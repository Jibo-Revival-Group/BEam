

// System imports
const http = require("http");
const WebSocket = require("ws");
// External imports
const bodyParser = require('body-parser');
const express = require("express");
const { PromiseUtils } = require('jibo-cai-utils');


class HubMock {

    init(hubPort) {
        let app = express(); 
        app.use(bodyParser.json());
        this.listenQueue = [];
        this.server = http.createServer(app);
        new WebSocket.Server({ server: this.server }).on('connection', (ws) => {
            console.log('HubMock received connection');

            let receivedTrigger = false;
            let receivedContext = false;
            let receivedListen = false;
            let shouldSkipSurprises = false;
            ws.on('message', (msg) => {
                console.log('HubMock received message: ', msg);

                const message = JSON.parse(msg);
                switch (message.type) {
                    case 'TRIGGER':
                        console.log('HubMock got trigger');
                        receivedTrigger = true;
                        if (message.data.triggerSource === 'SURPRISE') {
                            shouldSkipSurprises = true;
                        } else {
                            shouldSkipSurprises = false;
                        }
                        break;
                    case 'CONTEXT':
                        console.log('HubMock got context');
                        receivedContext = true;
                        break;
                    case 'LISTEN':
                        receivedListen = true;
                        console.log('HubMock got listen');
                        break;
                    default:
                        console.warn('HubMock does not handle message type: ' + message);
                }

                if (receivedTrigger && receivedContext) {
                    const resp = {
                        type: 'PROACTIVE',
                        msgID: 'fake',
                        transID: msg.transID,
                        ts: Date.now(),
                        data: {
                            match: {
                                skillID: '@be/greetings',
                                onRobot: true,
                                isProactive: true,
                                skipSurprises: shouldSkipSurprises,
                            }
                        },
                        final: true
                    };
                    ws.send(JSON.stringify(resp));
                    receivedTrigger = false;
                    receivedContext = false;
                } else if (receivedListen && receivedContext) {
                    const resp = {
                        type: 'LISTEN',
                        msgID: 'fake',
                        transID: msg.transID,
                        ts: Date.now(),
                        data: this.listenQueue.pop(),
                        final: true
                    }
                    console.log(`HubMock sending back: ${JSON.stringify(resp)}`)
                    ws.send(JSON.stringify(resp));
                    receivedListen = false;
                    receivedContext = false;
                }
            });
        });

        return PromiseUtils.promisify(cb => this.server.listen(hubPort, cb));
    }

    pushListenResult(listenResult) {
        this.listenQueue.push(listenResult);
    }

    clearListenResult() {
        this.listenQueue = [];
    }

    stop() {
        return PromiseUtils.promisify(cb => this.server.close(cb));
    }
}

module.exports = {
    HubMock
}