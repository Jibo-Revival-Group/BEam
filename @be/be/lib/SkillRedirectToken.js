"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SkillRedirectToken {
    constructor(skillLifecycle, skillSwitchData) {
        this._skillLifecycle = skillLifecycle;
        this._skillSwitchData = skillSwitchData;
    }
    get skillLifecycleState() {
        return this._skillLifecycle.skillLifecycleState;
    }
    get skillLifecycleEndState() {
        return this._skillLifecycle.skillLifecycleEndState;
    }
    get skillSwitchData() {
        return this._skillSwitchData;
    }
    addOnSkillLifecycleStateChange(callback) {
        this._skillLifecycle.addOnSkillLifecycleStateChange((prevLifecycleState, currentLifecycleState) => {
            callback(prevLifecycleState, currentLifecycleState);
        });
    }
    addOnSkillLifecycleEnd(callback) {
        this._skillLifecycle.addOnSkillLifecycleEnd((skillLifecycleEndState) => {
            callback(skillLifecycleEndState);
        });
    }
    onState(lifecycleState, callback) {
        if (this._skillLifecycle.skillLifecycleState >= lifecycleState) {
            callback();
        }
        else {
            this._skillLifecycle.addOnSkillLifecycleStateChange((prevLifecycleState, currentLifecycleState) => {
                if (lifecycleState === currentLifecycleState) {
                    callback();
                }
            });
        }
    }
}
exports.default = SkillRedirectToken;

