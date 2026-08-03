(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.besurprisesOta = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Analytics {
    constructor(skill) {
        this.skill = skill;
    }
    offeredOta(response) {
        this.skill.track('OTA Update Offered', { accepted: response });
    }
    offeredNotes(response) {
        this.skill.track('OTA Notes Offered', { accepted: response });
    }
    deliveredNotes(isReactive, version) {
        this.skill.track('OTA Notes Delivered', { intent: isReactive ? 'reactive' : 'proactive', release_version: version });
    }
    updated(version) {
        this.skill.track('OTA Update Installed', { release_version: version });
    }
}
exports.default = Analytics;

},{}],2:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'BackupNotification',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/surprises-ota/src/flows/BackupNotification.flow'
        },
        '19e474ae-0e68-4dcb-ac2b-1adeca42234e': function () {
            return {
                'id': '19e474ae-0e68-4dcb-ac2b-1adeca42234e',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '19e474ae-0e68-4dcb-ac2b-1adeca42234e',
                        'to': 'b49e2a83-d01f-4597-8a83-1606c049bd0d',
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
        'b5d1534e-0dca-4b94-95f2-c7b206fd1d61': function () {
            return {
                'id': 'b5d1534e-0dca-4b94-95f2-c7b206fd1d61',
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
        'b49e2a83-d01f-4597-8a83-1606c049bd0d': function () {
            return {
                'id': 'b49e2a83-d01f-4597-8a83-1606c049bd0d',
                'name': 'Backing Up Announcement',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'b49e2a83-d01f-4597-8a83-1606c049bd0d',
                        'to': 'b5d1534e-0dca-4b94-95f2-c7b206fd1d61',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/BackingUpAnnouncement.mim',
                    'getPromptData': () => {
                        return {};
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
            'name': 'DownloadingNotification',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/surprises-ota/src/flows/DownloadingNotification.flow'
        },
        '7a6ea3f6-146f-4997-850e-ef5d2d12e82b': function () {
            return {
                'id': '7a6ea3f6-146f-4997-850e-ef5d2d12e82b',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '7a6ea3f6-146f-4997-850e-ef5d2d12e82b',
                        'to': 'a9fb21e6-59c5-41ac-912f-696217e5ced3',
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
        'a9fb21e6-59c5-41ac-912f-696217e5ced3': function () {
            return {
                'id': 'a9fb21e6-59c5-41ac-912f-696217e5ced3',
                'name': 'Downloading Announcement',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'a9fb21e6-59c5-41ac-912f-696217e5ced3',
                        'to': 'd9264586-1b6e-47a6-9cf3-a93a796881e8',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/DownloadingAnnouncement.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'd9264586-1b6e-47a6-9cf3-a93a796881e8': function () {
            return {
                'id': 'd9264586-1b6e-47a6-9cf3-a93a796881e8',
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
},{}],4:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'ErrorNotification',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/surprises-ota/src/flows/ErrorNotification.flow'
        },
        '64991e73-a25d-4abb-9942-abfe5b1a257c': function () {
            return {
                'id': '64991e73-a25d-4abb-9942-abfe5b1a257c',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '64991e73-a25d-4abb-9942-abfe5b1a257c',
                        'to': '0572fa19-67d6-40b0-aa0b-a80e1e30ca86',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Begin',
                'options': {
                    'inputParameters': () => {
                        return { errorCode: 'OTAX' };
                    }
                }
            };
        },
        '0572fa19-67d6-40b0-aa0b-a80e1e30ca86': function () {
            return {
                'id': '0572fa19-67d6-40b0-aa0b-a80e1e30ca86',
                'name': 'O T A Error Announcement',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '0572fa19-67d6-40b0-aa0b-a80e1e30ca86',
                        'to': 'c549d462-b419-4b20-a2c5-7deb59960c7b',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/OTAErrorAnnouncement.mim',
                    'getPromptData': () => {
                        return { errorCode: notepad.params.errorCode };
                    }
                }
            };
        },
        'c549d462-b419-4b20-a2c5-7deb59960c7b': function () {
            return {
                'id': 'c549d462-b419-4b20-a2c5-7deb59960c7b',
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
},{}],5:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'ReleaseNotes',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/surprises-ota/src/flows/ReleaseNotes.flow'
        },
        '777ee8cf-6965-44a7-b8b0-585c988300da': function () {
            return {
                'id': '777ee8cf-6965-44a7-b8b0-585c988300da',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '777ee8cf-6965-44a7-b8b0-585c988300da',
                        'to': 'b71a7da7-aaed-4453-a50a-8d1274add47b',
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
        'b71a7da7-aaed-4453-a50a-8d1274add47b': function () {
            return {
                'id': 'b71a7da7-aaed-4453-a50a-8d1274add47b',
                'name': 'On Demand?',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'b71a7da7-aaed-4453-a50a-8d1274add47b',
                        'to': 'de85f801-019f-4f9d-8683-7a3830574865',
                        'value': 'true'
                    },
                    {
                        'frm': 'b71a7da7-aaed-4453-a50a-8d1274add47b',
                        'to': '16f2f65e-4eae-488d-9e4b-aebc1f4e4892',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        return blackboard.onDemand;
                    }
                }
            };
        },
        'de85f801-019f-4f9d-8683-7a3830574865': function () {
            return {
                'id': 'de85f801-019f-4f9d-8683-7a3830574865',
                'name': 'Share O T A Release Notes',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'de85f801-019f-4f9d-8683-7a3830574865',
                        'to': '8c1ab19e-07f6-4072-97f6-a7986cd1fac3',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/ShareOTAReleaseNotes.mim',
                    'getPromptData': () => {
                        return { notes: blackboard.releaseNotes };
                    }
                }
            };
        },
        '16f2f65e-4eae-488d-9e4b-aebc1f4e4892': function () {
            return {
                'id': '16f2f65e-4eae-488d-9e4b-aebc1f4e4892',
                'name': 'Offer O T A Release Notes',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '16f2f65e-4eae-488d-9e4b-aebc1f4e4892',
                        'to': 'de85f801-019f-4f9d-8683-7a3830574865',
                        'value': 'yes'
                    },
                    {
                        'frm': '16f2f65e-4eae-488d-9e4b-aebc1f4e4892',
                        'to': '72ecdbad-68da-441b-999a-5908f41e71c8',
                        'value': ''
                    }
                ],
                'exceptions': [{
                        'frm': '16f2f65e-4eae-488d-9e4b-aebc1f4e4892',
                        'to': '34e61333-2469-46ec-a265-965a7938f126',
                        'value': '~'
                    }],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/OfferOTAReleaseNotes.mim',
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
                        if (transition === 'yes') {
                            blackboard.notesResponse = 'accepted';
                        } else if (transition === 'no') {
                            blackboard.notesResponse = 'rejected';
                        }
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
        '8c1ab19e-07f6-4072-97f6-a7986cd1fac3': function () {
            return {
                'id': '8c1ab19e-07f6-4072-97f6-a7986cd1fac3',
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
        '72ecdbad-68da-441b-999a-5908f41e71c8': function () {
            return {
                'id': '72ecdbad-68da-441b-999a-5908f41e71c8',
                'name': 'Rejected O T A Release Notes Response',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '72ecdbad-68da-441b-999a-5908f41e71c8',
                        'to': '8c1ab19e-07f6-4072-97f6-a7986cd1fac3',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/RejectedOTAReleaseNotesResp.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '34e61333-2469-46ec-a265-965a7938f126': function () {
            return {
                'id': '34e61333-2469-46ec-a265-965a7938f126',
                'name': 'Rejected O T A Release Notes Error Resp',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '34e61333-2469-46ec-a265-965a7938f126',
                        'to': '8c1ab19e-07f6-4072-97f6-a7986cd1fac3',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/RejectedOTAReleaseNotesErrorResp.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        }
    };
};
},{}],6:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'UpdateAvailableNotification',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/surprises-ota/src/flows/UpdateAvailableNotification.flow'
        },
        '5838cc0c-4466-4503-b322-1853fbab0b6d': function () {
            return {
                'id': '5838cc0c-4466-4503-b322-1853fbab0b6d',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '5838cc0c-4466-4503-b322-1853fbab0b6d',
                        'to': '45de7866-3cde-4bfe-b20c-6d381a183936',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Begin',
                'options': {
                    'inputParameters': () => {
                        return { skill: null };
                    }
                }
            };
        },
        '45de7866-3cde-4bfe-b20c-6d381a183936': function () {
            return {
                'id': '45de7866-3cde-4bfe-b20c-6d381a183936',
                'name': 'Update Available Question',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '45de7866-3cde-4bfe-b20c-6d381a183936',
                        'to': 'd980d240-809b-4b63-bfb4-817633cdcca6',
                        'value': ''
                    },
                    {
                        'frm': '45de7866-3cde-4bfe-b20c-6d381a183936',
                        'to': 'df78c47f-6397-48ce-bced-73a31676be8b',
                        'value': 'no'
                    },
                    {
                        'frm': '45de7866-3cde-4bfe-b20c-6d381a183936',
                        'to': '9b3ae04d-79b2-413b-9b00-dec8d4ccacde',
                        'value': 'yes'
                    }
                ],
                'exceptions': [{
                        'frm': '45de7866-3cde-4bfe-b20c-6d381a183936',
                        'to': 'd980d240-809b-4b63-bfb4-817633cdcca6',
                        'value': '~'
                    }],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/UpdateAvailableQuestion.mim',
                    'getPromptData': () => {
                        return {};
                    },
                    'onSuccess': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let transition = 'no';
                        if (asrResults.intent) {
                            transition = asrResults.intent;
                        }
                        if (transition === 'yes') {
                            blackboard.updateResponse = 'accepted';
                        } else if (transition === 'no' || transition === 'never') {
                            blackboard.updateResponse = 'rejected';
                        }
                        return transition;
                    },
                    'onStatus': status => {
                        let mimState = status.state;
                        let asrResults = status.asrResults;
                        let speakerIds = status.speakerIds;
                    },
                    'onFailure': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let speakerIds = results.speakerIds;
                        let exception = results.exception;
                        return exception;
                    }
                }
            };
        },
        'cd32180e-6c9c-4249-afa3-c73adbfde6b9': function () {
            return {
                'id': 'cd32180e-6c9c-4249-afa3-c73adbfde6b9',
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
        '9b3ae04d-79b2-413b-9b00-dec8d4ccacde': function () {
            return {
                'id': '9b3ae04d-79b2-413b-9b00-dec8d4ccacde',
                'name': 'Okay Install Now',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '9b3ae04d-79b2-413b-9b00-dec8d4ccacde',
                        'to': '190fe6e9-b6fc-4275-bae7-24454104c498',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/OkayInstallNow.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'df78c47f-6397-48ce-bced-73a31676be8b': function () {
            return {
                'id': 'df78c47f-6397-48ce-bced-73a31676be8b',
                'name': 'Okay Install Later',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'df78c47f-6397-48ce-bced-73a31676be8b',
                        'to': 'cd32180e-6c9c-4249-afa3-c73adbfde6b9',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/OkayInstallLater.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'd980d240-809b-4b63-bfb4-817633cdcca6': function () {
            return {
                'id': 'd980d240-809b-4b63-bfb4-817633cdcca6',
                'name': 'Okay But Install Later',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'd980d240-809b-4b63-bfb4-817633cdcca6',
                        'to': 'cd32180e-6c9c-4249-afa3-c73adbfde6b9',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/OkayButInstallLater.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '190fe6e9-b6fc-4275-bae7-24454104c498': function () {
            return {
                'id': '190fe6e9-b6fc-4275-bae7-24454104c498',
                'name': 'doOTA',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '190fe6e9-b6fc-4275-bae7-24454104c498',
                        'to': 'cd32180e-6c9c-4249-afa3-c73adbfde6b9',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.scheduler.otaDownloadAndInstall(err => {
                            notepad.params.skill.log.iferr(err, `Surprise OTA Update failed: ${ err }`);
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
},{}],7:[function(require,module,exports){
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
const JSC = require("@jibo/jibo-server-client");
const jibo = require("jibo");
const surprises_1 = require("@be/surprises");
const Analytics_1 = require("./analytics/Analytics");
const MINUTES_TO_MS = 60 * 1000;
const HOURS_TO_MS = 60 * MINUTES_TO_MS;
const MIN_TIME_BETWEEN_CHECKS = 6 * HOURS_TO_MS;
const A_WHILE = 18 * HOURS_TO_MS;
const A_LITTLE_WHILE = 1 * HOURS_TO_MS;
const OTA_KB = '/ota';
class OTASurprise extends surprises_1.SurpriseElement {
    constructor(options) {
        super(options);
        this.kbm = null;
        this.flow = null;
        this.isDownloading = false;
        this.isBackingUp = false;
        this.surpriseReleaseNotes = false;
        this.releaseNotes = null;
        this.proactiveNotes = false;
        this.analytics = new Analytics_1.default(this);
        this.cleanupViews = this.cleanupViews.bind(this);
    }
    getCategoryPriority() {
        return 10;
    }
    getContextualPriority(context) {
        return __awaiter(this, void 0, void 0, function* () {
            this.isDownloading = false;
            this.isBackingUp = false;
            this.surpriseReleaseNotes = false;
            return new Promise((resolve, reject) => {
                this.kbm.loadRoot((err, root) => {
                    this.log.iferr(err, 'error loading OTA root from KB');
                    if (err || !root || !root.data) {
                        resolve(0);
                        return;
                    }
                    else if (root.data.lastReleaseNotes !== jibo.versions.release && this.releaseNotes && this.releaseNotes.length) {
                        this.surpriseReleaseNotes = true;
                        resolve(1);
                    }
                    else {
                        let nowTime = Date.now();
                        jibo.scheduler.backupStatus((err, backingUp) => {
                            if (!err && backingUp) {
                                if (root.data.lastBackupNotification < nowTime - A_LITTLE_WHILE) {
                                    this.isBackingUp = true;
                                    resolve(1);
                                }
                                else {
                                    resolve(0);
                                }
                            }
                            else {
                                jibo.scheduler.otaDownloadStatus((err, status) => {
                                    if (!err && status) {
                                        if (root.data.lastDownloadingNotification < nowTime - A_LITTLE_WHILE) {
                                            this.isDownloading = true;
                                            resolve(1);
                                        }
                                        else {
                                            resolve(0);
                                        }
                                    }
                                    else if (root.data.error && root.data.error.length) {
                                        resolve(1);
                                    }
                                    else if (root.data.updatesAvailable && root.data.lastUpdateNotification < nowTime - A_WHILE) {
                                        resolve(1);
                                    }
                                    else if (!root.data.updatesAvailable && root.data.lastUpdateCheck < nowTime - MIN_TIME_BETWEEN_CHECKS) {
                                        jibo.scheduler.otaCheckUpdates((err, updateList) => {
                                            this.log.iferr(err, 'error checking for updates');
                                            if (updateList && updateList.length) {
                                                root.data.updatesAvailable = true;
                                            }
                                            root.data.lastUpdateCheck = nowTime;
                                            root.save((err) => {
                                                this.log.iferr(err, 'couldnt save OTA updatesAvailable status');
                                            });
                                        });
                                        resolve(0);
                                    }
                                    else {
                                        resolve(0);
                                    }
                                });
                            }
                        });
                    }
                });
            });
        });
    }
    preload(done) {
        done();
    }
    postInit(done) {
        this.kbm = jibo.kb.createModel(OTA_KB);
        this.kbm.loadRoot((err, root) => {
            const DEFAULT_NOTES = {
                spoken: 'minor fixes and improvements',
                enableProactive: false
            };
            if (jibo.runMode === jibo.RunMode.ON_ROBOT) {
                jibo.loader.load('/opt/jibo/Jibo/Skills/jibo-tbd/release_notes.json', (loadErr, notes) => {
                    if (loadErr || !notes) {
                        this.log.warn('no release notes found', loadErr);
                        notes = DEFAULT_NOTES;
                    }
                    this.releaseNotes = notes.spoken;
                    this.proactiveNotes = notes.enableProactive;
                });
            }
            else {
                this.releaseNotes = DEFAULT_NOTES.spoken;
                this.proactiveNotes = DEFAULT_NOTES.enableProactive;
            }
            if (err || !root) {
                this.log.error('failed to load OTA KB', err);
                done();
            }
            else if (!root.data.initialized) {
                root.data.error = null;
                root.data.updatesAvailable = false;
                root.data.lastDownloadingNotification = 0;
                root.data.lastBackupNotification = 0;
                root.data.lastUpdateNotification = 0;
                root.data.lastUpdateCheck = 0;
                root.data.initialized = true;
                root.data.lastReleaseNotes = jibo.versions.release;
                root.data.versionLastBoot = jibo.versions.release;
                this.updateRobot();
                root.save((err) => {
                    this.log.iferr(err, 'couldnt save OTA initial properties');
                    done();
                });
            }
            else if (root.data.versionLastBoot !== jibo.versions.release) {
                this.updateRobot(root.data.versionLastBoot);
                root.data.versionLastBoot = jibo.versions.release;
                root.save(err => {
                    this.log.iferr(err, 'couldnt save last boot version');
                    done();
                });
            }
            else {
                done();
            }
        });
    }
    updateRobot(previousVersion) {
        if (jibo.runMode === jibo.RunMode.ON_ROBOT) {
            this.analytics.updated(jibo.versions.release);
            jibo.systemManager.getCredentials((err, credentials) => {
                if (err) {
                    this.log.error('Credentials not found', err);
                }
                else {
                    jibo.systemManager.getIdentity((err, identity) => {
                        if (err) {
                            this.log.error('identity not found', err);
                            return;
                        }
                        new JSC.Robot(credentials).updateRobot({
                            id: identity.name,
                            payload: {
                                version: jibo.versions.release,
                                previousVersion: previousVersion || null
                            }
                        }, (err, notErr) => {
                            if (err) {
                                this.log.warn('Unable to update robot info on server', err);
                                return;
                            }
                            this.log.info('Updated robot info on server: ', notErr);
                        });
                    });
                }
            });
        }
    }
    open(result) {
        jibo.face.views.forceEyeView();
        this.kbm.loadRoot((err, root) => {
            if (err || !root || !root.data) {
                this.log.iferr(err, 'error loading OTA root from KB on surprises launch');
                this.exit();
                return;
            }
            if (this.surpriseReleaseNotes || result && result.nlu && result.nlu.intent === 'releaseNotes') {
                root.data.lastReleaseNotes = jibo.versions.release;
                root.save((err) => {
                    this.log.iferr(err, 'couldnt save OTA notes delivered');
                });
                let blackboard = {
                    notesResponse: 'ignored',
                    releaseNotes: this.releaseNotes,
                    onDemand: !this.surpriseReleaseNotes
                };
                this.flow = jibo.flow.run(require('./flows/ReleaseNotes'), {
                    assetPack: this.assetPack,
                    blackboard: blackboard
                }, (err, status) => {
                    if (!blackboard.onDemand) {
                        this.analytics.offeredNotes(blackboard.notesResponse);
                    }
                    if (blackboard.onDemand || blackboard.notesResponse === 'accepted') {
                        this.analytics.deliveredNotes(blackboard.onDemand, jibo.versions.release);
                    }
                    if (status !== jibo.bt.Status.INTERRUPTED) {
                        this.exit();
                    }
                });
            }
            else if (this.isBackingUp) {
                this.flow = jibo.flow.run(require('./flows/BackupNotification'), { assetPack: this.assetPack }, (err, status) => {
                    if (status !== jibo.bt.Status.INTERRUPTED) {
                        this.exit();
                    }
                });
                root.data.lastBackupNotification = Date.now();
                root.save((err) => {
                    this.log.iferr(err, 'couldnt save OTA lastBackupNotification status');
                });
            }
            else if (this.isDownloading) {
                this.flow = jibo.flow.run(require('./flows/DownloadingNotification'), { assetPack: this.assetPack }, (err, status) => {
                    if (status !== jibo.bt.Status.INTERRUPTED) {
                        this.exit();
                    }
                });
                root.data.lastDownloadingNotification = Date.now();
                root.save((err) => {
                    this.log.iferr(err, 'couldnt save OTA lastDownloadingNotification status');
                });
            }
            else if (root.data.error) {
                let errorCode = root.data.error;
                if (errorCode !== 'OTA1' && errorCode !== 'OTA4' && errorCode !== 'OTA7' && errorCode !== 'OTA10' && errorCode !== 'OTA11' && errorCode !== 'OTA12' && errorCode !== 'OTAX') {
                    errorCode = 'OTAX';
                }
                this.flow = jibo.flow.run(require('./flows/ErrorNotification'), {
                    params: {
                        errorCode: errorCode
                    },
                    assetPack: this.assetPack
                }, (err, status) => {
                    if (status !== jibo.bt.Status.INTERRUPTED) {
                        this.exit();
                    }
                });
                root.data.error = null;
                root.save((err) => {
                    this.log.iferr(err, 'couldnt clear OTA error status');
                });
            }
            else if (root.data.updatesAvailable) {
                let blackboard = { updateResponse: 'ignored' };
                this.flow = jibo.flow.run(require('./flows/UpdateAvailableNotification'), {
                    assetPack: this.assetPack,
                    params: { skill: this },
                    blackboard: blackboard
                }, (err, status) => {
                    this.analytics.offeredOta(blackboard.updateResponse);
                    if (status !== jibo.bt.Status.INTERRUPTED) {
                        this.exit();
                    }
                });
                root.data.lastUpdateNotification = Date.now();
                root.save((err) => {
                    this.log.iferr(err, 'couldnt save OTA lastUpdateNotification status');
                });
            }
            else {
                this.exit();
            }
        });
    }
    cleanupViews() {
        return new Promise((resolve) => {
            if (jibo.face.views.currentView && jibo.face.views.currentView.id !== 'eyeView') {
                jibo.face.views.changeView({
                    removeAll: true,
                    leaveEmpty: true
                }, () => {
                    resolve();
                }, (err) => {
                    this.log.warn(err);
                    resolve();
                });
            }
            else {
                jibo.face.views.forceEyeView(() => {
                    resolve();
                }, null, null, null, () => {
                    this.log.warn('Error removing view, calling done anyway');
                    resolve();
                });
            }
        });
    }
    close(done) {
        this.isDownloading = false;
        this.isBackingUp = false;
        this.surpriseReleaseNotes = false;
        if (this.flow) {
            this.flow.stopAndDestroy()
                .then(this.cleanupViews)
                .then(() => { done(); })
                .catch(() => { done(); });
            this.flow = null;
        }
        else {
            this.cleanupViews()
                .then(() => { done(); })
                .catch(() => { done(); });
        }
    }
}
module.exports = OTASurprise;

},{"./analytics/Analytics":1,"./flows/BackupNotification":2,"./flows/DownloadingNotification":3,"./flows/ErrorNotification":4,"./flows/ReleaseNotes":5,"./flows/UpdateAvailableNotification":6,"@be/surprises":undefined,"@jibo/jibo-server-client":undefined,"jibo":undefined}]},{},[7])(7)
});
//# sourceMappingURL=index.js.map