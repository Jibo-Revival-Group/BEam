(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.behueControl = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
const be_framework_1 = require("@be/be-framework");
const jibo = require("jibo");
const Analytics_1 = require("./analytics/Analytics");
const HueControler_1 = require("./HueControler");
var PromiseUtils = be_framework_1.libraries.jibo_cai_utils.PromiseUtils;
var TimeUtils = be_framework_1.libraries.jibo_cai_utils.TimeUtils;
const promisify = PromiseUtils.promisify;
const BRIDGE_SCAN_VALID_FOR_MILI = TimeUtils.minutesToMs(3);
const WAIT_TO_SETUP_MILI = TimeUtils.hoursToMs(8);
class HueControl extends be_framework_1.BeSkill {
    constructor(assetPack) {
        super(assetPack);
        this.exit = this.exit.bind(this);
        this._analytics = new Analytics_1.default(this);
    }
    preload(done) {
        promisify((cb) => {
            jibo.loader.load('assets/colorcodes/ColorCodes.json', (err, result) => {
                this._COLORCODES = result;
                cb();
            });
        }).then(() => this._kbm.loadRoot())
            .then((root) => {
            this._root = root;
        }).then(() => {
            done();
        }).catch((err) => {
            this.log.error('Error loading KB: ', err);
            done();
        });
    }
    postInit(done) {
        this._kbm = jibo.kb.createModel('/skills/hue-control');
        done();
    }
    open(result, refresh, previousSkillName) {
        jibo.mim.silentMenus = false;
        let intent;
        let group;
        let color;
        if (result && result.nlu) {
            if (result.nlu.intent) {
                intent = result.nlu.intent;
            }
            if (result.nlu.entities.group) {
                group = result.nlu.entities.group;
            }
            if (result.nlu.entities.color) {
                color = result.nlu.entities.color;
            }
        }
        if (refresh) {
            this.cleanup().then(() => { this._startFlow(intent, true, group, color); });
        }
        else {
            this._startFlow(intent, false, group, color);
        }
    }
    _startFlow(intent, refresh, group, color) {
        this._hueControler = new HueControler_1.default(this.log.createChild('HueControler'), (this._root && this._root.data) ? this._root.data.hueBridges : [], (this._root && this._root.data) ? this._root.data.defaultGroupInfo : {}, this._COLORCODES);
        this._blackboard = {
            launchIntent: intent,
            launchGroup: group,
            launchColor: color,
            refresh: refresh,
            skill: this,
            log: this.log,
            kbData: this._root ? this._root.data : null,
            hueControler: this._hueControler,
            bridgeScanValidForMili: BRIDGE_SCAN_VALID_FOR_MILI,
            waitToSetupMili: WAIT_TO_SETUP_MILI,
            analytics: this._analytics,
        };
        let options = {
            assetPack: this.assetPack,
            blackboard: this._blackboard
        };
        this._flow = jibo.flow.run(require('./flows/Main.flow'), options, (err, status) => {
            if (status === jibo.bt.Status.INTERRUPTED) {
                return;
            }
            this.exit();
        });
    }
    cleanupViews(toEye) {
        return new Promise((resolve) => {
            if (jibo.face.views.currentView && jibo.face.views.currentView.id !== 'eyeView') {
                jibo.face.views.changeView({
                    removeAll: true,
                    leaveEmpty: !toEye
                }, () => {
                    resolve();
                }, (err) => {
                    this.log.warn('Failed removing view', err);
                    resolve();
                });
            }
            else {
                jibo.face.views.forceEyeView(() => {
                    resolve();
                }, null, null, null, (err) => {
                    this.log.warn('Failed reseting view', err);
                    resolve();
                });
            }
        });
    }
    cleanup() {
        return Promise.all([
            this.cleanupViews(),
            this._hueControler.stopAndDestroy().then(() => { this._hueControler = null; }),
            this._flow.stopAndDestroy().then(() => { this._flow = null; }),
        ]);
    }
    close(done) {
        this._close().then(done, (err) => {
            this.log.error('Error closing skill', err);
            done();
        });
    }
    _close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._blackboard.lightsForget) {
                this._root.data = {};
                this.log.info('Deleting all HUE kbData.');
            }
            else {
                this._root.data.hueBridges = this._hueControler.appAccounts;
                this.log.info('Set kbData.hueBridges to appAccounts: ', this._hueControler.appAccounts);
                this._root.data.defaultGroupInfo = this._hueControler.defaultGroupInfo;
                this.log.info('Set kbData.defaultGroupInfo to defaultGroupInfo: ', this._hueControler.defaultGroupInfo);
            }
            this._blackboard = null;
            try {
                yield this._flow.stopAndDestroy();
            }
            catch (err) {
                this.log.warn('Error cleaning up flow', err);
            }
            this._flow = null;
            try {
                yield this._hueControler.stopAndDestroy();
            }
            catch (err) {
                this.log.warn('Error cleaning up hueControler', err);
            }
            try {
                yield this.cleanupViews();
            }
            catch (err) {
                this.log.warn('Error cleaning up the views', err);
            }
            if (this._root) {
                try {
                    yield promisify(cb => this._root.save(cb));
                }
                catch (err) {
                    this.log.warn('failed to save KB');
                }
                this._root = null;
            }
        });
    }
}
exports.default = HueControl;

},{"./HueControler":2,"./analytics/Analytics":3,"./flows/Main.flow":8,"@be/be-framework":undefined,"jibo":undefined}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const Hue = require("node-hue-api");
const be_framework_1 = require("@be/be-framework");
var CancelTokenSession = be_framework_1.libraries.jibo_cai_utils.CancelTokenSession;
class HueControler {
    constructor(logger, appAccounts = [], defaultGroupInfo = null, colorcodes) {
        this.appAccounts = appAccounts;
        this.defaultGroupInfo = defaultGroupInfo;
        this.log = logger;
        this.cts = new CancelTokenSession();
        this.COLORCODES = colorcodes;
    }
    getUnknownBridges() {
        let t0 = performance.now();
        return this.cts.wrap(Hue.nupnpSearch()).then((detectedBridges) => {
            let t1 = performance.now();
            this.log.info(`nupnpSearch() duration ${t1 - t0} milliseconds.`);
            let unknownBridges = [];
            if (detectedBridges.length === 0) {
                return unknownBridges;
            }
            else if (this.appAccounts.length === 0) {
                unknownBridges = detectedBridges;
            }
            else {
                for (let detectedBridge of detectedBridges) {
                    let bridgeunknow = true;
                    for (let appAccount of this.appAccounts) {
                        if (detectedBridge.id === appAccount.id) {
                            bridgeunknow = false;
                            if (!(detectedBridge.ipaddress === appAccount.host)) {
                                appAccount.host = detectedBridge.ipaddress;
                                this.log.info(`getUnknownBridges(): Updated appAccount host to new ip: `, appAccount);
                            }
                            break;
                        }
                    }
                    if (bridgeunknow) {
                        unknownBridges.push(detectedBridge);
                    }
                }
            }
            let t2 = performance.now();
            this.log.info(`getUnknownBridges() in ${t2 - t0} milliseconds: `, unknownBridges);
            return unknownBridges;
        }).catch((err) => {
            this.log.warn('Problem getting UnknownBridges: ', err);
            throw err;
        });
    }
    getUnknownBridgesMenuView(unknownBridges) {
        let view = {
            "viewConfig": {
                "type": "MenuView",
                "id": "unknown_bridges_menu",
                "title": "Choose new Hue bridge",
                "dynamic": true,
                "ignoreSwipeDown": true,
                "listDefault": {
                    "menuButtonType": "ActionBigButton",
                    "iconSrc": "assets/icons/Hue_Button.png",
                    "colors": ["0x25F2FB", "0x107799"],
                },
                "list": []
            }
        };
        for (let unknownBridge of unknownBridges) {
            view.viewConfig.list.push({
                id: unknownBridge.id,
                label: unknownBridge.id.slice(-6),
                action: {
                    type: 'event',
                    data: {
                        event: 'Pressed',
                        selected_id: unknownBridge.id
                    }
                }
            });
        }
        return view;
    }
    registerBot(bridge) {
        this.log.info('Registering Jibo to Hue Bridge: ', bridge);
        let t0 = performance.now();
        let HueApi = Hue.HueApi;
        let hue = new HueApi();
        return this.cts.wrap(hue.registerUser(bridge.ipaddress, 'Jibo Hue Control Skill'))
            .then((result) => {
            let appAccount = {
                username: result,
                host: bridge.ipaddress,
                id: bridge.id,
                mac: bridge.mac,
                name: bridge.name,
                groups: [],
                groupsUpdated: 0,
                lights: [],
                lightsUpdated: 0,
            };
            this.appAccounts.push(appAccount);
            let t1 = performance.now();
            this.log.info('Registered Bot to Hue bridge in ${t1-t0} milliseconds: ', appAccount);
            return 'created';
        })
            .catch((err) => {
            if (err.type && err.type === 101) {
                this.log.info('Link button needs to be pressed: ', err);
                return 'press';
            }
            else {
                this.log.warn('Problem durring registerBot: ', err);
                throw err;
            }
        });
    }
    updateGroupsInformation() {
        let t0 = performance.now();
        let HueApi = Hue.HueApi;
        let api = new HueApi();
        let updatedDefaultGroupInfo = false;
        let updatedAppAccounts = [];
        let updatePromises = [];
        for (let appAccount of this.appAccounts) {
            this.log.info('Starting update appAccount groups: ', appAccount);
            api = new HueApi(appAccount.host, appAccount.username);
            let updatedGroups = [];
            updatePromises.push(this.cts.wrap(api.groups()).then((groups) => {
                for (let group of groups) {
                    if (group.id === "0") {
                        continue;
                    }
                    if (this.defaultGroupInfo &&
                        appAccount.id === this.defaultGroupInfo.appAccount.id &&
                        group.name === this.defaultGroupInfo.group.name) {
                        this.defaultGroupInfo.appAccount = appAccount;
                        this.defaultGroupInfo.group = group;
                        updatedDefaultGroupInfo = true;
                        this.log.info('Updated defaultGroupInfo: ', this.defaultGroupInfo);
                    }
                    let huegroup = group;
                    updatedGroups.push(huegroup);
                }
            }).then(() => {
                return this.cts.wrap(api.group(0)).then((group) => {
                    if (group.id === '0') {
                        group.name = 'All';
                        group.action = group.lastAction;
                    }
                    if ((!this.defaultGroupInfo) ||
                        (this.defaultGroupInfo && this.defaultGroupInfo.appAccount && this.defaultGroupInfo.group &&
                            appAccount.id === this.defaultGroupInfo.appAccount.id &&
                            group.name === this.defaultGroupInfo.group.name)) {
                        this.defaultGroupInfo = { appAccount, group };
                        updatedDefaultGroupInfo = true;
                        this.log.info('Updated defaultGroupInfo: ', this.defaultGroupInfo);
                    }
                    let huegroup = group;
                    updatedGroups.push(huegroup);
                    appAccount.groups = updatedGroups;
                    appAccount.groupsUpdated = new Date().getTime();
                    updatedAppAccounts.push(appAccount);
                    this.log.info('Updated appAccount groups: ', appAccount);
                });
            }));
        }
        return this.cts.wrap(this.promiseEvery(updatePromises)).then((results) => {
            this.appAccounts = updatedAppAccounts;
            if (!updatedDefaultGroupInfo) {
                let appAccount = this.appAccounts[0];
                let group = appAccount.groups.find(g => g.name === 'All');
                this.defaultGroupInfo = { appAccount, group };
                this.log.info('Never updatedDefaultGroupInfo, this.defaultGroupInfo falls back to first All group: ', this.defaultGroupInfo);
            }
            let t1 = performance.now();
            this.log.info(`updateGroupsInformation() duration ${t1 - t0} milliseconds. this.appAccounts`, this.appAccounts);
            return results;
        }).catch((err) => {
            this.log.warn('Problem durring updateGroupsInformation: ', err);
            throw err;
        });
    }
    earliestAppAccountGroupUpdateTime() {
        let earliestUpdate = new Date(8640000000000000).getTime();
        for (let appAccount of this.appAccounts) {
            earliestUpdate = (appAccount.groupsUpdated < earliestUpdate) ? appAccount.groupsUpdated : earliestUpdate;
        }
        return earliestUpdate;
    }
    defaultGroupNames() {
        let defaultGroupNames = ["Living room", "Kitchen", "Dining", "Bedroom",
            "Kid's Bedroom", "Bathroom", "Nursery", "Recreation room",
            "Office", "Gym", "Hallway", "Toilet",
            "Front door", "Garage", "Terrace", "Garden",
            "Driveway", "Carport", "All"];
        return defaultGroupNames;
    }
    getGroupSelectionMenuView() {
        let view = {
            "closeOnSwipeDown": true,
            "viewConfig": {
                "type": "MenuView",
                "id": "default_group_selection_menu",
                "title": "Choose default room",
                "dynamic": true,
                "listDefault": {
                    "menuButtonType": "ActionBigButton",
                    "iconSrc": "assets/icons/Bulb_Button_1.png",
                    "colors": ["0x3765AB", "0x1A2563"],
                },
                "list": [],
                "listMetadata": {
                    "defaultGroupsNames": [],
                    "customGroupsNames": []
                }
            }
        };
        let addBridgeInto = (this.appAccounts.length > 1);
        let customMenuItems = [];
        for (let appAccount of this.appAccounts) {
            for (let group of appAccount.groups) {
                let menuItem = {
                    id: {
                        appAccount: appAccount,
                        group: group
                    },
                    label: addBridgeInto ? (group.name + '\n' + appAccount.id.slice(-6)) : group.name,
                    colors: ["0x3765AB", "0x1A2563"],
                    action: {
                        type: 'event',
                        data: {
                            event: 'Pressed',
                            selected_group_info: {
                                appAccount: appAccount,
                                group: group
                            }
                        }
                    }
                };
                if (this.defaultGroupNames().indexOf(group.name) >= 0) {
                    view.viewConfig.listMetadata.defaultGroupsNames.push(group.name);
                    menuItem.colors = ["0x25F2FB", "0x107799"];
                    view.viewConfig.list.push(menuItem);
                }
                else {
                    view.viewConfig.listMetadata.customGroupsNames.push(group.name);
                    customMenuItems.push(menuItem);
                }
            }
        }
        view.viewConfig.list = view.viewConfig.list.concat(customMenuItems);
        return view;
    }
    checkForGroupsByLaunchGroup(launchGroup) {
        let launchGroupToDefaultGroupNames = {
            'living': "Living room",
            'kitchen': "Kitchen",
            'dining': "Dining",
            'bedroom': "Bedroom",
            'kidsBedroom': "Kid's Bedroom",
            'bathoom': "Bathroom",
            'nursery': "Nursery",
            'recRoom': "Recreation room",
            'office': "Office",
            'gym': "Gym",
            'hallway': "Hallway",
            'toilet': "Toilet",
            'frontDoor': "Front door",
            'garage': "Garage",
            'terrace': "Terrace",
            'garden': "Garden",
            'driveway': "Driveway",
            'carport': "Carport",
            'all': "All"
        };
        return launchGroupToDefaultGroupNames[launchGroup] ? this.checkForGroupsByName(launchGroupToDefaultGroupNames[launchGroup]) : [];
    }
    checkForGroupsByName(name) {
        let targetGroupsInfo = [];
        for (let appAccount of this.appAccounts) {
            for (let group of appAccount.groups) {
                if (name === group.name) {
                    let targetGroupInfo = {
                        'appAccount': appAccount,
                        'group': group
                    };
                    targetGroupsInfo.push(targetGroupInfo);
                }
            }
        }
        return targetGroupsInfo;
    }
    getColorRGBByName(name) {
        let result = this.COLORCODES[name];
        this.log.info('getColorRGBByName: ', name, result);
        return result;
    }
    addIntentToLightState(intent, color, startingLightState) {
        let lightState = startingLightState ? startingLightState : Hue.lightState.create();
        switch (intent) {
            case 'lightsOn':
            case 'lightsGroupOn':
                lightState.on();
                break;
            case 'lightsOff':
            case 'lightsGroupOff':
                lightState.off();
                break;
            case 'lightsUp':
            case 'lightsGroupUp':
                lightState.on();
                lightState.bri_inc(65);
                break;
            case 'lightsUpCompletely':
            case 'lightsGroupUpCompletely':
                lightState.on();
                lightState.bri(255);
                break;
            case 'lightsDown':
            case 'lightsGroupDown':
                lightState.on();
                lightState.bri_inc(-65);
                break;
            case 'lightsWarm':
            case 'lightsGroupWarm':
                lightState.on();
                lightState.ct_inc(88);
                break;
            case 'lightsCool':
            case 'lightsGroupCool':
                lightState.on();
                lightState.ct_inc(-88);
                break;
            case 'lightsColor':
            case 'lightsColorGroup':
                lightState.on();
                let hsl = this.rgbToHsl(this.getColorRGBByName(color));
                lightState.hsl(hsl[0], hsl[1], hsl[2]);
                break;
            case 'lightsAlert':
                lightState.longAlert();
            default:
                break;
        }
        return lightState;
    }
    animationMetaFromIntent(intent, targetAll, poseOnly) {
        let animationMeta = [];
        if (poseOnly) {
            animationMeta.push('pose');
        }
        switch (intent) {
            case 'lightsAlert':
            case 'lightsOn':
            case 'lightsGroupOn':
                targetAll ? animationMeta.push('lights-on-all') : animationMeta.push('lights-on');
                break;
            case 'lightsOff':
            case 'lightsGroupOff':
                targetAll ? animationMeta.push('lights-off-all') : animationMeta.push('lights-off');
                break;
            case 'lightsUp':
            case 'lightsGroupUp':
                animationMeta.push('lights-up');
                break;
            case 'lightsUpCompletely':
            case 'lightsGroupUpCompletely':
                animationMeta.push('lights-up-completely');
                break;
            case 'lightsDown':
            case 'lightsGroupDown':
                animationMeta.push('lights-down');
                break;
            case 'lightsWarm':
            case 'lightsGroupWarm':
                animationMeta.push('lights-warm');
                break;
            case 'lightsCool':
            case 'lightsGroupCool':
                animationMeta.push('lights-cool');
                break;
            case 'lightsColor':
            case 'lightsColorGroup':
                animationMeta.push('lights-on-all');
                break;
            default:
                break;
        }
        return animationMeta;
    }
    lightsComandByGroups(intent, targetGroupsInfo, color, poseOnly) {
        let lightState = this.addIntentToLightState(intent, color);
        this.log.info('lightsComandByGroups: Sending lightState to targetGroupsInfo.', lightState, targetGroupsInfo);
        let HueApi = Hue.HueApi;
        let hue = new HueApi();
        let updatePromises = [];
        let targetAll = targetGroupsInfo[0].group.name === 'All';
        let introQuery = { category: 'hue', includeMeta: ['intro'].concat(this.animationMetaFromIntent(intent, targetAll, poseOnly)) };
        let loopQuery = { category: 'hue', includeMeta: ['loop'].concat(this.animationMetaFromIntent(intent, targetAll)) };
        let outroSuccessQuery = { category: 'hue', includeMeta: ['outro', 'success'].concat(this.animationMetaFromIntent(intent, targetAll)) };
        let outroFailQuery = { category: 'hue', includeMeta: ['outro', 'fail'].concat(this.animationMetaFromIntent(intent, targetAll)) };
        this.log.info('AttentionMode set OFF to avoid animation jittters.');
        return this.cts.wrap(jibo.expression.pushAttentionMode(jibo.expression.AttentionMode.OFF))
            .then((resultHandle) => {
            this.attentionHandle = resultHandle;
            this.log.info('lightsComandByGroups: Playing Animation Intro.');
        })
            .then(() => this.cts.wrap(this.randomElement(jibo.animDB.query(introQuery).matching).play({ cache: jibo.loader.activeCache }).result))
            .then((animState) => {
            this.log.info('lightsComandByGroups: bundling light comand promises.');
            for (let targetGroupInfo of targetGroupsInfo) {
                let api = new HueApi(targetGroupInfo.appAccount.host, targetGroupInfo.appAccount.username);
                updatePromises.push(this.cts.wrap(api.setGroupLightState(targetGroupInfo.group.id, lightState)).then((apiResult) => {
                    this.log.info('Set targetGroupInfo to state: ', targetGroupInfo, lightState, apiResult);
                    return apiResult;
                }));
            }
            let lightsCommandFinished;
            let lightsCommandFailed;
            this.log.info('lightsComandByGroups: resolving promiseEvery.');
            this.cts.wrap(this.promiseEvery(updatePromises)).then((results) => {
                this.cts.wrap(this.updateGroupsInformation()).then((results) => {
                    lightsCommandFinished = true;
                    lightsCommandFailed = false;
                    this.log.info('lightsComandByGroups: promiseEvery SUCESS: ', results, lightsCommandFinished, lightsCommandFailed);
                });
            }).catch((results) => {
                this.updateGroupsInformation();
                lightsCommandFinished = true;
                lightsCommandFailed = true;
                this.log.info('lightsComandByGroups: promiseEvery REJECTED: ', results, lightsCommandFinished, lightsCommandFailed);
            });
            this.log.info('lightsComandByGroups: Playing animation loop');
            let loopAnimation = () => {
                if (!lightsCommandFinished) {
                    return this.cts.wrap(this.randomElement(jibo.animDB.query(loopQuery).matching).play({ cache: jibo.loader.activeCache }).result).then((animState) => {
                        return loopAnimation();
                    });
                }
                else {
                    this.log.info('lightsComandByGroups: Breaking out of animation loop. lightsCommandFinished: ', lightsCommandFinished);
                    let outroQuery = lightsCommandFailed ? outroFailQuery : outroSuccessQuery;
                    if (color && !lightsCommandFailed) {
                        this.log.info('lightsComandByGroups: set eye.glow for outroSuccess.');
                        this.eyeGlow = {
                            enabled: jibo.face.eye.glow.enabled,
                            amount: jibo.face.eye.glow.amount,
                            color: jibo.face.eye.glow.color
                        };
                        jibo.face.eye.glow.enabled = true;
                        jibo.face.eye.glow.amount = 1;
                        jibo.face.eye.glow.color = this.rgbToHex(this.getColorRGBByName(color));
                    }
                    return this.cts.wrap(this.randomElement(jibo.animDB.query(outroQuery).matching).play({ cache: jibo.loader.activeCache }).result)
                        .then(() => {
                        this.log.info('Animations done releasing AttentionMode.');
                        if (this.attentionHandle) {
                            return this.cts.wrap(this.attentionHandle.release()).then(() => { this.attentionHandle = null; });
                        }
                    })
                        .then(() => {
                        this.releaseEyeGlow();
                        this.log.info('lightsComandByGroups: outro finished. Returning, lightsCommandSuccess: ', !lightsCommandFailed);
                        return !lightsCommandFailed;
                    });
                }
            };
            return loopAnimation();
        });
    }
    lightsAlertByGroups(targetGroupsInfo) {
        this.log.info('Testing, Testing. Is this thing on?');
        return this.cts.wrap(this.lightsComandByGroups('lightsAlert', targetGroupsInfo, '', true));
    }
    lightsVerifyIntentByGroups(intent, targetGroupsInfo, color) {
        let HUE_MAX_BRI = 254;
        let HUE_MIN_BRI = 1;
        let HUE_MAX_CT = 500;
        let HUE_MIN_CT = 153;
        let targetsAllOn = true;
        let targetsAnyOn = true;
        let targetsMaxBri = HUE_MIN_BRI;
        let targetsMinBri = HUE_MAX_BRI;
        let targetsMaxCt = HUE_MIN_CT;
        let targetsMinCt = HUE_MAX_CT;
        for (let targetGroupInfo of targetGroupsInfo) {
            if (!targetGroupInfo.group.state || targetGroupInfo.group.state.all_on === undefined || targetGroupInfo.group.state.any_on === undefined) {
                targetsAllOn = false;
                targetsAnyOn = true;
            }
            else {
                targetsAllOn = targetsAllOn && targetGroupInfo.group.state.all_on;
                targetsAnyOn = targetsAnyOn && targetGroupInfo.group.state.any_on;
            }
            if (targetGroupInfo.group.action.bri || targetGroupInfo.group.action.bri === 0) {
                targetsMaxBri = Math.max(targetsMaxBri, targetGroupInfo.group.action.bri);
                targetsMinBri = Math.min(targetsMinBri, targetGroupInfo.group.action.bri);
            }
            if (targetGroupInfo.group.action.ct) {
                targetsMaxCt = Math.max(targetsMaxCt, targetGroupInfo.group.action.ct);
                targetsMinCt = Math.min(targetsMinCt, targetGroupInfo.group.action.ct);
            }
        }
        let verifiedIntent = intent;
        switch (intent) {
            case 'lightsOn':
            case 'lightsGroupOn':
                verifiedIntent = targetsAllOn ? (targetsMinBri > (HUE_MAX_BRI * .3) ? 'lightsAlreadyOn' : 'lightsAlreadyOnBrighten') : intent;
                break;
            case 'lightsOff':
            case 'lightsGroupOff':
                verifiedIntent = targetsAnyOn ? intent : 'lightsAlreadyOff';
                break;
            case 'lightsUp':
            case 'lightsGroupUp':
                verifiedIntent = (targetsMinBri < HUE_MAX_BRI || !targetsAllOn) ? intent : 'lightsMaxBri';
                break;
            case 'lightsUpCompletely':
            case 'lightsGroupUpCompletely':
                verifiedIntent = intent;
                break;
            case 'lightsDown':
            case 'lightsGroupDown':
                verifiedIntent = (targetsMaxBri > HUE_MIN_BRI) ? intent : 'lightsMinBri';
                break;
            case 'lightsWarm':
            case 'lightsGroupWarm':
                verifiedIntent = (targetsMinCt < HUE_MAX_CT) ? intent : 'lightsMaxCt';
                break;
            case 'lightsCool':
            case 'lightsGroupCool':
                verifiedIntent = (targetsMaxCt > HUE_MIN_CT) ? intent : 'lightsMinCt';
                break;
            case 'lightsColor':
            case 'lightsColorGroup':
                let rgbValues = this.getColorRGBByName(color);
                if (!rgbValues) {
                    verifiedIntent = 'lightsUnknownColor';
                }
                break;
            default:
                break;
        }
        this.log.info('lightsVerifyIntentByGroups: intent, verifiedIntent: ', intent, verifiedIntent);
        return verifiedIntent;
    }
    releaseEyeGlow() {
        if (this.eyeGlow) {
            this.log.info('lightsComandByGroups: put eye.glow back.');
            jibo.face.eye.glow.enabled = this.eyeGlow.enabled;
            jibo.face.eye.glow.amount = this.eyeGlow.amount;
            jibo.face.eye.glow.color = this.eyeGlow.color;
            this.eyeGlow = null;
        }
    }
    stopAndDestroy() {
        this.releaseEyeGlow();
        this.log.info('stopAndDestroy(): reset attention and break all promises');
        if (this.attentionHandle) {
            this.cts.wrap(this.attentionHandle.release().then(() => {
                this.log.info('stopAndDestroy(): attentionHandle.released');
                this.attentionHandle = null;
            }));
        }
        return this.cts.cancel();
    }
    promiseEvery(promises) {
        let rejected = false;
        let allPromises = new Array(promises.length);
        let results = new Array(promises.length);
        for (let i = 0; i < promises.length; i++) {
            allPromises.push(new Promise((resolve) => {
                promises[i]
                    .then((result) => { results[i] = result; })
                    .catch((error) => {
                    results[i] = error;
                    rejected = true;
                })
                    .then(resolve);
            }));
        }
        return new Promise((resolve, reject) => {
            Promise.all(allPromises).then(() => {
                if (rejected) {
                    reject(results);
                }
                else {
                    resolve(results);
                }
            });
        });
    }
    randomElement(array) {
        let randInt = Math.floor(Math.random() * array.length);
        this.log.debug("randomElement selected, randInt from array.length:", randInt, array.length);
        return array[randInt];
    }
    rgbToHsl(rgb) {
        var r = rgb[0] / 255;
        var g = rgb[1] / 255;
        var b = rgb[2] / 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;
        if (max == min) {
            h = s = 0;
        }
        else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        let hsl = [h * 360, s * 100, l * 100];
        this.log.info('rgbToHsl: ', rgb, hsl);
        this.log.debug('rgbToHsl: ', rgb, hsl);
        return hsl;
    }
    rgbToHex(rgb) {
        function componentToHex(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }
        var r = rgb[0];
        var g = rgb[1];
        var b = rgb[2];
        let hex = "0x" + componentToHex(r) + componentToHex(g) + componentToHex(b);
        this.log.info('rgbToHex: ', rgb, hex);
        this.log.debug('rgbToHsl: ', rgb, hex);
        return hex;
    }
}
exports.default = HueControler;

},{"@be/be-framework":undefined,"jibo":undefined,"node-hue-api":undefined}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Analytics {
    constructor(skill) {
        this.skill = skill;
        this._log = skill.log;
    }
    lightsCommanded(intent, group, details) {
        switch (intent) {
            case 'lightsOn':
            case 'lightsGroupOn':
            case 'lightsOff':
            case 'lightsGroupOff':
                this.skill.track('Light Toggled', { intent: intent, details: details, group: group });
                break;
            case 'lightsUp':
            case 'lightsGroupUp':
            case 'lightsDown':
            case 'lightsGroupDown':
                this.skill.track('Light Brightness Change', { intent: intent, details: details, group: group });
                break;
            case 'lightsUpCompletely':
                this.skill.track('Light Brightness Change', { intent: 'lightsUp', details: intent, group: group });
                break;
            case 'lightsGroupUpCompletely':
                this.skill.track('Light Brightness Change', { intent: 'lightsGroupUp', details: intent, group: group });
                break;
            case 'lightsWarm':
            case 'lightsGroupWarm':
            case 'lightsCool':
            case 'lightsGroupCool':
                this.skill.track('Light Temperature Change', { intent: intent, details: details, group: group });
                break;
            case 'lightsColor':
            case 'lightsColorGroup':
                this.skill.track('Light Color Change', { intent: intent, details: details, group: group });
                break;
            case 'lightsAlert':
                this.skill.track('Light Tested', { intent: intent, details: details, group: group });
                break;
            default:
                break;
        }
    }
    lightsGroupSelectionInfo(defaultGroupsNames, customGroupsNames) {
        this.skill.track('Light Group Selection Info', { defaultGroupsNames: defaultGroupsNames.join(', '), customGroupsNames: customGroupsNames.join(', ') });
    }
    lightsGroupSelection(selectedGroupName) {
        this.skill.track('Light Group Selected', { selectedGroupName });
    }
}
exports.default = Analytics;

},{}],4:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'Command',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/hue-control/src/flows/Command.flow'
        },
        '5b6d2564-4d74-455a-80e5-c31dea72f399': function () {
            return {
                'id': '5b6d2564-4d74-455a-80e5-c31dea72f399',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '5b6d2564-4d74-455a-80e5-c31dea72f399',
                        'to': '4f9163dc-d24f-40e6-b16c-e09d7e9cb2ad',
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
        'f24b0a22-ee86-4dbf-bfba-9a46d94a9d14': function () {
            return {
                'id': 'f24b0a22-ee86-4dbf-bfba-9a46d94a9d14',
                'name': 'Post',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return 'post';
                    }
                }
            };
        },
        'a432ae48-d539-466e-acfd-ba914a49b0a9': function () {
            return {
                'id': 'a432ae48-d539-466e-acfd-ba914a49b0a9',
                'name': 'Send Command To Lights',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'a432ae48-d539-466e-acfd-ba914a49b0a9',
                        'to': 'f24b0a22-ee86-4dbf-bfba-9a46d94a9d14',
                        'value': 'post'
                    },
                    {
                        'frm': 'a432ae48-d539-466e-acfd-ba914a49b0a9',
                        'to': '0985b2a4-032e-407c-86bb-68e8849862e9',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        let targetGroups = blackboard.targetedGroups ? blackboard.targetedGroups : [];
                        let intent = blackboard.launchIntent ? blackboard.launchIntent : '';
                        let color = blackboard.launchColor ? blackboard.launchColor : '';
                        let targetGroupName = !!targetGroups[0] ? targetGroups[0].group.name : '';
                        blackboard.analytics.lightsCommanded(intent, targetGroupName, color);
                        blackboard.hueControler.lightsComandByGroups(intent, targetGroups, color).then(result => {
                            blackboard.log.info('lightsComandByGroups returned: ', result);
                            if (result === true) {
                                done('post');
                            }
                            done('false');
                        }).catch(error => {
                            blackboard.log.error(error);
                            done('failure');
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '7ef25a71-4ffe-4481-8628-4ee11f6a17f1': function () {
            return {
                'id': '7ef25a71-4ffe-4481-8628-4ee11f6a17f1',
                'name': '~',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '7ef25a71-4ffe-4481-8628-4ee11f6a17f1',
                        'to': 'e169c899-e631-453c-b6ce-96d06bec961d',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Catch',
                'options': {
                    'getTransition': (exception, payload) => {
                        blackboard.log.error('Something leaked, Caught Exception: ', exception, payload);
                        return '';
                    }
                }
            };
        },
        '1d8b6112-d7b2-4065-8e73-35ab4e5dce67': function () {
            return {
                'id': '1d8b6112-d7b2-4065-8e73-35ab4e5dce67',
                'name': '~error',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '1d8b6112-d7b2-4065-8e73-35ab4e5dce67',
                        'to': 'e169c899-e631-453c-b6ce-96d06bec961d',
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
        'e169c899-e631-453c-b6ce-96d06bec961d': function () {
            return {
                'id': 'e169c899-e631-453c-b6ce-96d06bec961d',
                'name': 'Other',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return 'Other';
                    }
                }
            };
        },
        'cd8a9ad5-ad2b-43f2-9588-4c394c52fdf2': function () {
            return {
                'id': 'cd8a9ad5-ad2b-43f2-9588-4c394c52fdf2',
                'name': 'Idle',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        blackboard.lightsCommandFailureCount;
                        return this.inTransition;
                    }
                }
            };
        },
        '4f9163dc-d24f-40e6-b16c-e09d7e9cb2ad': function () {
            return {
                'id': '4f9163dc-d24f-40e6-b16c-e09d7e9cb2ad',
                'name': 'Check Command Applicable',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '4f9163dc-d24f-40e6-b16c-e09d7e9cb2ad',
                        'to': 'a432ae48-d539-466e-acfd-ba914a49b0a9',
                        'value': ''
                    },
                    {
                        'frm': '4f9163dc-d24f-40e6-b16c-e09d7e9cb2ad',
                        'to': '8889b1c7-2b8c-4dbb-90c8-2beefdac2778',
                        'value': 'lightsAlreadyOn'
                    },
                    {
                        'frm': '4f9163dc-d24f-40e6-b16c-e09d7e9cb2ad',
                        'to': '9368c32a-24e6-4721-8267-530487564b75',
                        'value': 'lightsAlreadyOnBrighten'
                    },
                    {
                        'frm': '4f9163dc-d24f-40e6-b16c-e09d7e9cb2ad',
                        'to': '85e7c3cc-fcfa-4ca8-aef5-2e6d93cf9443',
                        'value': 'lightsAlreadyOff'
                    },
                    {
                        'frm': '4f9163dc-d24f-40e6-b16c-e09d7e9cb2ad',
                        'to': 'b81de248-e2cb-4740-b70b-0b01ea652387',
                        'value': 'lightsMaxBri'
                    },
                    {
                        'frm': '4f9163dc-d24f-40e6-b16c-e09d7e9cb2ad',
                        'to': 'fb76e2e8-9c3a-4a44-aaaf-cf88cc075a80',
                        'value': 'lightsMinBri'
                    },
                    {
                        'frm': '4f9163dc-d24f-40e6-b16c-e09d7e9cb2ad',
                        'to': 'a46146a7-ddd8-4a0e-804f-4825cdf3c42c',
                        'value': 'lightsMaxCt'
                    },
                    {
                        'frm': '4f9163dc-d24f-40e6-b16c-e09d7e9cb2ad',
                        'to': 'c412a51b-1bf2-48c4-b661-16c7a79fe022',
                        'value': 'lightsMinCt'
                    },
                    {
                        'frm': '4f9163dc-d24f-40e6-b16c-e09d7e9cb2ad',
                        'to': '765ed5cb-de4f-487c-b297-f1b8880d71a9',
                        'value': 'lightsUnknownColor'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        let targetGroups = blackboard.targetedGroups ? blackboard.targetedGroups : [];
                        let intent = blackboard.launchIntent ? blackboard.launchIntent : '';
                        let color = blackboard.launchColor ? blackboard.launchColor : '';
                        let verifiedIntent = blackboard.hueControler.lightsVerifyIntentByGroups(intent, targetGroups, color);
                        if (!(verifiedIntent === intent)) {
                            return verifiedIntent;
                        }
                        blackboard.lightsCommandFailureCount = 0;
                        return 'yes';
                    }
                }
            };
        },
        'b81de248-e2cb-4740-b70b-0b01ea652387': function () {
            return {
                'id': 'b81de248-e2cb-4740-b70b-0b01ea652387',
                'name': 'Lights Up Is Brightest',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'b81de248-e2cb-4740-b70b-0b01ea652387',
                        'to': 'f24b0a22-ee86-4dbf-bfba-9a46d94a9d14',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsUpIsBrightest.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '8889b1c7-2b8c-4dbb-90c8-2beefdac2778': function () {
            return {
                'id': '8889b1c7-2b8c-4dbb-90c8-2beefdac2778',
                'name': 'Lights On Are On',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '8889b1c7-2b8c-4dbb-90c8-2beefdac2778',
                        'to': 'f24b0a22-ee86-4dbf-bfba-9a46d94a9d14',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsOnAreOn.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '85e7c3cc-fcfa-4ca8-aef5-2e6d93cf9443': function () {
            return {
                'id': '85e7c3cc-fcfa-4ca8-aef5-2e6d93cf9443',
                'name': 'Lights Off Are Off',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '85e7c3cc-fcfa-4ca8-aef5-2e6d93cf9443',
                        'to': 'f24b0a22-ee86-4dbf-bfba-9a46d94a9d14',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsOffAreOff.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '9368c32a-24e6-4721-8267-530487564b75': function () {
            return {
                'id': '9368c32a-24e6-4721-8267-530487564b75',
                'name': 'Lights On Turning Up',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '9368c32a-24e6-4721-8267-530487564b75',
                        'to': 'bf90a6e7-54c0-48bc-bb11-f7287c646911',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsOnTurningUp.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'fb76e2e8-9c3a-4a44-aaaf-cf88cc075a80': function () {
            return {
                'id': 'fb76e2e8-9c3a-4a44-aaaf-cf88cc075a80',
                'name': 'Lights Down Are Off',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'fb76e2e8-9c3a-4a44-aaaf-cf88cc075a80',
                        'to': 'f24b0a22-ee86-4dbf-bfba-9a46d94a9d14',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsDownAreOff.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'a46146a7-ddd8-4a0e-804f-4825cdf3c42c': function () {
            return {
                'id': 'a46146a7-ddd8-4a0e-804f-4825cdf3c42c',
                'name': 'Lights Warm Is Warmest',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'a46146a7-ddd8-4a0e-804f-4825cdf3c42c',
                        'to': 'f24b0a22-ee86-4dbf-bfba-9a46d94a9d14',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsWarmIsWarmest.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'c412a51b-1bf2-48c4-b661-16c7a79fe022': function () {
            return {
                'id': 'c412a51b-1bf2-48c4-b661-16c7a79fe022',
                'name': 'Lights Cool Is Coolest',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'c412a51b-1bf2-48c4-b661-16c7a79fe022',
                        'to': 'f24b0a22-ee86-4dbf-bfba-9a46d94a9d14',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsCoolIsCoolest.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'bf90a6e7-54c0-48bc-bb11-f7287c646911': function () {
            return {
                'id': 'bf90a6e7-54c0-48bc-bb11-f7287c646911',
                'name': 'Switch intent to turn up.',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'bf90a6e7-54c0-48bc-bb11-f7287c646911',
                        'to': 'a432ae48-d539-466e-acfd-ba914a49b0a9',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        blackboard.launchIntent = 'lightsGroupUp';
                        return '';
                    }
                }
            };
        },
        'b12975ac-89b1-40a7-af86-31444d6b6e84': function () {
            return {
                'id': 'b12975ac-89b1-40a7-af86-31444d6b6e84',
                'name': 'Lights Command Failure1',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'b12975ac-89b1-40a7-af86-31444d6b6e84',
                        'to': 'a432ae48-d539-466e-acfd-ba914a49b0a9',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsCommandFailure1.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '8e19dadc-7adb-402b-b2f7-9f2a814b6144': function () {
            return {
                'id': '8e19dadc-7adb-402b-b2f7-9f2a814b6144',
                'name': 'Lights Command Failure2 ERROR SCREEN',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '8e19dadc-7adb-402b-b2f7-9f2a814b6144',
                        'to': 'cd8a9ad5-ad2b-43f2-9588-4c394c52fdf2',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsCommandFailure2.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '0985b2a4-032e-407c-86bb-68e8849862e9': function () {
            return {
                'id': '0985b2a4-032e-407c-86bb-68e8849862e9',
                'name': 'LightsFailureCounter',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '0985b2a4-032e-407c-86bb-68e8849862e9',
                        'to': 'b12975ac-89b1-40a7-af86-31444d6b6e84',
                        'value': '1'
                    },
                    {
                        'frm': '0985b2a4-032e-407c-86bb-68e8849862e9',
                        'to': '8e19dadc-7adb-402b-b2f7-9f2a814b6144',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        blackboard.lightsCommandFailureCount = blackboard.lightsCommandFailureCount ? blackboard.lightsCommandFailureCount + 1 : 1;
                        return blackboard.lightsCommandFailureCount;
                    }
                }
            };
        },
        '765ed5cb-de4f-487c-b297-f1b8880d71a9': function () {
            return {
                'id': '765ed5cb-de4f-487c-b297-f1b8880d71a9',
                'name': 'Lights Unknown Color',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '765ed5cb-de4f-487c-b297-f1b8880d71a9',
                        'to': 'f24b0a22-ee86-4dbf-bfba-9a46d94a9d14',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsUnknownColor.mim',
                    'getPromptData': () => {
                        return {};
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
            'name': 'ControlCheck',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/hue-control/src/flows/ControlCheck.flow'
        },
        '2f46574d-0652-4f9d-b06e-d3efbc482711': function () {
            return {
                'id': '2f46574d-0652-4f9d-b06e-d3efbc482711',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '2f46574d-0652-4f9d-b06e-d3efbc482711',
                        'to': '1d89cf96-cde6-4e9d-9db9-33dc8ea5d16a',
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
        '1d89cf96-cde6-4e9d-9db9-33dc8ea5d16a': function () {
            return {
                'id': '1d89cf96-cde6-4e9d-9db9-33dc8ea5d16a',
                'name': 'Known bridge in KB?',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '1d89cf96-cde6-4e9d-9db9-33dc8ea5d16a',
                        'to': '0d8d595d-ef8b-4d32-9c24-efe13d3c277d',
                        'value': 'no'
                    },
                    {
                        'frm': '1d89cf96-cde6-4e9d-9db9-33dc8ea5d16a',
                        'to': '8714ed7a-3cf3-4661-a9d6-62e8ab03a29d',
                        'value': 'yes'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        let result = 'no';
                        if (blackboard.hueControler.appAccounts.length >= 1) {
                            result = 'yes';
                        }
                        blackboard.log.info('Control check, is there a known bridge? ', result);
                        return result;
                    }
                }
            };
        },
        'd2af952a-a440-4e02-a1e8-6908c56895a1': function () {
            return {
                'id': 'd2af952a-a440-4e02-a1e8-6908c56895a1',
                'name': 'First time hue used on Jibo?',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'd2af952a-a440-4e02-a1e8-6908c56895a1',
                        'to': '8aed2570-c87b-49df-9817-06335ab7bf4b',
                        'value': 'yes'
                    },
                    {
                        'frm': 'd2af952a-a440-4e02-a1e8-6908c56895a1',
                        'to': '62322201-8ad5-440d-b2b1-824b73dfaa32',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        let result = '';
                        if (!blackboard.kbData) {
                            blackboard.log.error('Problem loading kbData');
                            result = '~kbError';
                        }
                        if (blackboard.kbData.hueNeverUsed) {
                            delete blackboard.kbData.hueNeverUsed;
                            result = 'yes';
                        }
                        return result;
                    }
                }
            };
        },
        '0d8d595d-ef8b-4d32-9c24-efe13d3c277d': function () {
            return {
                'id': '0d8d595d-ef8b-4d32-9c24-efe13d3c277d',
                'name': 'Any Unknown Bridges?',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '0d8d595d-ef8b-4d32-9c24-efe13d3c277d',
                        'to': 'f5e5e3c5-bbe1-4835-85fd-36d9645b7ece',
                        'value': 'yes'
                    },
                    {
                        'frm': '0d8d595d-ef8b-4d32-9c24-efe13d3c277d',
                        'to': '33afbde8-51f1-41d1-8590-9dba48cda347',
                        'value': 'no'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.log.info('Checking for unknown and updated hue bridges.');
                        blackboard.hueControler.getUnknownBridges().then(unknownBridges => {
                            blackboard.unknownHueBridges = unknownBridges;
                            blackboard.unknownHueBridgesUpdated = new Date().getTime();
                            let result = '~error';
                            if (unknownBridges.length > 0) {
                                blackboard.log.info('Found Bridge(s): ', blackboard.unknownHueBridges);
                                result = 'yes';
                            } else if (blackboard.unknownHueBridges.length === 0) {
                                blackboard.log.info('No new bridges: ', blackboard.unknownHueBridges);
                                result = 'no';
                            } else {
                                blackboard.log.info('Found Something Else: ', blackboard.unknownHueBridges);
                            }
                            blackboard.log.info('checking for unknown and updated hue bridges result: ', result);
                            done(result);
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '33afbde8-51f1-41d1-8590-9dba48cda347': function () {
            return {
                'id': '33afbde8-51f1-41d1-8590-9dba48cda347',
                'name': 'Lights Control Are Lights',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '33afbde8-51f1-41d1-8590-9dba48cda347',
                        'to': '50598351-89b2-452a-b0c3-e48b6986e2d7',
                        'value': 'no'
                    },
                    {
                        'frm': '33afbde8-51f1-41d1-8590-9dba48cda347',
                        'to': '1e55c11e-781d-44b4-a8d3-62fd0c2753e0',
                        'value': 'yes'
                    }
                ],
                'exceptions': [],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/LightsControlAreLights.mim',
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
        '50598351-89b2-452a-b0c3-e48b6986e2d7': function () {
            return {
                'id': '50598351-89b2-452a-b0c3-e48b6986e2d7',
                'name': 'Lights Control Need Lights',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '50598351-89b2-452a-b0c3-e48b6986e2d7',
                        'to': '23035de8-324b-408c-8da0-45a1337f982a',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsControlNeedLights.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '1e55c11e-781d-44b4-a8d3-62fd0c2753e0': function () {
            return {
                'id': '1e55c11e-781d-44b4-a8d3-62fd0c2753e0',
                'name': 'Lights Control Must Setup ERROR SCREEN',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '1e55c11e-781d-44b4-a8d3-62fd0c2753e0',
                        'to': '23035de8-324b-408c-8da0-45a1337f982a',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsControlMustSetup.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'f5e5e3c5-bbe1-4835-85fd-36d9645b7ece': function () {
            return {
                'id': 'f5e5e3c5-bbe1-4835-85fd-36d9645b7ece',
                'name': 'Lights Control Want To Setup',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'f5e5e3c5-bbe1-4835-85fd-36d9645b7ece',
                        'to': '1d348925-c645-410a-8610-b8baeda5535a',
                        'value': 'yes'
                    },
                    {
                        'frm': 'f5e5e3c5-bbe1-4835-85fd-36d9645b7ece',
                        'to': '9a7e9eb4-c3df-439d-a1ac-ecde6123d0a7',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/LightsControlWantToSetup.mim',
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
        '9a7e9eb4-c3df-439d-a1ac-ecde6123d0a7': function () {
            return {
                'id': '9a7e9eb4-c3df-439d-a1ac-ecde6123d0a7',
                'name': 'Lights Control Setup Later',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '9a7e9eb4-c3df-439d-a1ac-ecde6123d0a7',
                        'to': '23035de8-324b-408c-8da0-45a1337f982a',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsControlSetupLater.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '7ef25a71-4ffe-4481-8628-4ee11f6a17f1': function () {
            return {
                'id': '7ef25a71-4ffe-4481-8628-4ee11f6a17f1',
                'name': '~',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '7ef25a71-4ffe-4481-8628-4ee11f6a17f1',
                        'to': 'e169c899-e631-453c-b6ce-96d06bec961d',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Catch',
                'options': {
                    'getTransition': (exception, payload) => {
                        blackboard.log.error('Something leaked, Caught Exception: ', exception, payload);
                        return '';
                    }
                }
            };
        },
        '1d8b6112-d7b2-4065-8e73-35ab4e5dce67': function () {
            return {
                'id': '1d8b6112-d7b2-4065-8e73-35ab4e5dce67',
                'name': '~error',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '1d8b6112-d7b2-4065-8e73-35ab4e5dce67',
                        'to': 'e169c899-e631-453c-b6ce-96d06bec961d',
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
        'e169c899-e631-453c-b6ce-96d06bec961d': function () {
            return {
                'id': 'e169c899-e631-453c-b6ce-96d06bec961d',
                'name': 'Other',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return 'other';
                    }
                }
            };
        },
        '23035de8-324b-408c-8da0-45a1337f982a': function () {
            return {
                'id': '23035de8-324b-408c-8da0-45a1337f982a',
                'name': 'Idle',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return 'idle';
                    }
                }
            };
        },
        '8aed2570-c87b-49df-9817-06335ab7bf4b': function () {
            return {
                'id': '8aed2570-c87b-49df-9817-06335ab7bf4b',
                'name': 'Lights Control First Time',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '8aed2570-c87b-49df-9817-06335ab7bf4b',
                        'to': '62322201-8ad5-440d-b2b1-824b73dfaa32',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsControlFirstTime.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '3a46df31-2a91-46ba-89c3-abecb97034c1': function () {
            return {
                'id': '3a46df31-2a91-46ba-89c3-abecb97034c1',
                'name': 'Group active on Bridge, or Default',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '3a46df31-2a91-46ba-89c3-abecb97034c1',
                        'to': '840afb32-200c-4a26-b521-860dc11b8ef1',
                        'value': ''
                    },
                    {
                        'frm': '3a46df31-2a91-46ba-89c3-abecb97034c1',
                        'to': 'd2af952a-a440-4e02-a1e8-6908c56895a1',
                        'value': 'yes'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        blackboard.targetedGroups = [];
                        blackboard.log.info('Checking groups for blackboard.launchGroup:', blackboard.launchGroup);
                        if (blackboard.launchGroup) {
                            blackboard.targetedGroups = blackboard.hueControler.checkForGroupsByLaunchGroup(blackboard.launchGroup);
                        } else if (blackboard.hueControler.defaultGroupInfo) {
                            blackboard.log.info('No launchGroup given, using default group.');
                            blackboard.targetedGroups = [blackboard.hueControler.defaultGroupInfo];
                        } else if (!blackboard.hueControler.defaultGroupInfo) {
                            blackboard.log.info('No defaultGroupInfo. How did that happen?');
                        }
                        blackboard.log.info('Group Loading result, blackboard.targetedGroups:', blackboard.targetedGroups);
                        if (blackboard.targetedGroups.length > 1) {
                            return 'yes';
                        } else if (blackboard.targetedGroups.length > 0) {
                            return 'yes';
                        }
                        return '';
                    }
                }
            };
        },
        '840afb32-200c-4a26-b521-860dc11b8ef1': function () {
            return {
                'id': '840afb32-200c-4a26-b521-860dc11b8ef1',
                'name': 'Lights Control Invalid Group',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '840afb32-200c-4a26-b521-860dc11b8ef1',
                        'to': 'dd086190-6b0f-4498-a8af-172903e3dde5',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsControlInvalidGroup.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '1d348925-c645-410a-8610-b8baeda5535a': function () {
            return {
                'id': '1d348925-c645-410a-8610-b8baeda5535a',
                'name': 'lightsSetup',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return 'lightsSetup';
                    }
                }
            };
        },
        '62322201-8ad5-440d-b2b1-824b73dfaa32': function () {
            return {
                'id': '62322201-8ad5-440d-b2b1-824b73dfaa32',
                'name': 'Passed',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return 'passed';
                    }
                }
            };
        },
        '8714ed7a-3cf3-4661-a9d6-62e8ab03a29d': function () {
            return {
                'id': '8714ed7a-3cf3-4661-a9d6-62e8ab03a29d',
                'name': 'Update Bridges then Groups',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '8714ed7a-3cf3-4661-a9d6-62e8ab03a29d',
                        'to': 'f283f9b9-1f21-4d58-b410-7caf33332023',
                        'value': ''
                    },
                    {
                        'frm': '8714ed7a-3cf3-4661-a9d6-62e8ab03a29d',
                        'to': '85ae3398-4577-49e3-8905-77670bbc3cea',
                        'value': 'hue0cc'
                    },
                    {
                        'frm': '8714ed7a-3cf3-4661-a9d6-62e8ab03a29d',
                        'to': 'ad33aa9e-116b-41c3-89e3-9e6c035dca11',
                        'value': 'hue3cc'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.log.info('Control Check Updating hue bridges.');
                        blackboard.hueControler.getUnknownBridges().then(unknownBridges => {
                            blackboard.unknownHueBridges = unknownBridges;
                            blackboard.unknownHueBridgesUpdated = new Date().getTime();
                            blackboard.log.info('Control Check Updating hue groups.');
                            return blackboard.hueControler.updateGroupsInformation().then(result => {
                                done('');
                            }).catch(err => {
                                blackboard.log.warn('Problem updateGroupsInformation', err);
                                done('hue3cc');
                            });
                        }).catch(err => {
                            blackboard.log.warn('Problem getUnknownBridges', err);
                            done('hue0cc');
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'dd086190-6b0f-4498-a8af-172903e3dde5': function () {
            return {
                'id': 'dd086190-6b0f-4498-a8af-172903e3dde5',
                'name': 'Idle',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return 'idle';
                    }
                }
            };
        },
        'f283f9b9-1f21-4d58-b410-7caf33332023': function () {
            return {
                'id': 'f283f9b9-1f21-4d58-b410-7caf33332023',
                'name': 'Want to change default group info?',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'f283f9b9-1f21-4d58-b410-7caf33332023',
                        'to': '3a46df31-2a91-46ba-89c3-abecb97034c1',
                        'value': ''
                    },
                    {
                        'frm': 'f283f9b9-1f21-4d58-b410-7caf33332023',
                        'to': 'a5a848d7-8b31-47ef-824c-c145f3eee2b8',
                        'value': 'yes'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        if (blackboard.launchIntent === 'lightsSetupDefaultGroup') {
                            return 'yes';
                        }
                        return '';
                    }
                }
            };
        },
        'a5a848d7-8b31-47ef-824c-c145f3eee2b8': function () {
            return {
                'id': 'a5a848d7-8b31-47ef-824c-c145f3eee2b8',
                'name': 'lightsSetupDefaultGroup',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return 'lightsSetupDefaultGroup';
                    }
                }
            };
        },
        '85ae3398-4577-49e3-8905-77670bbc3cea': function () {
            return {
                'id': '85ae3398-4577-49e3-8905-77670bbc3cea',
                'name': 'Lights Control Must Setup ERROR SCREEN',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '85ae3398-4577-49e3-8905-77670bbc3cea',
                        'to': '0a21d58d-f201-46cf-80bf-28f4c9df52e6',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsControlMustSetup.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '0a21d58d-f201-46cf-80bf-28f4c9df52e6': function () {
            return {
                'id': '0a21d58d-f201-46cf-80bf-28f4c9df52e6',
                'name': 'Idle',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return 'idle';
                    }
                }
            };
        },
        'ad33aa9e-116b-41c3-89e3-9e6c035dca11': function () {
            return {
                'id': 'ad33aa9e-116b-41c3-89e3-9e6c035dca11',
                'name': 'Lights Control Updating Group Info ERROR SCREEN',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'ad33aa9e-116b-41c3-89e3-9e6c035dca11',
                        'to': '0a21d58d-f201-46cf-80bf-28f4c9df52e6',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsControlUpdatingGroupInfo.mim',
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
            'name': 'DeleteHueData',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/hue-control/src/flows/DeleteHueData.flow'
        },
        'f745c283-82f8-4e73-a108-656159613b2b': function () {
            return {
                'id': 'f745c283-82f8-4e73-a108-656159613b2b',
                'name': 'Set Delete Flag',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'f745c283-82f8-4e73-a108-656159613b2b',
                        'to': '604005b0-5a26-46cd-9710-9f42ad90a3b4',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        blackboard.lightsForget = true;
                        blackboard.log.info('Hue Data Deletion Confirmed. blackboard.lightsForget: ', blackboard.lightsForget);
                        return '';
                    }
                }
            };
        },
        '572930af-0501-4ad8-b751-f7dc0c6cbdbc': function () {
            return {
                'id': '572930af-0501-4ad8-b751-f7dc0c6cbdbc',
                'name': 'Lights Delete Confirmed',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '572930af-0501-4ad8-b751-f7dc0c6cbdbc',
                        'to': 'f745c283-82f8-4e73-a108-656159613b2b',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsDeleteDataConfirmed.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'acdf8d85-4925-4693-91c5-a228e38d6586': function () {
            return {
                'id': 'acdf8d85-4925-4693-91c5-a228e38d6586',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'acdf8d85-4925-4693-91c5-a228e38d6586',
                        'to': '675c4fce-908f-4d43-b533-ba73561ae9f4',
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
        '675c4fce-908f-4d43-b533-ba73561ae9f4': function () {
            return {
                'id': '675c4fce-908f-4d43-b533-ba73561ae9f4',
                'name': 'Lights Delete Confirmation',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '675c4fce-908f-4d43-b533-ba73561ae9f4',
                        'to': '572930af-0501-4ad8-b751-f7dc0c6cbdbc',
                        'value': 'yes'
                    },
                    {
                        'frm': '675c4fce-908f-4d43-b533-ba73561ae9f4',
                        'to': 'c5701466-8fba-4e8c-bc0d-e2859e0badee',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/LightsDeleteDataConfirmation.mim',
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
        '604005b0-5a26-46cd-9710-9f42ad90a3b4': function () {
            return {
                'id': '604005b0-5a26-46cd-9710-9f42ad90a3b4',
                'name': 'Idle',
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
        'c5701466-8fba-4e8c-bc0d-e2859e0badee': function () {
            return {
                'id': 'c5701466-8fba-4e8c-bc0d-e2859e0badee',
                'name': 'Lights Delete Canceled',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'c5701466-8fba-4e8c-bc0d-e2859e0badee',
                        'to': '324bc2e8-4651-41e0-b4f8-d01dafd42f3b',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsDeleteDataCanceled.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '324bc2e8-4651-41e0-b4f8-d01dafd42f3b': function () {
            return {
                'id': '324bc2e8-4651-41e0-b4f8-d01dafd42f3b',
                'name': 'Confirm Delete Flag False',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '324bc2e8-4651-41e0-b4f8-d01dafd42f3b',
                        'to': '604005b0-5a26-46cd-9710-9f42ad90a3b4',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        blackboard.lightsForget = false;
                        blackboard.log.info('Hue Data Deletion Canceled. blackboard.lightsForget: ', blackboard.lightsForget);
                        return '';
                    }
                }
            };
        },
        '7ef25a71-4ffe-4481-8628-4ee11f6a17f1': function () {
            return {
                'id': '7ef25a71-4ffe-4481-8628-4ee11f6a17f1',
                'name': '~',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '7ef25a71-4ffe-4481-8628-4ee11f6a17f1',
                        'to': 'e169c899-e631-453c-b6ce-96d06bec961d',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Catch',
                'options': {
                    'getTransition': (exception, payload) => {
                        blackboard.log.error('Something leaked, Caught Exception: ', exception, payload);
                        return '';
                    }
                }
            };
        },
        '1d8b6112-d7b2-4065-8e73-35ab4e5dce67': function () {
            return {
                'id': '1d8b6112-d7b2-4065-8e73-35ab4e5dce67',
                'name': '~error',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '1d8b6112-d7b2-4065-8e73-35ab4e5dce67',
                        'to': 'e169c899-e631-453c-b6ce-96d06bec961d',
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
        'e169c899-e631-453c-b6ce-96d06bec961d': function () {
            return {
                'id': 'e169c899-e631-453c-b6ce-96d06bec961d',
                'name': 'Other',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return 'Other';
                    }
                }
            };
        }
    };
};
},{}],7:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'HueTutorial',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/hue-control/src/flows/HueTutorial.flow'
        },
        '7ef25a71-4ffe-4481-8628-4ee11f6a17f1': function () {
            return {
                'id': '7ef25a71-4ffe-4481-8628-4ee11f6a17f1',
                'name': '~',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '7ef25a71-4ffe-4481-8628-4ee11f6a17f1',
                        'to': 'e169c899-e631-453c-b6ce-96d06bec961d',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Catch',
                'options': {
                    'getTransition': (exception, payload) => {
                        blackboard.log.error('Something leaked, Caught Exception: ', exception, payload);
                        return '';
                    }
                }
            };
        },
        '1d8b6112-d7b2-4065-8e73-35ab4e5dce67': function () {
            return {
                'id': '1d8b6112-d7b2-4065-8e73-35ab4e5dce67',
                'name': '~error',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '1d8b6112-d7b2-4065-8e73-35ab4e5dce67',
                        'to': 'e169c899-e631-453c-b6ce-96d06bec961d',
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
        'e169c899-e631-453c-b6ce-96d06bec961d': function () {
            return {
                'id': 'e169c899-e631-453c-b6ce-96d06bec961d',
                'name': 'Other',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return 'Other';
                    }
                }
            };
        },
        '4739aab2-b5e9-4957-8f75-bd696a61135a': function () {
            return {
                'id': '4739aab2-b5e9-4957-8f75-bd696a61135a',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '4739aab2-b5e9-4957-8f75-bd696a61135a',
                        'to': '1d89cf96-cde6-4e9d-9db9-33dc8ea5d16a',
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
        '80ff850a-8e93-4a9a-91c5-5dfa870553c3': function () {
            return {
                'id': '80ff850a-8e93-4a9a-91c5-5dfa870553c3',
                'name': 'Idle',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return 'idle';
                    }
                }
            };
        },
        '1d89cf96-cde6-4e9d-9db9-33dc8ea5d16a': function () {
            return {
                'id': '1d89cf96-cde6-4e9d-9db9-33dc8ea5d16a',
                'name': 'Known bridge in KB?',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '1d89cf96-cde6-4e9d-9db9-33dc8ea5d16a',
                        'to': 'f64d8e0c-1444-459f-a61e-79f141caed19',
                        'value': 'yes'
                    },
                    {
                        'frm': '1d89cf96-cde6-4e9d-9db9-33dc8ea5d16a',
                        'to': '3c70aee0-0e38-4544-bbe9-3bc395ecdc71',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        let result = 'no';
                        if (blackboard.hueControler.appAccounts.length >= 1) {
                            result = 'yes';
                        }
                        blackboard.log.info('Control check, is there a known bridge? ', result);
                        return result;
                    }
                }
            };
        },
        'f64d8e0c-1444-459f-a61e-79f141caed19': function () {
            return {
                'id': 'f64d8e0c-1444-459f-a61e-79f141caed19',
                'name': 'Lights Tutorial Bridge',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'f64d8e0c-1444-459f-a61e-79f141caed19',
                        'to': '80ff850a-8e93-4a9a-91c5-5dfa870553c3',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsTutorialBridge.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '3c70aee0-0e38-4544-bbe9-3bc395ecdc71': function () {
            return {
                'id': '3c70aee0-0e38-4544-bbe9-3bc395ecdc71',
                'name': 'Lights Tutorial No Bridge',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '3c70aee0-0e38-4544-bbe9-3bc395ecdc71',
                        'to': '80ff850a-8e93-4a9a-91c5-5dfa870553c3',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsTutorialNoBridge.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        }
    };
};
},{}],8:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'Main',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/hue-control/src/flows/Main.flow'
        },
        '2f8efb12-9c6d-4f9b-82be-021699fb7591': function () {
            return {
                'id': '2f8efb12-9c6d-4f9b-82be-021699fb7591',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '2f8efb12-9c6d-4f9b-82be-021699fb7591',
                        'to': '426269b4-8fba-4695-bf9c-8493736e62c8',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Begin',
                'options': {
                    'inputParameters': () => {
                        blackboard.log.info('Begin HueControl Main Flow');
                        return {};
                    }
                }
            };
        },
        '82f6052b-53a9-4a98-a6e2-b11950ace1b2': function () {
            return {
                'id': '82f6052b-53a9-4a98-a6e2-b11950ace1b2',
                'name': 'End',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        blackboard.log.info('exit main', this.inTransition);
                        blackboard.log.info('End HueControl Main Flow');
                        return;
                    }
                }
            };
        },
        '0530b128-ef6c-49f2-9802-a87859b720e5': function () {
            return {
                'id': '0530b128-ef6c-49f2-9802-a87859b720e5',
                'name': 'Setup',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '0530b128-ef6c-49f2-9802-a87859b720e5',
                        'to': '82f6052b-53a9-4a98-a6e2-b11950ace1b2',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./Setup');
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
        '7ef25a71-4ffe-4481-8628-4ee11f6a17f1': function () {
            return {
                'id': '7ef25a71-4ffe-4481-8628-4ee11f6a17f1',
                'name': '~',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '7ef25a71-4ffe-4481-8628-4ee11f6a17f1',
                        'to': 'e169c899-e631-453c-b6ce-96d06bec961d',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Catch',
                'options': {
                    'getTransition': (exception, payload) => {
                        blackboard.log.error('Something leaked, Caught Exception: ', exception, payload);
                        return '';
                    }
                }
            };
        },
        'e169c899-e631-453c-b6ce-96d06bec961d': function () {
            return {
                'id': 'e169c899-e631-453c-b6ce-96d06bec961d',
                'name': 'Other',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return 'Other';
                    }
                }
            };
        },
        '1d8b6112-d7b2-4065-8e73-35ab4e5dce67': function () {
            return {
                'id': '1d8b6112-d7b2-4065-8e73-35ab4e5dce67',
                'name': '~error',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '1d8b6112-d7b2-4065-8e73-35ab4e5dce67',
                        'to': 'e169c899-e631-453c-b6ce-96d06bec961d',
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
        '74607cf1-27fa-409c-ac9b-6fcb2699a200': function () {
            return {
                'id': '74607cf1-27fa-409c-ac9b-6fcb2699a200',
                'name': '~kbError',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '74607cf1-27fa-409c-ac9b-6fcb2699a200',
                        'to': 'c630f450-4b6f-42aa-b94a-e3096d39a611',
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
        'c630f450-4b6f-42aa-b94a-e3096d39a611': function () {
            return {
                'id': 'c630f450-4b6f-42aa-b94a-e3096d39a611',
                'name': 'KB Error',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'c630f450-4b6f-42aa-b94a-e3096d39a611',
                        'to': 'e169c899-e631-453c-b6ce-96d06bec961d',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'TextToSpeech',
                'options': {
                    'words': 'I had an error loading the knowledge base.',
                    'onWord': word => {
                    }
                }
            };
        },
        'c216787e-db08-4df3-a6d5-73f71db28e68': function () {
            return {
                'id': 'c216787e-db08-4df3-a6d5-73f71db28e68',
                'name': 'ControlCheck',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'c216787e-db08-4df3-a6d5-73f71db28e68',
                        'to': '0530b128-ef6c-49f2-9802-a87859b720e5',
                        'value': 'lightsSetup'
                    },
                    {
                        'frm': 'c216787e-db08-4df3-a6d5-73f71db28e68',
                        'to': '82f6052b-53a9-4a98-a6e2-b11950ace1b2',
                        'value': ''
                    },
                    {
                        'frm': 'c216787e-db08-4df3-a6d5-73f71db28e68',
                        'to': 'd509d1b6-4730-4929-bed9-64d4c324700f',
                        'value': 'passed'
                    },
                    {
                        'frm': 'c216787e-db08-4df3-a6d5-73f71db28e68',
                        'to': 'fc6f7519-4ac1-4a74-858a-09b86ff2a7c8',
                        'value': 'lightsSetupDefaultGroup'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./ControlCheck');
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
        '426269b4-8fba-4695-bf9c-8493736e62c8': function () {
            return {
                'id': '426269b4-8fba-4695-bf9c-8493736e62c8',
                'name': 'Check for lightSetup intent.',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '426269b4-8fba-4695-bf9c-8493736e62c8',
                        'to': 'c216787e-db08-4df3-a6d5-73f71db28e68',
                        'value': ''
                    },
                    {
                        'frm': '426269b4-8fba-4695-bf9c-8493736e62c8',
                        'to': '0530b128-ef6c-49f2-9802-a87859b720e5',
                        'value': 'lightsSetup'
                    },
                    {
                        'frm': '426269b4-8fba-4695-bf9c-8493736e62c8',
                        'to': 'a2bd7213-f783-41a0-836b-5bbe1507c215',
                        'value': 'lightsHowTo'
                    },
                    {
                        'frm': '426269b4-8fba-4695-bf9c-8493736e62c8',
                        'to': '3dd26de7-a513-4bcd-8887-2c9c5c3b220c',
                        'value': 'lightsDeleteData'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        if (blackboard.launchIntent === 'lightsSetup') {
                            blackboard.log.info('launchIntent is setup, skipping ControlCheck: ', blackboard.launchIntent);
                            return blackboard.launchIntent;
                        } else if (blackboard.launchIntent === 'lightsHowTo') {
                            blackboard.log.info('launchIntent is tutorial, skipping ControlCheck: ', blackboard.launchIntent);
                            return blackboard.launchIntent;
                        } else if (blackboard.launchIntent === 'lightsDeleteData') {
                            blackboard.log.info('launchIntent is delete, confirming.');
                            return blackboard.launchIntent;
                        }
                        return '';
                    }
                }
            };
        },
        'fc6f7519-4ac1-4a74-858a-09b86ff2a7c8': function () {
            return {
                'id': 'fc6f7519-4ac1-4a74-858a-09b86ff2a7c8',
                'name': 'SetupDefaultGroup',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'fc6f7519-4ac1-4a74-858a-09b86ff2a7c8',
                        'to': '82f6052b-53a9-4a98-a6e2-b11950ace1b2',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./SetupDefaultGroup');
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
        'a2bd7213-f783-41a0-836b-5bbe1507c215': function () {
            return {
                'id': 'a2bd7213-f783-41a0-836b-5bbe1507c215',
                'name': 'HueTutorial',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'a2bd7213-f783-41a0-836b-5bbe1507c215',
                        'to': '82f6052b-53a9-4a98-a6e2-b11950ace1b2',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./HueTutorial');
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
        'd509d1b6-4730-4929-bed9-64d4c324700f': function () {
            return {
                'id': 'd509d1b6-4730-4929-bed9-64d4c324700f',
                'name': 'Command',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'd509d1b6-4730-4929-bed9-64d4c324700f',
                        'to': '9ec6804e-43b9-4e94-9af6-6ac203fa9f23',
                        'value': 'post'
                    },
                    {
                        'frm': 'd509d1b6-4730-4929-bed9-64d4c324700f',
                        'to': '82f6052b-53a9-4a98-a6e2-b11950ace1b2',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./Command');
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
        '9ec6804e-43b9-4e94-9af6-6ac203fa9f23': function () {
            return {
                'id': '9ec6804e-43b9-4e94-9af6-6ac203fa9f23',
                'name': 'PostControl',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '9ec6804e-43b9-4e94-9af6-6ac203fa9f23',
                        'to': '82f6052b-53a9-4a98-a6e2-b11950ace1b2',
                        'value': ''
                    },
                    {
                        'frm': '9ec6804e-43b9-4e94-9af6-6ac203fa9f23',
                        'to': 'd509d1b6-4730-4929-bed9-64d4c324700f',
                        'value': 'command'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./PostControl');
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
        '3dd26de7-a513-4bcd-8887-2c9c5c3b220c': function () {
            return {
                'id': '3dd26de7-a513-4bcd-8887-2c9c5c3b220c',
                'name': 'DeleteHueData',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '3dd26de7-a513-4bcd-8887-2c9c5c3b220c',
                        'to': '82f6052b-53a9-4a98-a6e2-b11950ace1b2',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./DeleteHueData');
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
},{"./Command":4,"./ControlCheck":5,"./DeleteHueData":6,"./HueTutorial":7,"./PostControl":9,"./Setup":10,"./SetupDefaultGroup":11}],9:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'PostControl',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/hue-control/src/flows/PostControl.flow'
        },
        '4774f980-aae4-49a0-a312-0ea6d1169204': function () {
            return {
                'id': '4774f980-aae4-49a0-a312-0ea6d1169204',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '4774f980-aae4-49a0-a312-0ea6d1169204',
                        'to': 'c63426b4-64cb-47c8-8339-08d3c5d9ea05',
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
        'c2dbc4e7-dd3d-4474-8fad-de0bb0b0ed9b': function () {
            return {
                'id': 'c2dbc4e7-dd3d-4474-8fad-de0bb0b0ed9b',
                'name': 'Idle',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return 'idle';
                    }
                }
            };
        },
        '5a4575b2-72e9-4ca9-9253-5152f2045943': function () {
            return {
                'id': '5a4575b2-72e9-4ca9-9253-5152f2045943',
                'name': 'Lights Post Control',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '5a4575b2-72e9-4ca9-9253-5152f2045943',
                        'to': 'f031df05-a7db-4e2f-8251-243ed8ef83a2',
                        'value': 'lightsDown'
                    },
                    {
                        'frm': '5a4575b2-72e9-4ca9-9253-5152f2045943',
                        'to': 'f031df05-a7db-4e2f-8251-243ed8ef83a2',
                        'value': 'lightsWarm'
                    },
                    {
                        'frm': '5a4575b2-72e9-4ca9-9253-5152f2045943',
                        'to': 'f031df05-a7db-4e2f-8251-243ed8ef83a2',
                        'value': 'lightsCool'
                    },
                    {
                        'frm': '5a4575b2-72e9-4ca9-9253-5152f2045943',
                        'to': 'f031df05-a7db-4e2f-8251-243ed8ef83a2',
                        'value': 'lightsOff'
                    },
                    {
                        'frm': '5a4575b2-72e9-4ca9-9253-5152f2045943',
                        'to': 'f031df05-a7db-4e2f-8251-243ed8ef83a2',
                        'value': 'lightsOn'
                    },
                    {
                        'frm': '5a4575b2-72e9-4ca9-9253-5152f2045943',
                        'to': 'f031df05-a7db-4e2f-8251-243ed8ef83a2',
                        'value': 'lightsUpCompletely'
                    },
                    {
                        'frm': '5a4575b2-72e9-4ca9-9253-5152f2045943',
                        'to': 'f031df05-a7db-4e2f-8251-243ed8ef83a2',
                        'value': 'lightsUp'
                    },
                    {
                        'frm': '5a4575b2-72e9-4ca9-9253-5152f2045943',
                        'to': 'c2dbc4e7-dd3d-4474-8fad-de0bb0b0ed9b',
                        'value': ''
                    },
                    {
                        'frm': '5a4575b2-72e9-4ca9-9253-5152f2045943',
                        'to': 'c63426b4-64cb-47c8-8339-08d3c5d9ea05',
                        'value': 'noMatch'
                    },
                    {
                        'frm': '5a4575b2-72e9-4ca9-9253-5152f2045943',
                        'to': 'f031df05-a7db-4e2f-8251-243ed8ef83a2',
                        'value': 'lightsColor'
                    }
                ],
                'exceptions': [],
                'class': 'Mim.Optional-Response',
                'options': {
                    'mimPath': 'mims/en-us/LightsPostControl.mim',
                    'getPromptData': () => {
                        return {};
                    },
                    'onStatus': status => {
                        let mimState = status.state;
                        let asrResults = status.asrResults;
                        let speakerIds = status.speakerIds;
                    },
                    'onSuccess': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let speakerIds = results.speakerIds;
                        let transition = results.firstGrammarTag;
                        if (asrResults.entities.color) {
                            notepad.postColor = asrResults.entities.color;
                        }
                        return transition;
                    }
                }
            };
        },
        'c63426b4-64cb-47c8-8339-08d3c5d9ea05': function () {
            return {
                'id': 'c63426b4-64cb-47c8-8339-08d3c5d9ea05',
                'name': 'Post Control Loop < 4',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'c63426b4-64cb-47c8-8339-08d3c5d9ea05',
                        'to': '5a4575b2-72e9-4ca9-9253-5152f2045943',
                        'value': ''
                    },
                    {
                        'frm': 'c63426b4-64cb-47c8-8339-08d3c5d9ea05',
                        'to': 'c2dbc4e7-dd3d-4474-8fad-de0bb0b0ed9b',
                        'value': 'done'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        blackboard.postControlCount = blackboard.postControlCount ? blackboard.postControlCount : 0;
                        blackboard.log.info('PostControl inTransition, loopCount: ', this.inTransition, blackboard.postControlCount);
                        if (blackboard.postControlCount > 3) {
                            delete blackboard.postControlCount;
                            blackboard.log.info('PostControl looped out, done');
                            return 'done';
                        }
                        if (this.inTransition === 'noMatch') {
                            delete blackboard.postControlCount;
                            blackboard.log.info('PostControl was a noMatch, done.');
                            return 'done';
                        }
                        blackboard.postControlCount = blackboard.postControlCount + 1;
                        return '';
                    }
                }
            };
        },
        'bd735010-9e33-4154-8271-f5c6441b75b3': function () {
            return {
                'id': 'bd735010-9e33-4154-8271-f5c6441b75b3',
                'name': 'Command',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return 'command';
                    }
                }
            };
        },
        'f031df05-a7db-4e2f-8251-243ed8ef83a2': function () {
            return {
                'id': 'f031df05-a7db-4e2f-8251-243ed8ef83a2',
                'name': 'Match Intent to Command.',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'f031df05-a7db-4e2f-8251-243ed8ef83a2',
                        'to': 'bd735010-9e33-4154-8271-f5c6441b75b3',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.log.info('Post control setting blackboard.launchIntent: ', blackboard.launchIntent);
                        blackboard.launchIntent = this.inTransition;
                        blackboard.launchColor = '';
                        if (notepad.postColor) {
                            blackboard.launchColor = notepad.postColor;
                            blackboard.log.info('Post control setting blackboard.launchColor: ', blackboard.launchColor);
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
},{}],10:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'Setup',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/hue-control/src/flows/Setup.flow'
        },
        '9d3b5b0f-823d-4f3b-aa71-0ceebc6d3567': function () {
            return {
                'id': '9d3b5b0f-823d-4f3b-aa71-0ceebc6d3567',
                'name': 'QueryKB: hueJustSetup',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '9d3b5b0f-823d-4f3b-aa71-0ceebc6d3567',
                        'to': '36198b1b-f2fd-4730-b2ef-d0b062ae6bfc',
                        'value': 'true'
                    },
                    {
                        'frm': '9d3b5b0f-823d-4f3b-aa71-0ceebc6d3567',
                        'to': 'ef794813-26fe-43c7-acc4-683db493caf5',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        let result = '~error';
                        let now = new Date().getTime();
                        let setup = blackboard.kbData.hueJustSetup ? blackboard.kbData.hueJustSetup : now;
                        if (now - setup >= blackboard.waitToSetupMili) {
                            blackboard.log.info('KB indicates bridge was setup was tried more than 8 hours ago.');
                            result = true;
                        } else {
                            result = false;
                        }
                        return result;
                    }
                }
            };
        },
        '0d8d595d-ef8b-4d32-9c24-efe13d3c277d': function () {
            return {
                'id': '0d8d595d-ef8b-4d32-9c24-efe13d3c277d',
                'name': 'Check for Unknown Bridges Results.',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '0d8d595d-ef8b-4d32-9c24-efe13d3c277d',
                        'to': '304a1508-95d5-4cc9-962f-d2e843fec0af',
                        'value': '0'
                    },
                    {
                        'frm': '0d8d595d-ef8b-4d32-9c24-efe13d3c277d',
                        'to': '85927686-4824-4e7d-a7e4-9410bf141e3a',
                        'value': ''
                    },
                    {
                        'frm': '0d8d595d-ef8b-4d32-9c24-efe13d3c277d',
                        'to': '1d64d6a5-29be-42f0-bb56-4680a76b9eb4',
                        'value': '1'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.hueScan.then(() => {
                            if (blackboard.unknownHueBridges && blackboard.unknownHueBridges != 'BAD') {
                                done(blackboard.unknownHueBridges.length);
                            } else {
                                blackboard.log.error('Check for UnknownHueBridges not defined: ', blackboard.unknownHueBridges);
                                done('~error');
                            }
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'a870df56-5284-46e3-b29e-503507b4d728': function () {
            return {
                'id': 'a870df56-5284-46e3-b29e-503507b4d728',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'a870df56-5284-46e3-b29e-503507b4d728',
                        'to': 'fbb03a68-7b83-4c76-913a-2b4d6a6446d6',
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
        '7ef1871f-108b-456e-a3ca-6d906ac7fc1e': function () {
            return {
                'id': '7ef1871f-108b-456e-a3ca-6d906ac7fc1e',
                'name': 'Redgister Bot on Bridge',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '7ef1871f-108b-456e-a3ca-6d906ac7fc1e',
                        'to': '8148dfdc-25c6-4e39-a3f2-dc268aa8574a',
                        'value': 'press'
                    },
                    {
                        'frm': '7ef1871f-108b-456e-a3ca-6d906ac7fc1e',
                        'to': '2d4957aa-05d9-4424-88e9-83da8e6913c4',
                        'value': 'created'
                    },
                    {
                        'frm': '7ef1871f-108b-456e-a3ca-6d906ac7fc1e',
                        'to': '8148dfdc-25c6-4e39-a3f2-dc268aa8574a',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        blackboard.hueControler.registerBot(blackboard.newHueBridge).then(result => {
                            if (result === 'created') {
                                blackboard.kbData.hueJustSetup = null;
                                blackboard.log.info('Bridge account created, clearing blackboard.kbData.hueJustSetup: ', blackboard.kbData.hueJustSetup);
                                blackboard.setupFailureRetries = null;
                                blackboard.setupMoreTimeRetries = null;
                                if (blackboard.hueControler.appAccounts.length === 1) {
                                    blackboard.kbData.hueNeverUsed = true;
                                }
                                let output = result;
                                blackboard.log.info('Lights Setup, Registered App Account Updating Info');
                                blackboard.hueControler.updateGroupsInformation().then(result => {
                                    done(output);
                                });
                            }
                            if (result === 'press') {
                                blackboard.log.info('Lights Setup, Registered App Account Link Button Not Pressed');
                                done(result);
                            }
                            blackboard.log.info('Lights Setup, Registered App Account Result: ', result);
                            done(result);
                        }, err => {
                            blackboard.log.warn('Error while registering app user: ', err);
                            done('error');
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '8badbd64-8e60-4e74-9a73-f242b6a2d479': function () {
            return {
                'id': '8badbd64-8e60-4e74-9a73-f242b6a2d479',
                'name': 'Lights Setup Press Screen',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '8badbd64-8e60-4e74-9a73-f242b6a2d479',
                        'to': 'e713156e-4974-4070-baaf-a0498af90ae2',
                        'value': 'imReady'
                    },
                    {
                        'frm': '8badbd64-8e60-4e74-9a73-f242b6a2d479',
                        'to': 'ceb16607-3980-40f9-a794-1f1e5ff0f10e',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Mim.Optional-Response',
                'options': {
                    'mimPath': 'mims/en-us/LightsSetupPressScreen.mim',
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
                    }
                }
            };
        },
        '7ef25a71-4ffe-4481-8628-4ee11f6a17f1': function () {
            return {
                'id': '7ef25a71-4ffe-4481-8628-4ee11f6a17f1',
                'name': '~',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '7ef25a71-4ffe-4481-8628-4ee11f6a17f1',
                        'to': 'e169c899-e631-453c-b6ce-96d06bec961d',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Catch',
                'options': {
                    'getTransition': (exception, payload) => {
                        blackboard.log.error('Something leaked, Caught Exception: ', exception, payload);
                        return '';
                    }
                }
            };
        },
        '1d8b6112-d7b2-4065-8e73-35ab4e5dce67': function () {
            return {
                'id': '1d8b6112-d7b2-4065-8e73-35ab4e5dce67',
                'name': '~error',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '1d8b6112-d7b2-4065-8e73-35ab4e5dce67',
                        'to': 'e169c899-e631-453c-b6ce-96d06bec961d',
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
        'e169c899-e631-453c-b6ce-96d06bec961d': function () {
            return {
                'id': 'e169c899-e631-453c-b6ce-96d06bec961d',
                'name': 'Other',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return 'Other';
                    }
                }
            };
        },
        '304a1508-95d5-4cc9-962f-d2e843fec0af': function () {
            return {
                'id': '304a1508-95d5-4cc9-962f-d2e843fec0af',
                'name': 'Lights Setup No Bridges ERROR SCREEN',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '304a1508-95d5-4cc9-962f-d2e843fec0af',
                        'to': '8b3d74a3-6bf2-4901-94b3-7ee3715b2a62',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsSetupNoBridges.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'a4940d5e-a62e-43d7-97be-9ed2e1f676c4': function () {
            return {
                'id': 'a4940d5e-a62e-43d7-97be-9ed2e1f676c4',
                'name': 'Lights Setup Do Tomorrow',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'a4940d5e-a62e-43d7-97be-9ed2e1f676c4',
                        'to': '0d6316f8-8744-4770-bee2-58c585d5c7e8',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsSetupDoTomorrow.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '5bb1b157-a90d-443b-8302-83e5d4b24ac7': function () {
            return {
                'id': '5bb1b157-a90d-443b-8302-83e5d4b24ac7',
                'name': 'hueJustSetup is True',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '5bb1b157-a90d-443b-8302-83e5d4b24ac7',
                        'to': 'a4940d5e-a62e-43d7-97be-9ed2e1f676c4',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        blackboard.kbData.hueJustSetup = new Date().getTime();
                        blackboard.log.info('User indicates bridge was setup was setup today. kbData.hueJustSetup: ', blackboard.kbData.hueJustSetup);
                    }
                }
            };
        },
        'fbb03a68-7b83-4c76-913a-2b4d6a6446d6': function () {
            return {
                'id': 'fbb03a68-7b83-4c76-913a-2b4d6a6446d6',
                'name': 'Start UnknownBridge Search',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'fbb03a68-7b83-4c76-913a-2b4d6a6446d6',
                        'to': '9d3b5b0f-823d-4f3b-aa71-0ceebc6d3567',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        let recentHueScan;
                        if (blackboard.unknownHueBridgesUpdated) {
                            let now = Date.now();
                            recentHueScan = now - blackboard.unknownHueBridgesUpdated <= blackboard.bridgeScanValidForMili;
                        }
                        if (blackboard.unknownHueBridges & recentHueScan) {
                            blackboard.log.info('Starting setup, unknown hue bridge scan is fresh: ', recentHueScan);
                            blackboard.hueScan = Promise.resolve();
                            return 'skip_scan';
                        }
                        blackboard.log.info('Starting setup, seaching for unknown hue bridges.');
                        blackboard.hueScan = blackboard.hueControler.getUnknownBridges().then(unknownBridges => {
                            blackboard.unknownHueBridges = unknownBridges;
                            blackboard.unknownHueBridgesUpdated = Date.now();
                            blackboard.log.info('Found Bridge(s): ', blackboard.unknownHueBridges);
                        }).catch(err => {
                            blackboard.unknownHueBridges = 'BAD';
                        });
                    }
                }
            };
        },
        'a7ffd531-8b79-4c34-a5c4-e4092a823f77': function () {
            return {
                'id': 'a7ffd531-8b79-4c34-a5c4-e4092a823f77',
                'name': 'Lights Setup Need App',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'a7ffd531-8b79-4c34-a5c4-e4092a823f77',
                        'to': '8e28daa5-bd24-41e1-be30-5fb82d6f98f6',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsSetupNeedApp.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '8e28daa5-bd24-41e1-be30-5fb82d6f98f6': function () {
            return {
                'id': '8e28daa5-bd24-41e1-be30-5fb82d6f98f6',
                'name': 'Idle',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return 'idle';
                    }
                }
            };
        },
        'ef794813-26fe-43c7-acc4-683db493caf5': function () {
            return {
                'id': 'ef794813-26fe-43c7-acc4-683db493caf5',
                'name': 'Lights setup first time today?',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'ef794813-26fe-43c7-acc4-683db493caf5',
                        'to': '5bb1b157-a90d-443b-8302-83e5d4b24ac7',
                        'value': ''
                    },
                    {
                        'frm': 'ef794813-26fe-43c7-acc4-683db493caf5',
                        'to': '5a9115b6-f871-4298-a320-fe8580e35f9d',
                        'value': 'yes'
                    }
                ],
                'exceptions': [{
                        'frm': 'ef794813-26fe-43c7-acc4-683db493caf5',
                        'to': '5bb1b157-a90d-443b-8302-83e5d4b24ac7',
                        'value': '~InteractionError'
                    }],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/LightsSetupFirstTime.mim',
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
        '36198b1b-f2fd-4730-b2ef-d0b062ae6bfc': function () {
            return {
                'id': '36198b1b-f2fd-4730-b2ef-d0b062ae6bfc',
                'name': 'Lights Setup Have App setup?',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '36198b1b-f2fd-4730-b2ef-d0b062ae6bfc',
                        'to': '2c19aa92-3af9-4ce9-b391-09c9956d66e3',
                        'value': 'yes'
                    },
                    {
                        'frm': '36198b1b-f2fd-4730-b2ef-d0b062ae6bfc',
                        'to': 'a7ffd531-8b79-4c34-a5c4-e4092a823f77',
                        'value': ''
                    }
                ],
                'exceptions': [{
                        'frm': '36198b1b-f2fd-4730-b2ef-d0b062ae6bfc',
                        'to': 'a7ffd531-8b79-4c34-a5c4-e4092a823f77',
                        'value': '~InteractionError'
                    }],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/LightsSetupHaveApp.mim',
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
        '5a9115b6-f871-4298-a320-fe8580e35f9d': function () {
            return {
                'id': '5a9115b6-f871-4298-a320-fe8580e35f9d',
                'name': 'hueJustSetup is False',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '5a9115b6-f871-4298-a320-fe8580e35f9d',
                        'to': '36198b1b-f2fd-4730-b2ef-d0b062ae6bfc',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        blackboard.kbData.hueJustSetup = 1351483200000;
                        blackboard.log.info('User indicates bridge was setup was setup before today. kbData.hueJustSetup: ', blackboard.kbData.hueJustSetup);
                    }
                }
            };
        },
        '4fc18c1c-2085-4238-b083-1571620528f9': function () {
            return {
                'id': '4fc18c1c-2085-4238-b083-1571620528f9',
                'name': 'Lights Setup Too Long',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '4fc18c1c-2085-4238-b083-1571620528f9',
                        'to': '567157e5-576f-4f38-9125-c183fdcf5f85',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsSetupTooLong.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'bcfe0675-1040-4e8d-a47b-f30aaabfc7f2': function () {
            return {
                'id': 'bcfe0675-1040-4e8d-a47b-f30aaabfc7f2',
                'name': 'Select Bridge to Connect menu',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'bcfe0675-1040-4e8d-a47b-f30aaabfc7f2',
                        'to': '231c26b3-3708-47f1-a975-02510a8ad9b0',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        let bridgeView = blackboard.hueControler.getUnknownBridgesMenuView(blackboard.unknownHueBridges);
                        blackboard.newHueBridge = null;
                        jibo.face.views.changeView({ addView: bridgeView }, view => {
                            view.on('Pressed', data => {
                                blackboard.log.info('User Selected: ', data);
                                for (let unknownHueBridge of blackboard.unknownHueBridges) {
                                    if (unknownHueBridge.id === data.selected_id) {
                                        blackboard.newHueBridge = unknownHueBridge;
                                        blackboard.log.info('User Selection matched: ', blackboard.newHueBridge);
                                        break;
                                    }
                                }
                                jibo.timer.clearTimeout(notepad.menuTimeout);
                                jibo.face.views.removeView();
                                done('');
                            });
                            notepad.menuTimeout = jibo.timer.setTimeout(() => {
                                jibo.face.views.removeView(() => {
                                    done('~InteractionError.MenuTimeout');
                                });
                            }, 30000);
                        }, error => {
                            blackboard.log.error('Error while setting up bridge selection menu: ', error);
                            done('~MenuFailed');
                        });
                    },
                    'onStop': () => {
                        if (notepad.menuTimeout) {
                            jibo.timer.clearTimeout(notepad.menuTimeout);
                        }
                    }
                }
            };
        },
        '85927686-4824-4e7d-a7e4-9410bf141e3a': function () {
            return {
                'id': '85927686-4824-4e7d-a7e4-9410bf141e3a',
                'name': 'Lights Setup Bridge Selection',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '85927686-4824-4e7d-a7e4-9410bf141e3a',
                        'to': 'bcfe0675-1040-4e8d-a47b-f30aaabfc7f2',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsSetupBridgeSelection.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '1d64d6a5-29be-42f0-bb56-4680a76b9eb4': function () {
            return {
                'id': '1d64d6a5-29be-42f0-bb56-4680a76b9eb4',
                'name': 'Lights Setup Found Bridge',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '1d64d6a5-29be-42f0-bb56-4680a76b9eb4',
                        'to': 'bcfe0675-1040-4e8d-a47b-f30aaabfc7f2',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsSetupFoundBridge.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '2c19aa92-3af9-4ce9-b391-09c9956d66e3': function () {
            return {
                'id': '2c19aa92-3af9-4ce9-b391-09c9956d66e3',
                'name': 'Lights Setup Get Close',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '2c19aa92-3af9-4ce9-b391-09c9956d66e3',
                        'to': '0d8d595d-ef8b-4d32-9c24-efe13d3c277d',
                        'value': 'imReady'
                    },
                    {
                        'frm': '2c19aa92-3af9-4ce9-b391-09c9956d66e3',
                        'to': '4fc18c1c-2085-4238-b083-1571620528f9',
                        'value': ''
                    }
                ],
                'exceptions': [{
                        'frm': '2c19aa92-3af9-4ce9-b391-09c9956d66e3',
                        'to': '4fc18c1c-2085-4238-b083-1571620528f9',
                        'value': '~InteractionError'
                    }],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/LightsSetupGetClose.mim',
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
                        let speakerIds = results.speakerIds;
                        let transition = results.firstGrammarTag;
                        return transition;
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
        '231c26b3-3708-47f1-a975-02510a8ad9b0': function () {
            return {
                'id': '231c26b3-3708-47f1-a975-02510a8ad9b0',
                'name': 'Lights Setup Press Link',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '231c26b3-3708-47f1-a975-02510a8ad9b0',
                        'to': '8badbd64-8e60-4e74-9a73-f242b6a2d479',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsSetupPressLink.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'ceb16607-3980-40f9-a794-1f1e5ff0f10e': function () {
            return {
                'id': 'ceb16607-3980-40f9-a794-1f1e5ff0f10e',
                'name': 'Lights Setup Need More Time',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'ceb16607-3980-40f9-a794-1f1e5ff0f10e',
                        'to': 'e713156e-4974-4070-baaf-a0498af90ae2',
                        'value': 'no'
                    },
                    {
                        'frm': 'ceb16607-3980-40f9-a794-1f1e5ff0f10e',
                        'to': '58619d2a-b342-47bb-bc2d-d5dfdaedd5a1',
                        'value': ''
                    }
                ],
                'exceptions': [{
                        'frm': 'ceb16607-3980-40f9-a794-1f1e5ff0f10e',
                        'to': '58619d2a-b342-47bb-bc2d-d5dfdaedd5a1',
                        'value': '~InteractionError'
                    }],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/LightsSetupNeedMoreTime.mim',
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
        '58619d2a-b342-47bb-bc2d-d5dfdaedd5a1': function () {
            return {
                'id': '58619d2a-b342-47bb-bc2d-d5dfdaedd5a1',
                'name': 'More Time Retries',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '58619d2a-b342-47bb-bc2d-d5dfdaedd5a1',
                        'to': 'c36ae7db-a562-4ce3-9ce4-a8a1a047b010',
                        'value': 'later'
                    },
                    {
                        'frm': '58619d2a-b342-47bb-bc2d-d5dfdaedd5a1',
                        'to': '8badbd64-8e60-4e74-9a73-f242b6a2d479',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        if (!blackboard.setupMoreTimeRetries) {
                            blackboard.setupMoreTimeRetries = 0;
                        }
                        blackboard.setupMoreTimeRetries++;
                        if (blackboard.setupMoreTimeRetries > 4) {
                            return 'later';
                        }
                        return 'moreTime';
                    }
                }
            };
        },
        'c36ae7db-a562-4ce3-9ce4-a8a1a047b010': function () {
            return {
                'id': 'c36ae7db-a562-4ce3-9ce4-a8a1a047b010',
                'name': 'Lights Setup Too Long',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'c36ae7db-a562-4ce3-9ce4-a8a1a047b010',
                        'to': 'c7d1b8f9-cf70-4a7e-805a-bedd908bfa45',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsSetupTooLong.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'e713156e-4974-4070-baaf-a0498af90ae2': function () {
            return {
                'id': 'e713156e-4974-4070-baaf-a0498af90ae2',
                'name': 'Lights Setup Please Hold',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'e713156e-4974-4070-baaf-a0498af90ae2',
                        'to': '7ef1871f-108b-456e-a3ca-6d906ac7fc1e',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsSetupPleaseHold.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '8148dfdc-25c6-4e39-a3f2-dc268aa8574a': function () {
            return {
                'id': '8148dfdc-25c6-4e39-a3f2-dc268aa8574a',
                'name': 'More Time Retries',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '8148dfdc-25c6-4e39-a3f2-dc268aa8574a',
                        'to': '8badbd64-8e60-4e74-9a73-f242b6a2d479',
                        'value': 'retry'
                    },
                    {
                        'frm': '8148dfdc-25c6-4e39-a3f2-dc268aa8574a',
                        'to': 'aa445aec-ba31-4666-bd86-a8412d6e13db',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        if (!blackboard.setupFailureRetries) {
                            blackboard.setupFailureRetries = 0;
                        }
                        blackboard.setupFailureRetries++;
                        if (blackboard.setupFailureRetries > 3) {
                            return 'fail';
                        }
                        return 'retry';
                    }
                }
            };
        },
        'aa445aec-ba31-4666-bd86-a8412d6e13db': function () {
            return {
                'id': 'aa445aec-ba31-4666-bd86-a8412d6e13db',
                'name': 'Lights Setup Failure 1 ERROR SCREEN',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'aa445aec-ba31-4666-bd86-a8412d6e13db',
                        'to': '6a759405-7c78-4675-9c02-2256463d6259',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsSetupFailure1.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '0d6316f8-8744-4770-bee2-58c585d5c7e8': function () {
            return {
                'id': '0d6316f8-8744-4770-bee2-58c585d5c7e8',
                'name': 'Idle',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return 'idle';
                    }
                }
            };
        },
        '8b3d74a3-6bf2-4901-94b3-7ee3715b2a62': function () {
            return {
                'id': '8b3d74a3-6bf2-4901-94b3-7ee3715b2a62',
                'name': 'Idle',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return 'idle';
                    }
                }
            };
        },
        '567157e5-576f-4f38-9125-c183fdcf5f85': function () {
            return {
                'id': '567157e5-576f-4f38-9125-c183fdcf5f85',
                'name': 'Idle',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return 'idle';
                    }
                }
            };
        },
        '6a759405-7c78-4675-9c02-2256463d6259': function () {
            return {
                'id': '6a759405-7c78-4675-9c02-2256463d6259',
                'name': 'Idle',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return 'idle';
                    }
                }
            };
        },
        'c7d1b8f9-cf70-4a7e-805a-bedd908bfa45': function () {
            return {
                'id': 'c7d1b8f9-cf70-4a7e-805a-bedd908bfa45',
                'name': 'Idle',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return 'idle';
                    }
                }
            };
        },
        '3da414b5-f8d8-418c-b2bc-842c12b33a01': function () {
            return {
                'id': '3da414b5-f8d8-418c-b2bc-842c12b33a01',
                'name': 'SetupDefaultGroup',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '3da414b5-f8d8-418c-b2bc-842c12b33a01',
                        'to': 'a0febe43-2477-4937-b767-9501f8b03221',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Subflow',
                'options': {
                    'subflowId': () => {
                        return require('./SetupDefaultGroup');
                    },
                    'inputParameters': () => {
                        return { fromSetup: true };
                    },
                    'getTransition': subflow_result_object => {
                        return subflow_result_object.transition;
                    }
                }
            };
        },
        '2efa863f-031b-4744-9f38-5d837f1ec6c3': function () {
            return {
                'id': '2efa863f-031b-4744-9f38-5d837f1ec6c3',
                'name': 'Idle',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return 'idle';
                    }
                }
            };
        },
        'a0febe43-2477-4937-b767-9501f8b03221': function () {
            return {
                'id': 'a0febe43-2477-4937-b767-9501f8b03221',
                'name': 'Lights Setup Conclusion',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'a0febe43-2477-4937-b767-9501f8b03221',
                        'to': '2efa863f-031b-4744-9f38-5d837f1ec6c3',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsSetupConclusion.mim',
                    'getPromptData': () => {
                        return { 'defaultRoom': blackboard.hueControler.defaultGroupInfo.group.name };
                    }
                }
            };
        },
        '2d4957aa-05d9-4424-88e9-83da8e6913c4': function () {
            return {
                'id': '2d4957aa-05d9-4424-88e9-83da8e6913c4',
                'name': 'Lights Setup Bridge Success',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '2d4957aa-05d9-4424-88e9-83da8e6913c4',
                        'to': '86311bfc-2ee3-4131-bcaa-1abe91ac5159',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsSetupBridgeSuccess.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '86311bfc-2ee3-4131-bcaa-1abe91ac5159': function () {
            return {
                'id': '86311bfc-2ee3-4131-bcaa-1abe91ac5159',
                'name': 'Lights Setup Near Lights',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '86311bfc-2ee3-4131-bcaa-1abe91ac5159',
                        'to': 'fd9115c5-7e5d-43d5-bb5a-04a3ffd4a7ac',
                        'value': 'no'
                    },
                    {
                        'frm': '86311bfc-2ee3-4131-bcaa-1abe91ac5159',
                        'to': '35578ab3-d4f8-4fc3-bcfb-7042218e659c',
                        'value': 'yes'
                    }
                ],
                'exceptions': [{
                        'frm': '86311bfc-2ee3-4131-bcaa-1abe91ac5159',
                        'to': 'fd9115c5-7e5d-43d5-bb5a-04a3ffd4a7ac',
                        'value': '~InteractionError'
                    }],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/LightsSetupNearLights.mim',
                    'getPromptData': () => {
                        return {};
                    },
                    'onStatus': status => {
                        let mimState = status.state;
                        let asrResults = status.asrResults;
                        let speakerIds = status.speakerIds;
                    },
                    'onSuccess': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let speakerIds = results.speakerIds;
                        let transition = results.firstGrammarTag;
                        return transition;
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
        'bcf33a48-8a7a-427b-af05-ef432b16a7d3': function () {
            return {
                'id': 'bcf33a48-8a7a-427b-af05-ef432b16a7d3',
                'name': 'Lights Setup Did Flash',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'bcf33a48-8a7a-427b-af05-ef432b16a7d3',
                        'to': 'a325e65b-9b37-4734-a344-af33dbadfd44',
                        'value': 'yes'
                    },
                    {
                        'frm': 'bcf33a48-8a7a-427b-af05-ef432b16a7d3',
                        'to': '86311bfc-2ee3-4131-bcaa-1abe91ac5159',
                        'value': 'again'
                    },
                    {
                        'frm': 'bcf33a48-8a7a-427b-af05-ef432b16a7d3',
                        'to': '21d080e7-7e0e-404b-856c-50620244cb01',
                        'value': 'no'
                    }
                ],
                'exceptions': [{
                        'frm': 'bcf33a48-8a7a-427b-af05-ef432b16a7d3',
                        'to': '21d080e7-7e0e-404b-856c-50620244cb01',
                        'value': '~'
                    }],
                'class': 'Mim.Question',
                'options': {
                    'mimPath': 'mims/en-us/LightsSetupDidFlash.mim',
                    'getPromptData': () => {
                        return {};
                    },
                    'onStatus': status => {
                        let mimState = status.state;
                        let asrResults = status.asrResults;
                        let speakerIds = status.speakerIds;
                    },
                    'onSuccess': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let speakerIds = results.speakerIds;
                        let transition = results.firstGrammarTag;
                        return transition;
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
        '21d080e7-7e0e-404b-856c-50620244cb01': function () {
            return {
                'id': '21d080e7-7e0e-404b-856c-50620244cb01',
                'name': 'Lights Setup Failure 2 ERROR SCREEN',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '21d080e7-7e0e-404b-856c-50620244cb01',
                        'to': '69be6bd6-46be-4b9f-80ac-475ae8e2538b',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsSetupFailure2.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '35578ab3-d4f8-4fc3-bcfb-7042218e659c': function () {
            return {
                'id': '35578ab3-d4f8-4fc3-bcfb-7042218e659c',
                'name': 'Flash All The Lights',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '35578ab3-d4f8-4fc3-bcfb-7042218e659c',
                        'to': 'bcf33a48-8a7a-427b-af05-ef432b16a7d3',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        let targetGroups = blackboard.hueControler.checkForGroupsByName('All');
                        blackboard.hueControler.lightsAlertByGroups(targetGroups).then(() => {
                            done('');
                        });
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        '69be6bd6-46be-4b9f-80ac-475ae8e2538b': function () {
            return {
                'id': '69be6bd6-46be-4b9f-80ac-475ae8e2538b',
                'name': 'Idle',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return 'idle';
                    }
                }
            };
        },
        'a325e65b-9b37-4734-a344-af33dbadfd44': function () {
            return {
                'id': 'a325e65b-9b37-4734-a344-af33dbadfd44',
                'name': 'Lights Setup Success',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'a325e65b-9b37-4734-a344-af33dbadfd44',
                        'to': '3da414b5-f8d8-418c-b2bc-842c12b33a01',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsSetupSuccess.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        'e8611493-94ca-4bd2-9f0b-e26578f235e9': function () {
            return {
                'id': 'e8611493-94ca-4bd2-9f0b-e26578f235e9',
                'name': 'More Time Flashing Retries',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'e8611493-94ca-4bd2-9f0b-e26578f235e9',
                        'to': 'e120603a-4512-4a09-8bce-fa71a91e12c0',
                        'value': 'later'
                    },
                    {
                        'frm': 'e8611493-94ca-4bd2-9f0b-e26578f235e9',
                        'to': '86311bfc-2ee3-4131-bcaa-1abe91ac5159',
                        'value': ''
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval',
                'options': {
                    'Script': () => {
                        if (!blackboard.setupMoreTimeFlashingRetries) {
                            blackboard.setupMoreTimeFlashingRetries = 0;
                        }
                        blackboard.setupMoreTimeFlashingRetries++;
                        if (blackboard.setupMoreTimeFlashingRetries > 4) {
                            return 'later';
                        }
                        return 'moreTime';
                    }
                }
            };
        },
        'e120603a-4512-4a09-8bce-fa71a91e12c0': function () {
            return {
                'id': 'e120603a-4512-4a09-8bce-fa71a91e12c0',
                'name': 'Idle',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return 'idle';
                    }
                }
            };
        },
        'fd9115c5-7e5d-43d5-bb5a-04a3ffd4a7ac': function () {
            return {
                'id': 'fd9115c5-7e5d-43d5-bb5a-04a3ffd4a7ac',
                'name': 'Lights Setup Get Near Lights',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': 'fd9115c5-7e5d-43d5-bb5a-04a3ffd4a7ac',
                        'to': 'e8611493-94ca-4bd2-9f0b-e26578f235e9',
                        'value': ''
                    },
                    {
                        'frm': 'fd9115c5-7e5d-43d5-bb5a-04a3ffd4a7ac',
                        'to': '35578ab3-d4f8-4fc3-bcfb-7042218e659c',
                        'value': 'imReady'
                    }
                ],
                'exceptions': [{
                        'frm': 'fd9115c5-7e5d-43d5-bb5a-04a3ffd4a7ac',
                        'to': 'e8611493-94ca-4bd2-9f0b-e26578f235e9',
                        'value': '~InteractionError'
                    }],
                'class': 'Mim.Optional-Response',
                'options': {
                    'mimPath': 'mims/en-us/LightsSetupGetNearLights.mim',
                    'getPromptData': () => {
                        return {};
                    },
                    'onStatus': status => {
                        let mimState = status.state;
                        let asrResults = status.asrResults;
                        let speakerIds = status.speakerIds;
                    },
                    'onSuccess': results => {
                        let mimState = results.state;
                        let asrResults = results.asrResults;
                        let speakerIds = results.speakerIds;
                        let transition = results.firstGrammarTag;
                        return transition;
                    }
                }
            };
        }
    };
};
},{"./SetupDefaultGroup":11}],11:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        'meta': {
            'version': 1,
            'name': 'SetupDefaultGroup',
            'uri': '/Users/jon/Workspace/jibo/buildsdk/skills/hue-control/src/flows/SetupDefaultGroup.flow'
        },
        '9867ef75-afd6-4c94-b5e7-52c74a108a0f': function () {
            return {
                'id': '9867ef75-afd6-4c94-b5e7-52c74a108a0f',
                'name': 'Lights Setup Default Room Confirm',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '9867ef75-afd6-4c94-b5e7-52c74a108a0f',
                        'to': '2bbf0ee9-3585-4379-8279-92aba53e88e2',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsSetupDefaultRoomConfirm.mim',
                    'getPromptData': () => {
                        return {
                            customGroupName: !blackboard.hueControler.defaultGroupNames().includes(blackboard.hueControler.defaultGroupInfo.group.name),
                            fromSetup: !!notepad.params.fromSetup,
                            menuTimedOut: this.inTransition === '~InteractionError.MenuTimeout' ? true : false
                        };
                    }
                }
            };
        },
        '2f1d4a72-8ea0-4ca6-8055-37341851aa1a': function () {
            return {
                'id': '2f1d4a72-8ea0-4ca6-8055-37341851aa1a',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '2f1d4a72-8ea0-4ca6-8055-37341851aa1a',
                        'to': '8714ed7a-3cf3-4661-a9d6-62e8ab03a29d',
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
        '2bbf0ee9-3585-4379-8279-92aba53e88e2': function () {
            return {
                'id': '2bbf0ee9-3585-4379-8279-92aba53e88e2',
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
        'e169c899-e631-453c-b6ce-96d06bec961d': function () {
            return {
                'id': 'e169c899-e631-453c-b6ce-96d06bec961d',
                'name': 'Other',
                'asset-pack': 'core',
                'transitions': [],
                'exceptions': [],
                'class': 'Flow.End',
                'options': {
                    'getTransition': () => {
                        return 'Other';
                    }
                }
            };
        },
        '1d8b6112-d7b2-4065-8e73-35ab4e5dce67': function () {
            return {
                'id': '1d8b6112-d7b2-4065-8e73-35ab4e5dce67',
                'name': '~error',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '1d8b6112-d7b2-4065-8e73-35ab4e5dce67',
                        'to': 'e169c899-e631-453c-b6ce-96d06bec961d',
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
        '7ef25a71-4ffe-4481-8628-4ee11f6a17f1': function () {
            return {
                'id': '7ef25a71-4ffe-4481-8628-4ee11f6a17f1',
                'name': '~',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '7ef25a71-4ffe-4481-8628-4ee11f6a17f1',
                        'to': 'e169c899-e631-453c-b6ce-96d06bec961d',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Flow.Catch',
                'options': {
                    'getTransition': (exception, payload) => {
                        blackboard.log.error('Something leaked, Caught Exception: ', exception, payload);
                        return '';
                    }
                }
            };
        },
        '8714ed7a-3cf3-4661-a9d6-62e8ab03a29d': function () {
            return {
                'id': '8714ed7a-3cf3-4661-a9d6-62e8ab03a29d',
                'name': 'UpdateGroups',
                'asset-pack': 'core',
                'transitions': [
                    {
                        'frm': '8714ed7a-3cf3-4661-a9d6-62e8ab03a29d',
                        'to': 'cee48340-db78-4f10-9b42-a27a6a24c4a1',
                        'value': ''
                    },
                    {
                        'frm': '8714ed7a-3cf3-4661-a9d6-62e8ab03a29d',
                        'to': '1abaad58-c5f7-4f0e-92d0-c5e1c8184676',
                        'value': 'hue3g'
                    }
                ],
                'exceptions': [],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        let earliestGroupUpdate = blackboard.hueControler.earliestAppAccountGroupUpdateTime();
                        let now = Date.now();
                        let recentGroupUpdate = now - earliestGroupUpdate <= blackboard.bridgeScanValidForMili;
                        blackboard.log.info('Starting SetupDefaultGroup, groups updated recently: ', recentGroupUpdate);
                        if (recentGroupUpdate) {
                            blackboard.log.info('SetupDefaultGroup: Skipping Update Groups');
                            done('skipGroupUpdate');
                        } else {
                            blackboard.log.info('SetupDefaultGroup: Updating Groups');
                            blackboard.hueControler.updateGroupsInformation().then(result => {
                                done('');
                            }).catch(err => {
                                blackboard.log.warn('SetupDefaultGroup: Problem Updating Groups', err);
                                done('hue3g');
                            });
                        }
                    },
                    'onStop': () => {
                    }
                }
            };
        },
        'bcfe0675-1040-4e8d-a47b-f30aaabfc7f2': function () {
            return {
                'id': 'bcfe0675-1040-4e8d-a47b-f30aaabfc7f2',
                'name': 'Select Bridge to Connect menu',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'bcfe0675-1040-4e8d-a47b-f30aaabfc7f2',
                        'to': '9867ef75-afd6-4c94-b5e7-52c74a108a0f',
                        'value': ''
                    }],
                'exceptions': [{
                        'frm': 'bcfe0675-1040-4e8d-a47b-f30aaabfc7f2',
                        'to': '9867ef75-afd6-4c94-b5e7-52c74a108a0f',
                        'value': '~InteractionError.MenuTimeout'
                    }],
                'class': 'Flow.Eval-Async',
                'options': {
                    'exec': done => {
                        let groupView = blackboard.hueControler.getGroupSelectionMenuView();
                        blackboard.analytics.lightsGroupSelectionInfo(groupView.viewConfig.listMetadata.defaultGroupsNames, groupView.viewConfig.listMetadata.customGroupsNames);
                        blackboard.log.info('Group Selection Avalable Group Names: ', groupView.viewConfig.listMetadata.defaultGroupsNames.length + groupView.viewConfig.listMetadata.customGroupsNames.length, groupView.viewConfig.listMetadata.defaultGroupsNames.length, groupView.viewConfig.listMetadata.defaultGroupsNames, groupView.viewConfig.listMetadata.customGroupsNames);
                        jibo.face.views.changeView({ addView: groupView }, view => {
                            view.on('Pressed', data => {
                                blackboard.log.info('User Selected default group: ', data.selected_group_info);
                                blackboard.hueControler.defaultGroupInfo = data.selected_group_info;
                                blackboard.analytics.lightsGroupSelection(data.selected_group_info.group.name);
                                jibo.timer.clearTimeout(notepad.menuTimeout);
                                jibo.face.views.removeView();
                                done('');
                            });
                            notepad.menuTimeout = jibo.timer.setTimeout(() => {
                                jibo.face.views.removeView(() => {
                                    done('~InteractionError.MenuTimeout');
                                });
                            }, 30000);
                        }, error => {
                            blackboard.log.error('Error while setting up group selection menu: ', error);
                        });
                    },
                    'onStop': () => {
                        if (notepad.menuTimeout) {
                            jibo.timer.clearTimeout(notepad.menuTimeout);
                        }
                    }
                }
            };
        },
        'cee48340-db78-4f10-9b42-a27a6a24c4a1': function () {
            return {
                'id': 'cee48340-db78-4f10-9b42-a27a6a24c4a1',
                'name': 'Lights Setup Default Room',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': 'cee48340-db78-4f10-9b42-a27a6a24c4a1',
                        'to': 'bcfe0675-1040-4e8d-a47b-f30aaabfc7f2',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsSetupDefaultRoom.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        },
        '1abaad58-c5f7-4f0e-92d0-c5e1c8184676': function () {
            return {
                'id': '1abaad58-c5f7-4f0e-92d0-c5e1c8184676',
                'name': 'Lights Setup Defaul Group Info ERROR SCREEN',
                'asset-pack': 'core',
                'transitions': [{
                        'frm': '1abaad58-c5f7-4f0e-92d0-c5e1c8184676',
                        'to': 'e169c899-e631-453c-b6ce-96d06bec961d',
                        'value': ''
                    }],
                'exceptions': [],
                'class': 'Mim.Announcement',
                'options': {
                    'mimPath': 'mims/en-us/LightsSetupDefaulGroupInfoError.mim',
                    'getPromptData': () => {
                        return {};
                    }
                }
            };
        }
    };
};
},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HueControl_1 = require("./HueControl");
module.exports = HueControl_1.default;

},{"./HueControl":1}]},{},[12])(12)
});
//# sourceMappingURL=index.js.map