'use strict';
var jibo = require('jibo');
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        '1': {
            'id': '1',
            'class': 'Sequence',
            // 5x1: no Jibo Inc account. BEnch keeps credentials.json on BEaker (joap.5x1.com) in every mode.
            'children': ['0322acda-01d9-4619-a7e4-f7ef6ff045e2', '69abc918-f022-4806-8454-5af6731c24b8'],
            'options': {}
        },
        '0322acda-01d9-4619-a7e4-f7ef6ff045e2': (function (self) {
            return {
                'id': '0322acda-01d9-4619-a7e4-f7ef6ff045e2',
                'name': 'check notepad and initialize certain vars',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'ExecuteScript',
                'options': {
                    'exec': function exec() {
                        notepad.errorCode = null;
                        notepad.cloudAuthorized = true;
                        notepad.accessKey = null;
                    }
                }
            };
        })({}),
        '6cb53940-b2aa-4f63-ac42-e55bcd34591a': (function (self) {
            return {
                'id': '6cb53940-b2aa-4f63-ac42-e55bcd34591a',
                'name': 'create an account and use token to get the accessKey and secretAccessKey',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'ExecuteScriptAsync',
                'options': {
                    'exec': function exec(callback) {
                        console.log('token is ' + notepad.accessToken);
                        var oobe = new notepad.JSC.OOBE();
                        var setupOptions = {
                            token: notepad.accessToken,
                            id: blackboard.robotName
                        };
                        oobe.setupRobot(setupOptions, function (err, data) {
                            notepad.log.iferr(err, 'Failed to retrieve account by access token');
                            if (!err) {
                                (function () {
                                    notepad.log.info('Successfully retrieved account by access token');
                                    console.log('Account access keys:', data);
                                    var accessKeyId = data['accessKeyId'];
                                    var secretAccessKey = data['secretAccessKey'];
                                    var isServiceMode = data['serviceMode'];
                                    notepad.accessKey = {
                                        accessKeyId: accessKeyId,
                                        secretAccessKey: secretAccessKey,
                                        region: blackboard.region
                                    };
                                    jibo.systemManager.setCredentials(notepad.accessKey, function (error) {
                                        if (error) {
                                            notepad.log.error('set credentials error:', error);
                                        } else {
                                            notepad.log.info('Successfully retrieved and saved robot credentials');
                                            notepad.cloudAuthorized = true;
                                        }
                                        if (!isServiceMode) {
                                            callback();
                                        } else {
                                            if (notepad.curMode === 'oobe') {
                                                notepad.log.info('Entering service center mode');
                                                jibo.systemManager.setMode('service', function (error) {
                                                    if (error) {
                                                        notepad.log.error('failed to set service mode', error);
                                                    }
                                                    jibo.systemManager.reboot(function (err) {
                                                        if (err) {
                                                            notepad.log.error('failed to reboot into service mode', err);
                                                        }
                                                    });
                                                });
                                            } else {
                                                notepad.log.info('Not setting current mode to service; currently ', notepad.curMode);
                                                jibo.systemManager.reboot(function (err) {
                                                    if (err) {
                                                        notepad.log.error('failed to reboot', err);
                                                    }
                                                });
                                            }
                                        }
                                    });
                                })();
                            } else {
                                notepad.errorCode = {
                                    code: 7,
                                    description: err.toString()
                                };
                                callback();
                            }
                        });
                    }
                }
            };
        })({}),
        '69abc918-f022-4806-8454-5af6731c24b8': (function (self) {
            return {
                'id': '69abc918-f022-4806-8454-5af6731c24b8',
                'name': 'Pass result variables back',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'ExecuteScript',
                'options': {
                    'exec': function exec() {
                        result.accessKey = notepad.accessKey;
                        result.cloudAuthorized = notepad.cloudAuthorized;
                        result.errorCode = notepad.errorCode;
                        console.log('Cloud-init results:');
                        console.log(result);
                    }
                }
            };
        })({})
    };
};