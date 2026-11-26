'use strict';
var jibo = require('jibo');
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        '1': {
            'id': '1',
            'asset-pack': 'core',
            'class': 'Sequence',
            'children': ['b85c4db9-9977-42a0-b40a-b2fe089dfcac', '9e9068b5-fa95-47f0-ac53-feb76f31b960', '97cb95bf-0524-46f7-bc94-da68b303ef85', '2c316f57-8268-4666-8d77-63ce5b73e704', '8de4399a-f6e8-43aa-ad05-6ef9561348b3', '3ed3587e-c25a-4e69-8b51-d61eeaeaff0b', '75f46805-c174-441c-96e3-bc6ef45f461b'],
            'decorators': [],
            'options': {}
        },
        '8de4399a-f6e8-43aa-ad05-6ef9561348b3': {
            'id': '8de4399a-f6e8-43aa-ad05-6ef9561348b3',
            'name': 'REAL Download Sequence',
            'parent': 1,
            'asset-pack': 'core',
            'class': 'Sequence',
            'children': ['72f0230c-3a05-4570-9685-91ea1a915646', '25f3c32b-c3cc-45a3-9fad-7f26578d63b1'],
            'decorators': ['1d51dc91-ea69-4a0f-b9ae-3a318a22bfc4'],
            'options': {}
        },
        '8f71d735-849e-4104-938a-cb9bb2b9990a': (function (self) {
            return {
                'id': '8f71d735-849e-4104-938a-cb9bb2b9990a',
                'name': 'progress bar and download',
                'parent': '2b6adb54-6f2e-470e-b8c9-9c869d3ea5b3',
                'asset-pack': 'core',
                'class': 'ExecuteScriptAsync',
                'options': {
                    'exec': function exec(succeed, fail) {
                        var currentIcon = -1;
                        var newIcon = -1;
                        var percentPerIcon = 1 / blackboard.loaderIcons.length;
                        var iconAnimPlaying = false;
                        var updateIcon = function updateIcon(iconId) {
                            iconAnimPlaying = true;
                            var sequence = [];
                            if (iconId > 0) {
                                sequence.push('hideIcon');
                            }
                            var iconData = blackboard.loaderIcons[iconId];
                            var changeIcon = function changeIcon() {
                                notepad.oobeMC.icons.loadingIcon.gotoAndStop(iconData.icon);
                                notepad.oobeMC.icons.loadingText.textfield.text = iconData.text;
                            };
                            if (iconData) {
                                sequence.push(changeIcon, 'showIcon');
                            }
                            blackboard.app.animator.play(notepad.oobeMC.icons, sequence, function () {
                                iconAnimPlaying = false;
                            });
                        };
                        var update = function update(percentComplete) {
                            percentComplete = Math.min(1, percentComplete);
                            notepad.maskUpdater.updateMask(percentComplete);
                            newIcon = Math.floor(percentComplete / percentPerIcon);
                            console.log('percentComplete:', percentComplete);
                            if (!iconAnimPlaying && newIcon > currentIcon) {
                                console.log('NEXT ICON:', newIcon);
                                currentIcon = newIcon;
                                updateIcon(currentIcon);
                            }
                        };
                        // 5x1: no Jibo Inc account keys; the updater reads BEnch's credentials.json itself.
                        var key = notepad.accessKey || {};
                        var creds = {
                            accessKeyId: key.accessKeyId,
                            secretAccessKey: key.secretAccessKey,
                            region: blackboard.region
                        };
                        notepad.skipInstallAttempt = false;
                        blackboard.updater.download(creds, update, function (skipInstallAttempt) {
                            notepad.otaComplete = true;
                            notepad.shouldRetry = false;
                            notepad.skipInstallAttempt = !!skipInstallAttempt;
                            succeed();
                        }, function (error) {
                            notepad.log.error('OTA STATUS ERROR: ', error);
                            notepad.errorCode = error;
                            succeed();
                        });
                        update(0);
                    }
                }
            };
        })({}),
        '9581c076-20e6-4c66-94aa-30ee0dab7bd1': (function (self) {
            return {
                'id': '9581c076-20e6-4c66-94aa-30ee0dab7bd1',
                'name': 'init loader',
                'parent': '2b6adb54-6f2e-470e-b8c9-9c869d3ea5b3',
                'asset-pack': 'core',
                'class': 'ExecuteScript',
                'options': {
                    'exec': function exec() {
                        notepad.oobeMC.gotoAndStop('downloading');
                        notepad.oobeMC.icons.gotoAndStop(0);
                        notepad.oobeMC.addChild(notepad.maskUpdater.mask);
                        notepad.oobeMC.blueRing.mask = notepad.maskUpdater.mask;
                    }
                }
            };
        })({}),
        'aa323c5b-c702-41e2-a276-0f112e9c21d6': (function (self) {
            return {
                'id': 'aa323c5b-c702-41e2-a276-0f112e9c21d6',
                'name': 'Download Start anim',
                'parent': '2b6adb54-6f2e-470e-b8c9-9c869d3ea5b3',
                'asset-pack': 'core',
                'class': 'ExecuteScriptAsync',
                'options': {
                    'exec': function exec(succeed, fail) {
                        blackboard.app.animator.play(notepad.oobeMC, {
                            anim: 'downloadStart',
                            audio: 'updaterOpen'
                        }, succeed);
                        notepad.oobeMC.downloadDots.framerate = 30;
                    }
                }
            };
        })({}),
        '97cb95bf-0524-46f7-bc94-da68b303ef85': {
            'id': '97cb95bf-0524-46f7-bc94-da68b303ef85',
            'name': 'only proceed if plugged in',
            'parent': 1,
            'asset-pack': 'core',
            'class': 'Switch',
            'children': ['19f55e00-ec6b-480e-9157-fbe8daec196b'],
            'options': {}
        },
        '31864695-a0a3-47ac-b209-10c3e14aa699': (function (self) {
            return {
                'id': '31864695-a0a3-47ac-b209-10c3e14aa699',
                'name': 'PLUG ME BACK IN!',
                'parent': '19f55e00-ec6b-480e-9157-fbe8daec196b',
                'asset-pack': 'core',
                'class': 'ExecuteScriptAsync',
                'decorators': ['411113cf-6323-49e6-8c23-2cfa220d73a3'],
                'options': {
                    'exec': function exec(succeed, fail) {
                        notepad.oobeMC.powerWarning.visible = true;
                        blackboard.app.sound.play('plugIn');
                    }
                }
            };
        })({}),
        '19f55e00-ec6b-480e-9157-fbe8daec196b': {
            'id': '19f55e00-ec6b-480e-9157-fbe8daec196b',
            'name': 'is unplugged?',
            'parent': '97cb95bf-0524-46f7-bc94-da68b303ef85',
            'asset-pack': 'core',
            'class': 'Sequence',
            'children': ['31864695-a0a3-47ac-b209-10c3e14aa699', '0ced9802-0c31-425d-adc0-ce1ff4d0d955'],
            'decorators': ['9ed92ab7-977a-4295-a361-0deb7debb22c'],
            'options': {}
        },
        '9ed92ab7-977a-4295-a361-0deb7debb22c': (function (self) {
            return {
                'id': '9ed92ab7-977a-4295-a361-0deb7debb22c',
                'asset-pack': 'core',
                'class': 'Case',
                'options': {
                    'conditional': function conditional() {
                        return !jibo.system.pluggedIn;
                    }
                }
            };
        })({}),
        '411113cf-6323-49e6-8c23-2cfa220d73a3': (function (self) {
            return {
                'id': '411113cf-6323-49e6-8c23-2cfa220d73a3',
                'asset-pack': 'core',
                'class': 'SucceedOnCondition',
                'options': {
                    'init': function init() {},
                    'conditional': function conditional() {
                        return jibo.system.pluggedIn;
                    }
                }
            };
        })({}),
        '0ced9802-0c31-425d-adc0-ce1ff4d0d955': (function (self) {
            return {
                'id': '0ced9802-0c31-425d-adc0-ce1ff4d0d955',
                'name': 'Thanks',
                'parent': '19f55e00-ec6b-480e-9157-fbe8daec196b',
                'asset-pack': 'core',
                'class': 'ExecuteScript',
                'options': {
                    'exec': function exec() {
                        notepad.oobeMC.powerWarning.visible = false;
                        blackboard.app.sound.play('pluggedIn');
                    }
                }
            };
        })({}),
        '72f0230c-3a05-4570-9685-91ea1a915646': {
            'id': '72f0230c-3a05-4570-9685-91ea1a915646',
            'name': 'download sequence',
            'parent': '8de4399a-f6e8-43aa-ad05-6ef9561348b3',
            'asset-pack': 'core',
            'class': 'Parallel',
            'children': ['f83fba33-57f9-4597-8700-e18ba7e1eb31', '2b6adb54-6f2e-470e-b8c9-9c869d3ea5b3'],
            'options': { 'succeedOnOne': true }
        },
        '2b6adb54-6f2e-470e-b8c9-9c869d3ea5b3': {
            'id': '2b6adb54-6f2e-470e-b8c9-9c869d3ea5b3',
            'name': 'progress bar art',
            'parent': '72f0230c-3a05-4570-9685-91ea1a915646',
            'asset-pack': 'core',
            'class': 'Sequence',
            'children': ['aa323c5b-c702-41e2-a276-0f112e9c21d6', '9581c076-20e6-4c66-94aa-30ee0dab7bd1', '37c69d50-7c6f-48c2-a229-a9cd123ae50b', '8f71d735-849e-4104-938a-cb9bb2b9990a', '479a6318-aa68-4c08-9bda-5e422d10d160'],
            'options': {}
        },
        'f83fba33-57f9-4597-8700-e18ba7e1eb31': {
            'id': 'f83fba33-57f9-4597-8700-e18ba7e1eb31',
            'name': 'check if Plugged',
            'parent': '72f0230c-3a05-4570-9685-91ea1a915646',
            'asset-pack': 'core',
            'class': 'Switch',
            'children': ['631b387f-02f4-46b1-ae57-e3bb12e65858', '6b3e4730-f31a-4b73-b6ed-6017226601cc'],
            'decorators': ['f55db198-4d06-46c2-b5e2-efc61d142fea'],
            'options': {}
        },
        'f55db198-4d06-46c2-b5e2-efc61d142fea': (function (self) {
            return {
                'id': 'f55db198-4d06-46c2-b5e2-efc61d142fea',
                'asset-pack': 'core',
                'class': 'WhileCondition',
                'options': {
                    'init': function init() {},
                    'conditional': function conditional() {
                        return true;
                    }
                }
            };
        })({}),
        '631b387f-02f4-46b1-ae57-e3bb12e65858': (function (self) {
            return {
                'id': '631b387f-02f4-46b1-ae57-e3bb12e65858',
                'name': 'show warning',
                'parent': 'f83fba33-57f9-4597-8700-e18ba7e1eb31',
                'asset-pack': 'core',
                'class': 'ExecuteScript',
                'decorators': ['7c7b52cd-66d7-46da-b2c9-ab131fd9b990'],
                'options': {
                    'exec': function exec() {
                        notepad.oobeMC.powerWarning.visible = true;
                        blackboard.app.sound.play('plugIn');
                    }
                }
            };
        })({}),
        '7c7b52cd-66d7-46da-b2c9-ab131fd9b990': (function (self) {
            return {
                'id': '7c7b52cd-66d7-46da-b2c9-ab131fd9b990',
                'asset-pack': 'core',
                'class': 'Case',
                'options': {
                    'conditional': function conditional() {
                        return !notepad.oobeMC.powerWarning.visible && !jibo.system.pluggedIn && notepad.oobeMC.timeline.getCurrentLabel() == 'downloading';
                    }
                }
            };
        })({}),
        '6b3e4730-f31a-4b73-b6ed-6017226601cc': (function (self) {
            return {
                'id': '6b3e4730-f31a-4b73-b6ed-6017226601cc',
                'name': 'hide warning',
                'parent': 'f83fba33-57f9-4597-8700-e18ba7e1eb31',
                'asset-pack': 'core',
                'class': 'ExecuteScript',
                'decorators': ['33899eb9-2524-43c5-a304-bc75480bd039'],
                'options': {
                    'exec': function exec() {
                        notepad.oobeMC.powerWarning.visible = false;
                        if (notepad.oobeMC.timeline.getCurrentLabel() == 'downloading') {
                            blackboard.app.sound.play('pluggedIn');
                        }
                    }
                }
            };
        })({}),
        '33899eb9-2524-43c5-a304-bc75480bd039': (function (self) {
            return {
                'id': '33899eb9-2524-43c5-a304-bc75480bd039',
                'asset-pack': 'core',
                'class': 'Case',
                'options': {
                    'conditional': function conditional() {
                        return notepad.oobeMC.powerWarning.visible && (jibo.system.pluggedIn || notepad.oobeMC.timeline.getCurrentLabel() != 'downloading');
                    }
                }
            };
        })({}),
        'b85c4db9-9977-42a0-b40a-b2fe089dfcac': (function (self) {
            return {
                'id': 'b85c4db9-9977-42a0-b40a-b2fe089dfcac',
                'name': 'WiFi success anim',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'ExecuteScriptAsync',
                'options': {
                    'exec': function exec(succeed, fail) {
                        notepad.log.info('Fully connected after ' + blackboard.timer.stop() + ' seconds.');
                        blackboard.app.animator.play(notepad.oobeMC, {
                            anim: 'wifiConnected',
                            audio: 'okDone'
                        }, succeed);
                    }
                }
            };
        })({}),
        '22a53307-a7c2-4924-90fa-6e00a8efd6cb': (function (self) {
            return {
                'id': '22a53307-a7c2-4924-90fa-6e00a8efd6cb',
                'name': 'show wifi error message',
                'parent': '3518d610-8107-4e66-a016-6491d003983f',
                'asset-pack': 'core',
                'class': 'ExecuteScriptAsync',
                'decorators': [],
                'options': {
                    'exec': function exec(succeed, fail) {
                        notepad.oobeMC.powerWarning.visible = false;
                        var errorMessage = undefined;
                        var messages = blackboard.errorMessages;
                        if (notepad.errorCode.code) {
                            errorMessage = messages['ota' + notepad.errorCode.code];
                        }
                        errorMessage = errorMessage || messages.otax;
                        notepad.log.info('got error code: ', notepad.errorCode);
                        notepad.log.info('showing error message: ', errorMessage);
                        notepad.oobeMC.errorMessage.errorCode.text = errorMessage.code;
                        notepad.oobeMC.errorMessage.message.text = errorMessage.message;
                        notepad.oobeMC.errorMessage.instructions.text = errorMessage.instructions;
                        blackboard.app.animator.play(notepad.oobeMC, {
                            anim: 'wifiError',
                            audio: 'error'
                        });
                        blackboard.app.display.stage.once('click', succeed);
                    }
                }
            };
        })({}),
        '25f3c32b-c3cc-45a3-9fad-7f26578d63b1': {
            'id': '25f3c32b-c3cc-45a3-9fad-7f26578d63b1',
            'name': 'error handler',
            'parent': '8de4399a-f6e8-43aa-ad05-6ef9561348b3',
            'asset-pack': 'core',
            'class': 'Switch',
            'children': ['481355bc-7976-497a-9468-1e00f35b56f5', 'ed2b39ac-c44b-4185-850f-e76e1239c800'],
            'options': {}
        },
        '1d51dc91-ea69-4a0f-b9ae-3a318a22bfc4': (function (self) {
            return {
                'id': '1d51dc91-ea69-4a0f-b9ae-3a318a22bfc4',
                'asset-pack': 'core',
                'class': 'WhileCondition',
                'options': {
                    'init': function init() {
                        notepad.shouldRetry = false;
                    },
                    'conditional': function conditional() {
                        return notepad.shouldRetry;
                    }
                }
            };
        })({}),
        '3518d610-8107-4e66-a016-6491d003983f': {
            'id': '3518d610-8107-4e66-a016-6491d003983f',
            'name': 'retry connection until tap',
            'parent': '50f14c32-f57f-4a56-b973-674d996fdb62',
            'asset-pack': 'core',
            'class': 'Parallel',
            'children': ['703fb6f7-03e0-4e57-8031-01e0d3ae16cb', '22a53307-a7c2-4924-90fa-6e00a8efd6cb'],
            'decorators': [],
            'options': { 'succeedOnOne': true }
        },
        '481355bc-7976-497a-9468-1e00f35b56f5': {
            'id': '481355bc-7976-497a-9468-1e00f35b56f5',
            'name': 'failure',
            'parent': '25f3c32b-c3cc-45a3-9fad-7f26578d63b1',
            'asset-pack': 'core',
            'class': 'Sequence',
            'children': ['1474a634-54aa-4471-8dbf-b8af9668b1df', 'c2f8b231-8453-4c36-ab77-cf80fa2f7301'],
            'decorators': ['35ffd00a-810b-428d-93b0-7104f2ea8993'],
            'options': {}
        },
        '35ffd00a-810b-428d-93b0-7104f2ea8993': (function (self) {
            return {
                'id': '35ffd00a-810b-428d-93b0-7104f2ea8993',
                'asset-pack': 'core',
                'class': 'Case',
                'options': {
                    'conditional': function conditional() {
                        return !notepad.otaComplete;
                    }
                }
            };
        })({}),
        '1474a634-54aa-4471-8dbf-b8af9668b1df': (function (self) {
            return {
                'id': '1474a634-54aa-4471-8dbf-b8af9668b1df',
                'name': 'get current status',
                'parent': '481355bc-7976-497a-9468-1e00f35b56f5',
                'asset-pack': 'core',
                'class': 'ExecuteScriptAsync',
                'options': {
                    'exec': function exec(succeed, fail) {
                        var log = notepad.log;
                        log.error('got OTA error: ', notepad.errorCode);
                        log.info('checking network status...');
                        notepad.errorCode = null;
                        notepad.shouldRetry = false;
                        jibo.wifi.getCurrentNetwork(function (error, stats) {
                            if (error) {
                                notepad.errorCode = {
                                    code: 1,
                                    description: error
                                };
                                log.error('getCurrentNetwork error: ', error);
                                succeed();
                            } else {
                                if (stats.ssid === notepad.ssid) {
                                    jibo.wifi.verifyConnection(function (error) {
                                        if (error) {
                                            log.error('verifyConnection error: ', error);
                                            notepad.errorCode = error;
                                            succeed();
                                        } else {
                                            jibo.systemManager.checkForUpdates(function (error, updateList) {
                                                if (error) {
                                                    log.error('checkForUpdates error: ', error);
                                                    notepad.errorCode = {
                                                        code: 7,
                                                        description: error
                                                    };
                                                } else if (!updateList || !updateList.length) {
                                                    log.error('no updates found');
                                                    notepad.errorCode = {
                                                        code: 7,
                                                        description: 'no updates found'
                                                    };
                                                } else {
                                                    log.info('We are connected and we have updates! - Retry!');
                                                    notepad.shouldRetry = true;
                                                }
                                                succeed();
                                            }, blackboard.otaFilter);
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            };
        })({}),
        '703fb6f7-03e0-4e57-8031-01e0d3ae16cb': {
            'id': '703fb6f7-03e0-4e57-8031-01e0d3ae16cb',
            'parent': '3518d610-8107-4e66-a016-6491d003983f',
            'asset-pack': 'core',
            'class': 'Sequence',
            'children': ['ef2d352b-e2bf-427d-b8aa-0b9bef9b96b2', 'e7184fa1-76e1-4863-95e0-be80d653c92e'],
            'decorators': ['4a0ed0cd-b3ad-485b-9954-f4204a847ebc'],
            'options': {}
        },
        '4a0ed0cd-b3ad-485b-9954-f4204a847ebc': (function (self) {
            return {
                'id': '4a0ed0cd-b3ad-485b-9954-f4204a847ebc',
                'asset-pack': 'core',
                'class': 'WhileCondition',
                'options': {
                    'init': function init() {},
                    'conditional': function conditional() {
                        return !notepad.shouldRetry;
                    }
                }
            };
        })({}),
        'ef2d352b-e2bf-427d-b8aa-0b9bef9b96b2': (function (self) {
            return {
                'id': 'ef2d352b-e2bf-427d-b8aa-0b9bef9b96b2',
                'parent': '703fb6f7-03e0-4e57-8031-01e0d3ae16cb',
                'asset-pack': 'core',
                'class': 'TimeoutJs',
                'options': {
                    'getTime': function getTime() {
                        return 8000;
                    }
                }
            };
        })({}),
        'e7184fa1-76e1-4863-95e0-be80d653c92e': (function (self) {
            return {
                'id': 'e7184fa1-76e1-4863-95e0-be80d653c92e',
                'name': 'get current status',
                'parent': '703fb6f7-03e0-4e57-8031-01e0d3ae16cb',
                'asset-pack': 'core',
                'class': 'ExecuteScriptAsync',
                'options': {
                    'exec': function exec(succeed, fail) {
                        notepad.errorCode = null;
                        jibo.wifi.getCurrentNetwork(function (error, stats) {
                            if (error) {
                                notepad.errorCode = {
                                    code: 1,
                                    description: error
                                };
                                succeed();
                            } else {
                                if (stats.ssid === notepad.ssid) {
                                    jibo.wifi.verifyConnection(function (error) {
                                        if (error) {
                                            notepad.errorCode = error;
                                            succeed();
                                        } else {
                                            jibo.systemManager.checkForUpdates(function (error, updateList) {
                                                if (error) {
                                                    notepad.errorCode = {
                                                        code: 7,
                                                        description: error
                                                    };
                                                } else if (!updateList || !updateList.length) {
                                                    notepad.errorCode = {
                                                        code: 7,
                                                        description: 'no updates found'
                                                    };
                                                } else {
                                                    notepad.log.info('connected and we have updates - RETRY!');
                                                    notepad.shouldRetry = true;
                                                }
                                                succeed();
                                            }, blackboard.otaFilter);
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            };
        })({}),
        '75f46805-c174-441c-96e3-bc6ef45f461b': (function (self) {
            return {
                'id': '75f46805-c174-441c-96e3-bc6ef45f461b',
                'name': 'results',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'ExecuteScript',
                'options': {
                    'exec': function exec() {
                        result.otaComplete = notepad.otaComplete;
                        result.skipInstallAttempt = notepad.skipInstallAttempt;
                    }
                }
            };
        })({}),
        'c2f8b231-8453-4c36-ab77-cf80fa2f7301': {
            'id': 'c2f8b231-8453-4c36-ab77-cf80fa2f7301',
            'parent': '481355bc-7976-497a-9468-1e00f35b56f5',
            'asset-pack': 'core',
            'class': 'Switch',
            'children': ['50f14c32-f57f-4a56-b973-674d996fdb62'],
            'options': {}
        },
        '50f14c32-f57f-4a56-b973-674d996fdb62': {
            'id': '50f14c32-f57f-4a56-b973-674d996fdb62',
            'name': 'not ready to retry - show error',
            'parent': 'c2f8b231-8453-4c36-ab77-cf80fa2f7301',
            'asset-pack': 'core',
            'class': 'Sequence',
            'children': ['3518d610-8107-4e66-a016-6491d003983f'],
            'decorators': ['259f31cf-3f5e-42a6-9ce4-fe0fc7ded34e'],
            'options': {}
        },
        '259f31cf-3f5e-42a6-9ce4-fe0fc7ded34e': (function (self) {
            return {
                'id': '259f31cf-3f5e-42a6-9ce4-fe0fc7ded34e',
                'asset-pack': 'core',
                'class': 'Case',
                'options': {
                    'conditional': function conditional() {
                        return !notepad.shouldRetry;
                    }
                }
            };
        })({}),
        '3ed3587e-c25a-4e69-8b51-d61eeaeaff0b': (function (self) {
            return {
                'id': '3ed3587e-c25a-4e69-8b51-d61eeaeaff0b',
                'name': 'cleanup loader',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'ExecuteScript',
                'options': {
                    'exec': function exec() {
                        notepad.oobeMC.blueRing.mask = null;
                        notepad.oobeMC.removeChild(notepad.maskUpdater.mask);
                        notepad.maskUpdater.dispose();
                    }
                }
            };
        })({}),
        '9e9068b5-fa95-47f0-ac53-feb76f31b960': (function (self) {
            return {
                'id': '9e9068b5-fa95-47f0-ac53-feb76f31b960',
                'name': 'prep mask',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'ExecuteScript',
                'options': {
                    'exec': function exec() {
                        notepad.maskUpdater = new blackboard.RadialMask(720, 0.001);
                        notepad.maskUpdater.mask.x = notepad.oobeMC.blueRing.x;
                        notepad.maskUpdater.mask.y = notepad.oobeMC.blueRing.y;
                        notepad.maskUpdater.mask.rotation = -0.5 * Math.PI;
                    }
                }
            };
        })({}),
        'ed2b39ac-c44b-4185-850f-e76e1239c800': {
            'id': 'ed2b39ac-c44b-4185-850f-e76e1239c800',
            'name': 'success',
            'parent': '25f3c32b-c3cc-45a3-9fad-7f26578d63b1',
            'asset-pack': 'core',
            'class': 'Sequence',
            'children': ['46b157aa-fc99-4279-8047-34691871bd85'],
            'decorators': ['c6fb2ec6-c8a6-4a7d-a8b8-50a5bf8bf429'],
            'options': {}
        },
        'c6fb2ec6-c8a6-4a7d-a8b8-50a5bf8bf429': (function (self) {
            return {
                'id': 'c6fb2ec6-c8a6-4a7d-a8b8-50a5bf8bf429',
                'asset-pack': 'core',
                'class': 'Case',
                'options': {
                    'conditional': function conditional() {
                        return notepad.otaComplete;
                    }
                }
            };
        })({}),
        '46b157aa-fc99-4279-8047-34691871bd85': (function (self) {
            return {
                'id': '46b157aa-fc99-4279-8047-34691871bd85',
                'name': 'download complete',
                'parent': 'ed2b39ac-c44b-4185-850f-e76e1239c800',
                'asset-pack': 'core',
                'class': 'ExecuteScriptAsync',
                'options': {
                    'exec': function exec(succeed, fail) {
                        notepad.log.info('OTA download completed in ' + blackboard.timer.stop() + ' seconds.');
                        blackboard.app.animator.play(notepad.oobeMC, {
                            anim: 'downloadComplete',
                            audio: 'downloadDone'
                        }, succeed);
                    }
                }
            };
        })({}),
        '37c69d50-7c6f-48c2-a229-a9cd123ae50b': (function (self) {
            return {
                'id': '37c69d50-7c6f-48c2-a229-a9cd123ae50b',
                'name': 'setup in-download wifi error handler',
                'parent': '2b6adb54-6f2e-470e-b8c9-9c869d3ea5b3',
                'asset-pack': 'core',
                'class': 'ExecuteScript',
                'options': {
                    'exec': function exec() {
                        notepad.onStateChange = function (data) {
                            if (data.newState == 'CONNECTED') {
                                notepad.oobeMC.gotoAndStop('downloading');
                            } else if (data.oldState == 'CONNECTED') {
                                var errorMessage = blackboard.errorMessages.ota1;
                                notepad.oobeMC.errorMessage.errorCode.text = errorMessage.code;
                                notepad.oobeMC.errorMessage.message.text = errorMessage.message;
                                notepad.oobeMC.errorMessage.instructions.text = '';
                                blackboard.app.animator.play(notepad.oobeMC, {
                                    anim: 'wifiError',
                                    audio: 'error'
                                });
                            }
                        };
                        jibo.wifi.on('state-change', notepad.onStateChange);
                    }
                }
            };
        })({}),
        '479a6318-aa68-4c08-9bda-5e422d10d160': (function (self) {
            return {
                'id': '479a6318-aa68-4c08-9bda-5e422d10d160',
                'name': 'remove in-download wifi error handler',
                'parent': '2b6adb54-6f2e-470e-b8c9-9c869d3ea5b3',
                'asset-pack': 'core',
                'class': 'ExecuteScript',
                'options': {
                    'exec': function exec() {
                        jibo.wifi.removeListener('state-change', notepad.onStateChange);
                    }
                }
            };
        })({}),
        '2c316f57-8268-4666-8d77-63ce5b73e704': (function (self) {
            return {
                'id': '2c316f57-8268-4666-8d77-63ce5b73e704',
                'name': 'logging',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'ExecuteScript',
                'options': {
                    'exec': function exec() {
                        blackboard.timer.start();
                        notepad.log.info('starting OTA download');
                        notepad.errorCode = null;
                    }
                }
            };
        })({})
    };
};