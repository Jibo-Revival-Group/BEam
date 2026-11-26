'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var jibo = require('jibo');
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        '1': {
            'id': '1',
            'asset-pack': 'core',
            'class': 'Sequence',
            // 5x1: pick the network on screen; the QR steps (Jibo Inc's retired app) are no longer in the tree.
            'children': [1536421699826126, '5x1-pick-network', 2109682925476, '45123520-be0f-45fb-859b-4cd532c3a274', '9d6cb74b-7029-4d1b-ad03-22e7b174f708'],
            'decorators': [],
            'options': {}
        },
        '5x1-pick-network': (function (self) {
            return {
                'id': '5x1-pick-network',
                'name': 'pick a Wi-Fi network on screen',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'ExecuteScriptAsync',
                'options': {
                    'exec': function exec(succeed, fail) {
                        require('./network-picker').pick(function (choice) {
                            notepad.ssid = choice.ssid;
                            notepad.password = choice.password;
                            notepad.staticSettings = null;
                            notepad.accessToken = null;
                            blackboard.timer.start();
                            succeed();
                        });
                    }
                }
            };
        })({}),
        '2109682925469': {
            'id': '2109682925469',
            'name': 'Read Barcode',
            'parent': 'bc9afc10-4e87-40fa-88f2-c76d034bd3e5',
            'asset-pack': 'core',
            'class': 'Sequence',
            'children': [2109682925467, 2109682925471],
            'decorators': [2109682925472],
            'options': {}
        },
        '2109682925472': (function (self) {
            return {
                'id': '2109682925472',
                'asset-pack': 'core',
                'class': 'WhileCondition',
                'options': {
                    'init': function init() {},
                    'conditional': function conditional() {
                        return !notepad.gotCode;
                    }
                }
            };
        })({}),
        '2109682925467': (function (self) {
            return {
                'id': '2109682925467',
                'parent': 2109682925469,
                'asset-pack': 'core',
                'class': 'ReadBarcode',
                'options': {
                    'onBarcode': function onBarcode(error, data) {
                        notepad.log.iferr(error, 'ReadBarcode');
                        if (data && data.length) {
                            var barcode = data[0].content;
                            var metaEnd = barcode.indexOf('\n');
                            var metaData = barcode.substring(0, metaEnd).split('/');
                            var codeId = parseInt(metaData[0]);
                            notepad.totalCodes = parseInt(metaData[1]);
                            if (codeId > 0 && notepad.totalCodes > 0) {
                                console.log('codeID: ', codeId, 'totes codes: ', notepad.totalCodes);
                                notepad.qrData[codeId - 1] = barcode.substring(metaEnd + 1);
                                if (notepad.codesReceived.indexOf(codeId) == -1) {
                                    notepad.codesReceived.push(codeId);
                                }
                                if (notepad.codesReceived.length == notepad.totalCodes) {
                                    notepad.allCodesRead = true;
                                }
                                notepad.gotCode = true;
                            } else if (!notepad.easterEggActive) {
                                notepad.easterEggActive = true;
                                blackboard.app.sound.play('sayWhat', function () {
                                    notepad.easterEggActive = false;
                                });
                            }
                        }
                    }
                }
            };
        })({}),
        '2109682925471': (function (self) {
            return {
                'id': '2109682925471',
                'parent': 2109682925469,
                'asset-pack': 'core',
                'class': 'TimeoutJs',
                'options': {
                    'getTime': function getTime() {
                        return 100;
                    }
                }
            };
        })({}),
        '2109682925476': (function (self) {
            return {
                'id': '2109682925476',
                'name': 'wifi connecting anim',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'ExecuteScript',
                'options': {
                    'exec': function exec() {
                        notepad.oobeMC.gotoAndStop('wifiSearch');
                        notepad.oobeMC.ssid.ssid.text = notepad.ssid;
                        blackboard.app.animator.play(notepad.oobeMC, [{
                            anim: 'wifiSearch',
                            audio: 'searching'
                        }, { anim: 'wifiSearchLoop' }]);
                    }
                }
            };
        })({}),
        '1024537321800955': (function (self) {
            return {
                'id': '1024537321800955',
                'name': 'QR Success anim',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'ExecuteScriptAsync',
                'decorators': [],
                'options': {
                    'exec': function exec(succeed, fail) {
                        blackboard.app.animator.play(notepad.oobeMC, {
                            anim: 'QRScan',
                            audio: 'searchingToots'
                        }, succeed);
                    }
                }
            };
        })({}),
        '1536421699826126': (function (self) {
            return {
                'id': '1536421699826126',
                'name': 'set up notepad vars (incl. JSC)',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'ExecuteScript',
                'options': {
                    'exec': function exec() {
                        notepad.networkConnected = false;
                        notepad.ssid = false;
                    }
                }
            };
        })({}),
        '9d6cb74b-7029-4d1b-ad03-22e7b174f708': (function (self) {
            return {
                'id': '9d6cb74b-7029-4d1b-ad03-22e7b174f708',
                'name': 'Pass result variables back',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'ExecuteScript',
                'options': {
                    'exec': function exec() {
                        blackboard.unbungler.notBroke();
                        result.accessToken = notepad.accessToken;
                        result.ssid = notepad.ssid;
                        result.networkConnected = notepad.networkConnected;
                        var errorCode = notepad.wifiError ? notepad.wifiError : 'wifi connecting timed-out';
                        result.errorCode = notepad.networkConnected ? undefined : errorCode;
                        console.log('Config results:');
                        console.log(result);
                    }
                }
            };
        })({}),
        '45123520-be0f-45fb-859b-4cd532c3a274': (function (self) {
            return {
                'id': '45123520-be0f-45fb-859b-4cd532c3a274',
                'name': 'add, set and connect new network',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'ExecuteScriptAsync',
                'options': {
                    'exec': function exec(succeed, fail) {
                        notepad.wifiError = undefined;
                        var networkData = {
                            ssid: notepad.ssid,
                            pswd: notepad.password,
                            security: notepad.password && notepad.password.length > 0 ? 'WPA-PSK' : 'NONE',
                            hidden: 0,
                            networkType: notepad.staticSettings ? 1 : 0,
                            staticSettings: notepad.staticSettings
                        };
                        jibo.wifi.removeAllNetworks(function (error) {
                            if (error) {
                                notepad.log.error('removeAllNetworks error (NBD): ', error);
                            }
                            jibo.wifi.addNetwork(networkData, 30, function (error) {
                                notepad.log.iferr(error, 'addNetwork');
                                if (!error) {
                                    notepad.log.info('addNetwork succeeded: ' + notepad.ssid);
                                    notepad.networkConnected = true;
                                } else if (error.code) {
                                    notepad.wifiError = error;
                                }
                                blackboard.unbungler.isItBroke();
                                succeed();
                            });
                        });
                    }
                }
            };
        })({}),
        '66cbdcd0-66e0-4b1a-a2b7-7256e87479ab': {
            'id': '66cbdcd0-66e0-4b1a-a2b7-7256e87479ab',
            'parent': 1,
            'asset-pack': 'core',
            'class': 'Sequence',
            'children': ['1a34196f-d28a-4e90-aaa8-d04779793ce1', '98f0f42c-a8fd-4e66-b1d9-7a3db41a37bf', 'c248e9d1-d54e-4230-9d2a-9a564f1bcc37', '73b9094e-1787-4120-b45b-c84412aec2e9'],
            'decorators': ['0c01cea8-b4d8-4c58-ab98-47fb99874b7c'],
            'options': {}
        },
        '0c01cea8-b4d8-4c58-ab98-47fb99874b7c': (function (self) {
            return {
                'id': '0c01cea8-b4d8-4c58-ab98-47fb99874b7c',
                'asset-pack': 'core',
                'class': 'WhileCondition',
                'options': {
                    'init': function init() {
                        notepad.allCodesRead = false;
                    },
                    'conditional': function conditional() {
                        return !notepad.allCodesRead;
                    }
                }
            };
        })({}),
        '1a34196f-d28a-4e90-aaa8-d04779793ce1': {
            'id': '1a34196f-d28a-4e90-aaa8-d04779793ce1',
            'parent': '66cbdcd0-66e0-4b1a-a2b7-7256e87479ab',
            'asset-pack': 'core',
            'class': 'Switch',
            'children': ['6173a9d8-2ce6-4a9b-ae5e-dcceafb9560f'],
            'options': {}
        },
        '6173a9d8-2ce6-4a9b-ae5e-dcceafb9560f': {
            'id': '6173a9d8-2ce6-4a9b-ae5e-dcceafb9560f',
            'parent': '1a34196f-d28a-4e90-aaa8-d04779793ce1',
            'asset-pack': 'core',
            'class': 'Sequence',
            'children': ['50953d78-e3ab-4482-b24e-42097bf89e87', '9e758b35-2fa3-4bda-8f60-2e9b7a1f07f0'],
            'decorators': ['22603f1f-232b-4814-bbfc-cca6cfedde52'],
            'options': {}
        },
        '9e758b35-2fa3-4bda-8f60-2e9b7a1f07f0': (function (self) {
            return {
                'id': '9e758b35-2fa3-4bda-8f60-2e9b7a1f07f0',
                'name': 'transition out \'openApp\'',
                'parent': '6173a9d8-2ce6-4a9b-ae5e-dcceafb9560f',
                'asset-pack': 'core',
                'class': 'ExecuteScriptAsync',
                'options': {
                    'exec': function exec(succeed, fail) {
                        blackboard.app.animator.play(notepad.oobeMC, 'openAppTap', succeed);
                    }
                }
            };
        })({}),
        '50953d78-e3ab-4482-b24e-42097bf89e87': (function (self) {
            return {
                'id': '50953d78-e3ab-4482-b24e-42097bf89e87',
                'name': 'Tap when QR Code ready',
                'parent': '6173a9d8-2ce6-4a9b-ae5e-dcceafb9560f',
                'asset-pack': 'core',
                'class': 'ExecuteScriptAsync',
                'options': {
                    'exec': function exec(succeed, fail) {
                        blackboard.app.animator.play(notepad.oobeMC, 'openApp');
                        blackboard.app.display.stage.interactive = true;
                        blackboard.app.display.stage.once('click', succeed);
                    }
                }
            };
        })({}),
        '22603f1f-232b-4814-bbfc-cca6cfedde52': (function (self) {
            return {
                'id': '22603f1f-232b-4814-bbfc-cca6cfedde52',
                'asset-pack': 'core',
                'class': 'Case',
                'options': {
                    'conditional': function conditional() {
                        return !notepad.fromError;
                    }
                }
            };
        })({}),
        'bc9afc10-4e87-40fa-88f2-c76d034bd3e5': {
            'id': 'bc9afc10-4e87-40fa-88f2-c76d034bd3e5',
            'parent': 'c248e9d1-d54e-4230-9d2a-9a564f1bcc37',
            'asset-pack': 'core',
            'class': 'Parallel',
            'children': ['46828d0a-9dd6-4821-b322-d03758c08398', 2109682925469],
            'options': { 'succeedOnOne': true }
        },
        '46828d0a-9dd6-4821-b322-d03758c08398': (function (self) {
            return {
                'id': '46828d0a-9dd6-4821-b322-d03758c08398',
                'name': '5 minutes scan time before re-showing instrux',
                'parent': 'bc9afc10-4e87-40fa-88f2-c76d034bd3e5',
                'asset-pack': 'core',
                'class': 'TimeoutJs',
                'options': {
                    'getTime': function getTime() {
                        return 300000;
                    }
                }
            };
        })({}),
        'b069be59-7a0c-40ad-baf4-8a2d0a9dc7f4': (function (self) {
            return {
                'id': 'b069be59-7a0c-40ad-baf4-8a2d0a9dc7f4',
                'name': 'Parse QR data',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'ExecuteScript',
                'options': {
                    'exec': function exec() {
                        var barcode = '';
                        for (var i = 0; i < notepad.qrData.length; i++) {
                            barcode += notepad.qrData[i];
                        }
                        function xorString(str, key) {
                            var result = '';
                            for (var i = 0; i < str.length; i++) {
                                result += String.fromCharCode(key.charCodeAt(i % key.length) ^ str.charCodeAt(i));
                            }
                            return result;
                        }
                        var aKey = 'Wow, you cracked our secret code. Impressive. Maybe you should check out jibo.com/jobs.';
                        barcode = xorString(barcode, aKey);
                        var barcodeData = barcode.split('\n');
                        var _accessToken = barcodeData.pop();

                        var _barcodeData = _slicedToArray(barcodeData, 7);

                        var _ssid = _barcodeData[0];
                        var _password = _barcodeData[1];
                        var _staticIP = _barcodeData[2];
                        var _netmask = _barcodeData[3];
                        var _gateway = _barcodeData[4];
                        var _dns1 = _barcodeData[5];
                        var _dns2 = _barcodeData[6];

                        notepad.accessToken = _accessToken;
                        notepad.ssid = _ssid || '';
                        notepad.password = _password;
                        if (!_staticIP) {
                            notepad.staticSettings = null;
                        } else {
                            notepad.staticSettings = {
                                staticIP: _staticIP,
                                gateway: _gateway,
                                netmask: _netmask,
                                dns1: _dns1 ? _dns1 : '8.8.8.8',
                                dns2: _dns2 ? _dns2 : '8.8.4.4'
                            };
                        }
                        console.log('accessToken', notepad.accessToken);
                        console.log('ssid', notepad.ssid);
                        console.log('password', !!notepad.password);
                        if (notepad.staticSettings) {
                            console.log('staticIP', notepad.staticSettings.staticIP);
                            console.log('gateway', notepad.staticSettings.gateway);
                            console.log('netmask', notepad.staticSettings.netmask);
                            console.log('dns1', notepad.staticSettings.dns1);
                            console.log('dns2', notepad.staticSettings.dns2);
                        }
                        notepad.log.info('Number of QR Codes scanned: ' + notepad.qrData.length);
                        notepad.log.info('QR codes scanned in ' + blackboard.timer.stop() + ' seconds');
                        notepad.log.info('Static Settings used?: ' + !!notepad.staticSettings);
                        blackboard.timer.start();
                    }
                }
            };
        })({}),
        'dbba8112-507d-4d91-bc2c-592bfc7b13cb': {
            'id': 'dbba8112-507d-4d91-bc2c-592bfc7b13cb',
            'parent': 'c248e9d1-d54e-4230-9d2a-9a564f1bcc37',
            'asset-pack': 'core',
            'class': 'Switch',
            'children': ['70354396-ec88-4237-b8d1-f43ab4536d9b', '73760ed3-cb1b-4560-9d12-4e8009ac39cc', 'acf36d0f-e424-42bc-93b2-139756121b55'],
            'options': {}
        },
        'd4a0ba06-1d44-4ed2-bdb3-0c7b7b0f5d3c': (function (self) {
            return {
                'id': 'd4a0ba06-1d44-4ed2-bdb3-0c7b7b0f5d3c',
                'name': 'play sound, prep for next code',
                'parent': '70354396-ec88-4237-b8d1-f43ab4536d9b',
                'asset-pack': 'core',
                'class': 'ExecuteScriptAsync',
                'decorators': [],
                'options': {
                    'exec': function exec(succeed, fail) {
                        jibo.lps.setPreview({ enable: false }, function (error) {
                            if (error) {
                                notepad.log.error('setPreview disable error: ', error);
                            }
                            notepad.gotCode = false;
                            blackboard.app.sound.play('searchingToots', succeed);
                        });
                    }
                }
            };
        })({}),
        '70354396-ec88-4237-b8d1-f43ab4536d9b': {
            'id': '70354396-ec88-4237-b8d1-f43ab4536d9b',
            'parent': 'dbba8112-507d-4d91-bc2c-592bfc7b13cb',
            'asset-pack': 'core',
            'class': 'Sequence',
            'children': ['d4a0ba06-1d44-4ed2-bdb3-0c7b7b0f5d3c', 'a175ed5f-6ebc-492b-a574-a48fd324756d', '55a0bdff-1d6e-4574-a8de-b380c03ea352', '4b6230e8-1d1a-46d0-89f2-515afda5790c'],
            'decorators': ['39f82e36-a74c-45eb-83f8-250ef3b8b807'],
            'options': {}
        },
        '39f82e36-a74c-45eb-83f8-250ef3b8b807': (function (self) {
            return {
                'id': '39f82e36-a74c-45eb-83f8-250ef3b8b807',
                'asset-pack': 'core',
                'class': 'Case',
                'options': {
                    'conditional': function conditional() {
                        return notepad.gotCode && !notepad.allCodesRead;
                    }
                }
            };
        })({}),
        'a175ed5f-6ebc-492b-a574-a48fd324756d': (function (self) {
            return {
                'id': 'a175ed5f-6ebc-492b-a574-a48fd324756d',
                'name': 'show next code prompt, wait for tap',
                'parent': '70354396-ec88-4237-b8d1-f43ab4536d9b',
                'asset-pack': 'core',
                'class': 'ExecuteScriptAsync',
                'options': {
                    'exec': function exec(succeed, fail) {
                        for (var i = 1; i <= notepad.totalCodes; i++) {
                            if (notepad.codesReceived.indexOf(i) == -1) {
                                notepad.oobeMC.nextCode.counter.text = i;
                                notepad.oobeMC.scanCode.counter.text = i;
                                break;
                            }
                        }
                        blackboard.app.animator.play(notepad.oobeMC, 'nextCode');
                        blackboard.app.display.stage.once('click', succeed);
                    }
                }
            };
        })({}),
        '55a0bdff-1d6e-4574-a8de-b380c03ea352': (function (self) {
            return {
                'id': '55a0bdff-1d6e-4574-a8de-b380c03ea352',
                'name': 'transition to viewfinder',
                'parent': '70354396-ec88-4237-b8d1-f43ab4536d9b',
                'asset-pack': 'core',
                'class': 'ExecuteScriptAsync',
                'options': {
                    'exec': function exec(succeed, fail) {
                        blackboard.app.animator.play(notepad.oobeMC, 'nextCodeTap', succeed);
                    }
                }
            };
        })({}),
        '4b6230e8-1d1a-46d0-89f2-515afda5790c': (function (self) {
            return {
                'id': '4b6230e8-1d1a-46d0-89f2-515afda5790c',
                'name': 'show viewfinder',
                'parent': '70354396-ec88-4237-b8d1-f43ab4536d9b',
                'asset-pack': 'core',
                'class': 'ExecuteScript',
                'options': {
                    'exec': function exec() {
                        blackboard.app.animator.play(notepad.oobeMC, 'viewfinderSpecific');
                        jibo.lps.setPreview({
                            enable: true,
                            x: 176,
                            y: 64,
                            width: 928,
                            height: 522,
                            camera: 0
                        }, function (error) {
                            if (error) {
                                notepad.log.error('setPreview enable error: ', error);
                            }
                        });
                    }
                }
            };
        })({}),
        'c248e9d1-d54e-4230-9d2a-9a564f1bcc37': {
            'id': 'c248e9d1-d54e-4230-9d2a-9a564f1bcc37',
            'parent': '66cbdcd0-66e0-4b1a-a2b7-7256e87479ab',
            'asset-pack': 'core',
            'class': 'Sequence',
            'children': ['bc9afc10-4e87-40fa-88f2-c76d034bd3e5', 'dbba8112-507d-4d91-bc2c-592bfc7b13cb'],
            'decorators': ['7147196e-9f6e-40da-98c1-f03fc59c4569'],
            'options': {}
        },
        '7147196e-9f6e-40da-98c1-f03fc59c4569': (function (self) {
            return {
                'id': '7147196e-9f6e-40da-98c1-f03fc59c4569',
                'asset-pack': 'core',
                'class': 'WhileCondition',
                'options': {
                    'init': function init() {},
                    'conditional': function conditional() {
                        return !notepad.allCodesRead;
                    }
                }
            };
        })({}),
        '73760ed3-cb1b-4560-9d12-4e8009ac39cc': {
            'id': '73760ed3-cb1b-4560-9d12-4e8009ac39cc',
            'name': 're-show instrux 1',
            'parent': 'dbba8112-507d-4d91-bc2c-592bfc7b13cb',
            'asset-pack': 'core',
            'class': 'Sequence',
            'children': ['f2fcb628-b8c2-4dc2-89f8-deaedd3960a4', 'b132a40f-05f1-4019-b5c3-01f7244c13ff', 'e008d89a-1082-43a6-bc5c-b64f952f01c4'],
            'decorators': ['c11d8c24-e8e3-4251-beb6-6e287783dc06'],
            'options': {}
        },
        'f2fcb628-b8c2-4dc2-89f8-deaedd3960a4': (function (self) {
            return {
                'id': 'f2fcb628-b8c2-4dc2-89f8-deaedd3960a4',
                'name': 'Tap when QR Code ready',
                'parent': '73760ed3-cb1b-4560-9d12-4e8009ac39cc',
                'asset-pack': 'core',
                'class': 'ExecuteScriptAsync',
                'options': {
                    'exec': function exec(succeed, fail) {
                        jibo.lps.setPreview({ enable: false }, function (error) {
                            if (error) {
                                notepad.log.error('setPreview disable error: ', error);
                            }
                            blackboard.app.animator.play(notepad.oobeMC, 'openApp');
                            blackboard.app.display.stage.once('click', succeed);
                        });
                    }
                }
            };
        })({}),
        'b132a40f-05f1-4019-b5c3-01f7244c13ff': (function (self) {
            return {
                'id': 'b132a40f-05f1-4019-b5c3-01f7244c13ff',
                'name': 'transition out \'openApp\'',
                'parent': '73760ed3-cb1b-4560-9d12-4e8009ac39cc',
                'asset-pack': 'core',
                'class': 'ExecuteScriptAsync',
                'options': {
                    'exec': function exec(succeed, fail) {
                        blackboard.app.animator.play(notepad.oobeMC, 'openAppTap', succeed);
                    }
                }
            };
        })({}),
        'c11d8c24-e8e3-4251-beb6-6e287783dc06': (function (self) {
            return {
                'id': 'c11d8c24-e8e3-4251-beb6-6e287783dc06',
                'asset-pack': 'core',
                'class': 'Case',
                'options': {
                    'conditional': function conditional() {
                        return !notepad.gotCode && !notepad.allCodesRead && notepad.totalCodes < 2;
                    }
                }
            };
        })({}),
        'e008d89a-1082-43a6-bc5c-b64f952f01c4': (function (self) {
            return {
                'id': 'e008d89a-1082-43a6-bc5c-b64f952f01c4',
                'name': 'show viewfinder',
                'parent': '73760ed3-cb1b-4560-9d12-4e8009ac39cc',
                'asset-pack': 'core',
                'class': 'ExecuteScript',
                'options': {
                    'exec': function exec() {
                        blackboard.app.animator.play(notepad.oobeMC, 'viewfinder');
                        jibo.lps.setPreview({
                            enable: true,
                            x: 176,
                            y: 64,
                            width: 928,
                            height: 522,
                            camera: 0
                        }, function (error) {
                            if (error) {
                                notepad.log.error('setPreview enable error: ', error);
                            }
                        });
                    }
                }
            };
        })({}),
        '649c01ec-1ae5-4b3f-bff3-c758aff83ef1': (function (self) {
            return {
                'id': '649c01ec-1ae5-4b3f-bff3-c758aff83ef1',
                'asset-pack': 'core',
                'class': 'Case',
                'options': {
                    'conditional': function conditional() {
                        return !notepad.gotCode && !notepad.allCodesRead && notepad.totalCodes > 1;
                    }
                }
            };
        })({}),
        'acf36d0f-e424-42bc-93b2-139756121b55': {
            'id': 'acf36d0f-e424-42bc-93b2-139756121b55',
            'name': 're-show instrux 2',
            'parent': 'dbba8112-507d-4d91-bc2c-592bfc7b13cb',
            'asset-pack': 'core',
            'class': 'Sequence',
            'children': ['f499d950-76fc-47ac-b1b4-24e8b96a4f3d', '192af2f8-d59e-4f3b-9f46-9374209bae62', 'e32f3a56-167d-485c-b485-cd3891a94884'],
            'decorators': ['649c01ec-1ae5-4b3f-bff3-c758aff83ef1'],
            'options': {}
        },
        'e32f3a56-167d-485c-b485-cd3891a94884': (function (self) {
            return {
                'id': 'e32f3a56-167d-485c-b485-cd3891a94884',
                'name': 'show viewfinder',
                'parent': 'acf36d0f-e424-42bc-93b2-139756121b55',
                'asset-pack': 'core',
                'class': 'ExecuteScript',
                'options': {
                    'exec': function exec() {
                        blackboard.app.animator.play(notepad.oobeMC, 'viewfinderSpecific');
                        jibo.lps.setPreview({
                            enable: true,
                            x: 176,
                            y: 64,
                            width: 928,
                            height: 522,
                            camera: 0
                        }, function (error) {
                            if (error) {
                                notepad.log.error('setPreview enable error: ', error);
                            }
                        });
                    }
                }
            };
        })({}),
        '192af2f8-d59e-4f3b-9f46-9374209bae62': (function (self) {
            return {
                'id': '192af2f8-d59e-4f3b-9f46-9374209bae62',
                'name': 'transition out \'openApp\'',
                'parent': 'acf36d0f-e424-42bc-93b2-139756121b55',
                'asset-pack': 'core',
                'class': 'ExecuteScriptAsync',
                'options': {
                    'exec': function exec(succeed, fail) {
                        blackboard.app.animator.play(notepad.oobeMC, 'nextCodeTap', succeed);
                    }
                }
            };
        })({}),
        'f499d950-76fc-47ac-b1b4-24e8b96a4f3d': (function (self) {
            return {
                'id': 'f499d950-76fc-47ac-b1b4-24e8b96a4f3d',
                'name': 'Tap when QR Code ready',
                'parent': 'acf36d0f-e424-42bc-93b2-139756121b55',
                'asset-pack': 'core',
                'class': 'ExecuteScriptAsync',
                'options': {
                    'exec': function exec(succeed, fail) {
                        jibo.lps.setPreview({ enable: false }, function (error) {
                            if (error) {
                                notepad.log.error('setPreview disable error: ', error);
                            }
                            blackboard.app.animator.play(notepad.oobeMC, 'nextCode');
                            blackboard.app.display.stage.once('click', succeed);
                        });
                    }
                }
            };
        })({}),
        '98f0f42c-a8fd-4e66-b1d9-7a3db41a37bf': (function (self) {
            return {
                'id': '98f0f42c-a8fd-4e66-b1d9-7a3db41a37bf',
                'name': 'turn on preview and prep vars',
                'parent': '66cbdcd0-66e0-4b1a-a2b7-7256e87479ab',
                'asset-pack': 'core',
                'class': 'ExecuteScriptAsync',
                'options': {
                    'exec': function exec(succeed, fail) {
                        notepad.fromError = false;
                        notepad.qrData = [];
                        notepad.codesReceived = [];
                        notepad.gotCode = false;
                        notepad.totalCodes = 0;
                        blackboard.app.animator.play(notepad.oobeMC, 'viewfinder');
                        jibo.lps.setPreview({
                            enable: true,
                            x: 176,
                            y: 64,
                            width: 928,
                            height: 522,
                            camera: 0
                        }, function (error) {
                            if (error) {
                                notepad.log.error('setPreview enable error: ', error);
                            }
                            blackboard.timer.start();
                            succeed();
                        });
                    }
                }
            };
        })({}),
        '73b9094e-1787-4120-b45b-c84412aec2e9': (function (self) {
            return {
                'id': '73b9094e-1787-4120-b45b-c84412aec2e9',
                'name': 'turn off viewfinder preview',
                'parent': '66cbdcd0-66e0-4b1a-a2b7-7256e87479ab',
                'asset-pack': 'core',
                'class': 'ExecuteScriptAsync',
                'options': {
                    'exec': function exec(succeed, fail) {
                        jibo.lps.setPreview({ enable: false }, function (error) {
                            if (error) {
                                notepad.log.error('setPreview disable error: ', error);
                            }
                            succeed();
                        });
                    }
                }
            };
        })({})
    };
};