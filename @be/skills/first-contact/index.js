(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.befirstContact = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'awakening-submain',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/first-contact/src/flows/awakening/awakening-submain.flow'
        },
        '4ad28cd0-9428-4047-b2a9-27288fe81da9': function () {
            return {
                'id': '4ad28cd0-9428-4047-b2a9-27288fe81da9',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '4ad28cd0-9428-4047-b2a9-27288fe81da9',
                        'to': 'b37a0dfd-5ceb-4f86-b48d-109db820a761',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Begin',
                'options': {
                    'inputParameters': () => {
                        return {};
                    }
                }
            };
        },
        'ccd931e9-f5c1-4005-8e86-135e0b3bddc9': function () {
            return {
                'id': 'ccd931e9-f5c1-4005-8e86-135e0b3bddc9',
                'name': 'eye',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'ccd931e9-f5c1-4005-8e86-135e0b3bddc9',
                        'to': '6779e705-657f-4c9c-849c-4fbcbb45ac3b',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./eye');
                    },
                    'inputParameters': () => {
                        return {};
                    },
                    'getTransition': subflow_result_object => {
                        return subflow_result_object.transition;
                    }
                }
            };
        },
        'cae47e69-7502-4e1e-8c79-111a45301f95': function () {
            return {
                'id': 'cae47e69-7502-4e1e-8c79-111a45301f95',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return;
                    }
                }
            };
        },
        '821ffe53-dda1-47f8-b86f-70d7d53ba230': {
            'id': '821ffe53-dda1-47f8-b86f-70d7d53ba230',
            'transitions': [],
            'exceptions': [],
            'class': 'Flow.Comment',
            'options': {}
        },
        '6779e705-657f-4c9c-849c-4fbcbb45ac3b': function () {
            return {
                'id': '6779e705-657f-4c9c-849c-4fbcbb45ac3b',
                'name': 'track entities...',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '6779e705-657f-4c9c-849c-4fbcbb45ac3b',
                        'to': 'fcf3d690-4fb5-4293-9f13-97a5995011a0',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.face.eye.eye.eyeMesh.alpha = 1;
                        blackboard.numDetected = Math.max(jibo.lps.motionData.entities.length, blackboard.numDetected);
                        done('');
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'd013297c-ecd1-4b33-8706-115d159978be': function () {
            return {
                'id': 'd013297c-ecd1-4b33-8706-115d159978be',
                'name': 'track entities...',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'd013297c-ecd1-4b33-8706-115d159978be',
                        'to': 'cae47e69-7502-4e1e-8c79-111a45301f95',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.numDetected = Math.max(jibo.lps.motionData.entities.length, blackboard.numDetected);
                        done('');
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'fcb2db71-6133-4236-8863-a1b3af54a2e3': function () {
            return {
                'id': 'fcb2db71-6133-4236-8863-a1b3af54a2e3',
                'name': 'double blink',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'fcb2db71-6133-4236-8863-a1b3af54a2e3',
                        'to': 'd013297c-ecd1-4b33-8706-115d159978be',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'PlayAnimation',
                'options': {
                    'animSelector': 3,
                    'animPath': '',
                    'cache': true,
                    'upload': true,
                    'config': animation => {
                    },
                    'animName': 'eye_double_blink_03',
                    'creationOptions': () => {
                        return {};
                    },
                    'playbackOptions': () => {
                        return {};
                    }
                }
            };
        },
        'fcf3d690-4fb5-4293-9f13-97a5995011a0': function () {
            return {
                'id': 'fcf3d690-4fb5-4293-9f13-97a5995011a0',
                'name': 'awakening',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'fcf3d690-4fb5-4293-9f13-97a5995011a0',
                        'to': 'fcb2db71-6133-4236-8863-a1b3af54a2e3',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'PlayAnimation',
                'options': {
                    'animSelector': 3,
                    'animPath': '',
                    'cache': true,
                    'upload': true,
                    'config': animation => {
                    },
                    'animName': 'awakening_variant_4',
                    'creationOptions': () => {
                        return {};
                    },
                    'playbackOptions': () => {
                        return {};
                    }
                }
            };
        },
        'b37a0dfd-5ceb-4f86-b48d-109db820a761': function () {
            return {
                'id': 'b37a0dfd-5ceb-4f86-b48d-109db820a761',
                'name': 'VOID-all-layers',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'b37a0dfd-5ceb-4f86-b48d-109db820a761',
                        'to': 'e0aead43-1f17-4f68-a1f9-9cb3d689069b',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'PlayAnimation',
                'options': {
                    'animSelector': 3,
                    'animPath': '',
                    'cache': true,
                    'upload': true,
                    'config': animation => {
                    },
                    'animName': 'forming-eye-void',
                    'creationOptions': () => {
                        return {};
                    },
                    'playbackOptions': () => {
                        return {};
                    }
                }
            };
        },
        'e0aead43-1f17-4f68-a1f9-9cb3d689069b': function () {
            return {
                'id': 'e0aead43-1f17-4f68-a1f9-9cb3d689069b',
                'name': 'remove blocker view',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'e0aead43-1f17-4f68-a1f9-9cb3d689069b',
                        'to': 'ccd931e9-f5c1-4005-8e86-135e0b3bddc9',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.face.views.changeView({ remove: true }, () => {
                            done();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        }
    };
};
},{"./eye":2}],2:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'eye',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/first-contact/src/flows/awakening/eye.flow'
        },
        '4ad28cd0-9428-4047-b2a9-27288fe81da9': function () {
            return {
                'id': '4ad28cd0-9428-4047-b2a9-27288fe81da9',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '4ad28cd0-9428-4047-b2a9-27288fe81da9',
                        'to': '0f42d6b5-4144-4848-aa40-9a07e758e59d',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Begin',
                'options': {
                    'inputParameters': () => {
                        return {};
                    }
                }
            };
        },
        'c0d2fb3f-5d4a-426f-a5f1-1cf186865772': function () {
            return {
                'id': 'c0d2fb3f-5d4a-426f-a5f1-1cf186865772',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return;
                    }
                }
            };
        },
        '90927812-12ea-45ab-985f-8cd5bbea8351': function () {
            return {
                'id': '90927812-12ea-45ab-985f-8cd5bbea8351',
                'name': 'touched',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '90927812-12ea-45ab-985f-8cd5bbea8351',
                        'to': 'c0d2fb3f-5d4a-426f-a5f1-1cf186865772',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'PlayAnimation',
                'options': {
                    'animSelector': 3,
                    'animPath': 'jibo-anim-db-animations://Skill-Specific/First-Contact/stage-eye/forming-eye-000-touchscreen-touched.keys',
                    'cache': true,
                    'upload': true,
                    'config': animation => {
                    },
                    'animName': 'forming-eye-000-touchscreen-touched',
                    'creationOptions': () => {
                        return {};
                    },
                    'playbackOptions': () => {
                        return {};
                    }
                }
            };
        },
        '058431f7-d1ce-4d97-be97-e0226cbeab71': {
            'id': '058431f7-d1ce-4d97-be97-e0226cbeab71',
            'transitions': [],
            'exceptions': [],
            'class': 'Flow.Comment',
            'options': {}
        },
        'b036b023-15c8-4197-be35-7b2189e8bcf0': function () {
            return {
                'id': 'b036b023-15c8-4197-be35-7b2189e8bcf0',
                'name': 'Touchscreen Listener',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'b036b023-15c8-4197-be35-7b2189e8bcf0',
                        'to': '2943bce8-308e-4017-a901-3cf4cd7d8b41',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': (succeed, fail) => {
                        notepad.onClick = () => {
                            blackboard.log.info('Touched to start FC!');
                            jibo.face.views.currentView.removeActionsByType(jibo.face.views.ActionData.CALLBACK);
                            jibo.face.eye.eye.eyeMesh.alpha = 0;
                            succeed();
                        };
                        let action = new jibo.face.views.ActionData(jibo.face.views.ActionData.CALLBACK, { callback: notepad.onClick });
                        jibo.face.views.currentView.addAction(action);
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '0f42d6b5-4144-4848-aa40-9a07e758e59d': function () {
            return {
                'id': '0f42d6b5-4144-4848-aa40-9a07e758e59d',
                'name': 'touch here',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'PlayAnimation',
                'options': {
                    'animSelector': 3,
                    'animPath': 'jibo-anim-db-animations://Skill-Specific/First-Contact/stage-eye/forming-eye-000-touchscreen-button-01.keys',
                    'cache': true,
                    'upload': true,
                    'config': animation => {
                    },
                    'animName': 'forming-eye-000-touchscreen-button-01',
                    'creationOptions': () => {
                        return { loops: 0 };
                    },
                    'playbackOptions': () => {
                        return {};
                    }
                }
            };
        },
        '44fecc2f-1e12-497b-b858-ad80d300ec73': {
            'id': '44fecc2f-1e12-497b-b858-ad80d300ec73',
            'asset-pack': 'core',
            'transitions': [{
                    'frm': '44fecc2f-1e12-497b-b858-ad80d300ec73',
                    'to': 'b036b023-15c8-4197-be35-7b2189e8bcf0',
                    'value': ''
                }],
            'exceptions': [],
            'class': 'Flow.Begin-Parallel',
            'options': {}
        },
        '2943bce8-308e-4017-a901-3cf4cd7d8b41': function () {
            return {
                'id': '2943bce8-308e-4017-a901-3cf4cd7d8b41',
                'name': '~touched',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '2943bce8-308e-4017-a901-3cf4cd7d8b41',
                        'to': '2f660784-7083-4e85-a4d6-92789355af84',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Interrupt',
                'options': {
                    'getPayload': () => {
                        return {};
                    }
                }
            };
        },
        '2f660784-7083-4e85-a4d6-92789355af84': function () {
            return {
                'id': '2f660784-7083-4e85-a4d6-92789355af84',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return;
                    }
                }
            };
        },
        'b47b75ed-4af3-4e1e-a719-ffb2d030f8ff': function () {
            return {
                'id': 'b47b75ed-4af3-4e1e-a719-ffb2d030f8ff',
                'name': '~touched',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'b47b75ed-4af3-4e1e-a719-ffb2d030f8ff',
                        'to': '90927812-12ea-45ab-985f-8cd5bbea8351',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Catch',
                'options': {
                    'getTransition': (exception, payload) => {
                        return '';
                    }
                }
            };
        },
        'a0404b07-5086-4975-880d-d5108e1c281f': {
            'id': 'a0404b07-5086-4975-880d-d5108e1c281f',
            'transitions': [],
            'exceptions': [],
            'class': 'Flow.Comment',
            'options': {}
        }
    };
};
},{}],3:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'introduction',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/first-contact/src/flows/introduction.flow'
        },
        '59e7ef7a-6e83-4914-b6ff-b461bd6426f2': function () {
            return {
                'id': '59e7ef7a-6e83-4914-b6ff-b461bd6426f2',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '59e7ef7a-6e83-4914-b6ff-b461bd6426f2',
                        'to': '33485b9d-978b-4deb-b057-230500f22f59',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Begin',
                'options': {
                    'inputParameters': () => {
                        return {};
                    }
                }
            };
        },
        '2696f31b-3afb-4051-bfd7-6047d2ed3ede': {
            'id': '2696f31b-3afb-4051-bfd7-6047d2ed3ede',
            'asset-pack': 'core',
            'transitions': [],
            'exceptions': [],
            'class': 'Flow.Comment',
            'options': {}
        },
        '1fcf8cc3-26b3-409d-b1cd-dcfb723e06e8': function () {
            return {
                'id': '1fcf8cc3-26b3-409d-b1cd-dcfb723e06e8',
                'name': 'F C_ I Am Really Here',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '1fcf8cc3-26b3-409d-b1cd-dcfb723e06e8',
                        'to': '6779e705-657f-4c9c-849c-4fbcbb45ac3b',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/oobe/FC_IAmReallyHere.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'e714a602-0aff-427b-ad78-f2ea20ab0f9c': function () {
            return {
                'id': 'e714a602-0aff-427b-ad78-f2ea20ab0f9c',
                'name': 'F C_ I Am Your Robot (uses numDetected)',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'e714a602-0aff-427b-ad78-f2ea20ab0f9c',
                        'to': 'a0a96db3-2791-4b2c-8c66-c2afe882afbc',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/oobe/FC_IAmYourRobot.mim',
                    'getPromptData': () => {
                        blackboard.log.info('max detected entities:', blackboard.numDetected);
                        return { numDetected: blackboard.numDetected };
                    }
                }
            };
        },
        'a0a96db3-2791-4b2c-8c66-c2afe882afbc': function () {
            return {
                'id': 'a0a96db3-2791-4b2c-8c66-c2afe882afbc',
                'name': 'F C_ I Am Very New',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'a0a96db3-2791-4b2c-8c66-c2afe882afbc',
                        'to': 'f82ccf6a-d8b0-4374-8096-adff2249f7af',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/oobe/FC_IAmVeryNew.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'f82ccf6a-d8b0-4374-8096-adff2249f7af': function () {
            return {
                'id': 'f82ccf6a-d8b0-4374-8096-adff2249f7af',
                'name': 'F C_ Say Loop Names',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'f82ccf6a-d8b0-4374-8096-adff2249f7af',
                        'to': '6e1ea933-a75b-4233-b114-7b6727c76d98',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/oobe/FC_SayLoopNames.mim',
                    'getPromptData': () => {
                        return {
                            loopNames: notepad.loopNames,
                            loopCount: notepad.loopNames.length > 0 ? notepad.loopNames.length : 0
                        };
                    }
                }
            };
        },
        '6e1ea933-a75b-4233-b114-7b6727c76d98': function () {
            return {
                'id': '6e1ea933-a75b-4233-b114-7b6727c76d98',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return;
                    }
                }
            };
        },
        '33485b9d-978b-4deb-b057-230500f22f59': function () {
            return {
                'id': '33485b9d-978b-4deb-b057-230500f22f59',
                'name': 'initialize stuff',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '33485b9d-978b-4deb-b057-230500f22f59',
                        'to': '1fcf8cc3-26b3-409d-b1cd-dcfb723e06e8',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        notepad.loopNames = [];
                        blackboard.attentionHandler.release();
                        jibo.kb.loop.loadLoop((err, loop) => {
                            for (let looper of loop) {
                                if (!looper.isJibo) {
                                    notepad.loopNames.push(looper.toString());
                                }
                            }
                            done('');
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '6779e705-657f-4c9c-849c-4fbcbb45ac3b': function () {
            return {
                'id': '6779e705-657f-4c9c-849c-4fbcbb45ac3b',
                'name': 'track entities...',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '6779e705-657f-4c9c-849c-4fbcbb45ac3b',
                        'to': 'e714a602-0aff-427b-ad78-f2ea20ab0f9c',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.numDetected = Math.max(jibo.lps.motionData.entities.length, blackboard.numDetected);
                        for (let i = 0; i < jibo.lps.motionData.entities.length; i++) {
                        }
                        done('');
                    },
                    'onStop': () => {
                    }
                }
            };
        }
    };
};
},{}],4:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'main',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/first-contact/src/flows/main.flow'
        },
        '794cadc6-f20a-41af-8051-f5afd65733ff': function () {
            return {
                'id': '794cadc6-f20a-41af-8051-f5afd65733ff',
                'name': 'Begin',
                'transitions': [{
                        'frm': '794cadc6-f20a-41af-8051-f5afd65733ff',
                        'to': '0f12461c-2766-48b5-98a3-0cb85f7ab85c',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Begin',
                'options': {
                    'inputParameters': () => {
                        return { fromEnrollment: false };
                    }
                }
            };
        },
        'c3ec9349-9457-4595-8f68-014dd1e5c900': function () {
            return {
                'id': 'c3ec9349-9457-4595-8f68-014dd1e5c900',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return '';
                    }
                }
            };
        },
        '0de75e21-0012-4d54-8f8c-a17c3d9e1b3e': {
            'id': '0de75e21-0012-4d54-8f8c-a17c3d9e1b3e',
            'transitions': [],
            'exceptions': [],
            'class': 'Flow.Comment',
            'options': {}
        },
        'fe4ab44a-2087-420f-9d21-e122fb186fce': function () {
            return {
                'id': 'fe4ab44a-2087-420f-9d21-e122fb186fce',
                'name': 'introduction',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'fe4ab44a-2087-420f-9d21-e122fb186fce',
                        'to': 'c3ec9349-9457-4595-8f68-014dd1e5c900',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./introduction');
                    },
                    'inputParameters': () => {
                        return {};
                    },
                    'getTransition': subflow_result_object => {
                        return subflow_result_object.transition;
                    }
                }
            };
        },
        '0f12461c-2766-48b5-98a3-0cb85f7ab85c': function () {
            return {
                'id': '0f12461c-2766-48b5-98a3-0cb85f7ab85c',
                'name': 'awakening-submain',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '0f12461c-2766-48b5-98a3-0cb85f7ab85c',
                        'to': 'fe4ab44a-2087-420f-9d21-e122fb186fce',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./awakening/awakening-submain');
                    },
                    'inputParameters': () => {
                        return {};
                    },
                    'getTransition': subflow_result_object => {
                        return subflow_result_object.transition;
                    }
                }
            };
        }
    };
};
},{"./awakening/awakening-submain":1,"./introduction":3}],5:[function(require,module,exports){
"use strict";
const be_framework_1 = require("@be/be-framework");
var CancelTokenSession = be_framework_1.libraries.jibo_cai_utils.CancelTokenSession;
const jibo = require("jibo");
let mainFlow = require('./flows/main');
var FirstContactCloseStatus;
(function (FirstContactCloseStatus) {
    FirstContactCloseStatus[FirstContactCloseStatus["STOPPED_AND_DESTROYED_FLOW"] = 0] = "STOPPED_AND_DESTROYED_FLOW";
    FirstContactCloseStatus[FirstContactCloseStatus["NO_FLOW"] = 1] = "NO_FLOW";
})(FirstContactCloseStatus || (FirstContactCloseStatus = {}));
class FirstContactSkill extends be_framework_1.BeSkill {
    constructor(assetPack) {
        super(assetPack);
        this._promiseSession = null;
        this.handleHeadTouch = this.handleHeadTouch.bind(this);
        this._promiseSession = new CancelTokenSession();
    }
    open(result) {
        this._isInterruptible = false;
        jibo.action.configure({ orientToHJ: false });
        jibo.globalEvents.touchStop.on(this.handleHeadTouch);
        Promise.resolve()
            .then(() => {
            return this._promiseSession.cancel();
        })
            .then(() => {
            return this._promiseSession.wrap(jibo.expression.pushAttentionMode(jibo.expression.AttentionMode.OFF));
        })
            .then((attentionHandler) => {
            const options = {
                assetPack: this.assetPack,
                blackboard: {
                    numDetected: 0,
                    attentionHandler: attentionHandler,
                    log: this.log
                },
                params: {}
            };
            this.flow = jibo.flow.run(mainFlow, options, () => {
                this._promiseSession.wrap(new Promise((resolve) => {
                    this.redirect('@be/tutorial', {});
                    resolve();
                }));
            });
        })
            .catch((error) => {
            this.log.warn(error);
            this._promiseSession.wrap(new Promise((resolve) => {
                this.redirect('@be/tutorial', {});
                resolve();
            }));
        });
    }
    preload(done) {
        this.hjHandle = jibo.jetstream.setHotwordMode(jibo.jetstream.types.HotwordListenMode.Disabled);
        this.hjHandle.activated.catch((err) => {
        }).then(() => {
            jibo.face.views.forceEyeView(() => { this._addBlockerView(done); }, null, jibo.face.views.TRANSITION.NONE, jibo.face.views.TRANSITION.NONE, (err) => {
                this.log.error("problem with forcing eye view:", err);
                this._addBlockerView(done);
            });
        });
    }
    _addBlockerView(done) {
        let blockerView = jibo.face.views.createView('View');
        jibo.face.views.changeView({
            addView: blockerView
        }, () => { done(); });
    }
    handleHeadTouch() {
        this.log.info("head touch overriden in first contact");
    }
    close(done) {
        this._promiseSession.cancel()
            .then(() => {
            this._clearFC((err) => {
                if (err) {
                    this.log.warn('Clearing FC: ' + err);
                }
                jibo.globalEvents.touchStop.removeListener(this.handleHeadTouch);
                jibo.action.configure({ orientToHJ: true });
                this._isInterruptible = true;
                if (this.hjHandle) {
                    this.hjHandle.release().catch(() => {
                    }).then(() => {
                        this.hjHandle = null;
                        if (this.flow) {
                            this.flow.stopAndDestroy().then(() => {
                                this.flow = null;
                                done(null, FirstContactCloseStatus.STOPPED_AND_DESTROYED_FLOW);
                            });
                        }
                        else {
                            done(null, FirstContactCloseStatus.NO_FLOW);
                        }
                    });
                }
                else {
                    if (this.flow) {
                        this.flow.stopAndDestroy().then(() => {
                            this.flow = null;
                            done(null, FirstContactCloseStatus.STOPPED_AND_DESTROYED_FLOW);
                        });
                    }
                    else {
                        done(null, FirstContactCloseStatus.NO_FLOW);
                    }
                }
            });
        });
    }
    _clearFC(done) {
        let kbm = jibo.kb.createModel('/skills-config');
        kbm.loadRoot((err, rootNode) => {
            if (err) {
                return done(new Error('Unable to load root to set FC flag: ' + err));
            }
            if (rootNode && rootNode.data) {
                rootNode.data.hasAlreadyLaunchedFirstContact = true;
                rootNode.save((err) => {
                    done(err ? new Error('Unable to save FC flag: ' + err) : null);
                });
            }
            else {
                done(new Error("Unable to retrieve root for 'skills-config'"));
            }
        });
    }
}
module.exports = {
    Skill: FirstContactSkill,
    FirstContactSkill: FirstContactSkill,
    FirstContactCloseStatus: FirstContactCloseStatus
};

},{"./flows/main":4,"@be/be-framework":undefined,"jibo":undefined}]},{},[5])(5)
});
//# sourceMappingURL=index.js.map