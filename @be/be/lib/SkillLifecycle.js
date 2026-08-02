"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SkillLifecycleState_1 = require("./SkillLifecycleState");
const SkillLifecycleEndState_1 = require("./SkillLifecycleEndState");
const log_1 = require("./log");
class SkillLifecycle {
    constructor(skillSwitchData) {
        this._skillSwitchData = skillSwitchData;
        this._onSkillLifecycleStateChangeCallbackSet = new Set();
        this._onSkillLifecycleEndCallbackSet = new Set();
        this._prevSkillLifecycleState = null;
        this._setSkillLifecycleState(SkillLifecycleState_1.default.NONE);
        this._skillLifecycleEndState = SkillLifecycleEndState_1.default.NONE;
        this.log = log_1.default.createChild("SkillLifecycle");
    }
    get skillSwitchData() {
        return this._skillSwitchData;
    }
    get skillLifecycleState() {
        return this._skillLifecycleState;
    }
    get skillLifecycleEndState() {
        return this._skillLifecycleEndState;
    }
    addOnSkillLifecycleStateChange(callback) {
        if (this._onSkillLifecycleStateChangeCallbackSet.has(callback)) {
            return false;
        }
        this._onSkillLifecycleStateChangeCallbackSet.add(callback);
        return true;
    }
    addOnSkillLifecycleEnd(callback) {
        let returnValue = false;
        if (!this._onSkillLifecycleEndCallbackSet.has(callback)) {
            this._onSkillLifecycleEndCallbackSet.add(callback);
            returnValue = true;
        }
        if (this._skillLifecycleState === SkillLifecycleState_1.default.LIFECYCLE_ENDED) {
            this._callOnSkillLifecycleEndCallbacks();
        }
        return returnValue;
    }
    skillSwitchRequested() {
        if (this._skillLifecycleState === SkillLifecycleState_1.default.NONE) {
            this._setSkillLifecycleState(SkillLifecycleState_1.default.SKILL_SWITCH_REQUESTED);
            return true;
        }
        return false;
    }
    skillSwitchPending() {
        if (this._skillLifecycleState === SkillLifecycleState_1.default.SKILL_SWITCH_REQUESTED) {
            this._setSkillLifecycleState(SkillLifecycleState_1.default.SKILL_SWITCH_PENDING);
            return true;
        }
        return false;
    }
    startSkillOpen() {
        if (this._skillLifecycleState === SkillLifecycleState_1.default.SKILL_SWITCH_PENDING) {
            this._setSkillLifecycleState(SkillLifecycleState_1.default.SKILL_START_OPEN);
            return true;
        }
        return false;
    }
    skillOpened() {
        if (this._skillLifecycleState === SkillLifecycleState_1.default.SKILL_START_OPEN) {
            this._setSkillLifecycleState(SkillLifecycleState_1.default.SKILL_OPENED);
            return true;
        }
        return false;
    }
    skillLifecycleEnded(skillLifecycleEndState) {
        if (this._skillLifecycleState === SkillLifecycleState_1.default.LIFECYCLE_ENDED) {
            return false;
        }
        this._skillLifecycleEndState = skillLifecycleEndState;
        this._setSkillLifecycleState(SkillLifecycleState_1.default.LIFECYCLE_ENDED);
        this._callOnSkillLifecycleEndCallbacks();
        return true;
    }
    _setSkillLifecycleState(skillLifecycleState) {
        this._prevSkillLifecycleState = this._skillLifecycleState;
        this._skillLifecycleState = skillLifecycleState;
        if (this._prevSkillLifecycleState !== this._skillLifecycleState) {
            if (this._onSkillLifecycleStateChangeCallbackSet.size > 0) {
                this._onSkillLifecycleStateChangeCallbackSet.forEach((lifecycleStateChangeCallback) => {
                    try {
                        lifecycleStateChangeCallback(this._prevSkillLifecycleState, this._skillLifecycleState);
                    }
                    catch (err) {
                        this.log.error("SkillSwitch: caught exception in onSkillLifecycleStateChange callback", err, lifecycleStateChangeCallback);
                    }
                });
            }
        }
    }
    _callOnSkillLifecycleEndCallbacks() {
        if (this._onSkillLifecycleEndCallbackSet.size > 0) {
            this._onSkillLifecycleEndCallbackSet.forEach((lifecycleEndCallback) => {
                try {
                    lifecycleEndCallback(this._skillLifecycleEndState);
                }
                catch (err) {
                    this.log.error("SkillSwitch: caught exception in onSkillLifecycleEnd callback", err);
                }
            });
        }
    }
}
exports.default = SkillLifecycle;

