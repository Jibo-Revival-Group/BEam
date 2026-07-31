(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.begallery = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Analytics {
    constructor(skill) {
        this.skill = skill;
        this.itemsViewed = 0;
        this.itemsOpened = 0;
        this.wasOpened = false;
        this.itemWasDeleted = false;
    }
    opened() {
        this.skill.track('Gallery Opened');
        this.itemsViewed = 0;
        this.itemsOpened = 0;
        this.wasOpened = true;
        this.itemWasDeleted = false;
    }
    itemViewed() {
        this.itemsViewed++;
    }
    itemOpened() {
        this.itemsOpened++;
        this.itemViewed();
    }
    itemDeleted() {
        this.itemWasDeleted = true;
    }
    finished() {
        if (this.wasOpened) {
            this.skill.track('Gallery Finished', {
                items_viewed: this.itemsViewed,
                items_opened: this.itemsOpened,
                photo_deleted: this.itemWasDeleted
            });
            this.wasOpened = false;
        }
    }
}
exports.default = Analytics;

},{}],2:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'actualDelete',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/gallery/src/flows/actualDelete.flow'
        },
        '2755d009-7ec4-48ef-be1d-a0bd0ad3615f': function () {
            return {
                'id': '2755d009-7ec4-48ef-be1d-a0bd0ad3615f',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '2755d009-7ec4-48ef-be1d-a0bd0ad3615f',
                        'to': '3b115f27-b113-4e11-9dce-165ea3649961',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Begin',
                'options': {
                    'inputParameters': () => {
                        return { itemId: '' };
                    }
                }
            };
        },
        '4865f7c4-531e-45f4-8053-4a3cf86cdb62': {
            'id': '4865f7c4-531e-45f4-8053-4a3cf86cdb62',
            'asset-pack': 'core',
            'transitions': [{
                    'frm': '4865f7c4-531e-45f4-8053-4a3cf86cdb62',
                    'to': 'ba85962a-deeb-4f7d-a9ef-d55511b06cb3',
                    'value': ''
                }],
            'exceptions': [],
            'class': 'Flow.Begin-Parallel',
            'options': {}
        },
        '3ab4a5c6-ca16-4a2f-9f9f-b3580e7e87a8': {
            'id': '3ab4a5c6-ca16-4a2f-9f9f-b3580e7e87a8',
            'asset-pack': 'core',
            'transitions': [{
                    'frm': '3ab4a5c6-ca16-4a2f-9f9f-b3580e7e87a8',
                    'to': '2491d482-a2a5-4f1e-9aec-d4cb9bb7882d',
                    'value': ''
                }],
            'exceptions': [],
            'class': 'Flow.Begin-Parallel',
            'options': {}
        },
        'ba85962a-deeb-4f7d-a9ef-d55511b06cb3': function () {
            return {
                'id': 'ba85962a-deeb-4f7d-a9ef-d55511b06cb3',
                'name': 'Delete From Gallery',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'ba85962a-deeb-4f7d-a9ef-d55511b06cb3',
                        'to': '9caf76c0-b3c3-4dee-88a0-dd50a3566405',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/DeleteFromGallery.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '2491d482-a2a5-4f1e-9aec-d4cb9bb7882d': function () {
            return {
                'id': '2491d482-a2a5-4f1e-9aec-d4cb9bb7882d',
                'name': 'Delete media',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '2491d482-a2a5-4f1e-9aec-d4cb9bb7882d',
                        'to': '9caf76c0-b3c3-4dee-88a0-dd50a3566405',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.analytics.itemDeleted();
                        blackboard.media.deleteItem(notepad.params.itemId, blackboard.userData).then(() => {
                            done();
                        }, err => {
                            console.error('Actually, could not delete item: ', err);
                            done();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '9caf76c0-b3c3-4dee-88a0-dd50a3566405': function () {
            return {
                'id': '9caf76c0-b3c3-4dee-88a0-dd50a3566405',
                'name': 'Is Everything Complete?',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '9caf76c0-b3c3-4dee-88a0-dd50a3566405',
                        'to': '664a0dbf-24bb-4875-aad8-ca99b67e4741',
                        'value': 'true'
                    },
                    {
                        'frm': '9caf76c0-b3c3-4dee-88a0-dd50a3566405',
                        'to': 'f5c538ce-df4e-4b0a-a49d-c0fece96fb0f',
                        'value': 'false'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        return ++notepad.completes >= 2;
                    }
                }
            };
        },
        '664a0dbf-24bb-4875-aad8-ca99b67e4741': function () {
            return {
                'id': '664a0dbf-24bb-4875-aad8-ca99b67e4741',
                'name': '~Complete',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '664a0dbf-24bb-4875-aad8-ca99b67e4741',
                        'to': 'f5c538ce-df4e-4b0a-a49d-c0fece96fb0f',
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
        'f5c538ce-df4e-4b0a-a49d-c0fece96fb0f': function () {
            return {
                'id': 'f5c538ce-df4e-4b0a-a49d-c0fece96fb0f',
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
        '3b115f27-b113-4e11-9dce-165ea3649961': function () {
            return {
                'id': '3b115f27-b113-4e11-9dce-165ea3649961',
                'name': 'Init and Wait',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        notepad.completes = 0;
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '46bf39bd-6b83-4090-a342-258ac9c193cd': function () {
            return {
                'id': '46bf39bd-6b83-4090-a342-258ac9c193cd',
                'name': '~Complete',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '46bf39bd-6b83-4090-a342-258ac9c193cd',
                        'to': 'e1e61328-765e-4e5d-9ede-c6da9243a787',
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
        'e1e61328-765e-4e5d-9ede-c6da9243a787': function () {
            return {
                'id': 'e1e61328-765e-4e5d-9ede-c6da9243a787',
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
        }
    };
};
},{}],3:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'deleteItem',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/gallery/src/flows/deleteItem.flow'
        },
        'fc2192d4-47da-49be-bc30-46edfce517f6': function () {
            return {
                'id': 'fc2192d4-47da-49be-bc30-46edfce517f6',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'fc2192d4-47da-49be-bc30-46edfce517f6',
                        'to': '28184040-b4c6-46e3-a8be-67f496e56122',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Begin',
                'options': {
                    'inputParameters': () => {
                        return {
                            itemIndex: -1,
                            itemId: '',
                            needsConfirmation: false
                        };
                    }
                }
            };
        },
        '4065107f-0db9-4b78-9151-e130ca04655a': function () {
            return {
                'id': '4065107f-0db9-4b78-9151-e130ca04655a',
                'name': 'Confirm Delete Item',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '4065107f-0db9-4b78-9151-e130ca04655a',
                        'to': '3ccf52f1-963b-457b-adec-bda4c741647f',
                        'value': 'yes'
                    },
                    {
                        'frm': '4065107f-0db9-4b78-9151-e130ca04655a',
                        'to': '3e516aab-1636-42e1-8c34-559811cb1fc7',
                        'value': 'no'
                    }
                ],
                'exceptions': [{
                        'frm': '4065107f-0db9-4b78-9151-e130ca04655a',
                        'to': 'a3937969-b6a7-47b5-928c-32913b958d3b',
                        'value': '~InteractionError'
                    }],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/ConfirmDeleteItem.mim',
                    'getPromptData': () => {
                        return {};
                    },
                    'onStatus': status => {
                        let mimState = status.state;
                        let asrResults = status.asrResults;
                    },
                    'onSuccess': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let transition = results.firstGrammarTag;
                        return transition;
                    },
                    'onFailure': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let exception = results.exception;
                        return exception;
                    }
                }
            };
        },
        '3e516aab-1636-42e1-8c34-559811cb1fc7': function () {
            return {
                'id': '3e516aab-1636-42e1-8c34-559811cb1fc7',
                'name': 'No Delete',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '3e516aab-1636-42e1-8c34-559811cb1fc7',
                        'to': 'cc9526b2-721c-45f4-a27a-fe81cec5e777',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/NoDelete.mim',
                    'getPromptData': () => {
                        return { type: 'photo' };
                    }
                }
            };
        },
        'a3937969-b6a7-47b5-928c-32913b958d3b': function () {
            return {
                'id': 'a3937969-b6a7-47b5-928c-32913b958d3b',
                'name': 'No Delete2',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'a3937969-b6a7-47b5-928c-32913b958d3b',
                        'to': 'cc9526b2-721c-45f4-a27a-fe81cec5e777',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/NoDelete2.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'cc9526b2-721c-45f4-a27a-fe81cec5e777': function () {
            return {
                'id': 'cc9526b2-721c-45f4-a27a-fe81cec5e777',
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
        '3d7b74b8-54e9-463d-ac17-5b746624510b': {
            'id': '3d7b74b8-54e9-463d-ac17-5b746624510b',
            'asset-pack': 'core',
            'transitions': [{
                    'frm': '3d7b74b8-54e9-463d-ac17-5b746624510b',
                    'to': '2badd089-38dd-4c20-aa11-bbe53f4ab0e0',
                    'value': ''
                }],
            'exceptions': [],
            'class': 'Flow.Begin-Parallel',
            'options': {}
        },
        '2badd089-38dd-4c20-aa11-bbe53f4ab0e0': function () {
            return {
                'id': '2badd089-38dd-4c20-aa11-bbe53f4ab0e0',
                'name': 'Run pausing view',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '2badd089-38dd-4c20-aa11-bbe53f4ab0e0',
                        'to': 'c64bf515-d93a-4a8f-95f1-1abafde1f2b6',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        jibo.face.views.currentView.pause(true);
                    }
                }
            };
        },
        'c64bf515-d93a-4a8f-95f1-1abafde1f2b6': function () {
            return {
                'id': 'c64bf515-d93a-4a8f-95f1-1abafde1f2b6',
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
        '28184040-b4c6-46e3-a8be-67f496e56122': function () {
            return {
                'id': '28184040-b4c6-46e3-a8be-67f496e56122',
                'name': 'Check if need confirmation',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '28184040-b4c6-46e3-a8be-67f496e56122',
                        'to': '4065107f-0db9-4b78-9151-e130ca04655a',
                        'value': 'true'
                    },
                    {
                        'frm': '28184040-b4c6-46e3-a8be-67f496e56122',
                        'to': '3ccf52f1-963b-457b-adec-bda4c741647f',
                        'value': 'false'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        return notepad.params.needsConfirmation;
                    }
                }
            };
        },
        '3ccf52f1-963b-457b-adec-bda4c741647f': function () {
            return {
                'id': '3ccf52f1-963b-457b-adec-bda4c741647f',
                'name': 'actualDelete',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '3ccf52f1-963b-457b-adec-bda4c741647f',
                        'to': 'cc9526b2-721c-45f4-a27a-fe81cec5e777',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./actualDelete');
                    },
                    'inputParameters': () => {
                        return { itemId: notepad.params.itemId };
                    },
                    'getTransition': subflow_result_object => {
                        return subflow_result_object.transition;
                    }
                }
            };
        }
    };
};
},{"./actualDelete":2}],4:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'itemView',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/gallery/src/flows/itemView.flow'
        },
        'dc0d74ec-6ed3-496e-820a-38e1e5ac2882': function () {
            return {
                'id': 'dc0d74ec-6ed3-496e-820a-38e1e5ac2882',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'dc0d74ec-6ed3-496e-820a-38e1e5ac2882',
                        'to': 'cc334784-139e-4c9a-88e7-4243e999a644',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Begin',
                'options': {
                    'inputParameters': () => {
                        return { itemId: '' };
                    }
                }
            };
        },
        '677fd350-4b22-4ef4-80cd-5a8ffc3ab59d': {
            'id': '677fd350-4b22-4ef4-80cd-5a8ffc3ab59d',
            'asset-pack': 'core',
            'transitions': [{
                    'frm': '677fd350-4b22-4ef4-80cd-5a8ffc3ab59d',
                    'to': '5ee632bd-9c3d-4cae-9936-adca7f7fb14d',
                    'value': ''
                }],
            'exceptions': [],
            'class': 'Flow.Begin-Parallel',
            'options': {}
        },
        '5ee632bd-9c3d-4cae-9936-adca7f7fb14d': function () {
            return {
                'id': '5ee632bd-9c3d-4cae-9936-adca7f7fb14d',
                'name': 'Listen for paged',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        const List = jibo.rendering.gui.components.List;
                        notepad.pagedListener = event => {
                            if (event.event === List.PAGED) {
                                notepad.itemId = event.data.itemId;
                                notepad.itemIndex = event.data.index;
                                blackboard.analytics.itemViewed();
                            }
                        };
                        jibo.face.views.events.view.on(notepad.pagedListener);
                    },
                    'onStop': () => {
                        jibo.face.views.events.view.removeListener(notepad.pagedListener);
                    }
                }
            };
        },
        'cc334784-139e-4c9a-88e7-4243e999a644': function () {
            return {
                'id': 'cc334784-139e-4c9a-88e7-4243e999a644',
                'name': 'Item View',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'cc334784-139e-4c9a-88e7-4243e999a644',
                        'to': '775eccb8-0db5-42ed-955a-d50d69864c32',
                        'value': 'pause'
                    },
                    {
                        'frm': 'cc334784-139e-4c9a-88e7-4243e999a644',
                        'to': '775eccb8-0db5-42ed-955a-d50d69864c32',
                        'value': 'delete'
                    }
                ],
                'exceptions': [{
                        'frm': 'cc334784-139e-4c9a-88e7-4243e999a644',
                        'to': '775eccb8-0db5-42ed-955a-d50d69864c32',
                        'value': '~InteractionError.MenuClosed'
                    }],
                'class': 'Menu',
                'options': {
                    'getConfig': callback => {
                        notepad.itemId = notepad.params.itemId;
                        let config = blackboard.buildItemList(blackboard.userData, notepad.itemId);
                        notepad.itemIndex = config.viewConfig.pageIndex;
                        callback(config);
                    },
                    'onMenuClosed': (wasTimeout, menu, overrideMenuTransition, exception) => {
                        return exception;
                    },
                    'onItemChosen': (chosen, menu, overrideMenuTransition) => {
                        if (chosen.intent === 'delete') {
                            return 'delete';
                        } else {
                            return 'pause';
                        }
                    },
                    'onPositionalSelect': (commandAsr, intendedIndex, menu) => {
                    }
                }
            };
        },
        '775eccb8-0db5-42ed-955a-d50d69864c32': function () {
            return {
                'id': '775eccb8-0db5-42ed-955a-d50d69864c32',
                'name': 'Exit (value decided from input)',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        result.itemId = notepad.itemId;
                        result.itemIndex = notepad.itemIndex;
                        const trans = this.inTransition || this.in.name;
                        switch (trans) {
                        case '~InteractionError.MenuClosed':
                            return 'back';
                        case 'delete':
                        case 'pause':
                            return trans;
                        default:
                            console.error('Invalid transition from Item View: ', trans);
                            return '~InvalidItemViewExit';
                        }
                    }
                }
            };
        },
        'c0b9bc3f-2e6b-4dbf-affa-5c92789c2d7c': {
            'id': 'c0b9bc3f-2e6b-4dbf-affa-5c92789c2d7c',
            'asset-pack': 'core',
            'transitions': [],
            'exceptions': [],
            'class': 'Flow.Comment',
            'options': {}
        }
    };
};
},{}],5:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'main',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/gallery/src/flows/main.flow'
        },
        'c3ddb137-9994-4ff8-ae7d-b5ccb13f67ab': function () {
            return {
                'id': 'c3ddb137-9994-4ff8-ae7d-b5ccb13f67ab',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'c3ddb137-9994-4ff8-ae7d-b5ccb13f67ab',
                        'to': 'cf4c7d60-9607-41e9-b6f8-294c8f1002da',
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
        'cf4c7d60-9607-41e9-b6f8-294c8f1002da': function () {
            return {
                'id': 'cf4c7d60-9607-41e9-b6f8-294c8f1002da',
                'name': 'Load Gallery',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'cf4c7d60-9607-41e9-b6f8-294c8f1002da',
                        'to': 'b853e7b4-eaf2-4710-aae1-b372a3d71aac',
                        'value': 'empty'
                    },
                    {
                        'frm': 'cf4c7d60-9607-41e9-b6f8-294c8f1002da',
                        'to': '058e3496-7048-4364-ba8b-83f22e915cc7',
                        'value': 'error'
                    },
                    {
                        'frm': 'cf4c7d60-9607-41e9-b6f8-294c8f1002da',
                        'to': '96126817-66c4-4881-a8cf-9e0f0f64043b',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        notepad.log = blackboard.parentLog.createChild('main');
                        blackboard.media.getMedia().then(userData => {
                            blackboard.userData = userData;
                            if (!userData || userData.isEmpty) {
                                jibo.face.views.forceEyeView();
                                return done('empty');
                            }
                            blackboard.analytics.opened();
                            this.out = -1;
                            done();
                        }, e => {
                            jibo.face.views.forceEyeView();
                            notepad.log.debug('Error loading Media:', e);
                            done('error');
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'b853e7b4-eaf2-4710-aae1-b372a3d71aac': function () {
            return {
                'id': 'b853e7b4-eaf2-4710-aae1-b372a3d71aac',
                'name': 'Empty Gallery',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'b853e7b4-eaf2-4710-aae1-b372a3d71aac',
                        'to': '69911730-39e3-4a04-9979-8d0a2f8cf85f',
                        'value': 'yes'
                    },
                    {
                        'frm': 'b853e7b4-eaf2-4710-aae1-b372a3d71aac',
                        'to': '3a8cb073-9c90-429e-983c-bf9ec07bec0d',
                        'value': 'no'
                    },
                    {
                        'frm': 'b853e7b4-eaf2-4710-aae1-b372a3d71aac',
                        'to': '300c375a-a520-4cb8-be66-80e6f2459ee3',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/EmptyGallery.mim',
                    'getPromptData': () => {
                        return {};
                    },
                    'onStatus': status => {
                    },
                    'onSuccess': results => {
                        let transition = results.firstGrammarTag;
                        return transition;
                    },
                    'onFailure': results => {
                        let exception = results.exception;
                        return exception;
                    }
                }
            };
        },
        '69911730-39e3-4a04-9979-8d0a2f8cf85f': function () {
            return {
                'id': '69911730-39e3-4a04-9979-8d0a2f8cf85f',
                'name': 'create',
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
        '058e3496-7048-4364-ba8b-83f22e915cc7': function () {
            return {
                'id': '058e3496-7048-4364-ba8b-83f22e915cc7',
                'name': 'Gallery Unavailable',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '058e3496-7048-4364-ba8b-83f22e915cc7',
                        'to': '300c375a-a520-4cb8-be66-80e6f2459ee3',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/GalleryUnavailable.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '212fe4b1-264d-4631-8889-fa73a90d7883': function () {
            return {
                'id': '212fe4b1-264d-4631-8889-fa73a90d7883',
                'name': 'return',
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
        '300c375a-a520-4cb8-be66-80e6f2459ee3': function () {
            return {
                'id': '300c375a-a520-4cb8-be66-80e6f2459ee3',
                'name': 'exit',
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
        '96126817-66c4-4881-a8cf-9e0f0f64043b': function () {
            return {
                'id': '96126817-66c4-4881-a8cf-9e0f0f64043b',
                'name': 'Thumbnail List',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '96126817-66c4-4881-a8cf-9e0f0f64043b',
                        'to': '5d3cfe07-4810-49ff-a825-affcae31146e',
                        'value': ''
                    }],
                'exceptions': [{
                        'frm': '96126817-66c4-4881-a8cf-9e0f0f64043b',
                        'to': '212fe4b1-264d-4631-8889-fa73a90d7883',
                        'value': '~InteractionError.MenuClosed'
                    }],
                'class': 'Menu',
                'options': {
                    'getConfig': callback => {
                        notepad.log.debug(`Entering thumbnail list with focus index of ${ this.in }`);
                        let indexFromItemView = this.in;
                        const userData = blackboard.userData;
                        let config = blackboard.buildThumbList(userData, this.activeFilter || 'all');
                        if (indexFromItemView > -1) {
                            config.baseMim = 'mims/en-us/ReopenGallery.mim';
                            config.open.transitionOpen = 'trans_down';
                            if (indexFromItemView >= userData.length) {
                                indexFromItemView = userData.length - 1;
                            }
                            config.viewConfig.pageIndex = Math.floor(indexFromItemView / 3);
                            config.viewConfig.indexOfAction = indexFromItemView;
                        } else {
                            config.baseMim = 'mims/en-us/OpenGallery.mim';
                        }
                        callback(config);
                    },
                    'onMenuClosed': (wasTimeout, menu, overrideMenuTransition, exception) => {
                        return exception;
                    },
                    'onItemChosen': (chosen, menu, overrideMenuTransition) => {
                        if (chosen.filter) {
                            this.out = chosen.filter;
                            return 'filter';
                        } else {
                            notepad.log.debug('Item opened on Thumbnail List - id: ', chosen.id);
                            this.out = chosen.id;
                            blackboard.analytics.itemOpened();
                        }
                    },
                    'onPositionalSelect': (commandAsr, intendedIndex, menu) => {
                    }
                }
            };
        },
        '5d3cfe07-4810-49ff-a825-affcae31146e': function () {
            return {
                'id': '5d3cfe07-4810-49ff-a825-affcae31146e',
                'name': 'Item View Flow',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '5d3cfe07-4810-49ff-a825-affcae31146e',
                        'to': '96126817-66c4-4881-a8cf-9e0f0f64043b',
                        'value': 'back'
                    },
                    {
                        'frm': '5d3cfe07-4810-49ff-a825-affcae31146e',
                        'to': '91d79b7a-75ea-411e-a73a-81dc85dd6c46',
                        'value': 'delete'
                    },
                    {
                        'frm': '5d3cfe07-4810-49ff-a825-affcae31146e',
                        'to': '14ddc5af-f6b3-4a79-bdde-c14255ff905c',
                        'value': 'pause'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./itemView');
                    },
                    'inputParameters': () => {
                        notepad.log.debug(`Entering item view with item id of ${ this.in }`);
                        return { itemId: this.in };
                    },
                    'getTransition': _result => {
                        if (_result.transition === 'back') {
                            this.out = _result.itemIndex;
                            notepad.log.debug(`Returning to thumbnail list from item view - focus index: ${ _result.itemIndex }`);
                        } else {
                            this.out = {
                                itemIndex: _result.itemIndex,
                                itemId: _result.itemId
                            };
                            if (_result.transition === 'delete') {
                                this.out.needsConfirmation = true;
                                notepad.log.debug(`Attempting to delete item ${ _result.itemId } from item view`);
                            } else {
                                notepad.log.debug(`Going to pause menu on ${ _result.itemId }`);
                            }
                        }
                        return _result.transition;
                    }
                }
            };
        },
        '91d79b7a-75ea-411e-a73a-81dc85dd6c46': function () {
            return {
                'id': '91d79b7a-75ea-411e-a73a-81dc85dd6c46',
                'name': 'Delete Item',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '91d79b7a-75ea-411e-a73a-81dc85dd6c46',
                        'to': '7548ac75-f37a-40cb-b50b-860889bfe01a',
                        'value': 'empty'
                    },
                    {
                        'frm': '91d79b7a-75ea-411e-a73a-81dc85dd6c46',
                        'to': '5d3cfe07-4810-49ff-a825-affcae31146e',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./deleteItem');
                    },
                    'inputParameters': () => {
                        return this.in;
                    },
                    'getTransition': subflow_result_object => {
                        if (blackboard.userData.isEmpty) {
                            jibo.face.views.forceEyeView();
                            return 'empty';
                        }
                        const itemView = jibo.face.views.currentView;
                        itemView.pause(false);
                        const index = Math.min(this.in.itemIndex, blackboard.userData.length - 1);
                        this.out = itemView.list.getComponentByIndex(index).id;
                    }
                }
            };
        },
        '7548ac75-f37a-40cb-b50b-860889bfe01a': function () {
            return {
                'id': '7548ac75-f37a-40cb-b50b-860889bfe01a',
                'name': 'No More Items',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '7548ac75-f37a-40cb-b50b-860889bfe01a',
                        'to': '300c375a-a520-4cb8-be66-80e6f2459ee3',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/NoMoreItems.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '14ddc5af-f6b3-4a79-bdde-c14255ff905c': function () {
            return {
                'id': '14ddc5af-f6b3-4a79-bdde-c14255ff905c',
                'name': 'Pause Menu',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '14ddc5af-f6b3-4a79-bdde-c14255ff905c',
                        'to': '96126817-66c4-4881-a8cf-9e0f0f64043b',
                        'value': 'close'
                    },
                    {
                        'frm': '14ddc5af-f6b3-4a79-bdde-c14255ff905c',
                        'to': '91d79b7a-75ea-411e-a73a-81dc85dd6c46',
                        'value': 'delete'
                    }
                ],
                'exceptions': [{
                        'frm': '14ddc5af-f6b3-4a79-bdde-c14255ff905c',
                        'to': '5d3cfe07-4810-49ff-a825-affcae31146e',
                        'value': '~InteractionError.MenuClosed'
                    }],
                'class': 'Menu',
                'options': {
                    'getConfig': loadCallback => {
                        loadCallback('assets/menus/pause_photo.json');
                    },
                    'onMenuClosed': (wasTimeout, menu, overrideMenuTransition, exception) => {
                        this.out = this.in.itemId;
                        return exception;
                    },
                    'onItemChosen': (chosen, menu, overrideMenuTransition) => {
                        if (chosen.intent === 'delete') {
                            this.out = this.in;
                            this.out.needsConfirmation = false;
                            notepad.log.debug(`Attempting to delete item ${ this.out.itemId } from pause menu`);
                            return 'delete';
                        } else if (chosen.intent === 'close') {
                            this.out = this.in.itemIndex;
                            notepad.log.debug(`Returning to thumbnail list from pause menu - focus index: ${ this.out }`);
                            return 'close';
                        }
                    },
                    'onPositionalSelect': (commandAsr, intendedIndex, menu) => {
                    }
                }
            };
        },
        'baa62732-bacc-44a3-ac16-f7f986d4ecda': function () {
            return {
                'id': 'baa62732-bacc-44a3-ac16-f7f986d4ecda',
                'name': '~allDeleted',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'baa62732-bacc-44a3-ac16-f7f986d4ecda',
                        'to': '0960a5dc-115d-430e-8e68-54eead924517',
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
        '0960a5dc-115d-430e-8e68-54eead924517': function () {
            return {
                'id': '0960a5dc-115d-430e-8e68-54eead924517',
                'name': 'Show Eye',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '0960a5dc-115d-430e-8e68-54eead924517',
                        'to': '7548ac75-f37a-40cb-b50b-860889bfe01a',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        jibo.face.views.forceEyeView();
                    }
                }
            };
        },
        '9eec6291-5f8d-4c23-8a30-d656029d6f54': {
            'id': '9eec6291-5f8d-4c23-8a30-d656029d6f54',
            'asset-pack': 'core',
            'transitions': [{
                    'frm': '9eec6291-5f8d-4c23-8a30-d656029d6f54',
                    'to': 'c424205a-9554-46ce-ad83-d0476c06bb31',
                    'value': ''
                }],
            'exceptions': [],
            'class': 'Flow.Begin-Parallel',
            'options': {}
        },
        '714130b4-e691-4c36-b498-4feb055ed939': function () {
            return {
                'id': '714130b4-e691-4c36-b498-4feb055ed939',
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
        'c424205a-9554-46ce-ad83-d0476c06bb31': function () {
            return {
                'id': 'c424205a-9554-46ce-ad83-d0476c06bb31',
                'name': 'Wait for All Deleted',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'c424205a-9554-46ce-ad83-d0476c06bb31',
                        'to': '941fc965-d8c9-41f4-aac6-9e0b3f5ac897',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.Notifier.allDeleted.on(() => {
                            blackboard.Notifier.allDeleted.removeAllListeners();
                            done();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '941fc965-d8c9-41f4-aac6-9e0b3f5ac897': function () {
            return {
                'id': '941fc965-d8c9-41f4-aac6-9e0b3f5ac897',
                'name': '~allDeleted',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '941fc965-d8c9-41f4-aac6-9e0b3f5ac897',
                        'to': '714130b4-e691-4c36-b498-4feb055ed939',
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
        '3a8cb073-9c90-429e-983c-bf9ec07bec0d': function () {
            return {
                'id': '3a8cb073-9c90-429e-983c-bf9ec07bec0d',
                'name': 'Empty Cancel',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '3a8cb073-9c90-429e-983c-bf9ec07bec0d',
                        'to': '300c375a-a520-4cb8-be66-80e6f2459ee3',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/EmptyCancel.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        }
    };
};
},{"./deleteItem":3,"./itemView":4}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
var Button = jibo.rendering.gui.components.Button;
const DIMENSIONS = new PIXI.Point(1280, 720);
class ImageItem extends Button {
    constructor() {
        super(...arguments);
        this._type = ImageItem.DEFAULT_TYPE;
        this.dimensions = DIMENSIONS;
    }
    static get DEFAULT_TYPE() { return 'ImageItem'; }
    static createFromConfig(configData) {
        let btn = new ImageItem();
        btn.assignConfig(configData);
        return btn;
    }
    assignConfig(configData) {
        if (configData) {
            super.assignConfig(configData);
            this.addAssetDescriptor(this.id, configData.imageSrc, 'texture');
        }
    }
    setupDisplay(assets) {
        const tex = assets[this.id];
        let image = new PIXI.Sprite(tex || PIXI.Texture.EMPTY);
        this.display.addChild(image);
        this.setupHitArea(new PIXI.Rectangle(0, 0, 1280, 720));
        this.setupInteractions();
    }
}
exports.default = ImageItem;

},{"jibo":undefined}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
var MenuView = jibo.rendering.gui.views.MenuView;
var ActionData = jibo.rendering.gui.actions.ActionData;
class ItemPauseView extends MenuView {
    actionEnactor(action) {
        if (action.type === ActionData.VERBAL_COMMAND) {
            switch (action.data.intent) {
                case 'resume':
                    this.triggerActions('swipeDown');
                    return true;
            }
        }
        return super.actionEnactor(action);
    }
}
exports.default = ItemPauseView;

},{"jibo":undefined}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
var MenuView = jibo.rendering.gui.views.MenuView;
var ActionData = jibo.rendering.gui.actions.ActionData;
var List = jibo.rendering.gui.components.List;
const Notifier_1 = require("../utils/Notifier");
class ItemView extends MenuView {
    constructor(viewState) {
        super(viewState);
        this.onItemsDeleted = this.onItemsDeleted.bind(this);
    }
    actionEnactor(action) {
        if (action.type === ActionData.VERBAL_COMMAND) {
            switch (action.data.intent) {
                case 'pause':
                    return super.actionEnactor(new ActionData(action.type, new jibo.jetstream.types.ListenResult(null, { intent: 'selectItem', entities: {}, rules: [] })));
            }
        }
        return super.actionEnactor(action);
    }
    actionHandler(action, fromComponent) {
        const component = this._list.getComponentByIndex(this._list.pageIndex);
        if (action.type === ActionData.EVENT && action.data.event === List.PAGED) {
            action.data.itemId = component.id;
            action.data.index = this._list.pageIndex;
        }
        super.actionHandler(action, fromComponent);
    }
    applyData() {
        this.addAssetDescriptorObject({
            id: 'delete-sfx',
            type: 'sound',
            src: 'audio/delete.m4a'
        });
        this._choiceBtn = new jibo.rendering.gui.components.MenuButton();
        this._choiceBtn.addAssetDescriptorObject({
            id: 'delete',
            type: 'texture',
            src: 'core://resources/actionIcons/delete.png',
            cache: 'global-gui'
        });
        this._choiceBtn.interactable = false;
        this._choiceBtn.applyButtonType(jibo.rendering.gui.components.MenuButton.ACTION);
        this.addComponent(this._choiceBtn, 'choiceBtn');
        super.applyData();
    }
    ready() {
        super.ready();
        const display = this._choiceBtn.display;
        display.parent.removeChild(display);
        display.pivot.x = this._choiceBtn.dimensions.width / 2;
        display.pivot.y = this._choiceBtn.dimensions.height / 2;
        this._choiceBtn.setIcon(new PIXI.Sprite(this.assets['delete']));
        this._choiceBtn.colors = 'cancel';
        Notifier_1.default.deleted.on(this.onItemsDeleted);
    }
    removeItem(id) {
        return new Promise((resolve) => {
            this.pause(false);
            this.lockInput(true);
            this.list.removeComponent(id, () => {
                resolve();
            }, this.itemRemovalTransition.bind(this));
        });
    }
    itemRemovalTransition(item, done) {
        let action = new jibo.rendering.gui.actions.ActionData('sound', { id: 'delete-sfx' });
        let choiceDisplay = this._choiceBtn.display;
        let btnDisplay = this._choiceBtn.buttonDisplay;
        item.display.x = item.display.pivot.x = item.display.width / 2;
        item.display.y = item.display.pivot.y = item.display.height / 2;
        item.display.addChild(choiceDisplay);
        choiceDisplay.x = item.display.x;
        choiceDisplay.y = item.display.y;
        this._inputLocked = false;
        super.actionHandler(action);
        this._inputLocked = true;
        const TweenManager = jibo.face.tween;
        TweenManager.play(btnDisplay, {
            to: { alpha: 1 },
            from: { alpha: 0 },
            duration: 500,
            ease: 'sineIn'
        });
        TweenManager.play(btnDisplay, {
            to: {
                'scale.x': 1,
                'scale.y': 1
            },
            from: {
                'scale.x': 0,
                'scale.y': 0
            },
            duration: 750,
            ease: 'backOut'
        }, () => {
            const tweenTime = 550;
            TweenManager.play(item.display, {
                to: { alpha: 0 },
                duration: tweenTime,
                ease: 'sineIn'
            });
            TweenManager.play(item.display, {
                to: {
                    'scale.x': 0,
                    'scale.y': 0
                },
                duration: tweenTime,
                ease: 'backIn'
            }, () => {
                TweenManager.stop(item.display);
                item.display.alpha = 0;
                choiceDisplay.parent.removeChild(choiceDisplay);
                done();
            });
        });
    }
    close(callback, transitionType) {
        Notifier_1.default.deleted.removeListener(this.onItemsDeleted);
        super.close(callback, transitionType);
    }
    onItemsDeleted(deleted) {
        let prom = Promise.resolve();
        prom = prom.then(() => {
            return new Promise((resolve) => {
                const id = deleted.shift();
                if (jibo.face.views.currentView !== this && id === this.list.getComponentByIndex(this.list.pageIndex).id) {
                    jibo.face.views.changeView({ removeTo: this.id }, () => {
                        resolve();
                    });
                    this.list.removeComponent(id);
                }
                else {
                    this.list.removeComponent(id, () => {
                        resolve();
                    });
                }
            });
        });
    }
}
exports.default = ItemView;

},{"../utils/Notifier":13,"jibo":undefined}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
var MenuView = jibo.rendering.gui.views.MenuView;
var List = jibo.rendering.gui.components.List;
var ActionData = jibo.rendering.gui.actions.ActionData;
const Notifier_1 = require("../utils/Notifier");
class ListView extends MenuView {
    constructor(viewState) {
        super(viewState);
        this.onItemsDeleted = this.onItemsDeleted.bind(this);
    }
    applyData() {
        super.applyData();
        this.activeFilter = this._viewConfig.activeFilter;
    }
    actionEnactor(action) {
        if (action.type === ActionData.VERBAL_COMMAND) {
            switch (action.data.intent) {
                case 'filter':
                    if (action.data.itemType != this.activeFilter) {
                        this.actionHandler(new ActionData("event", {
                            event: "press",
                            filter: action.data.itemType
                        }));
                        return true;
                    }
            }
        }
        return super.actionEnactor(action);
    }
    ready() {
        super.ready();
        Notifier_1.default.deleted.on(this.onItemsDeleted);
    }
    close(callback, transitionType) {
        Notifier_1.default.deleted.removeListener(this.onItemsDeleted);
        super.close(callback, transitionType);
    }
    onItemsDeleted(deleted) {
        let prom = Promise.resolve();
        prom = prom.then(() => {
            return new Promise((resolve) => {
                this.list.removeComponent(deleted.shift(), () => {
                    resolve();
                });
                this.actionHandler(new ActionData(List.REMOVE_ELEMENT));
            });
        });
    }
}
exports.default = ListView;

},{"../utils/Notifier":13,"jibo":undefined}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const ListView_1 = require("./ListView");
const ItemView_1 = require("./ItemView");
const ImageItem_1 = require("./ImageItem");
const ItemPauseView_1 = require("./ItemPauseView");
function register() {
    jibo.face.views.creator.registerClass(ListView_1.default, 'GalleryListView');
    jibo.face.views.creator.registerClass(ItemView_1.default, 'GalleryItemView');
    jibo.face.views.creator.registerClass(ImageItem_1.default, 'ImageItem');
    jibo.face.views.creator.registerClass(ItemPauseView_1.default, 'GalleryItemPauseView');
}
exports.register = register;
function unregister() {
    jibo.face.views.creator.unregisterClass('GalleryListView');
    jibo.face.views.creator.unregisterClass('GalleryItemView');
    jibo.face.views.creator.unregisterClass('ImageItem');
    jibo.face.views.creator.unregisterClass('GalleryItemPauseView');
}
exports.unregister = unregister;

},{"./ImageItem":6,"./ItemPauseView":7,"./ItemView":8,"./ListView":9,"jibo":undefined}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const be_framework_1 = require("@be/be-framework");
const BuildItemList_1 = require("./utils/BuildItemList");
const gui = require("./gui");
const media = require("./utils/media");
const Notifier_1 = require("./utils/Notifier");
const Analytics_1 = require("./analytics/Analytics");
const log_1 = require("./utils/log");
const deleteItemFlow = require('./flows/deleteItem');
class Gallery extends be_framework_1.BeSkill {
    constructor(assetPack) {
        super(assetPack);
        this.flowOverrides = null;
        this.activeFilter = 'all';
        this.analytics = new Analytics_1.default(this);
        log_1.default.log = this.log.createChild('Utils');
    }
    preload(done) {
        done();
    }
    open(result, refresh) {
        if (refresh) {
            this.close(() => {
                this._openHelper(result);
            });
        }
        else {
            this._openHelper(result);
        }
    }
    _openHelper(result) {
        gui.register();
        this.fromMainMenu = result && result.intent === 'menu';
        const options = Object.assign({
            enableLogging: false,
            assetPack: this.assetPack,
            blackboard: {
                media: media,
                userData: null,
                analytics: this.analytics,
                parentLog: this.log.createChild('Flows'),
                buildThumbList: BuildItemList_1.buildThumbList,
                buildItemList: BuildItemList_1.buildItemList,
                Notifier: Notifier_1.default
            }
        }, this.flowOverrides);
        this.mainFlow = jibo.flow.run(require('./flows/main'), options, (err, status) => {
            if (status === jibo.bt.Status.INTERRUPTED) {
                return;
            }
            if (this.mainFlow.blackboard.userData) {
                this.mainFlow.blackboard.userData.destroy();
            }
            const result = this.mainFlow.result.transition;
            this.mainFlow.destroy();
            this.mainFlow = null;
            if (result === 'return' && this.fromMainMenu) {
                this.log.debug('closing and redirecting to main menu');
                this.redirect('@be/main-menu', {});
            }
            else if (result === 'create') {
                this.redirect('@be/create', { nlu: { intent: 'createOnePhoto' } });
                this.log.debug('closing and redirecting to create');
            }
            else {
                this.log.debug('closing - no redirect');
                this.exit();
            }
        });
    }
    close(done) {
        gui.unregister();
        this.analytics.finished();
        if (this.mainFlow) {
            Notifier_1.cleanNotifications();
            if (this.mainFlow.blackboard.userData) {
                this.mainFlow.blackboard.userData.destroy();
            }
            Promise.all([
                this.mainFlow.stop()
                    .catch((err) => {
                    this.log.debug('Error when stopping flow: ', err);
                })
                    .then(() => {
                    this.mainFlow.destroy();
                    this.mainFlow = null;
                }),
                new Promise((resolve) => {
                    jibo.face.views.changeView({ removeAll: true, leaveEmpty: true, transitionClose: jibo.face.views.DOWN }, () => {
                        resolve();
                    }, () => {
                        resolve();
                    });
                })
                    .catch((err) => {
                    this.log.debug('had an error when closing views: ', err);
                })
            ])
                .then(() => {
                done();
            });
        }
        else {
            done();
        }
    }
}
module.exports = Gallery;

},{"./analytics/Analytics":1,"./flows/deleteItem":3,"./flows/main":5,"./gui":10,"./utils/BuildItemList":12,"./utils/Notifier":13,"./utils/log":15,"./utils/media":16,"@be/be-framework":undefined,"jibo":undefined}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const be_framework_1 = require("@be/be-framework");
const media = require("./media");
function buildThumbList(userData, filter = 'all') {
    let list = {
        viewConfig: {
            type: "GalleryListView",
            dynamic: true,
            id: "gallery_list",
            title: "Gallery",
            activeFilter: filter,
            listDefault: {
                type: "ContentButton"
            },
            list: []
        },
        open: {
            transitionOpen: "trans_up"
        },
        defaultClose: {
            remove: true,
            leaveEmpty: true,
            transitionClose: "trans_down"
        },
        defaultSelect: "remain",
        baseMim: null
    };
    const data = userData.data;
    for (let i = 0; i < data.length; ++i) {
        let thumbnailId = data[i].getThumbnailId();
        let mediaId = data[i].id;
        let dateCreated = data[i].data.created;
        let labelDate = new be_framework_1.utils.DateTime(dateCreated, be_framework_1.utils.Location.jiboHome.timezone);
        list.viewConfig.list.push({
            id: mediaId,
            type: "ContentButton",
            label: labelDate.toMoment(),
            iconSrc: media.getUrl(thumbnailId),
            action: {
                type: "event",
                data: {
                    event: "press",
                    id: mediaId
                }
            }
        });
    }
    return list;
}
exports.buildThumbList = buildThumbList;
function buildItemList(userData, startOnItem) {
    let list = {
        viewConfig: {
            type: "GalleryItemView",
            dynamic: true,
            id: "gallery_items",
            elementsPerPage: 1,
            list: []
        },
        open: {
            transitionOpen: "trans_up"
        },
        defaultClose: "remain",
        defaultSelect: "remain",
        rule: 'gallery/item_view',
        timeout: 120
    };
    const data = userData.data;
    for (let i = 0; i < data.length; ++i) {
        let mediaId = data[i].id;
        list.viewConfig.list.push({
            id: mediaId,
            type: "ImageItem",
            imageSrc: media.getUrl(mediaId),
            action: {
                type: "event",
                data: {
                    event: "press",
                    id: mediaId
                }
            }
        });
        if (startOnItem === mediaId) {
            list.viewConfig.pageIndex = i;
        }
    }
    return list;
}
exports.buildItemList = buildItemList;

},{"./media":16,"@be/be-framework":undefined}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const be_framework_1 = require("@be/be-framework");
var Event = be_framework_1.libraries.jibo_typed_events.Event;
const Notifier = {
    deleted: new Event('Item(s) Deleted'),
    allDeleted: new Event('All Items Deleted')
};
exports.default = Notifier;
function cleanNotifications() {
    Notifier.allDeleted.removeAllListeners();
    Notifier.deleted.removeAllListeners();
}
exports.cleanNotifications = cleanNotifications;
;

},{"@be/be-framework":undefined}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const Notifier_1 = require("./Notifier");
class UserData {
    get isEmpty() {
        return !(this.data && this.data.length > 0);
    }
    get length() {
        return this.data ? this.data.length : 0;
    }
    constructor(parentLog, data) {
        this.data = data || null;
        this.onMediaChanged = this.onMediaChanged.bind(this);
        this.log = parentLog.createChild('UserData');
    }
    init() {
        let start = Date.now();
        return jibo.kb.media.loadMedia().then((data) => {
            this.log.debug(`Took ${Date.now() - start}ms to fetch Gallery content. Total items:`, data.length);
            start = Date.now();
            data = data.filter((item) => {
                if (!item.edges) {
                    return false;
                }
                return item.data.type === jibo.kb.media.MediaType.image;
            });
            data.sort((a, b) => {
                return b.data.created - a.data.created;
            });
            this.log.debug(`Took ${Date.now() - start}ms to filter and sort Gallery content (synchronously). Total photos:`, data.length);
            this.data = data;
            jibo.kb.media.events.mediaListChanged.on(this.onMediaChanged);
            return this;
        });
    }
    destroy() {
        this.data = null;
        jibo.kb.media.events.mediaListChanged.removeListener(this.onMediaChanged);
    }
    onMediaChanged() {
        this.log.debug('Media changed - fetching media list to check for deletions');
        jibo.kb.media.loadMedia().then((data) => {
            data = data.filter((item) => {
                if (!item.edges) {
                    return false;
                }
                return item.data.type === jibo.kb.media.MediaType.image;
            });
            if (!data.length) {
                this.log.debug('After fetching media list, all items deleted!');
                this.data = data;
                Notifier_1.default.allDeleted.emit();
                return;
            }
            data.sort((a, b) => {
                return b.data.created - a.data.created;
            });
            const deleted = [];
            const currentData = this.data;
            const inUse = {};
            for (let i = 0, length = data.length; i < length; ++i) {
                inUse[data[i].id] = true;
            }
            for (let i = 0, length = currentData.length; i < length; ++i) {
                const id = currentData[i].id;
                if (!inUse[id]) {
                    deleted.push(id);
                }
            }
            this.log.debug(`After fetching media list, number of deleted items: ${deleted.length}`);
            if (deleted.length > 0) {
                this.data = data;
                Notifier_1.default.deleted.emit(deleted);
            }
        }).catch((err) => {
            this.log.warn('Caught error when loading media to delete item:', err);
        });
    }
}
exports.default = UserData;

},{"./Notifier":13,"jibo":undefined}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logWrap = {
    log: null
};
exports.default = logWrap;

},{}],16:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const UserData_1 = require("./UserData");
const log_1 = require("./log");
let log = null;
function getUrl(id) {
    return jibo.media.getUrl(id);
}
exports.getUrl = getUrl;
function getMedia() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!log) {
            log = log_1.default.log.createChild('media');
        }
        const data = new UserData_1.default(log_1.default.log);
        return data.init();
    });
}
exports.getMedia = getMedia;
function deleteItem(itemToDelete, userData) {
    return __awaiter(this, void 0, void 0, function* () {
        const index = userData.data.findIndex((item) => {
            return item.id === itemToDelete;
        });
        if (index > -1) {
            userData.data.splice(index, 1);
        }
        let viewProm;
        let deleteProm;
        let view = jibo.face.views.currentView;
        while (view && view.id !== 'gallery_items') {
            view = view.pausedParent;
        }
        if (view) {
            viewProm = view.removeItem(itemToDelete);
        }
        else {
            viewProm = Promise.resolve();
        }
        let start = Date.now();
        deleteProm = jibo.media.deletePhoto(itemToDelete).then(() => {
            log.debug(`Took ${Date.now() - start}ms to delete item.`);
        }, (err) => {
            log.warn('Unable to delete item: ', err);
            return Promise.reject(err);
        });
        return Promise.all([viewProm, deleteProm]);
    });
}
exports.deleteItem = deleteItem;

},{"./UserData":14,"./log":15,"jibo":undefined}]},{},[11])(11)
});
//# sourceMappingURL=index.js.map