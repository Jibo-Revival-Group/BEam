(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.besettings = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports={
    "viewConfig": {
        "title": "Shut down?",
        "id": "shutdownConfirm",
        "listDefault": {
            "menuButtonType": "ActionButton"
        },
        "list": [{
                "id": "shutdownButton",
                "label": "Shut down",
                "iconSrc": "core://resources/actionIcons/shutdown.png",
                "colors": ["0xFD362F", "0x990024"],
                "action": {
                    "type": "utterance",
                    "data": {
                        "utterance": "yes"
                    }
                }
            },
            {
                "id": "nobutton",
                "label": "No",
                "iconSrc": "core://resources/actionIcons/cancel.png",
                "colors": ["0x25F2FB", "0x107799"],
                "action": {
                    "type": "utterance",
                    "data": {
                        "utterance": "no"
                    }
                }
            }
        ]
    },
    "rule": "settings/shut_down_confirmation",
    "timeout": 8,
    "defaultClose": "remain",
    "defaultSelect": "remain"
}

},{}],2:[function(require,module,exports){
module.exports={
    "WIFI1a": {
        "code": "Error WIFI1a",
        "header": "Can't connect to Wi-Fi network.",
        "message": "Go to the app for help, and tap the screen\nto check your Wi-Fi settings."
    },
    "WIFI2a": {
        "code": "Error WIFI2a",
        "header": "Can't get IP address from router.",
        "message": "Go to the app for help, and tap the screen\nto check your Wi-Fi settings."
    },
    "WIFI4a": {
        "code": "Error WIFI4a",
        "header": "Can't connect to Jibo's server.",
        "message": "Go to the app for help, and tap the screen\nto check your Wi-Fi settings."
    },
    "WIFIXa": {
        "code": "Error WIFIXa",
        "header": "Jibo didn't connect to Wi-Fi.",
        "message": "Go to the app for help, and tap the screen\nto check your Wi-Fi settings."
    },
    "Q1": {
        "code": "Error Q1",
        "header": "Wi-Fi connection lost.",
        "message": "Jibo is trying to reconnect to your router. Tap the screen\nto check Wi-Fi settings, or go to support.jibo.com for help."
    }
}

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
let fs = require('fs');
class AboutPage {
    static about(doneLoadingCallback, log) {
        let view = jibo.face.views.createView('View', 'assets/about/aboutView.json');
        jibo.systemManager.getIdentity((err, identityData) => {
            if (err) {
                if (log) {
                    log.error('Failed to get identity ', err);
                }
            }
            view.on(jibo.face.views.LOADED, (loadedView) => {
                this._viewLoaded(loadedView, identityData, log);
                if (doneLoadingCallback) {
                    doneLoadingCallback(loadedView);
                }
            });
            jibo.face.views.addView(view);
        });
        return view;
    }
    static _viewLoaded(aboutView, identityData, log) {
        try {
            let serialNumber = aboutView.getComponentById('serialNumber');
            let robotName = aboutView.getComponentById('robotName');
            let releaseVersion = aboutView.getComponentById('releaseVersion');
            if (!identityData) {
                identityData = { name: robotName.text, serial_number: serialNumber.text, wifi_mac: null };
            }
            robotName.text = identityData.name;
            serialNumber.text = identityData.serial_number;
            releaseVersion.text = `Release Version: ${jibo.versions.release}`;
        }
        catch (err) {
            if (log) {
                log.error('Failed to display name and number ', err);
            }
        }
    }
}
exports.default = AboutPage;

},{"fs":undefined,"jibo":undefined}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WipeView_1 = require("./views/WipeView");
const PowerAnalytics_1 = require("./analytics/PowerAnalytics");
const jibo = require("jibo");
const PULSE_LENGTH = 2;
const MIN_BRIGHTNESS = 0.4;
const MAX_BRIGHTNESS = 1;
const ERROR_COLOR = [1, 0.0784313725490196, 0.07450980392156863];
const TAP_EVENT = 'errorScreenTapEvent';
const QUIET_HOURS_START = 22;
const QUIET_HOURS_END = 7;
const SECRET_SWIPES_REQUIRED = 5;
const LOW_BATTERY_ERROR = 'K4-Low_battery';
class ErrorDisplay {
    constructor(skill, log) {
        this.skill = skill;
        this.log = log;
        this.assetPack = skill.assetPack;
        this.errorMetaData = skill.errorMetaData;
        this.tapActions = {
            wifi: this.doWifi.bind(this),
            dismiss: this.dismissError.bind(this),
            index: () => {
                jibo.expression.indexRobot();
            },
            none: null,
            reboot: () => {
                jibo.systemManager.reboot((err) => {
                    if (this.skill && err) {
                        this.log.error('failed to reboot on tap from error skill.', err);
                    }
                });
            },
            shutdown: () => {
                jibo.systemManager.poweroff((err) => {
                    if (this.skill && err) {
                        this.log.error('failed to shutdown on tap from error skill.', err);
                    }
                });
            },
            wipe: this.doWipe.bind(this)
        };
        this.errorCode = null;
        this.currentMessage = null;
        this.queuedError = null;
        this.ringPulse = this.ringPulse.bind(this);
        this.doingPulse = false;
        this.fadingUp = true;
        this.brightness = 0;
        this.silent = false;
        this.wifiSkill = null;
        this.wipeSkill = null;
        this.isHeadHeld = false;
        this.numOfSwipes = 0;
        this.touchStartTime = 0;
        this.onWifiExitedAfterSolved = this.onWifiExitedAfterSolved.bind(this);
        this.onHeadUpdate = this.onHeadUpdate.bind(this);
        jibo.timer.on('update', this.onHeadUpdate);
    }
    doError(errorCode) {
        if (!this.skill) {
            return;
        }
        if (errorCode === LOW_BATTERY_ERROR) {
            PowerAnalytics_1.default.lowBatteryError();
        }
        this.currentMessage = {
            title: 'Error Error',
            message: 'Encountered an error when trying to display an error',
            tapAction: 'dismiss',
            icon: 'error',
            code: errorCode,
            spokenPromptOnError: null,
            spokenPromptOnResolution: null,
            description: null,
            platformCode: null,
            priority: null,
            repeatTime: null
        };
        this.currentMessage = this.errorMetaData[errorCode];
        jibo.errors.subscribeError(errorCode, this.onResolved.bind(this));
        let time = new Date().getHours();
        this.silent = time >= QUIET_HOURS_START || time < QUIET_HOURS_END;
        this.errorCode = errorCode;
        jibo.expression.pushAttentionMode(jibo.expression.AttentionMode.OFF).then((handle) => {
            this.attentionHandler = handle;
            if (!this.skill) {
                this.attentionHandler.release();
                return;
            }
            jibo.expression.centerRobot();
            jibo.loader.load('assets/errors/data.json', (err, result) => {
                if (!this.skill) {
                    return;
                }
                let icons = result.icons;
                let tapText = result.tapText;
                jibo.loader.load('assets/errors/error.json', (err, result) => {
                    if (!this.skill) {
                        return;
                    }
                    let viewConfig = result;
                    let icon = icons[this.currentMessage.icon] || icons['error'];
                    viewConfig.componentConfigs[0].assets.push(icon);
                    this.currentView = jibo.face.views.createView('View', viewConfig, false);
                    jibo.face.views.changeView({
                        addView: this.currentView
                    }, () => {
                        if (!this.skill) {
                            return;
                        }
                        this.currentView.addAction(jibo.face.views.ActionData.CALLBACK, { callback: this.onSwipeUp.bind(this) }, false, false, jibo.face.views.GESTURE.SWIPE_UP);
                        this.doPulse(true);
                        if (!this.silent) {
                            if (this.currentMessage.spokenPromptOnError && this.currentMessage.spokenPromptOnError.length) {
                                jibo.sound.play('error', () => {
                                    if (!this.skill) {
                                        return;
                                    }
                                    jibo.tts.speak(this.currentMessage.spokenPromptOnError, {
                                        mode: jibo.tts.TTSMode.SSML
                                    });
                                });
                            }
                            else {
                                jibo.sound.play('error');
                            }
                        }
                    }, () => {
                        if (!this.skill) {
                            return;
                        }
                        this.log.warn('view change interrupted or something like that');
                    }, () => {
                        if (!this.skill) {
                            return;
                        }
                        let tapAction = this.tapActions[this.currentMessage.tapAction];
                        if (tapAction) {
                            this.currentView.addAction('event', {
                                event: TAP_EVENT
                            });
                            this.currentView.on(TAP_EVENT, tapAction);
                        }
                        this.currentView.getComponentById('header').text = this.currentMessage.title;
                        this.currentView.getComponentById('message').text = this.currentMessage.message;
                        this.currentView.getComponentById('tap').text = tapText[this.currentMessage.tapAction];
                        this.currentView.getComponentById('code').text = `Error ${this.currentMessage.code}`;
                    });
                });
            });
        });
    }
    onResolved(err, data) {
        if (!this.skill) {
            return;
        }
        if (err) {
            if (err.name === jibo.web.ErrorStatus.ABORTED) {
                this.log.info('current error display aborted: ', err);
            }
            else {
                this.log.warn('error resolved with error: ', err);
            }
            return;
        }
        this.log.info('error resolved: ', this.errorCode);
        if (this.queuedError) {
            this.queuedError = null;
        }
        this.doPulse(false);
        if (data && data.nextErrorId) {
            if (this.wifiSkill || this.wipeSkill) {
                this.log.info('got queued error while still in wifi settings - save for later');
                this.queuedError = data.nextErrorId;
            }
            else if (jibo.face.views.currentView && jibo.face.views.currentView.id == 'wipeView' && this.errorMetaData[data.nextErrorId].tapAction == 'wifi') {
                this.log.info('ignoring WiFi error because we are wiping the robot right now');
            }
            else {
                this.log.info('handling queued error: ', data.nextErrorId);
                if (!this.silent && data.resolved && this.currentMessage.spokenPromptOnResolution && this.currentMessage.spokenPromptOnResolution.length) {
                    jibo.tts.speak(this.currentMessage.spokenPromptOnResolution, {
                        mode: jibo.tts.TTSMode.SSML
                    }, () => {
                        if (!this.skill) {
                            return;
                        }
                        this.cleanup();
                        this.removeAllThenDoError(data.nextErrorId);
                    });
                }
                else {
                    this.cleanup();
                    this.removeAllThenDoError(data.nextErrorId);
                }
            }
        }
        else {
            this.log.info('no more errors!');
            if (this.wifiSkill || this.wipeSkill) {
                this.log.info(`error display not doing anything because we're still doing wifi stuff`);
                jibo.globalEvents.touchStop.on(this.onWifiExitedAfterSolved);
            }
            else {
                if (!this.silent && data && data.resolved && this.currentMessage.spokenPromptOnResolution && this.currentMessage.spokenPromptOnResolution.length) {
                    jibo.tts.speak(this.currentMessage.spokenPromptOnResolution, {
                        mode: jibo.tts.TTSMode.SSML
                    }, () => {
                        if (!this.skill) {
                            return;
                        }
                        this.skill.exit2Idle();
                    });
                }
                else {
                    this.skill.exit2Idle();
                }
            }
        }
    }
    dismissError() {
        if (!this.skill) {
            return;
        }
        jibo.errors.processedError(this.errorCode, (err, data) => {
            if (!this.skill) {
                return;
            }
            if (err) {
                this.log.error(`error processing error ${this.errorCode}`, err, data);
            }
        });
    }
    onHeadUpdate() {
        if (jibo.system.padState.some((value) => value)) {
            if (!this.touchStartTime) {
                this.touchStartTime = Date.now();
            }
            else if (Date.now() - this.touchStartTime > 1000) {
                this.isHeadHeld = true;
            }
        }
        else if (this.touchStartTime) {
            this.isHeadHeld = false;
            this.touchStartTime = 0;
            this.numOfSwipes = 0;
        }
    }
    onSwipeUp() {
        if (!this.isHeadHeld || this.wipeSkill || this.wifiSkill) {
            return;
        }
        if (++this.numOfSwipes === SECRET_SWIPES_REQUIRED) {
            this.doWipeSkill();
        }
    }
    doWifi() {
        if (!this.skill) {
            return;
        }
        this.doPulse(false);
        this.log.info('launching WifiSkill as child of ErrorSkill');
        jibo.face.views.changeView({
            remove: true,
            leaveEmpty: true
        }, () => {
            this.wifiSkill = new this.skill.SUB_SKILLZ.wifiStatus.Class(this.skill, 'wifiStatus', this.doneWifi.bind(this), false, true);
        });
    }
    doneWifi() {
        if (!this.skill) {
            return;
        }
        this.log.info('done with ErrorSkill-initiated WifiSkill');
        this.doneOwnedSkill();
    }
    doneOwnedSkill() {
        this.numOfSwipes = 0;
        this.touchStartTime = 0;
        if (this.queuedError) {
            this.cleanup();
            this.removeAllThenDoError(this.queuedError);
        }
        else {
            jibo.errors.getCurrentErrorId((err, errorCode) => {
                if (errorCode) {
                    this.cleanup();
                    this.removeAllThenDoError(errorCode);
                }
                else {
                    this.skill.exit2Idle();
                }
            });
        }
    }
    onWifiExitedAfterSolved() {
        jibo.face.gestures.spoofGesture('swipedown');
    }
    doWipeSkill() {
        if (!this.skill) {
            return;
        }
        this.doPulse(false);
        this.log.info('launching WipeSkill as child of ErrorSkill');
        jibo.face.views.changeView({
            remove: true,
            leaveEmpty: true
        }, () => {
            this.wipeSkill = new this.skill.SUB_SKILLZ.wipe.Class(this.skill, 'wipe', this.cancelledWipe.bind(this), true, true);
        });
    }
    cancelledWipe() {
        if (!this.skill) {
            return;
        }
        this.log.info('done with ErrorSkill-initiated WipeSkill');
        this.doneOwnedSkill();
    }
    doWipe() {
        jibo.face.views.creator.registerClass(WipeView_1.default, 'WipeView');
        jibo.face.views.changeView({
            remove: true,
            addView: 'assets/wipe/wipeView.json'
        }, null, null, (view) => {
            view.setLogger(this.log);
            view.on('wipeFail', () => {
                this.log.error('Wipe failed from Error Skill. This is probably real bad.');
                jibo.systemManager.reboot((err) => {
                    if (this.skill && err) {
                        this.log.error('failed to reboot on wipe fail from error skill.', err);
                    }
                });
            });
            view.run(true);
        });
    }
    doPulse(doIt) {
        if (doIt) {
            if (!this.doingPulse) {
                this.doingPulse = true;
                this.fadingUp = true;
                this.brightness = MIN_BRIGHTNESS;
                jibo.timer.on('update', this.ringPulse);
            }
        }
        else {
            jibo.timer.off('update', this.ringPulse);
            this.doingPulse = false;
            jibo.expression.setLEDColor([0, 0, 0]);
        }
    }
    ringPulse(elapsed) {
        if (!this.skill) {
            this.doPulse(false);
            return;
        }
        if (this.fadingUp) {
            this.brightness += (elapsed / 1000) * (1 / PULSE_LENGTH) * (MAX_BRIGHTNESS - MIN_BRIGHTNESS);
            if (this.brightness >= MAX_BRIGHTNESS) {
                this.brightness = MAX_BRIGHTNESS;
                this.fadingUp = false;
            }
        }
        else {
            this.brightness -= (elapsed / 1000) * (1 / PULSE_LENGTH) * (MAX_BRIGHTNESS - MIN_BRIGHTNESS);
            if (this.brightness <= MIN_BRIGHTNESS) {
                this.brightness = MIN_BRIGHTNESS;
                this.fadingUp = true;
            }
        }
        jibo.expression.setLEDColor([ERROR_COLOR[0] * this.brightness, ERROR_COLOR[1] * this.brightness, ERROR_COLOR[2] * this.brightness]);
    }
    removeAllThenDoError(nextError) {
        jibo.face.views.changeView({
            removeAll: true,
            leaveEmpty: true
        }, () => {
            this.doError(nextError);
        }, () => {
            this.doError(nextError);
        });
    }
    cleanup() {
        this.wifiSkill = null;
        this.wipeSkill = null;
        if (this.currentView && this.currentMessage && this.tapActions[this.currentMessage.tapAction]) {
            this.currentView.removeListener(TAP_EVENT, this.tapActions[this.currentMessage.tapAction]);
        }
        if (this.attentionHandler) {
            this.attentionHandler.release();
            this.attentionHandler = null;
        }
        jibo.tts.stop();
        this.doPulse(false);
        jibo.globalEvents.touchStop.removeListener(this.onWifiExitedAfterSolved);
    }
    destroy() {
        this.cleanup();
        this.brightness = null;
        this.skill = null;
        this.assetPack = null;
        this.currentView = null;
        this.errorCode = null;
        this.queuedError = null;
        jibo.timer.removeListener('update', this.onHeadUpdate);
    }
}
exports.default = ErrorDisplay;

},{"./analytics/PowerAnalytics":8,"./views/WipeView":25,"jibo":undefined}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const be_framework_1 = require("@be/be-framework");
const jibo = require("jibo");
const WiFi_1 = require("./WiFi");
const AboutSkill_1 = require("./subskills/AboutSkill");
const BatterySkill_1 = require("./subskills/BatterySkill");
const ErrorSkill_1 = require("./subskills/ErrorSkill");
const MenuSkill_1 = require("./subskills/MenuSkill");
const ShutdownSkill_1 = require("./subskills/ShutdownSkill");
const ShutdownAnimationSkill_1 = require("./subskills/ShutdownAnimationSkill");
const UpdatesSkill_1 = require("./subskills/UpdatesSkill");
const VolumeSkill_1 = require("./subskills/VolumeSkill");
const WifiSkill_1 = require("./subskills/WifiSkill");
const WipeSkill_1 = require("./subskills/WipeSkill");
const Analytics_1 = require("./analytics/Analytics");
const PowerAnalytics_1 = require("./analytics/PowerAnalytics");
class Settings extends be_framework_1.BeSkill {
    constructor(assetPack) {
        super(assetPack);
        this.SUB_SKILLZ = {
            about: { Class: AboutSkill_1.default },
            battery: { Class: BatterySkill_1.default },
            error: { Class: ErrorSkill_1.default, uninterruptible: true, refreshable: true },
            menu: { Class: MenuSkill_1.default },
            shutDown: { Class: ShutdownSkill_1.default },
            shutdownAnimation: { Class: ShutdownAnimationSkill_1.default, uninterruptible: true },
            updates: { Class: UpdatesSkill_1.default },
            volumeQuery: { Class: VolumeSkill_1.default },
            wifiStatus: { Class: WifiSkill_1.default },
            wipe: { Class: WipeSkill_1.default, uninterruptible: true }
        };
        this.root = null;
        this.currentIntent = null;
        this.panelClosed = this.panelClosed.bind(this);
        this.errorMetaData = null;
        this.previousSkillName = null;
        this.previousSkillOptions = null;
        this.currentErrorCode = null;
        this._globalIgnoreState = false;
        this.globalDoNothing = this.globalDoNothing.bind(this);
        this._analytics = new Analytics_1.default(this);
        PowerAnalytics_1.default.init();
    }
    postInit(callback) {
        let errorKbm = jibo.kb.createModel('/error-codes');
        errorKbm.loadRoot((err, root) => {
            if (err) {
                this.log.error('error loading error root from KB', err);
            }
            this.errorMetaData = root.data.errorCodes;
            let kbm = jibo.kb.createModel('/settings');
            kbm.loadRoot((err, root) => {
                if (err) {
                    this.log.error('error loading settings root from KB', err);
                }
                this.root = root;
                jibo.wifi.getCurrentNetwork((err, net) => {
                    if (err || !net || !net.ssid) {
                        this.log.warn('Not connected to WiFi at Be startup. Error: ', err);
                    }
                    else {
                        WiFi_1.default.notifyServer(net.ssid, this.log);
                    }
                    callback();
                });
            });
        });
    }
    preload(callback) {
        callback();
    }
    open(data, refresh, previousSkillName, previousSkillOptions) {
        let intent = 'menu';
        let fromTouch = false;
        if (data) {
            if (data.nlu) {
                if (data.nlu.entities && data.nlu.entities.errorId) {
                    intent = 'error';
                    this.currentErrorCode = data.nlu.entities.errorId;
                    if (this.currentIntent === 'error' && this.currentSkill.errorDisplay && this.currentSkill.errorDisplay.wipeSkill) {
                        this.log.info(`Got ${this.currentErrorCode} error while displaying secret Wipe menu. This is fine.`);
                    }
                    else if (this.errorMetaData[this.currentErrorCode].tapAction === 'wifi' && (this.currentIntent === 'wifiStatus' ||
                        (this.currentIntent === 'error' && this.currentSkill.errorDisplay && this.currentSkill.errorDisplay.wifiSkill))) {
                        this.log.info(`Got ${this.currentErrorCode} error while in WiFi settings. This is fine.`);
                        return;
                    }
                }
                else if (data.nlu.intent) {
                    intent = data.nlu.intent;
                }
            }
            fromTouch = !!data.fromTouch;
        }
        if (refresh) {
            if (this.currentIntent === intent && !this.SUB_SKILLZ[intent].refreshable) {
                this.log.info(`Ignoring skill refresh because ${this.currentIntent} is already active.`);
                jibo.globalEvents.shared.nonInterruptingGlobal.emit();
                return;
            }
            if (this.currentSkill && this.currentSkill.intent === 'menu') {
                this.currentSkill.cleanup();
                this.openPanel(intent, fromTouch, previousSkillName, previousSkillOptions);
            }
            else {
                this.cleanupSubSkill(() => {
                    this.openPanel(intent, fromTouch, previousSkillName, previousSkillOptions);
                });
            }
        }
        else {
            this.openPanel(intent, fromTouch, previousSkillName, previousSkillOptions);
        }
    }
    close(done) {
        this.previousSkillName = null;
        this.previousSkillOptions = null;
        this.currentIntent = null;
        this.cleanupSubSkill(done);
    }
    destroy(done) {
        done();
    }
    goBack() {
        if (this.previousSkillName === '@be/settings' && this.previousSkillOptions.nlu && this.previousSkillOptions.nlu.entities && this.previousSkillOptions.nlu.entities.errorId) {
            let options = this.previousSkillOptions;
            jibo.errors.getCurrentErrorId((err, errorCode) => {
                if (!err && errorCode) {
                    this.log.warn('trying to redirect from error skill to error skill. Succeed - An error is active: ', errorCode);
                    options.nlu.entities.errorId = errorCode;
                    this.redirect('@be/settings', options);
                }
                else {
                    this.log.warn('trying to redirect from error skill to error skill. Fail - No error active, go to Idle');
                    this.redirect('@be/idle', {});
                }
            });
        }
        else {
            this.redirect(this.previousSkillName || '@be/idle', this.previousSkillOptions || {});
        }
    }
    exit2Idle() {
        jibo.errors.getCurrentErrorId((err, errorCode) => {
            if (!err && errorCode) {
                this.log.warn('trying to exit from error skill, but an error is still active: ', errorCode);
                let options = { nlu: { entities: { skill: '@be/settings', errorId: errorCode } } };
                this.redirect('@be/settings', options);
            }
            else {
                this.redirect('@be/idle', {});
            }
        });
    }
    ignoreGlobalStops(enable) {
        if (this._globalIgnoreState === enable) {
            return;
        }
        this._globalIgnoreState = enable;
        if (enable) {
            jibo.globalEvents.touchStop.on(this.globalDoNothing);
            jibo.globalEvents.voiceStop.on(this.globalDoNothing);
        }
        else {
            jibo.globalEvents.touchStop.removeListener(this.globalDoNothing);
            jibo.globalEvents.voiceStop.removeListener(this.globalDoNothing);
        }
    }
    globalDoNothing() {
        this.log.info(`ignoring global stop command in ${this.currentIntent} SubSkill.`);
        jibo.globalEvents.shared.nonInterruptingGlobal.emit();
    }
    openPanel(intent, fromTouch, previousSkillName, previousSkillOptions) {
        this.previousSkillName = previousSkillName;
        this.previousSkillOptions = previousSkillOptions;
        this.currentIntent = intent;
        if (!this.SUB_SKILLZ[intent]) {
            this.log.warn(`no SubSkill for intent ${intent}`);
            this.exit();
            return;
        }
        this._isInterruptible = !this.SUB_SKILLZ[intent].uninterruptible;
        this.currentSkill = new this.SUB_SKILLZ[intent].Class(this, intent, this.panelClosed.bind(this), fromTouch);
    }
    panelClosed() {
        this.currentSkill = null;
        if (this.previousSkillName === '@be/settings' && this.previousSkillOptions.nlu && this.previousSkillOptions.nlu.intent === 'menu') {
            this.log.info('Going back to settings Menu');
            this.goBack();
        }
        else {
            this.exit();
        }
    }
    cleanupSubSkill(done) {
        if (this.currentSkill) {
            if (this.currentSkill.intent) {
                this.currentSkill.log.info('SubSkill killed before its time');
                this.currentSkill.stopAndDestroy((err) => {
                    if (err) {
                        this.log.warn('SubSkill closed with errors: ', err);
                    }
                    this.currentSkill = null;
                    done();
                });
            }
            else {
                this.currentSkill = null;
                done();
            }
        }
        else {
            done();
        }
    }
}
Settings.BeSkill = be_framework_1.BeSkill;
Settings.AboutPage = AboutSkill_1.AboutPage;
exports.default = Settings;

},{"./WiFi":6,"./analytics/Analytics":7,"./analytics/PowerAnalytics":8,"./subskills/AboutSkill":11,"./subskills/BatterySkill":12,"./subskills/ErrorSkill":13,"./subskills/MenuSkill":14,"./subskills/ShutdownAnimationSkill":15,"./subskills/ShutdownSkill":16,"./subskills/UpdatesSkill":18,"./subskills/VolumeSkill":19,"./subskills/WifiSkill":20,"./subskills/WipeSkill":21,"@be/be-framework":undefined,"jibo":undefined}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JSC = require("@jibo/jibo-server-client");
const jibo = require("jibo");
const TouchyTimeout_1 = require("./utils/TouchyTimeout");
const animate = require("pixi-animate");
const HIGH_SIGNAL = 85;
const MEDIUM_SIGNAL = 65;
const BACK = 'BAQUE';
const BACKTIONS = [{
        applyConfig: null,
        type: 'event',
        data: {
            event: BACK
        }
    }];
const TIMEOUT_TIME = 120000;
const COLORS = {
    metro: [0x58586D, 0x282735],
    limeade: [0xA3FF4A, 0x2A7922],
};
class WiFi {
    constructor(skill, log, fromError) {
        this._shouldUpdateWifiStatus = false;
        this.updateWiFiStatus = () => {
            this._shouldUpdateWifiStatus = true;
            jibo.wifi.getCurrentNetwork((err, currentNetwork) => {
                if (!this.skill) {
                    this.currentNetwork = {
                        ssid: 'UNKNOWN',
                        strength: 0,
                        speed: 0,
                        ip_address: 'disconnected'
                    };
                }
                else if (err || !currentNetwork || currentNetwork.ssid === undefined) {
                    jibo.wifi.getSavedNetworks((err, networks) => {
                        if (!this.skill) {
                            this.currentNetwork = {
                                ssid: 'UNKNOWN',
                                strength: 0,
                                speed: 0,
                                ip_address: 'disconnected'
                            };
                        }
                        else if (err || !networks || !networks.length || networks[0].ssid === undefined || networks.filter((net) => { return net.enabled === true; })[0] === undefined) {
                            this.currentNetwork = {
                                ssid: 'UNKNOWN',
                                strength: 0,
                                speed: 0,
                                ip_address: 'disconnected'
                            };
                        }
                        else {
                            this.currentNetwork = {
                                ssid: networks.filter((net) => { return net.enabled === true; })[0].ssid,
                                strength: 0,
                                speed: 0,
                                ip_address: 'disconnected'
                            };
                        }
                        if (this._shouldUpdateWifiStatus) {
                            this.interval = setTimeout(this.updateWiFiStatus, 1000);
                        }
                    });
                    this.connected = false;
                    this.skill.ignoreGlobalStops(true);
                }
                else {
                    this.connected = true;
                    this.skill.ignoreGlobalStops(false);
                    this.currentNetwork = currentNetwork;
                    if (this._shouldUpdateWifiStatus) {
                        this.interval = setTimeout(this.updateWiFiStatus, 1000);
                    }
                }
            });
        };
        this.skill = skill;
        this.log = log;
        this.fromError = fromError;
        this.assetPack = skill.assetPack;
        this.macAddress = null;
        jibo.systemManager.getIdentity((err, id) => {
            if (err) {
                this.log.warn('getIdentity failed: ', err);
                return;
            }
            this.macAddress = `MAC Address: ${id.wifi_mac}`;
        });
        this.updater = null;
        this.timeout = null;
        this.connected = true;
    }
    static notifyServer(ssid, log, token) {
        jibo.systemManager.getCredentials((err, credentials) => {
            if (err) {
                log.error('Credentials not found', err);
            }
            else {
                jibo.systemManager.getIdentity((err, identity) => {
                    if (err) {
                        log.error('identity not found', err);
                    }
                    else {
                        let updata = {
                            id: identity.name,
                            payload: {
                                SSID: ssid,
                                connectedAt: Date.now(),
                                platform: jibo.versions.platform,
                                serialNumber: identity.serial_number
                            }
                        };
                        JSC.config.update(credentials);
                        let robot = new JSC.Robot(credentials);
                        robot.updateRobot(updata, (err, notErr) => {
                            if (err) {
                                log.warn('Unable to update robot info on server', err);
                            }
                            else {
                                log.info('Updated robot info on server: ', notErr);
                            }
                        });
                        if (token) {
                            let oobe = new JSC.OOBE();
                            oobe.reconnectRobot({ token: token, id: identity.name }, (err, data) => {
                                if (err) {
                                    log.warn('Unable to notify mobile of reconnection: ', err);
                                }
                                else {
                                    log.info('Notified mobile of reconnection: ', data);
                                }
                            });
                        }
                    }
                });
            }
        });
    }
    showWiFiMenu(onBack) {
        this.onBack = onBack;
        this.getWiFiStatus().then(this._initWiFiMenu.bind(this));
    }
    _initWiFiMenu(wifiMenu) {
        this.updateWiFiStatus();
        let subtitle = jibo.face.views.creator.createComponentFromConfig({
            id: 'ssid',
            type: 'Label',
            text: 'Connected to: ' + this.currentNetwork.ssid,
            style: {
                fontSize: '45',
                fontFamily: 'Proxima Nova Light',
                fill: '#FFFFFF'
            },
            position: {
                x: 640,
                y: 160
            },
            targetAnchor: {
                x: 0.5,
                y: 0
            },
            bounds: {
                width: jibo.face.width - 160,
                height: 45
            }
        });
        let onLoaded = () => {
            this.currentView.swipeDownActions = BACKTIONS;
            this.currentView._title.display.y = 50;
            this.currentView.ssid = this.currentView.getComponentById('ssid');
            this.currentView.networkButton = this.currentView.list.getComponentById('currentNetwork');
            let assets = this.currentView.networkButton._assets;
            this.currentView.iconContainer = this.currentView.networkButton.display.children[0].content.icon;
            this.currentView.iconContainer.noSignal = this.currentView.iconContainer.children[0];
            this.currentView.iconContainer.loSignal = new PIXI.Sprite(assets.signal_lo);
            this.currentView.iconContainer.loSignal.anchor.x = 0.5;
            this.currentView.iconContainer.loSignal.anchor.y = 0.5;
            this.currentView.iconContainer.loSignal.x = this.currentView.iconContainer.noSignal.x;
            this.currentView.iconContainer.loSignal.y = this.currentView.iconContainer.noSignal.y;
            this.currentView.iconContainer.addChild(this.currentView.iconContainer.loSignal);
            this.currentView.iconContainer.mdSignal = new PIXI.Sprite(assets.signal_md);
            this.currentView.iconContainer.mdSignal.anchor.x = 0.5;
            this.currentView.iconContainer.mdSignal.anchor.y = 0.5;
            this.currentView.iconContainer.mdSignal.x = this.currentView.iconContainer.noSignal.x;
            this.currentView.iconContainer.mdSignal.y = this.currentView.iconContainer.noSignal.y;
            this.currentView.iconContainer.addChild(this.currentView.iconContainer.mdSignal);
            this.currentView.iconContainer.hiSignal = new PIXI.Sprite(assets.signal_hi);
            this.currentView.iconContainer.hiSignal.anchor.x = 0.5;
            this.currentView.iconContainer.hiSignal.anchor.y = 0.5;
            this.currentView.iconContainer.hiSignal.x = this.currentView.iconContainer.noSignal.x;
            this.currentView.iconContainer.hiSignal.y = this.currentView.iconContainer.noSignal.y;
            this.currentView.iconContainer.addChild(this.currentView.iconContainer.hiSignal);
            this._updateWiFiMenu();
            this.updater = setInterval(this._updateWiFiMenu.bind(this), 1000);
            this.timeout = new TouchyTimeout_1.default(this.emitBack.bind(this), TIMEOUT_TIME);
        };
        if (wifiMenu) {
            this.currentView = wifiMenu;
            this.currentView.addComponent(subtitle).createDisplay(this.currentView.stage, this.currentView.assets);
            onLoaded();
        }
        else {
            this.currentView = jibo.face.views.createView('MenuView', 'assets/wifi/views/menu.json', true);
            this.currentView.addComponent(subtitle);
            this.currentView.on(jibo.face.views.LOADED, onLoaded);
        }
        this.currentView.on('detail', () => {
            this.currentView.lockInput(true);
            this.cleanupTimers();
            this._showYourNetworks();
        });
        this.currentView.on('change', () => {
            this.cleanupTimers();
            this.changeWiFi();
        });
        this.currentView.on(BACK, () => {
            let timerEnded = this.timeout && !this.timeout.delayedCall;
            this.cleanupTimers();
            if (this.connected || this.fromError) {
                jibo.face.views.removeView(this.onBack);
            }
            else if (timerEnded) {
                this.timeout = new TouchyTimeout_1.default(this.emitBack.bind(this), TIMEOUT_TIME);
            }
            else {
                this.jiboPhoneHome();
            }
        });
    }
    emitBack() {
        if (this.currentView) {
            this.log.info('going back due to timeout');
            this.currentView.emit(BACK);
        }
    }
    jiboPhoneHome() {
        this.currentView = jibo.face.views.createView('EyeView', {
            viewConfig: {
                ignoreSwipeDown: true
            }
        }, true, () => {
            this.mim = new jibo.bt.behaviors.Mim({
                mimPath: 'mims/en-us/ILikeWiFi.mim',
                assetPack: this.assetPack,
                getPromptData: null
            });
            this.mim.start();
            let ticker = (elapsed) => {
                if (this.mim.update(elapsed) === jibo.bt.Status.SUCCEEDED) {
                    jibo.timer.removeListener('update', ticker);
                    this._closeAllToWiFiMenu();
                }
            };
            jibo.timer.on('update', ticker);
        });
    }
    getWiFiStatus() {
        return new Promise((resolve, reject) => {
            jibo.wifi.getCurrentNetwork((err, currentNetwork) => {
                if (!this.skill) {
                    this.currentNetwork = {
                        ssid: 'UNKNOWN',
                        strength: 0,
                        speed: 0,
                        ip_address: 'disconnected'
                    };
                    this.previousNetwork = this.currentNetwork.ssid;
                    resolve();
                }
                else if (err || !currentNetwork || currentNetwork.ssid === undefined) {
                    jibo.wifi.getSavedNetworks((err, networks) => {
                        if (!this.skill) {
                            this.currentNetwork = {
                                ssid: 'UNKNOWN',
                                strength: 0,
                                speed: 0,
                                ip_address: 'disconnected'
                            };
                            this.previousNetwork = this.currentNetwork.ssid;
                            resolve();
                        }
                        else if (err || !networks || !networks.length || networks[0].ssid === undefined || networks.filter((net) => { return net.enabled === true; })[0] === undefined) {
                            this.currentNetwork = {
                                ssid: 'UNKNOWN',
                                strength: 0,
                                speed: 0,
                                ip_address: 'disconnected'
                            };
                            this.previousNetwork = this.currentNetwork.ssid;
                            resolve();
                        }
                        else {
                            this.currentNetwork = {
                                ssid: networks.filter((net) => { return net.enabled === true; })[0].ssid,
                                strength: 0,
                                speed: 0,
                                ip_address: 'disconnected'
                            };
                            this.previousNetwork = this.currentNetwork.ssid;
                            resolve();
                        }
                    });
                    this.connected = false;
                    this.skill.ignoreGlobalStops(true);
                }
                else {
                    this.connected = true;
                    this.skill.ignoreGlobalStops(false);
                    this.currentNetwork = currentNetwork;
                    this.previousNetwork = currentNetwork.ssid;
                    resolve();
                }
            });
        });
    }
    _updateYourNetworks() {
        if (this.currentView.id !== 'yournetworks') {
            return;
        }
        if (this.currentView !== jibo.face.views.currentView) {
            return;
        }
        for (let iconSprite of this.currentView.iconContainer.children) {
            iconSprite.visible = false;
        }
        if (this.currentNetwork.strength <= 0) {
            this.currentView.networkButton._content.background.children[0].tint = COLORS.metro[0];
            this.currentView.networkButton._content.gradient.children[0].tint = COLORS.metro[1];
            this.currentView.iconContainer.noSignal.visible = true;
        }
        else {
            this.currentView.networkButton._content.background.children[0].tint = COLORS.limeade[0];
            this.currentView.networkButton._content.gradient.children[0].tint = COLORS.limeade[1];
            if (this.currentNetwork.strength > HIGH_SIGNAL) {
                this.currentView.iconContainer.hiSignal.visible = true;
            }
            else if (this.currentNetwork.strength > MEDIUM_SIGNAL) {
                this.currentView.iconContainer.mdSignal.visible = true;
            }
            else {
                this.currentView.iconContainer.loSignal.visible = true;
            }
        }
    }
    _updateWiFiMenu() {
        if (this.currentView !== jibo.face.views.currentView) {
            return;
        }
        if (this.currentView.ssid.text !== `Connected to: ${this.currentNetwork.ssid}`) {
            this.currentView.ssid.text = `Connected to: ${this.currentNetwork.ssid}`;
        }
        for (let iconSprite of this.currentView.iconContainer.children) {
            iconSprite.visible = false;
        }
        if (this.currentNetwork.strength <= 0) {
            this.currentView.networkButton._content.background.children[0].tint = COLORS.metro[0];
            this.currentView.networkButton._content.gradient.children[0].tint = COLORS.metro[1];
            this.currentView.iconContainer.noSignal.visible = true;
            this.currentView.ssid = this.currentView.getComponentById('ssid');
            this.currentView.ssid.text = this.currentNetwork.ssid;
            if (this.currentView._title.text !== 'Wi-Fi (Disconnected)') {
                this.currentView._title.text = 'Wi-Fi (Disconnected)';
            }
        }
        else {
            this.currentView.networkButton._content.background.children[0].tint = COLORS.limeade[0];
            this.currentView.networkButton._content.gradient.children[0].tint = COLORS.limeade[1];
            if (this.currentView._title.text !== 'Wi-Fi') {
                this.currentView._title.text = 'Wi-Fi';
            }
            if (this.currentNetwork.strength > HIGH_SIGNAL) {
                this.currentView.iconContainer.hiSignal.visible = true;
            }
            else if (this.currentNetwork.strength > MEDIUM_SIGNAL) {
                this.currentView.iconContainer.mdSignal.visible = true;
            }
            else {
                this.currentView.iconContainer.loSignal.visible = true;
            }
        }
    }
    createNetworkObject(savedNet) {
        let net = {
            'id': savedNet.ssid,
            'label': savedNet.ssid,
            'iconSrc': 'assets/wifi/images/icons/signal_no.png',
            'colors': [0xA3FF4A, 0x2A7922],
            'action': {
                'type': 'event',
                'data': {
                    'event': 'detail',
                    'ssid': null
                }
            },
            'assets': [{
                    'id': 'signal_lo',
                    'src': 'assets/wifi/images/icons/signal_lo.png',
                    'type': 'texture'
                },
                {
                    'id': 'signal_md',
                    'src': 'assets/wifi/images/icons/signal_md.png',
                    'type': 'texture'
                },
                {
                    'id': 'signal_hi',
                    'src': 'assets/wifi/images/icons/signal_hi.png',
                    'type': 'texture'
                }
            ]
        };
        if (!savedNet.enabled) {
            net.colors = COLORS.metro;
            net.action.data.event = 'connect';
            net.action.data.ssid = savedNet.ssid;
        }
        else {
            net.id = 'currentNetwork';
        }
        return net;
    }
    _showYourNetworks(yourNetworksMenu) {
        this.updateWiFiStatus();
        let yourNetworksView = {
            'viewConfig': {
                'title': 'Your networks',
                'id': 'yournetworks',
                'listDefault': {
                    'menuButtonType': 'ActionBigButton'
                },
                'list': []
            }
        };
        let onLoaded = () => {
            this.currentView.swipeDownActions = BACKTIONS;
            this.currentView.networkButton = this.currentView.list.getComponentById('currentNetwork');
            let assets = this.currentView.networkButton._assets;
            this.currentView.iconContainer = this.currentView.networkButton.display.children[0].content.icon;
            this.currentView.iconContainer.noSignal = this.currentView.iconContainer.children[0];
            this.currentView.iconContainer.loSignal = new PIXI.Sprite(assets.signal_lo);
            this.currentView.iconContainer.loSignal.anchor.x = 0.5;
            this.currentView.iconContainer.loSignal.anchor.y = 0.5;
            this.currentView.iconContainer.loSignal.x = this.currentView.iconContainer.noSignal.x;
            this.currentView.iconContainer.loSignal.y = this.currentView.iconContainer.noSignal.y;
            this.currentView.iconContainer.addChild(this.currentView.iconContainer.loSignal);
            this.currentView.iconContainer.mdSignal = new PIXI.Sprite(assets.signal_md);
            this.currentView.iconContainer.mdSignal.anchor.x = 0.5;
            this.currentView.iconContainer.mdSignal.anchor.y = 0.5;
            this.currentView.iconContainer.mdSignal.x = this.currentView.iconContainer.noSignal.x;
            this.currentView.iconContainer.mdSignal.y = this.currentView.iconContainer.noSignal.y;
            this.currentView.iconContainer.addChild(this.currentView.iconContainer.mdSignal);
            this.currentView.iconContainer.hiSignal = new PIXI.Sprite(assets.signal_hi);
            this.currentView.iconContainer.hiSignal.anchor.x = 0.5;
            this.currentView.iconContainer.hiSignal.anchor.y = 0.5;
            this.currentView.iconContainer.hiSignal.x = this.currentView.iconContainer.noSignal.x;
            this.currentView.iconContainer.hiSignal.y = this.currentView.iconContainer.noSignal.y;
            this.currentView.iconContainer.addChild(this.currentView.iconContainer.hiSignal);
            this._updateYourNetworks();
            this.updater = setInterval(this._updateYourNetworks.bind(this), 1000);
        };
        jibo.wifi.getSavedNetworks((err, data) => {
            let nonCurrentNets = [];
            data.forEach((savedNet) => {
                if (savedNet.enabled) {
                    yourNetworksView.viewConfig.list.push(this.createNetworkObject(savedNet));
                }
                else {
                    nonCurrentNets.push(this.createNetworkObject(savedNet));
                }
            });
            if (yourNetworksView.viewConfig.list.length <= 0) {
                this.log.error('All the networks are disabled, this is unexpected');
                nonCurrentNets[0].id = 'currentNetwork';
                nonCurrentNets[0].action.data.event = 'detail';
            }
            if (yourNetworksView.viewConfig.list.length > 1) {
                this.log.error('multiple networks are enabled, this is unexpected');
                for (let i = 1; i < yourNetworksView.viewConfig.list.length; i++) {
                    yourNetworksView.viewConfig.list[i].id = yourNetworksView.viewConfig.list[i].label;
                    yourNetworksView.viewConfig.list[i].action.data.event = 'connect';
                    yourNetworksView.viewConfig.list[i].colors = COLORS.metro;
                    yourNetworksView.viewConfig.list[i].action.data.ssid = yourNetworksView.viewConfig.list[i].label;
                }
            }
            yourNetworksView.viewConfig.list = yourNetworksView.viewConfig.list.concat(nonCurrentNets).slice();
            if (yourNetworksMenu) {
                this.currentView = yourNetworksMenu;
                onLoaded();
            }
            else {
                this.currentView = jibo.face.views.createView('MenuView', yourNetworksView, true);
            }
            this.currentView.on(jibo.face.views.LOADED, onLoaded);
            this.currentView.on(BACK, () => {
                this.cleanupTimers();
                this._closeAllToWiFiMenu();
            });
            this.currentView.on('detail', () => {
                this.cleanupTimers();
                this._showDetailView();
            });
            this.currentView.on('connect', (eventData) => {
                this.cleanupTimers();
                this._showConnectView(eventData.ssid);
            });
        });
    }
    _showConnectView(ssid) {
        this.currentView = jibo.face.views.createView('MenuView', 'assets/wifi/views/connect.json', true);
        this.currentView.on(BACK, () => {
            this.cleanupTimers();
            this._closeAllToYourNetworksMenu();
        });
        this.currentView.on(jibo.face.views.LOADED, () => {
            this.currentView.swipeDownActions = BACKTIONS;
            this.currentView._title.text = ssid;
        });
        this.currentView.on('delete', () => {
            this.currentView.lockInput(true);
            this.cleanupTimers();
            this._showRemoving(ssid);
        });
        this.currentView.on('connect', () => {
            this.cleanupTimers();
            this._connectingToSaved(ssid);
        });
    }
    _connectingToSaved(ssid) {
        this.log.info('connecting to ssid: ', ssid);
        this.skill.ignoreGlobalStops(true);
        this.currentView = jibo.face.views.createView('View', 'assets/wifi/views/connecting.json', true, null, jibo.face.views.NONE, jibo.face.views.NONE);
        this.currentView.on(jibo.face.views.LOADED, () => {
            this.currentView.connecting = this.currentView.getComponentById('connecting').movieClip;
            this.currentView.connecting.stop();
            this.currentView.connecting.ssid.ssid.text = ssid;
            let labels = this.currentView.connecting.labels;
            for (let i = 0; i < labels.length; ++i) {
                let label = labels[i].label;
                if (label.indexOf('playAudio-') === 0) {
                    let alias = label.split('-')[1];
                    this.currentView.connecting.addAction(() => {
                        jibo.sound.play(alias);
                    }, labels[i].position);
                }
            }
        });
        this.currentView.on(jibo.face.views.OPENED, () => {
            let commenceTheNetworking = () => {
                this.wifiError = null;
                jibo.wifi.selectNetwork(ssid, () => {
                    this.wifiConfig = {
                        ssid,
                        pswd: null,
                        security: null,
                        hidden: null,
                        networkType: null,
                        staticSettings: null
                    };
                    this.newNetworkAdded = false;
                    let startVerify = Date.now();
                    const VERIFY_TIME = 30000;
                    let verifyCallback = (error) => {
                        if (error) {
                            if (Date.now() - startVerify > VERIFY_TIME) {
                                this.wifiError = error;
                                this._connectionFailed();
                            }
                            else {
                                setTimeout(() => {
                                    jibo.wifi.verifyConnection(verifyCallback);
                                }, 1000);
                            }
                        }
                        else {
                            this._connectionSuccess();
                        }
                    };
                    jibo.wifi.verifyConnection(verifyCallback);
                });
            };
            commenceTheNetworking();
            animate.Animator.play(this.currentView.connecting, 'wifiSearch', () => {
                if (this.currentView.connecting) {
                    animate.Animator.play(this.currentView.connecting, 'wifiSearchLoop');
                }
            });
        });
    }
    _showRemoving(ssid) {
        this.currentView = jibo.face.views.createView('View', 'assets/wifi/views/detail.json', true);
        this.currentView.closeOnSwipeDown = false;
        this.currentView.on(jibo.face.views.LOADED, () => {
            this.currentView.signalIndicator = this.currentView.getComponentById('signalIndicator').display;
            this.currentView.ssid = this.currentView.getComponentById('ssid');
            this.currentView.ip = this.currentView.getComponentById('ip');
            this.currentView.mac = this.currentView.getComponentById('mac');
            if (!this.macAddress) {
                jibo.systemManager.getIdentity((err, id) => {
                    if (err) {
                        this.log.error('getIdentity failed: ', err);
                        return;
                    }
                    this.currentView.mac.text = this.macAddress = `MAC Address: ${id.wifi_mac}`;
                });
            }
            else {
                this.currentView.mac.text = this.macAddress;
            }
            this.currentView.ssid.text = ssid;
            this.currentView.signalIndicator.children[3].visible = false;
            this.currentView.signalIndicator.children[2].visible = false;
            this.currentView.signalIndicator.children[1].visible = false;
            this.currentView.signalIndicator.children[0].visible = true;
            this.currentView.ip.text = '';
        });
        this.currentView.on(jibo.face.views.STATE.OPENED, () => {
            jibo.wifi.removeNetwork(ssid, () => {
                for (let viewState of jibo.face.views._viewStates) {
                    if (viewState.id === 'yournetworks') {
                        for (let i = 0; i < viewState.viewConfig.list.length; i++) {
                            if (viewState.viewConfig.list[i].id === ssid) {
                                viewState.viewConfig.list.splice(i, 1);
                                break;
                            }
                        }
                        break;
                    }
                }
                this.cleanupTimers();
                jibo.face.views.changeView({
                    removeTo: 'yournetworks',
                    transitionClose: jibo.face.views.TRANSITION.OUT
                }, null, null, (view) => {
                    this._showYourNetworks(view);
                });
            });
        });
    }
    _showDetailView() {
        this.updateWiFiStatus();
        this.currentView = jibo.face.views.createView('View', 'assets/wifi/views/detail.json', true);
        this.currentView.on(BACK, () => {
            this.cleanupTimers();
            this._closeAllToYourNetworksMenu();
        });
        this.currentView.on(jibo.face.views.LOADED, () => {
            this.currentView.swipeDownActions = BACKTIONS;
            this.currentView.signalIndicator = this.currentView.getComponentById('signalIndicator').display;
            this.currentView.ssid = this.currentView.getComponentById('ssid');
            this.currentView.ip = this.currentView.getComponentById('ip');
            this.currentView.mac = this.currentView.getComponentById('mac');
            if (!this.macAddress) {
                jibo.systemManager.getIdentity((err, id) => {
                    if (err) {
                        this.log.error('getIdentity failed: ', err);
                        return;
                    }
                    this.currentView.mac.text = this.macAddress = `MAC Address: ${id.wifi_mac}`;
                });
            }
            else {
                this.currentView.mac.text = this.macAddress;
            }
            this._updateDetail();
            this.updater = setInterval(this._updateDetail.bind(this), 1000);
            this.timeout = new TouchyTimeout_1.default(this.emitBack.bind(this), TIMEOUT_TIME);
        });
    }
    _updateDetail() {
        if (this.currentView.ssid.text !== this.currentNetwork.ssid) {
            this.currentView.ssid.text = this.currentNetwork.ssid;
        }
        if (this.currentView.ip.text !== this.currentNetwork.ip_address) {
            this.currentView.ip.text = this.currentNetwork.ip_address;
        }
        for (let indicator of this.currentView.signalIndicator.children) {
            indicator.visible = false;
        }
        let strength = 0;
        if (this.currentNetwork.strength > HIGH_SIGNAL) {
            strength = 3;
        }
        else if (this.currentNetwork.strength > MEDIUM_SIGNAL) {
            strength = 2;
        }
        else if (this.currentNetwork.strength > 0) {
            strength = 1;
        }
        this.currentView.signalIndicator.children[strength].visible = true;
    }
    changeWiFi() {
        this._showInstructions();
    }
    _showInstructions() {
        this.currentView = jibo.face.views.createView('View', 'assets/wifi/views/instructions.json', true);
        this.currentView.on(BACK, () => {
            this.cleanupTimers();
            this._closeAllToWiFiMenu();
        });
        this.currentView.on(jibo.face.views.LOADED, () => {
            this.currentView.swipeDownActions = BACKTIONS;
            this.currentView.setupScreenClick();
            let eventName = 'somethingHappened';
            this.currentView.addAction('event', {
                event: eventName
            });
            this.currentView.on(eventName, () => {
                this.cleanupTimers();
                this._scanning();
            });
            this.currentView.mac = this.currentView.getComponentById('mac');
            if (!this.macAddress) {
                jibo.systemManager.getIdentity((err, id) => {
                    if (err) {
                        this.log.error('getIdentity failed: ', err);
                        return;
                    }
                    this.currentView.mac.text = this.macAddress = `MAC Address: ${id.wifi_mac}`;
                });
            }
            else {
                this.currentView.mac.text = this.macAddress;
            }
            this.timeout = new TouchyTimeout_1.default(this.emitBack.bind(this), TIMEOUT_TIME);
        });
    }
    _scanning() {
        this.qrData = [];
        this.codesReceived = [];
        this.currentView = jibo.face.views.createView('View', 'assets/wifi/views/scanning.json', true, null, jibo.face.views.IN, jibo.face.views.NONE);
        this.currentView.on(BACK, () => {
            this.cleanupTimers();
            this._stopScanning();
            this._closeAllToWiFiMenu();
        });
        this.currentView.on(jibo.face.views.LOADED, () => {
            this.currentView.swipeDownActions = BACKTIONS;
            this._startScanning();
            this.timeout = new TouchyTimeout_1.default(this.emitBack.bind(this), TIMEOUT_TIME);
        });
    }
    _moreInstructions() {
        this.currentView = jibo.face.views.createView('View', 'assets/wifi/views/instructionsMore.json', true);
        this.currentView.on(BACK, () => {
            this.cleanupTimers();
            this._closeAllToWiFiMenu();
        });
        this.currentView.on(jibo.face.views.LOADED, () => {
            this.currentView.swipeDownActions = BACKTIONS;
            this.currentView.mac = this.currentView.getComponentById('mac');
            this.currentView.mac.text = this.macAddress;
            this.currentView.qrNum = this.currentView.getComponentById('num');
            this.currentView.qrNum.text = `${this._getNextQRCodeNumber()}`;
            this.currentView.setupScreenClick();
            let eventName = 'somethingHappened';
            this.currentView.addAction('event', {
                event: eventName
            });
            this.currentView.on(eventName, () => {
                this.cleanupTimers();
                this._scanningMore();
            });
            this.timeout = new TouchyTimeout_1.default(this.emitBack.bind(this), TIMEOUT_TIME);
        });
    }
    _scanningMore() {
        this.currentView = jibo.face.views.createView('View', 'assets/wifi/views/scanningMore.json', true, null, jibo.face.views.IN, jibo.face.views.NONE);
        this.currentView.on(BACK, () => {
            this.cleanupTimers();
            this._stopScanning();
            this._closeAllToWiFiMenu();
        });
        this.currentView.on(jibo.face.views.LOADED, () => {
            this.currentView.swipeDownActions = BACKTIONS;
            this.currentView.qrNum = this.currentView.getComponentById('num');
            this.currentView.qrNum.text = `${this._getNextQRCodeNumber()}`;
            ;
            this._startScanning();
            this.timeout = new TouchyTimeout_1.default(this.emitBack.bind(this), TIMEOUT_TIME);
        });
    }
    _startScanning() {
        jibo.media.setViewfinder({
            enable: true,
            x: 176,
            y: 64,
            width: 928,
            height: 522,
            camera: 0
        }, (error) => {
            if (error) {
                this.log.error('setViewfinder enable error: ', error);
            }
        });
        this.scanning = true;
        this._readQR();
    }
    _readQR() {
        if (!this.scanning) {
            return;
        }
        jibo.lps.readBarcode((err, data) => {
            if (!err && data && data.length && data[0].type === 9) {
                let barcode = data[0].content;
                var metaEnd = barcode.indexOf('\n');
                var metaData = barcode.substring(0, metaEnd).split('/');
                var codeId = parseInt(metaData[0]);
                this.totalCodes = parseInt(metaData[1]);
                if (codeId > 0 && this.totalCodes > 0) {
                    this.qrData[codeId - 1] = barcode.substring(metaEnd + 1);
                    if (this.codesReceived.indexOf(codeId) === -1) {
                        this.codesReceived.push(codeId);
                    }
                    this.cleanupTimers();
                    this._stopScanning();
                    if (this.codesReceived.length === this.totalCodes) {
                        this.wifiConfig = this._parseQRData(this.qrData);
                        this._connecting();
                    }
                    else {
                        this._moreInstructions();
                    }
                    return;
                }
                else if (!this.easterEggActive) {
                    this.easterEggActive = true;
                    jibo.embodied.speech.speak(`<ssa name='SSA_0172'/>`).then(() => { this.easterEggActive = false; });
                }
            }
            setTimeout(this._readQR.bind(this), 100);
        });
    }
    _getNextQRCodeNumber() {
        for (let i = 1; i <= this.totalCodes; i++) {
            if (this.codesReceived.indexOf(i) === -1) {
                return i;
            }
        }
    }
    _stopScanning() {
        this.scanning = false;
        jibo.media.setViewfinder({
            enable: false
        }, (error) => {
            if (error) {
                this.log.error('setViewfinder disable error: ', error);
            }
        });
    }
    _parseQRData(data) {
        let barcode = '';
        for (var i = 0; i < data.length; i++) {
            barcode += data[i];
        }
        function xorString(str, key) {
            var result = '';
            for (var i = 0; i < str.length; i++) {
                result += String.fromCharCode(key.charCodeAt(i % key.length) ^ str.charCodeAt(i));
            }
            return result;
        }
        let aKey = 'Wow, you cracked our secret code. Impressive. Maybe you should check out jibo.com/jobs.';
        barcode = xorString(barcode, aKey);
        let barcodeData = barcode.split('\n');
        this._accessToken = barcodeData.pop();
        let [_ssid, _password, _staticIP, _netmask, _gateway, _dns1, _dns2] = barcodeData;
        let _staticSettings = null;
        if (_staticIP) {
            _staticSettings = {
                staticIP: _staticIP,
                gateway: _gateway,
                netmask: _netmask,
                dns1: (_dns1 ? _dns1 : '8.8.8.8'),
                dns2: (_dns2 ? _dns2 : '8.8.4.4')
            };
        }
        let wifiConfig = {
            ssid: _ssid,
            pswd: _password,
            security: ((_password && _password.length > 0) ? 'WPA-PSK' : 'NONE'),
            hidden: 0,
            networkType: (_staticSettings ? 1 : 0),
            staticSettings: _staticSettings
        };
        return wifiConfig;
    }
    _connecting() {
        this.skill.ignoreGlobalStops(true);
        this.currentView = jibo.face.views.createView('View', 'assets/wifi/views/connecting.json', true, null, jibo.face.views.NONE, jibo.face.views.NONE);
        this.currentView.on(jibo.face.views.LOADED, () => {
            this.currentView.connecting = this.currentView.getComponentById('connecting').movieClip;
            this.currentView.connecting.ssid.ssid.text = this.wifiConfig.ssid;
            let labels = this.currentView.connecting.labels;
            for (let i = 0; i < labels.length; ++i) {
                let label = labels[i].label;
                if (label.indexOf('playAudio-') === 0) {
                    let alias = label.split('-')[1];
                    this.currentView.connecting.addAction(() => {
                        jibo.sound.play(alias);
                    }, labels[i].position);
                }
            }
        });
        this.currentView.on(jibo.face.views.OPENED, () => {
            animate.Animator.play(this.currentView.connecting, 'QRScan', () => {
                let commenceTheNetworking = () => {
                    this.wifiError = null;
                    jibo.wifi.addNetwork(this.wifiConfig, 30, this._doneConnecting.bind(this));
                };
                jibo.wifi.getSavedNetworks((err, data) => {
                    let alreadyExists = false;
                    for (let net of data) {
                        if (net.ssid === this.wifiConfig.ssid) {
                            this.log.debug('removing network before adding because new SSID matches old SSID');
                            jibo.wifi.removeNetwork(net.ssid, (err) => {
                                if (err) {
                                    this.log.error('couldnt remove old network with same SSID as new network. ', err);
                                }
                                this.newNetworkAdded = false;
                                commenceTheNetworking();
                            });
                            alreadyExists = true;
                            break;
                        }
                    }
                    if (!alreadyExists) {
                        this.newNetworkAdded = true;
                        commenceTheNetworking();
                    }
                });
                animate.Animator.play(this.currentView.connecting, 'wifiSearch', () => {
                    if (this.currentView.connecting) {
                        animate.Animator.play(this.currentView.connecting, 'wifiSearchLoop');
                    }
                });
            });
        });
    }
    _doneConnecting(error) {
        if (error) {
            this.wifiError = error;
            this.log.warn('Failed to connect to new network. ', error);
            this._connectionFailed();
        }
        else {
            this.log.info('Successfully connected to new network');
            this._connectionSuccess();
        }
    }
    _connectionSuccess(afterError) {
        WiFi.notifyServer(this.wifiConfig.ssid, this.log, this._accessToken);
        this.analytics.wifiSuccess(this.totalCodes);
        jibo.wifi.getSavedNetworks((err, networks) => {
            this.previousNetwork = networks.filter((net) => { return net.current === true; })[0].ssid;
            if (!afterError && this.currentView.connecting) {
                animate.Animator.play(this.currentView.connecting, 'wifiConnected', this._closeAllToWiFiMenu.bind(this));
            }
            else {
                if (!afterError) {
                    this.log.warn('WiFi connection succeeded, but animation not present. Returning to WiFi submenu');
                }
                this._closeAllToWiFiMenu();
            }
        });
    }
    _connectionFailed() {
        let message = null;
        let errorMessages = require('../assets/wifi/errorText.json');
        if (!this.wifiError || !this.wifiError.code) {
            this.wifiError = message = errorMessages.WIFIXa;
        }
        else {
            message = errorMessages[`WIFI${this.wifiError.code}a`];
            message = message || errorMessages.WIFIXa;
        }
        let keepChecking = () => {
            jibo.wifi.verifyConnection((error) => {
                if (!this.wifiError) {
                    return;
                }
                if (error) {
                    setTimeout(keepChecking, 500);
                }
                else {
                    let oldError = this.wifiError;
                    this.wifiError = null;
                    jibo.wifi.getCurrentNetwork((err, currentNetwork) => {
                        if (err || !currentNetwork || currentNetwork.ssid === undefined) {
                            this.wifiError = oldError;
                            setTimeout(keepChecking, 500);
                        }
                        else {
                            if (currentNetwork.ssid === this.wifiConfig.ssid) {
                                this.log.info('successfully connected to new network from error screen after failure');
                                this._connectionSuccess(true);
                            }
                            else {
                                this.log.info('Reconnected to old network from error screen after failure');
                                this.wifiError = oldError;
                            }
                        }
                    });
                }
            });
        };
        this.currentView = jibo.face.views.createView('View', 'assets/wifi/views/error.json');
        jibo.face.views.changeView({ addView: this.currentView }, keepChecking, null, () => {
            jibo.sound.play('error');
            this.currentView.setupScreenClick();
            let eventName = 'somethingHappened';
            this.currentView.addAction('event', {
                event: eventName
            });
            this.currentView.on(eventName, () => {
                if (!this.wifiError) {
                    return;
                }
                this.analytics.wifiFailure(`${this.wifiError.code}`);
                jibo.wifi.getSavedNetworks((err, networks) => {
                    if (this.wifiConfig.ssid === this.previousNetwork) {
                        this._closeAllToWiFiMenu();
                    }
                    else {
                        if (this.newNetworkAdded) {
                            jibo.wifi.removeNetwork(this.wifiConfig.ssid, () => {
                                this._connectingToSaved(this.previousNetwork);
                                this.newNetworkAdded = false;
                            });
                        }
                        else {
                            this._connectingToSaved(this.previousNetwork);
                        }
                    }
                });
            });
            this.currentView.getComponentById('header').text = message.header;
            this.currentView.getComponentById('message').text = message.message;
            this.currentView.getComponentById('code').text = message.code;
        });
    }
    _closeAllToWiFiMenu() {
        jibo.face.views.changeView({
            removeTo: 'wifiMenu'
        }, null, null, (view) => {
            this._initWiFiMenu(view);
        });
    }
    _closeAllToYourNetworksMenu() {
        if (!this.closing) {
            this.closing = true;
            jibo.face.views.changeView({
                removeTo: 'yournetworks'
            }, null, null, (view) => {
                this.closing = false;
                this._showYourNetworks(view);
            });
        }
    }
    cleanupTimers() {
        if (this.interval !== null) {
            clearTimeout(this.interval);
            this._shouldUpdateWifiStatus = false;
            this.interval = null;
        }
        if (this.updater !== null) {
            clearInterval(this.updater);
            this.updater = null;
        }
        if (this.timeout) {
            this.timeout.destroy();
            this.timeout = null;
        }
    }
    destroy() {
        this.cleanupTimers();
        this.skill = null;
        this.assetPack = null;
        this.wifiError = null;
        this.currentView = null;
        this._accessToken = null;
        if (this.mim) {
            this.mim.stop();
            this.mim.destroy();
            this.mim = null;
        }
        if (this.scanning) {
            this._stopScanning();
        }
    }
}
exports.default = WiFi;

},{"../assets/wifi/errorText.json":2,"./utils/TouchyTimeout":22,"@jibo/jibo-server-client":undefined,"jibo":undefined,"pixi-animate":undefined}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Analytics {
    constructor(skill) {
        this.skill = skill;
    }
    wifiSuccess(numQRCodes) {
        this.skill.track('WIFI Success', { QR_codes: numQRCodes });
    }
    wifiFailure(reason) {
        this.skill.track('WIFI Failure', { reason });
    }
    batteryQuery() {
        this.skill.track('Battery query');
    }
    volumeOpened(fromMenu) {
        this.skill.track('Volume Opened', { launch_type: fromMenu ? 'menu' : 'speech' });
    }
    volumeChanged(viaTouch) {
        this.skill.track('Volume Changed', { control_type: viaTouch ? 'touch' : 'speech' });
    }
    wipeConfirmed() {
        this.skill.track('Wipe Confirmed');
    }
    errorEntered(error_code, last_skill) {
        this.skill.track('Error Skill Entered', { error_code, last_skill });
    }
}
exports.default = Analytics;

},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const be_framework_1 = require("@be/be-framework");
class PowerAnalytics {
    static init() {
        this.shutdownModality = 'hardware';
        jibo.system.events.pluggedIn.on(this.onPluggedIn);
        jibo.system.events.unplugged.on(this.onUnplugged);
    }
    static shutdownViaMenu() {
        this.shutdownModality = 'menu';
    }
    static shutdown() {
        be_framework_1.BeSkill.plugins.analytics.skillEvent('Shutdown', { modality: this.shutdownModality });
    }
    static lowBatteryError() {
        be_framework_1.BeSkill.plugins.analytics.skillEvent('Battery Low');
    }
    static onUnplugged() {
        be_framework_1.BeSkill.plugins.analytics.skillEvent('Unplugged');
    }
    static onPluggedIn() {
        be_framework_1.BeSkill.plugins.analytics.skillEvent('Plugged In');
    }
}
exports.default = PowerAnalytics;

},{"@be/be-framework":undefined,"jibo":undefined}],9:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'Updates',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/settings/src/flows/Updates.flow'
        },
        '022ddc02-7607-4a87-80eb-b7bdf0ef3eef': function () {
            return {
                'id': '022ddc02-7607-4a87-80eb-b7bdf0ef3eef',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '022ddc02-7607-4a87-80eb-b7bdf0ef3eef',
                        'to': '0fa44104-8a14-4d20-9f75-6a150af096db',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Begin',
                'options': {
                    'inputParameters': () => {
                        return { log: null };
                    }
                }
            };
        },
        'b1f1c271-ae7e-4f3e-b38e-e668c0919241': function () {
            return {
                'id': 'b1f1c271-ae7e-4f3e-b38e-e668c0919241',
                'name': 'wait for update check',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'b1f1c271-ae7e-4f3e-b38e-e668c0919241',
                        'to': '301f851c-653e-43dd-9cf4-93df8e42662f',
                        'value': 'downloading'
                    },
                    {
                        'frm': 'b1f1c271-ae7e-4f3e-b38e-e668c0919241',
                        'to': 'f7358016-8dcd-4005-b241-7ee2a4fbc263',
                        'value': 'none'
                    },
                    {
                        'frm': 'b1f1c271-ae7e-4f3e-b38e-e668c0919241',
                        'to': 'f0be890c-b11c-4b18-a510-6b11612bb18a',
                        'value': 'updates'
                    },
                    {
                        'frm': 'b1f1c271-ae7e-4f3e-b38e-e668c0919241',
                        'to': '2f713e25-adbe-449f-a545-6f98cda999d9',
                        'value': 'down'
                    },
                    {
                        'frm': 'b1f1c271-ae7e-4f3e-b38e-e668c0919241',
                        'to': 'c75157cb-a3ea-4759-aa9b-e5e6f288ddf6',
                        'value': 'backup'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        if (!notepad.updateStatus) {
                            notepad.weGoodHere = () => {
                                if (notepad.updateStatus) {
                                    jibo.timer.removeListener('update', notepad.weGoodHere);
                                    notepad.weGoodHere = null;
                                    jibo.face.views.changeView({
                                        remove: true,
                                        transitionClose: jibo.face.views.OUT
                                    }, () => {
                                        done(notepad.updateStatus);
                                    });
                                }
                            };
                            jibo.timer.on('update', notepad.weGoodHere);
                        } else {
                            jibo.face.views.changeView({
                                remove: true,
                                transitionClose: jibo.face.views.OUT
                            }, () => {
                                done(notepad.updateStatus);
                            });
                        }
                    },
                    'onStop': () => {
                        if (notepad.weGoodHere) {
                            jibo.timer.removeListener('update', notepad.weGoodHere);
                            notepad.weGoodHere = null;
                        }
                        if (jibo.face.views.currentView && jibo.face.views.currentView.id != 'eyeView') {
                            return new Promise(resolve => {
                                jibo.face.views.changeView({
                                    remove: true,
                                    transitionClose: jibo.face.views.OUT
                                }, resolve, resolve);
                            });
                        }
                    }
                }
            };
        },
        '7b822885-ee4b-4327-a1cb-54a906adad7b': function () {
            return {
                'id': '7b822885-ee4b-4327-a1cb-54a906adad7b',
                'name': 'Already Downloading',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '7b822885-ee4b-4327-a1cb-54a906adad7b',
                        'to': '77dd34dd-bd14-4d8d-a162-ca6dab2a2a33',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/ota/AlreadyDownloading.mim',
                    'getPromptData': () => {
                        return { percent: notepad.downloadPercent };
                    }
                }
            };
        },
        'f7358016-8dcd-4005-b241-7ee2a4fbc263': function () {
            return {
                'id': 'f7358016-8dcd-4005-b241-7ee2a4fbc263',
                'name': 'No Updates',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'f7358016-8dcd-4005-b241-7ee2a4fbc263',
                        'to': '77dd34dd-bd14-4d8d-a162-ca6dab2a2a33',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/ota/NoUpdates.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'f0be890c-b11c-4b18-a510-6b11612bb18a': function () {
            return {
                'id': 'f0be890c-b11c-4b18-a510-6b11612bb18a',
                'name': 'Want To Update Now',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'f0be890c-b11c-4b18-a510-6b11612bb18a',
                        'to': '61a4168c-bd59-47a1-8074-79193d674d4a',
                        'value': 'yes'
                    },
                    {
                        'frm': 'f0be890c-b11c-4b18-a510-6b11612bb18a',
                        'to': 'fd527ddc-5b87-4ea3-892c-b0fbbbd6971b',
                        'value': 'no'
                    },
                    {
                        'frm': 'f0be890c-b11c-4b18-a510-6b11612bb18a',
                        'to': 'eba01620-9132-4e71-ba20-fb7aa9c9ba10',
                        'value': ''
                    }
                ],
                'exceptions': [{
                        'frm': 'f0be890c-b11c-4b18-a510-6b11612bb18a',
                        'to': 'eba01620-9132-4e71-ba20-fb7aa9c9ba10',
                        'value': '~'
                    }],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/ota/WantToUpdateNow.mim',
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
                        let transition = 'no';
                        if (asrResults.intent) {
                            transition = asrResults.intent;
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
        '77dd34dd-bd14-4d8d-a162-ca6dab2a2a33': function () {
            return {
                'id': '77dd34dd-bd14-4d8d-a162-ca6dab2a2a33',
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
        '61a4168c-bd59-47a1-8074-79193d674d4a': function () {
            return {
                'id': '61a4168c-bd59-47a1-8074-79193d674d4a',
                'name': 'Okay Install Now',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '61a4168c-bd59-47a1-8074-79193d674d4a',
                        'to': 'fc88b759-4107-424c-8476-4cbb42e58e92',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/ota/OkayInstallNow.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'fd527ddc-5b87-4ea3-892c-b0fbbbd6971b': function () {
            return {
                'id': 'fd527ddc-5b87-4ea3-892c-b0fbbbd6971b',
                'name': 'Okay Install Later',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'fd527ddc-5b87-4ea3-892c-b0fbbbd6971b',
                        'to': '77dd34dd-bd14-4d8d-a162-ca6dab2a2a33',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/ota/OkayInstallLater.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'eba01620-9132-4e71-ba20-fb7aa9c9ba10': function () {
            return {
                'id': 'eba01620-9132-4e71-ba20-fb7aa9c9ba10',
                'name': 'Okay But Install Later',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'eba01620-9132-4e71-ba20-fb7aa9c9ba10',
                        'to': '77dd34dd-bd14-4d8d-a162-ca6dab2a2a33',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/ota/OkayButInstallLater.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'fc88b759-4107-424c-8476-4cbb42e58e92': function () {
            return {
                'id': 'fc88b759-4107-424c-8476-4cbb42e58e92',
                'name': 'start OTA',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'fc88b759-4107-424c-8476-4cbb42e58e92',
                        'to': '77dd34dd-bd14-4d8d-a162-ca6dab2a2a33',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.scheduler.otaDownloadAndInstall(err => {
                            if (err) {
                                notepad.params.log.error('Manual OTA Update failed: ', err);
                            }
                            done();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '5fd8eb45-5a66-40c2-b236-c9358aacc540': function () {
            return {
                'id': '5fd8eb45-5a66-40c2-b236-c9358aacc540',
                'name': 'Okay Check For Updates',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '5fd8eb45-5a66-40c2-b236-c9358aacc540',
                        'to': '3ecc86d9-3d7d-4130-82d2-0ca2be0250d5',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/ota/OkayCheckForUpdates.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '301f851c-653e-43dd-9cf4-93df8e42662f': function () {
            return {
                'id': '301f851c-653e-43dd-9cf4-93df8e42662f',
                'name': 'calculate percent complete',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '301f851c-653e-43dd-9cf4-93df8e42662f',
                        'to': '7b822885-ee4b-4327-a1cb-54a906adad7b',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        let total = 0;
                        let progress = 0;
                        for (let update of notepad.downloadStatus.updates) {
                            total += update.length;
                            if (update.downloaded) {
                                progress += update.length;
                            }
                        }
                        if (notepad.downloadStatus.status && notepad.downloadStatus.status.received) {
                            progress += notepad.downloadStatus.status.received;
                        }
                        let percent = progress / total;
                        notepad.downloadPercent = parseInt(percent * 1000) / 10;
                        return '';
                    }
                }
            };
        },
        '2f713e25-adbe-449f-a545-6f98cda999d9': function () {
            return {
                'id': '2f713e25-adbe-449f-a545-6f98cda999d9',
                'name': 'Update Service Unavailable',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '2f713e25-adbe-449f-a545-6f98cda999d9',
                        'to': '77dd34dd-bd14-4d8d-a162-ca6dab2a2a33',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/ota/UpdateServiceUnavailable.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '0fa44104-8a14-4d20-9f75-6a150af096db': function () {
            return {
                'id': '0fa44104-8a14-4d20-9f75-6a150af096db',
                'name': 'start update check',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '0fa44104-8a14-4d20-9f75-6a150af096db',
                        'to': '5fd8eb45-5a66-40c2-b236-c9358aacc540',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        notepad.updateStatus = false;
                        console.log('checkin 4 updates');
                        jibo.scheduler.backupStatus((err, backingUp) => {
                            if (err) {
                                notepad.params.log.error('error getting backup status ', err);
                            }
                            if (backingUp) {
                                notepad.updateStatus = 'backup';
                            } else {
                                jibo.scheduler.otaDownloadStatus((err, status) => {
                                    if (err) {
                                        notepad.params.log.error('error getting download status ', err);
                                    }
                                    if (!status) {
                                        jibo.scheduler.otaCheckUpdates((err, updateList) => {
                                            console.log('updates check returned. err?', err, ' list?', updateList);
                                            if (err) {
                                                notepad.updateStatus = 'down';
                                            } else if (updateList && updateList.length) {
                                                notepad.kbm = jibo.kb.createModel('/ota');
                                                notepad.kbm.loadRoot((err, root) => {
                                                    if (err) {
                                                        notepad.params.log.error('couldnt load OTA KB ', err);
                                                    }
                                                    root.data.updatesAvailable = true;
                                                    root.data.lastUpdateNotification = Date.now();
                                                    root.save(err => {
                                                        if (err) {
                                                            notepad.params.log.error('couldnt save OTA available status ', err);
                                                        }
                                                        notepad.updateStatus = 'updates';
                                                    });
                                                });
                                            } else {
                                                notepad.updateStatus = 'none';
                                            }
                                        });
                                    } else {
                                        console.log('download status recieved.', status);
                                        notepad.downloadStatus = status;
                                        notepad.updateStatus = 'downloading';
                                    }
                                });
                            }
                        });
                    }
                }
            };
        },
        '3ecc86d9-3d7d-4130-82d2-0ca2be0250d5': function () {
            return {
                'id': '3ecc86d9-3d7d-4130-82d2-0ca2be0250d5',
                'name': 'start animation',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '3ecc86d9-3d7d-4130-82d2-0ca2be0250d5',
                        'to': 'b1f1c271-ae7e-4f3e-b38e-e668c0919241',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        jibo.face.views.changeView({
                            addView: 'assets/updates/ThinkingView.json',
                            transitionOpen: jibo.face.views.IN
                        }, () => {
                            done();
                        }, () => {
                            notepad.params.log.warn('Thinking View failed to load');
                            done();
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'c75157cb-a3ea-4759-aa9b-e5e6f288ddf6': function () {
            return {
                'id': 'c75157cb-a3ea-4759-aa9b-e5e6f288ddf6',
                'name': 'Already Backing Up',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'c75157cb-a3ea-4759-aa9b-e5e6f288ddf6',
                        'to': '77dd34dd-bd14-4d8d-a162-ca6dab2a2a33',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/ota/AlreadyBackingUp.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        }
    };
};
},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Settings_1 = require("./Settings");
module.exports = Settings_1.default;

},{"./Settings":5}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const SubSkill_1 = require("./SubSkill");
const AboutPage_1 = require("../AboutPage");
exports.AboutPage = AboutPage_1.default;
const TouchyTimeout_1 = require("../utils/TouchyTimeout");
const TIMEOUT_TIME = 120000;
class AboutSkill extends SubSkill_1.default {
    constructor(skill, intent, onClose) {
        super(skill, intent, onClose);
        this.view = AboutPage_1.default.about(null, this.log);
        this.view.once(jibo.face.views.CLOSED, this.destroyThenClose);
        this.timeout = new TouchyTimeout_1.default(() => {
            this.stopAndDestroy(this.onClose);
        }, TIMEOUT_TIME);
    }
    stopAndDestroy(done) {
        if (this.timeout) {
            this.timeout.destroy();
            this.timeout = null;
        }
        this.view.removeListener(jibo.face.views.CLOSED, this.destroyThenClose);
        jibo.face.views.changeView({ removeAll: true, leaveEmpty: true }, () => {
            this.destroy();
            done();
        }, () => {
            this.destroy();
            done('about view close failed');
        });
    }
    destroy() {
        if (this.timeout) {
            this.timeout.destroy();
            this.timeout = null;
        }
        this.view = null;
        super.destroy();
    }
}
exports.default = AboutSkill;

},{"../AboutPage":3,"../utils/TouchyTimeout":22,"./SubSkill":17,"jibo":undefined}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const SubSkill_1 = require("./SubSkill");
const BatteryView_1 = require("../views/BatteryView");
class BatterySkill extends SubSkill_1.default {
    constructor(skill, intent, onClose) {
        super(skill, intent, onClose);
        this.skill._analytics.batteryQuery();
        jibo.face.views.creator.registerClass(BatteryView_1.default, 'BatteryView');
        this.view = jibo.face.views.createView('BatteryView', 'assets/battery/batteryView.json', false);
        this.view.assetPack = this.assetPack;
        this.view.once(jibo.face.views.CLOSED, this.destroyThenClose);
        jibo.face.views.changeView({
            addView: this.view
        });
    }
    stopAndDestroy(done) {
        this.view.removeListener(jibo.face.views.CLOSED, this.destroyThenClose);
        jibo.face.views.changeView({ removeAll: true, leaveEmpty: true }, () => {
            this.destroy();
            done();
        }, () => {
            this.destroy();
            done('battery view close failed');
        });
    }
    destroy() {
        jibo.face.views.creator.unregisterClass('BatteryView');
        this.view = null;
        super.destroy();
    }
}
exports.default = BatterySkill;

},{"../views/BatteryView":23,"./SubSkill":17,"jibo":undefined}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const SubSkill_1 = require("./SubSkill");
const ErrorDisplay_1 = require("../ErrorDisplay");
class ErrorSkill extends SubSkill_1.default {
    constructor(skill, intent, onClose) {
        super(skill, intent, onClose);
        this.hjHandle = jibo.jetstream.setHotwordMode(jibo.jetstream.types.HotwordListenMode.Disabled);
        this.hjHandle.activated.catch((err) => {
            this.log.warn('GL pause failure ', err);
        });
        this.errorDisplay = new ErrorDisplay_1.default(this.skill, this.log);
        this.errorDisplay.doError(this.skill.currentErrorCode);
        this.skill._analytics.errorEntered(this.skill.currentErrorCode, this.skill.previousSkillName);
    }
    stopAndDestroy(done) {
        this.destroy();
        if (this.hjHandle) {
            this.hjHandle.release().catch((err) => {
                this.log.error('GL failed to resume', err);
            });
            this.hjHandle = null;
        }
        jibo.face.views.changeView({ removeAll: true, leaveEmpty: true }, () => {
            done();
        }, () => {
            done('error view close failed');
        });
    }
    destroy() {
        this.errorDisplay.destroy();
        this.errorDisplay = null;
        super.destroy();
    }
}
exports.default = ErrorSkill;

},{"../ErrorDisplay":4,"./SubSkill":17,"jibo":undefined}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const SubSkill_1 = require("./SubSkill");
const ActionData = jibo.rendering.gui.actions.ActionData;
class MenuSkill extends SubSkill_1.default {
    constructor(skill, intent, onClose) {
        super(skill, intent, onClose);
        this.update = this.update.bind(this);
        let viewIsActive = false;
        if (jibo.face.views.currentView && jibo.face.views.currentView.id == 'settingsMenu') {
            this.view = jibo.face.views.currentView;
            viewIsActive = true;
        }
        else {
            this.view = jibo.face.views.createView('MenuView', 'assets/menu/menu.json');
        }
        this.view.swipeDownActions = [
            new ActionData(ActionData.EVENT, {
                event: jibo.face.views.View.BACK
            }),
            new ActionData(ActionData.MIM_END),
            new ActionData(ActionData.CLOSE_VIEW)
        ];
        this.mimResult = null;
        this.shouldExit = false;
        this.view.once('closed', this.destroyThenClose);
        this.view.once('press', (event) => {
            this.view.removeListener('closed', this.destroyThenClose);
            this.onButtonPress(event);
            this.menuMim.stop();
            jibo.timer.off('update', this.update);
        });
        this.view.once('closed', () => {
            if (this.menuMim) {
                this.menuMim.stop();
                this.menuMim.destroy();
                jibo.timer.off('update', this.update);
                this.menuMim = null;
            }
        });
        const promptData = {};
        this.menuMim = new jibo.bt.behaviors.Mim({
            mimPath: 'mims/en-us/SettingsMenuNav.mim',
            assetPack: this.assetPack,
            onSuccess: (results) => {
                if (results.state.lastResultState === 'match') {
                    this.mimResult = results.asrResults;
                }
                else {
                    this.shouldExit = true;
                }
            },
            getPromptData: () => {
                return promptData;
            }
        });
        jibo.timer.on('update', this.update);
        if (!viewIsActive) {
            jibo.face.views.changeView({
                addView: this.view
            }, null, null, () => {
                if (this.menuMim) {
                    this.menuMim.start();
                }
            });
        }
        else {
            if (this.menuMim) {
                this.menuMim.start();
            }
        }
    }
    onButtonPress(event) {
        this.log.info(`SubSkill ${event.intent} selected via button-press.`);
        this.skill.redirect('@be/settings', { nlu: { intent: event.intent }, fromTouch: true });
    }
    update(elapsed) {
        if (this.menuMim.update(elapsed) == jibo.bt.Status.SUCCEEDED) {
            jibo.timer.off('update', this.update);
            if (this.shouldExit) {
                jibo.face.views.changeView({ remove: true });
            }
            else if (this.mimResult) {
                this.view.removeListener('closed', this.destroyThenClose);
                this.log.info(`SubSkill ${this.mimResult.intent} selected via voice.`);
                this.skill.redirect('@be/settings', { nlu: { intent: this.mimResult.intent } });
            }
        }
    }
    stopAndDestroy(done) {
        this.destroy();
        jibo.face.views.changeView({ removeAll: true, leaveEmpty: true }, () => {
            done();
        }, () => {
            done('menu view close failed');
        });
    }
    cleanup() {
        this.destroy();
    }
    destroy() {
        this.view.removeListener(jibo.face.views.CLOSED, this.destroyThenClose);
        this.menuMim.stop();
        this.menuMim.destroy();
        jibo.timer.off('update', this.update);
        this.menuMim = null;
        this.view = null;
        super.destroy();
    }
}
exports.default = MenuSkill;

},{"./SubSkill":17,"jibo":undefined}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const SubSkill_1 = require("./SubSkill");
const PowerAnalytics_1 = require("../analytics/PowerAnalytics");
class ShutdownAnimationSkill extends SubSkill_1.default {
    constructor(skill, intent, onClose) {
        super(skill, intent, onClose);
        PowerAnalytics_1.default.shutdown();
        jibo.analytics.flush();
        jibo.expression.setAttentionMode(jibo.expression.AttentionMode.OFF);
        jibo.expression.doCenterRobotOnDisconnect(false);
        this.playAnimation = this.playAnimation.bind(this);
        jibo.face.views.forceEyeView(this.playAnimation, null, null, null, this.playAnimation);
    }
    playAnimation() {
        jibo.embodied.speech.speak(`<anim cat='system-states' filter='shutdown' />.`);
    }
}
exports.default = ShutdownAnimationSkill;

},{"../analytics/PowerAnalytics":8,"./SubSkill":17,"jibo":undefined}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const SubSkill_1 = require("./SubSkill");
const PowerAnalytics_1 = require("../analytics/PowerAnalytics");
const ActionData = jibo.rendering.gui.actions.ActionData;
class ShutdownSkill extends SubSkill_1.default {
    constructor(skill, intent, onClose) {
        super(skill, intent, onClose);
        this.update = this.update.bind(this);
        this.shouldShutDown = false;
        this.shouldExit = false;
        let menuConfig = {
            getConfig: (cb) => {
                cb(require('../../assets/shutdown/shutdown.json'));
            },
            onMenuClosed: (timedOut) => {
                if (timedOut) {
                    this.shouldExit = true;
                }
                return true;
            },
            onItemChosen: (result) => {
                if (result && result.intent) {
                    if (result.intent == 'yes') {
                        this.shouldShutDown = true;
                        this.log.info('User initiated shutdown');
                    }
                    else {
                        this.log.info('User rejected shutdown');
                    }
                }
            },
            assetPack: this.assetPack
        };
        this.shutdown = new jibo.bt.behaviors.Menu(menuConfig);
        jibo.timer.on('update', this.update);
        this.shutdown.start();
    }
    update(elapsed) {
        if (this.shutdown.update(elapsed) == jibo.bt.Status.SUCCEEDED) {
            jibo.timer.off('update', this.update);
            if (this.shouldShutDown) {
                PowerAnalytics_1.default.shutdownViaMenu();
                jibo.face.views.changeView({ removeAll: true, leaveEmpty: true });
                jibo.systemManager.poweroff((err) => {
                    if (err) {
                        this.log.error('failed to shutdown from settings button. ', err);
                    }
                });
            }
            else if (this.shouldExit) {
                this.stopAndDestroy(this.skill.exit.bind(this.skill));
            }
            else {
                jibo.face.views.changeView({ remove: true }, () => {
                    this.destroyThenClose();
                }, () => {
                    this.destroyThenClose();
                });
            }
        }
    }
    stopAndDestroy(done) {
        jibo.timer.off('update', this.update);
        this.shutdown.stop();
        this.destroy();
        jibo.face.views.changeView({ removeAll: true, leaveEmpty: true }, () => {
            done();
        }, null, () => {
            done('shutdown view close failed');
        });
    }
    destroy() {
        this.shutdown.destroy();
        this.shutdown = null;
        super.destroy();
    }
}
exports.default = ShutdownSkill;

},{"../../assets/shutdown/shutdown.json":1,"../analytics/PowerAnalytics":8,"./SubSkill":17,"jibo":undefined}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SubSkill {
    constructor(skill, intent, onClose, fromTouch) {
        this.skill = skill;
        this.assetPack = this.skill.assetPack;
        this.log = this.skill.log.createChild(intent);
        this.log.info('SubSkill Launched');
        this.intent = intent;
        this.onClose = onClose;
        this.destroyThenClose = this.destroyThenClose.bind(this);
    }
    stopAndDestroy(done) {
        this.log.warn(`you probably want to override stopAndDestroy() in the ${this.intent} SubSkill`);
        this.destroy();
        done();
    }
    destroyThenClose() {
        this.log.info('SubSkill died of natural causes');
        let onClose = this.onClose;
        this.destroy();
        onClose();
    }
    destroy() {
        this.assetPack = null;
        this.intent = null;
        this.onClose = null;
        this.skill = null;
    }
}
exports.default = SubSkill;

},{}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const SubSkill_1 = require("./SubSkill");
class UpdatesSkill extends SubSkill_1.default {
    constructor(skill, intent, onClose) {
        super(skill, intent, onClose);
        if (jibo.face.views.currentView && jibo.face.views.currentView.id == 'eyeView') {
            this.startFlow();
        }
        else {
            jibo.face.views.createView('EyeView', null, true, () => { this.startFlow(); });
        }
    }
    startFlow() {
        this.flow = jibo.flow.run(require('../flows/Updates'), {
            enableLogging: true,
            params: {
                log: this.log
            },
            assetPack: this.assetPack
        }, (err, status) => {
            if (status != jibo.bt.Status.INTERRUPTED) {
                jibo.face.views.changeView({
                    remove: true
                }, () => {
                    this.destroyThenClose();
                }, () => {
                    this.destroyThenClose();
                });
            }
            ;
        });
    }
    stopAndDestroy(done) {
        this.flow.stopAndDestroy().then(() => {
            this.destroy();
            if (jibo.face.views.currentView && jibo.face.views.currentView.id != 'eyeView') {
                jibo.face.views.changeView({
                    removeAll: true,
                    leaveEmpty: true
                }, () => {
                    done();
                }, () => {
                    done();
                });
            }
            else {
                jibo.face.views.forceEyeView(() => { done(); }, null, null, null, () => { done(); });
            }
        });
    }
    destroy() {
        this.flow.destroy();
        this.flow = null;
        super.destroy();
    }
}
exports.default = UpdatesSkill;

},{"../flows/Updates":9,"./SubSkill":17,"jibo":undefined}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const SubSkill_1 = require("./SubSkill");
const VolumeView_1 = require("../views/VolumeView");
class VolumeSkill extends SubSkill_1.default {
    constructor(skill, intent, onClose, fromTouch) {
        super(skill, intent, onClose);
        this.skill._analytics.volumeOpened(fromTouch);
        jibo.face.views.creator.registerClass(VolumeView_1.default, 'VolumeView');
        this.view = jibo.face.views.createView('VolumeView', 'assets/volume/volumeView.json', false);
        this.view.assetPack = this.assetPack;
        this.view.analytics = this.skill._analytics;
        this.view.once(jibo.face.views.CLOSED, this.destroyThenClose);
        jibo.face.views.changeView({
            addView: this.view
        });
    }
    stopAndDestroy(done) {
        this.view.removeListener(jibo.face.views.CLOSED, this.destroyThenClose);
        jibo.face.views.changeView({ removeAll: true, leaveEmpty: true }, () => {
            this.destroy();
            done();
        }, () => {
            this.destroy();
            done('volume view close failed');
        });
    }
    destroy() {
        jibo.face.views.creator.unregisterClass('VolumeView');
        this.view = null;
        super.destroy();
    }
}
exports.default = VolumeSkill;

},{"../views/VolumeView":24,"./SubSkill":17,"jibo":undefined}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const SubSkill_1 = require("./SubSkill");
const WiFi_1 = require("../WiFi");
class WifiSkill extends SubSkill_1.default {
    constructor(skill, intent, onClose, fromTouch, fromError) {
        super(skill, intent, onClose);
        this.wifi = new WiFi_1.default(this.skill, this.log, fromError || false);
        this.wifi.analytics = this.skill._analytics;
        this.wifi.showWiFiMenu(() => {
            this.destroyThenClose();
        });
    }
    stopAndDestroy(done) {
        this.destroy();
        jibo.face.views.changeView({ removeAll: true, leaveEmpty: true }, () => {
            done();
        }, () => {
            done('wifi view close failed');
        });
    }
    destroy() {
        this.wifi.destroy();
        this.wifi = null;
        super.destroy();
    }
}
exports.default = WifiSkill;

},{"../WiFi":6,"./SubSkill":17,"jibo":undefined}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const SubSkill_1 = require("./SubSkill");
const WipeView_1 = require("../views/WipeView");
class WipeSkill extends SubSkill_1.default {
    constructor(skill, intent, onClose, fromTouch, force = false) {
        super(skill, intent, onClose);
        this.hasKeyBackup = null;
        this.forceWithoutWifi = force;
        this.keyBackupPromise = null;
        this.hasWifi = true;
        jibo.face.views.creator.registerClass(WipeView_1.default, 'WipeView');
        this.transitionThenDestroyThenClose = this.transitionThenDestroyThenClose.bind(this);
        this._transitionToDeviceMode();
        this._checkForKeyBackup();
        this._doWipeConfirm1();
    }
    _transitionToDeviceMode() {
        return Promise.resolve()
            .then(() => {
            return jibo.expression.centerRobot();
        })
            .then(() => {
            if (!this.intent) {
                return;
            }
            this.hjHandle = jibo.jetstream.setHotwordMode(jibo.jetstream.types.HotwordListenMode.Disabled);
            return this.hjHandle.activated.catch((err) => {
                this.log.error("Failed to disable GL", err);
            });
        })
            .then(() => {
            if (!this.intent) {
                return;
            }
            return jibo.expression.pushAttentionMode(jibo.expression.AttentionMode.OFF);
        })
            .then((attentionHandler) => {
            if (!this.intent) {
                return;
            }
            this.attentionHandler = attentionHandler;
        });
    }
    _transitionToCharacterMode() {
        return Promise.resolve()
            .then(() => {
            if (this.hjHandle) {
                return this.hjHandle.release().catch((err) => {
                    this.log.error("Failed to enable GL", err);
                });
            }
        })
            .then(() => {
            if (!this.attentionHandler) {
                return true;
            }
            let released = this.attentionHandler.release();
            this.attentionHandler = null;
            return released;
        });
    }
    _checkForKeyBackup() {
        this.keyBackupPromise = new Promise((resolve) => {
            jibo.wifi.verifyConnection((err) => {
                if (err && this.forceWithoutWifi) {
                    this.hasWifi = false;
                    return resolve();
                }
                jibo.kb.loop.hasKeyBackup((err, hasKeyBackup) => {
                    if (hasKeyBackup) {
                        this.hasKeyBackup = true;
                    }
                    else {
                        if (err) {
                            this.log.warn('hasKeyBackup check failed:', err);
                        }
                        this.hasKeyBackup = false;
                    }
                    resolve();
                });
            });
        });
    }
    _doWipeConfirm1() {
        jibo.face.views.changeView({
            addView: 'assets/wipe/wipeConfirm1.json'
        }, (view) => {
            view.on('pressed', (data) => {
                this.log.info('User confirmed Wipe 1');
                this._chooseWipeConfirm2();
            });
        }, null, (view) => {
            this.currentView = view;
            view.once(jibo.face.views.CLOSED, this.transitionThenDestroyThenClose);
        });
    }
    _chooseWipeConfirm2() {
        this.currentView.removeListener(jibo.face.views.CLOSED, this.transitionThenDestroyThenClose);
        if (this.hasKeyBackup === null) {
            jibo.face.views.changeView({
                remove: true,
                addView: 'assets/wipe/pleaseWait.json'
            }, () => { });
        }
        this.keyBackupPromise.then(() => {
            if (this.hasKeyBackup) {
                this._doWipeConfirm2();
            }
            else {
                this._doWipeConfirm2NoPassphrase();
            }
        });
    }
    _doWipeConfirm2() {
        jibo.face.views.changeView({
            remove: true,
            addView: 'assets/wipe/wipeConfirm2.json'
        }, (view) => {
            view.on('pressed', (data) => {
                this.skill._analytics.wipeConfirmed();
                this.log.info('User confirmed Wipe 2');
                view.removeListener(jibo.face.views.CLOSED, this.transitionThenDestroyThenClose);
                this._doWipeView();
            });
        }, null, (view) => {
            this.currentView = view;
            view.once(jibo.face.views.CLOSED, this.transitionThenDestroyThenClose);
        });
    }
    _doWipeConfirm2NoPassphrase() {
        jibo.face.views.changeView({
            remove: true,
            addView: 'assets/wipe/wipeConfirm2NoPassphrase.json'
        }, (view) => {
            view.on('pressed', (data) => {
                this.skill._analytics.wipeConfirmed();
                this.log.info('User confirmed Wipe 2 with no passphrase');
                view.removeListener(jibo.face.views.CLOSED, this.transitionThenDestroyThenClose);
                this._doWipeConfirm3NoPassphrase();
            });
        }, null, (view) => {
            this.currentView = view;
            view.once(jibo.face.views.CLOSED, this.transitionThenDestroyThenClose);
        });
    }
    _doWipeConfirm3NoPassphrase() {
        jibo.face.views.changeView({
            remove: true,
            addView: 'assets/wipe/wipeConfirm3NoPassphrase.json'
        }, (view) => {
            view.on('pressed', (data) => {
                this.skill._analytics.wipeConfirmed();
                this.log.info('User confirmed Wipe 3 with no passphrase');
                view.removeListener(jibo.face.views.CLOSED, this.transitionThenDestroyThenClose);
                this._doWipeView();
            });
        }, null, (view) => {
            this.currentView = view;
            view.once(jibo.face.views.CLOSED, this.transitionThenDestroyThenClose);
        });
    }
    _doWipeView() {
        jibo.face.views.changeView({
            remove: true,
            addView: 'assets/wipe/wipeView.json'
        }, (view) => {
            this.currentView = view;
            view.setLogger(this.log);
            view.on('wipeFail', () => {
                this._doWipeFail();
            });
            view.run(this.forceWithoutWifi && !this.hasWifi);
        }, null, null);
    }
    _doWipeFail() {
        jibo.face.views.changeView({
            remove: true,
            addView: 'assets/wipe/wipeFail.json'
        }, null, null, (view) => {
            this.currentView = view;
            view.once(jibo.face.views.CLOSED, this.transitionThenDestroyThenClose);
        });
    }
    stopAndDestroy(done) {
        this.log.warn('WipeSkill interrupted. This should be impossbile.');
        this.currentView.removeListener(jibo.face.views.CLOSED, this.transitionThenDestroyThenClose);
        jibo.face.views.changeView({ removeAll: true, leaveEmpty: true }, () => {
            this.destroy();
            done();
        }, () => {
            this.destroy();
            done('wipe view close failed');
        });
    }
    transitionThenDestroyThenClose() {
        this._transitionToCharacterMode().then(() => {
            this.destroyThenClose();
        });
    }
    destroy() {
        jibo.face.views.creator.unregisterClass('WipeView');
        this.currentView = null;
        super.destroy();
    }
}
exports.default = WipeSkill;

},{"../views/WipeView":25,"./SubSkill":17,"jibo":undefined}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
class TouchyTimeout {
    constructor(callback, time) {
        this.delayedCall = jibo.timer.setTimeout(() => {
            this.destroy();
            callback();
        }, time, false, false);
        this._reset = this.reset.bind(this);
        document.addEventListener('mousedown', this._reset);
        document.addEventListener('mouseup', this._reset);
        document.addEventListener('mousemove', this._reset);
    }
    reset(event) {
        this.delayedCall.restart();
    }
    destroy() {
        if (this._reset) {
            document.removeEventListener('mousedown', this._reset);
            document.removeEventListener('mouseup', this._reset);
            document.removeEventListener('mousemove', this._reset);
            this._reset = null;
        }
        if (this.delayedCall) {
            this.delayedCall.destroy();
            this.delayedCall = null;
        }
    }
}
exports.default = TouchyTimeout;

},{"jibo":undefined}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const animate = require("pixi-animate");
let View = jibo.rendering.gui.views.View;
let Mim = jibo.bt.behaviors.Mim;
const ActionData = jibo.rendering.gui.actions.ActionData;
let SHITS_NOT_TOO_BAD_THRESHOLD = 50;
let LOW_BATTERY_THRESHOLD = 20;
let EMERGENCY_WERE_ALL_GONNA_DIE_THRESHOLD = 5;
class BatteryView extends View {
    constructor(viewState) {
        super(viewState);
        this.battery = null;
        this.isPlugged = null;
        this.mim = null;
        this.succeedOnPlug = false;
        this.needAPlug = false;
        this.charginMahLazer = null;
        this.isProactive = false;
        this.wasFullyChargedAllTheTime = jibo.system.pluggedIn && !jibo.system.batteryCharging;
        this.swipeDownActions = [
            new ActionData(ActionData.EVENT, {
                event: View.BACK
            }),
            new ActionData(ActionData.MIM_END),
            new ActionData(ActionData.CLOSE_VIEW)
        ];
    }
    update(elapsed) {
        if (this.battery) {
            this.updateDisplay();
            if (this.isPlugged != jibo.system.pluggedIn) {
                this.isPlugged = jibo.system.pluggedIn;
                jibo.sound.play(this.isPlugged ? 'battery_plugin' : 'battery_plugout');
            }
        }
        if (this.mim) {
            if (this.mim.update() == jibo.bt.Status.SUCCEEDED) {
                this.mim.destroy();
                this.mim = null;
                if (this.needAPlug && jibo.system.pluggedIn) {
                    this._thxBae();
                }
                else if (jibo.system.getBatteryLevel() > EMERGENCY_WERE_ALL_GONNA_DIE_THRESHOLD || jibo.system.pluggedIn) {
                    jibo.face.views.removeView();
                }
                else {
                    this.succeedOnPlug = true;
                }
            }
            else if (this.needAPlug && jibo.system.pluggedIn) {
                let hackyMIM = this.mim;
                if (hackyMIM.listen && hackyMIM.listen.timeout) {
                    hackyMIM.listen.timeout = 1;
                }
                else if (hackyMIM.mimConfig && hackyMIM.mimConfig.timeout) {
                    hackyMIM.mimConfig.timeout = 0;
                    hackyMIM.mimConfig.mimType = 'announcement';
                }
            }
        }
        else if (this.succeedOnPlug && jibo.system.pluggedIn) {
            this._thxBae();
        }
        super.update(elapsed);
    }
    _thxBae() {
        this.needAPlug = false;
        this.succeedOnPlug = false;
        let mimConfig = {
            mimPath: 'mims/en-us/MuchBetter.mim',
            assetPack: this.assetPack
        };
        this.mim = new Mim(mimConfig);
        this.mim.start();
    }
    updateDisplay() {
        if (jibo.system.pluggedIn && (jibo.system.batteryCharging || this.wasFullyChargedAllTheTime)) {
            this.battery.charging.visible = true;
            this.battery.warning.visible = false;
            if (this.charginMahLazer && !jibo.system.batteryCharging) {
                this.charginMahLazer = false;
                animate.Animator.stop(this.battery);
                this.battery.gotoAndStop('fullUp');
                this.battery.juice.gotoAndStop(2);
            }
            else if (this.charginMahLazer === null && jibo.system.batteryCharging) {
                this.battery.juice.gotoAndStop(0);
                this.charginMahLazer = true;
                animate.Animator.play(this.battery, 'imChargin');
            }
        }
        else {
            this.wasFullyChargedAllTheTime = false;
            this.battery.charging.visible = false;
            if (this.charginMahLazer) {
                this.charginMahLazer = null;
                animate.Animator.stop(this.battery);
            }
            let level = Math.round(jibo.system.getBatteryLevel());
            level = level >= 0 ? level : 0;
            this.battery.gotoAndStop(level);
            let isLow = level < LOW_BATTERY_THRESHOLD;
            this.battery.juice.gotoAndStop(isLow ? 1 : 0);
            this.battery.warning.visible = isLow;
        }
    }
    loaded() {
        super.loaded();
        this.battery = this.getComponentById('battery').movieClip;
        this.needAPlug = false;
        this.isPlugged = jibo.system.pluggedIn;
        if (this.isPlugged) {
            if (jibo.system.batteryCharging) {
                this.charginMahLazer = true;
                this.battery.juice.gotoAndStop(0);
                animate.Animator.play(this.battery, 'imChargin');
            }
            else {
                this.charginMahLazer = false;
                this.battery.gotoAndStop('fullUp');
                this.battery.juice.gotoAndStop(2);
            }
        }
        else {
            this.charginMahLazer = null;
            this.updateDisplay();
        }
        this.once(View.OPENED, this._sayStuff.bind(this));
    }
    _sayStuff() {
        let mimPath;
        if (this.isPlugged) {
            mimPath = 'mims/en-us/OkayThanksToClear.mim';
        }
        else {
            let charge = jibo.system.getBatteryLevel() || 0;
            if (charge <= EMERGENCY_WERE_ALL_GONNA_DIE_THRESHOLD) {
                this.needAPlug = true;
                mimPath = 'mims/en-us/WouldLikeAPlugin.mim';
            }
            else if (charge <= LOW_BATTERY_THRESHOLD) {
                this.needAPlug = true;
                mimPath = 'mims/en-us/IWantPower.mim';
            }
            else if (charge <= SHITS_NOT_TOO_BAD_THRESHOLD) {
                mimPath = 'mims/en-us/MyBatterysLow.mim';
            }
            else {
                mimPath = 'mims/en-us/OkayThanksPresent.mim';
            }
        }
        this.mim = new Mim({
            mimPath: mimPath,
            assetPack: this.assetPack,
            getPromptData: () => {
                return {
                    proactiveNotification: this.isProactive,
                    fullyCharged: this.charginMahLazer === false
                };
            }
        });
        this.mim.start();
    }
    destroy() {
        if (this.mim) {
            this.mim.stop().then(() => {
                this.mim.destroy();
                this.mim = null;
            });
        }
        this.charginMahLazer = null;
        this.battery = null;
        this.isPlugged = null;
        this.isProactive = null;
        super.destroy();
    }
}
exports.default = BatteryView;

},{"jibo":undefined,"pixi-animate":undefined}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
let View = jibo.rendering.gui.views.View;
const ActionData = jibo.rendering.gui.actions.ActionData;
let MIN_POS = 140;
let SLIDER_WIDTH = 1000;
let VOLUME_CONTROL = 'volumeToValue';
class VolumeView extends View {
    constructor(viewState) {
        super(viewState);
        this.volume = null;
        this.startX = null;
        this.deltaX = 0;
        this.buttonStartX = 0;
        this.isDragging = false;
        this.currentVolume = -1;
        this.buttonDown = this.buttonDown.bind(this);
        this.onDrag = this.onDrag.bind(this);
        this.onTouchUp = this.onTouchUp.bind(this);
        this.swipeDownActions = [
            new ActionData(ActionData.EVENT, {
                event: View.BACK
            }),
            new ActionData(ActionData.MIM_END)
        ];
    }
    update(elapsed) {
        if (this.isDragging) {
            let newX = this.buttonStartX - this.deltaX;
            if (newX < MIN_POS) {
                newX = MIN_POS;
            }
            else if (newX > MIN_POS + SLIDER_WIDTH) {
                newX = MIN_POS + SLIDER_WIDTH;
            }
            this.volume.button.x = this.volume.blueBar.x = newX;
            let newVol = jibo.volume.MIN_VOLUME + Math.round((newX - MIN_POS) / (SLIDER_WIDTH / this.numTicks));
            if (newVol != this.currentVolume) {
                this.currentVolume = newVol;
                this.volume.button.value.text = String(newVol);
            }
            if (this.mim) {
                this.mim.resetTimeout();
            }
        }
        else if (this.volume && jibo.volume.currentVolume !== this.currentVolume) {
            this.updateSlider(jibo.volume.currentVolume);
        }
        if (this.mim) {
            if (this.mim.update(elapsed) !== jibo.bt.Status.IN_PROGRESS) {
                jibo.face.views.removeView();
            }
        }
        super.update(elapsed);
    }
    buttonDown(event) {
        this.startX = event.data.global.x;
        this.buttonStartX = this.volume.button.x;
        this.isDragging = true;
        this.volume.on('mousemove', this.onDrag);
        this.volume.once('mouseup', this.onTouchUp);
    }
    onTouchUp(event) {
        this.volume.off('mousemove', this.onDrag);
        this.volume.button.once('mousedown', this.buttonDown);
        this.isDragging = false;
        this.deltaX = 0;
        this.analytics.volumeChanged(true);
        jibo.volume.changeVolume(VOLUME_CONTROL, this.currentVolume);
        this.updateSlider(jibo.volume.currentVolume);
    }
    onDrag(event) {
        this.deltaX = this.startX - event.data.global.x;
    }
    loaded() {
        super.loaded();
        this.numTicks = jibo.volume.MAX_VOLUME - jibo.volume.MIN_VOLUME;
        this.volume = this.getComponentById('volume').movieClip;
        this.volume.interactive = true;
        this.volume.hitArea = new PIXI.Rectangle(0, 0, 1280, 720);
        this.volume.button.interactive = true;
        this.volume.button.once('mousedown', this.buttonDown);
        this.updateSlider(jibo.volume.currentVolume);
        this.subscribeListen();
    }
    subscribeListen() {
        let mimConfig = {
            assetPack: this.assetPack,
            mimPath: 'mims/en-us/VolumeUpDown.mim'
        };
        this.mim = new jibo.bt.behaviors.Mim(mimConfig);
        this.mim.start();
    }
    actionEnactor(action) {
        let actedOn = false;
        if (action.type === ActionData.VERBAL_COMMAND && action.data) {
            switch (action.data.intent) {
                case 'volumeUp':
                case 'volumeDown':
                case 'volumeToValue':
                    this.analytics.volumeChanged(false);
                    jibo.volume.onVoiceCommand(action.data);
                    this.updateSlider(jibo.volume.currentVolume);
                    actedOn = true;
                    break;
                case 'volumeQuery':
                    break;
            }
        }
        if (actedOn) {
            return true;
        }
        else {
            return super.actionEnactor(action);
        }
    }
    updateSlider(value) {
        this.currentVolume = value;
        let position = value - jibo.volume.MIN_VOLUME;
        this.volume.button.x = this.volume.blueBar.x = MIN_POS + position / this.numTicks * SLIDER_WIDTH;
        value = Math.round(value);
        this.volume.button.value.text = String(value);
    }
    destroy() {
        if (this.mim) {
            this.mim.stop().then(() => {
                this.mim.destroy();
                this.mim = null;
            });
        }
        this.volume.button.off('mousedown', this.buttonDown);
        this.volume.off('mousemove', this.onDrag);
        this.volume.off('mouseup', this.onTouchUp);
        this.volume = null;
        this.analytics = null;
        super.destroy();
    }
}
exports.default = VolumeView;

},{"jibo":undefined}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
class WipeView extends jibo.rendering.gui.views.View {
    constructor(viewState) {
        super(viewState);
        this.log = null;
    }
    setLogger(log) {
        this.log = log;
    }
    run(skipBackup = false) {
        Promise.resolve()
            .then(() => {
            if (skipBackup) {
                return;
            }
            return new Promise((resolve, reject) => {
                this.log.info("Wipe - backing up...");
                jibo.systemManager.backup((err) => {
                    if (err) {
                        this.log.error("Wipe - backup error:", err);
                    }
                    resolve();
                });
            });
        })
            .then(() => {
            let label = this.getComponentById("wipeLabel");
            label.text = "Wiping robot...";
            return jibo.utils.WipeUtil.run(this.log, skipBackup);
        })
            .then(() => {
            return new Promise((resolve, reject) => {
                let label = this.getComponentById("wipeLabel");
                label.text = "Rebooting...";
                this.log.info("Wipe - rebooting! Bye.");
                jibo.systemManager.reboot((err) => {
                    if (err) {
                        this.log.error("Wipe - reboot error: ", err);
                    }
                    resolve();
                });
            });
        })
            .catch((err) => {
            this.log.info("Wipe error: ", err);
            this.emit('wipeFail');
        });
    }
}
exports.default = WipeView;

},{"jibo":undefined}]},{},[10])(10)
});
//# sourceMappingURL=index.js.map