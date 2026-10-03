"use strict";

// The normal robot uses native Jetstream, not JetstreamServiceSim. Its
// SKILL_ACTION events reach the BE skill through @jibo/jetstream-client.
const pairing = require('./homeassistant');
const system = require('./system');

class HomeAssistantCommandRelay {
    _readHomeAssistantPairing() { return pairing.readConfig(); }
    createHubOptions() {
        const current = system.serverConfig().current;
        if (!current || !current.hostname || !current.port) {
            throw new Error('Home Assistant callback hub is not configured');
        }
        return current;
    }
    _forwardHomeAssistantCommand(data) {
        const saved = this._readHomeAssistantPairing();
        if (!saved || !saved.password || !saved.haIp || !saved.webhookId) {
            console.warn('HA_COMMAND rejected; pairing missing or incomplete requestId=' + (data && data.requestId));
            if (data && data.callbackToken) {
                this._postHomeAssistantResult(data, JSON.stringify({
                    type: 'command_result', requestId: data.requestId,
                    status: 'error', message: 'pairing_required'
                }));
            }
            return;
        }
        const http = require('http');
        const body = {
            type: 'command',
            password: saved.password,
            command: data && data.command,
            requestId: data && data.requestId
        };
        ['targetName', 'temperature', 'delta', 'entityId', 'action', 'blacklistHeat', 'blacklistCool']
            .forEach((key) => {
            if (data && data[key] !== undefined && data[key] !== null) {
                body[key] = data[key];
            }
        });
        const payload = JSON.stringify(body);
        console.info('HA_COMMAND forwarding requestId=' + body.requestId +
            ' command=' + body.command + ' host=' + saved.haIp +
            ' port=' + (Number(saved.haPort) || 8123));
        let completed = false;
        let timer;
        const finish = (resultText) => {
            if (completed) { return; }
            completed = true;
            clearTimeout(timer);
            if (data && data.callbackToken) {
                this._postHomeAssistantResult(data, resultText);
            }
        };
        const fail = (message) => finish(JSON.stringify({
            type: 'command_result', requestId: body.requestId,
            status: 'error', message: message
        }));
        const req = http.request({
            host: saved.haIp,
            port: Number(saved.haPort) || 8123,
            path: '/api/webhook/' + saved.webhookId,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        }, (res) => {
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => {
                console.info('HA_COMMAND response requestId=' + body.requestId +
                    ' httpStatus=' + res.statusCode);
                finish(Buffer.concat(chunks).toString('utf8'));
            });
            res.on('error', () => fail('disconnected'));
            res.on('aborted', () => fail('disconnected'));
        });
        req.on('error', (err) => {
            console.error('HA_COMMAND forward failed requestId=' + body.requestId,
                err && err.code);
            fail('disconnected');
        });
        timer = setTimeout(() => {
            console.warn('HA_COMMAND forward timed out requestId=' + body.requestId);
            fail('timeout');
            req.destroy();
        }, 2500);
        req.write(payload);
        req.end();
    }
    _postHomeAssistantResult(data, resultText) {
        let result;
        try {
            result = JSON.parse(resultText);
        }
        catch (err) {
            result = {
                type: 'command_result',
                requestId: data.requestId,
                status: 'error',
                message: 'bad_result'
            };
        }
        if (!result || typeof result !== 'object') {
            result = {
                type: 'command_result',
                requestId: data.requestId,
                status: 'error',
                message: 'bad_result'
            };
        }
        result.callbackToken = data.callbackToken;
        if (!result.requestId) {
            result.requestId = data.requestId;
        }
        if (!result.type) {
            result.type = 'command_result';
        }
        const http = require('http');
        const https = require('https');
        const callbackPath = data.callbackPath || '/v1/homeassistant/robot-result';
        const options = this.createHubOptions(callbackPath);
        const secure = Number(options.port) === 443;
        const payload = JSON.stringify(result);
        const req = (secure ? https : http).request({
            host: options.hostname,
            port: options.port,
            path: callbackPath,
            method: 'POST',
            rejectUnauthorized: false,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        }, (res) => {
            clearTimeout(timer);
            console.info('HA result callback requestId=' + result.requestId +
                ' status=' + result.status + ' httpStatus=' + res.statusCode);
            res.resume();
        });
        const timer = setTimeout(() => {
            console.warn('HA result callback timed out requestId=' + result.requestId);
            req.destroy();
        }, 2000);
        req.on('error', (err) => {
            clearTimeout(timer);
            console.error('HA result callback failed requestId=' + result.requestId, err && err.code);
        });
        req.write(payload);
        req.end();
    }
}

const relay = new HomeAssistantCommandRelay();
module.exports = function handleHomeAssistantAction(data) {
    if (!data || !data.skill || data.skill.id !== '@be/homeassistant') {
        return false;
    }
    const command = data.action || {};
    console.info('HA native command received requestId=' + command.requestId +
        ' command=' + command.command);
    relay._forwardHomeAssistantCommand(command);
    return true;
};
