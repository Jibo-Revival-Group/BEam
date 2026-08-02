"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const SkillLifecycle_1 = require("./SkillLifecycle");
const SkillSwitchUtil_1 = require("./SkillSwitchUtil");
const SkillLifecycleEndState_1 = require("./SkillLifecycleEndState");
const SkillRedirectToken_1 = require("./SkillRedirectToken");
const SkillSwitchData_1 = require("./SkillSwitchData");
const TimerSpy_1 = require("./TimerSpy");
const log_1 = require("./log");
class SkillSwitchScheduler {
    constructor(idleSkill) {
        this._idleSkill = idleSkill;
        this._currentSkillLifecycle = null;
        this._currentSkillRedirectToken = null;
        this._pendingSkillLifecycle = null;
        this._pendingSkillRedirectToken = null;
        this._updateTimeout = null;
        this._updateMethod = this._update.bind(this);
        this._updateMethod.isGlobalTimer = true;
        this.log = log_1.default.createChild("SkillSwitchScheduler");
        this._destroyed = false;
    }
    run() {
        this._updateMethod();
    }
    get currentSkillRedirectToken() {
        return this._currentSkillRedirectToken;
    }
    requestSkillRedirect(requestedSkillSwitchData) {
        const requestedSkillName = requestedSkillSwitchData.name;
        const requestedSkillOptions = requestedSkillSwitchData.options;
        this.log.info("requested skill switch", requestedSkillName, requestedSkillOptions);
        let reqestedSkillLifecycle = new SkillLifecycle_1.default(requestedSkillSwitchData);
        let skillRedirectToken = new SkillRedirectToken_1.default(reqestedSkillLifecycle, requestedSkillSwitchData);
        reqestedSkillLifecycle.skillSwitchRequested();
        if (!this._pendingSkillLifecycle && !this._currentSkillLifecycle) {
            this.log.info("no current or pending skill. launching into requested skill");
            this._pendingSkillLifecycle = reqestedSkillLifecycle;
            this._pendingSkillLifecycle.skillSwitchPending();
            this._pendingSkillRedirectToken = skillRedirectToken;
        }
        else if (this._currentSkillLifecycle && !this._pendingSkillLifecycle) {
            if (SkillSwitchUtil_1.default.canSkillSwitch(this._currentSkillLifecycle.skillSwitchData, reqestedSkillLifecycle.skillSwitchData)) {
                this.log.info("no pending skill. interrupting current skill");
                this._pendingSkillLifecycle = reqestedSkillLifecycle;
                this._pendingSkillLifecycle.skillSwitchPending();
                this._pendingSkillRedirectToken = skillRedirectToken;
            }
            else {
                this.log.info("no pending skill. cannot interrupt current skill. denying skill switch request");
                reqestedSkillLifecycle.skillLifecycleEnded(SkillLifecycleEndState_1.default.SKILL_SWITCH_REQUEST_DENIED);
            }
        }
        else if (!this._currentSkillLifecycle && this._pendingSkillLifecycle) {
            if (reqestedSkillLifecycle.skillSwitchData.priority >= this._pendingSkillLifecycle.skillSwitchData.priority) {
                this.log.info("no current skill. requested skill is >= to pending skill priority. switching into requested skill");
                this._pendingSkillLifecycle.skillLifecycleEnded(SkillLifecycleEndState_1.default.PENDING_SKILL_SWITCH_INTERRUPTED);
                this._pendingSkillLifecycle = reqestedSkillLifecycle;
                this._pendingSkillRedirectToken = skillRedirectToken;
                this._pendingSkillLifecycle.skillSwitchPending();
            }
            else {
                this.log.info("no current skill. requested skill is < to pending skill priority. denying skill switch request");
                reqestedSkillLifecycle.skillLifecycleEnded(SkillLifecycleEndState_1.default.SKILL_SWITCH_REQUEST_DENIED);
            }
        }
        else {
            if (reqestedSkillLifecycle.skillSwitchData.priority >= this._pendingSkillLifecycle.skillSwitchData.priority &&
                SkillSwitchUtil_1.default.canSkillSwitch(this._currentSkillLifecycle.skillSwitchData, reqestedSkillLifecycle.skillSwitchData)) {
                this.log.info("current skill and pending skill exist. requested skill is >= priority to pending skill and we can switch from current skill");
                this._pendingSkillLifecycle.skillLifecycleEnded(SkillLifecycleEndState_1.default.PENDING_SKILL_SWITCH_INTERRUPTED);
                this._pendingSkillLifecycle = reqestedSkillLifecycle;
                this._pendingSkillRedirectToken = skillRedirectToken;
                this._pendingSkillLifecycle.skillSwitchPending();
            }
            else {
                this.log.info("current skill and pending skill exist. requested skill switch is either < priority than pending skill or cannot switch into current skill. denying skill switch request");
                reqestedSkillLifecycle.skillLifecycleEnded(SkillLifecycleEndState_1.default.SKILL_SWITCH_REQUEST_DENIED);
            }
        }
        return skillRedirectToken;
    }
    _update() {
        if (!this._pendingSkillLifecycle) {
            this._recallUpdate();
            return;
        }
        let currentSkillName = this._currentSkillLifecycle ? this._currentSkillLifecycle.skillSwitchData.name : null;
        let currentSkillOptions = this._currentSkillLifecycle ? this._currentSkillLifecycle.skillSwitchData.options : null;
        let pendingSkillName = this._pendingSkillLifecycle ? this._pendingSkillLifecycle.skillSwitchData.name : null;
        let pendingSkillOptions = this._pendingSkillLifecycle ? this._pendingSkillLifecycle.skillSwitchData.options : null;
        this.log.info('switching skill', currentSkillName, this._pendingSkillLifecycle.skillSwitchData.name);
        if (this._currentSkillLifecycle && this._currentSkillLifecycle.skillSwitchData.skill === this._pendingSkillLifecycle.skillSwitchData.skill) {
            try {
                this.log.info('refreshing skill', currentSkillName, currentSkillOptions, pendingSkillOptions);
                this._pendingSkillLifecycle.startSkillOpen();
                this._pendingSkillLifecycle.skillSwitchData.skill.open(this._pendingSkillLifecycle.skillSwitchData.options, true, currentSkillName, this._currentSkillLifecycle.skillSwitchData.options);
                this.log.info('refreshing skill success', currentSkillName, currentSkillOptions, pendingSkillOptions);
                this._currentSkillLifecycle.skillLifecycleEnded(SkillLifecycleEndState_1.default.SKILL_REFRESHED);
                this._currentSkillRedirectToken = this._pendingSkillRedirectToken;
                this._currentSkillLifecycle = this._pendingSkillLifecycle;
                this._pendingSkillLifecycle = null;
                this._pendingSkillRedirectToken = null;
                this._currentSkillLifecycle.skillOpened();
            }
            catch (err) {
                this._currentSkillLifecycle.skillLifecycleEnded(SkillLifecycleEndState_1.default.SKILL_REFRESH_FAILED);
                this._pendingSkillLifecycle.skillLifecycleEnded(SkillLifecycleEndState_1.default.SKILL_REFRESH_FAILED);
                this._pendingSkillLifecycle = null;
                this._pendingSkillRedirectToken = null;
                this.log.error('refresh skill failed', currentSkillName, currentSkillOptions, err);
                this.requestSkillRedirect(new SkillSwitchData_1.default(this._idleSkill, {}));
            }
            finally {
                this._recallUpdate();
            }
        }
        else {
            this.log.info('starting close skill', currentSkillName);
            const skillToClose = this._currentSkillLifecycle ? this._currentSkillLifecycle.skillSwitchData.skill : null;
            Promise.resolve()
                .then(() => {
                return SkillSwitchUtil_1.default.closeSkill(skillToClose, pendingSkillName);
            })
                .then(() => {
                this.log.info('ending close skill', currentSkillName);
                if (this._currentSkillLifecycle) {
                    this._currentSkillLifecycle.skillLifecycleEnded(SkillLifecycleEndState_1.default.SKILL_EXITED);
                }
                this.log.info('deferring to action system with pending skill:', pendingSkillName, pendingSkillOptions);
                return Promise.resolve()
                    .then(() => {
                    return this._completeAction();
                })
                    .then((pendingSkillLifecycle) => {
                    if (this._pendingSkillLifecycle !== pendingSkillLifecycle) {
                        this.log.info('the pending skill lifecycle which the action system has completed with is not the same as the current pending skill lifecycle', pendingSkillLifecycle.skillSwitchData.name, pendingSkillLifecycle.skillSwitchData.options, this._pendingSkillLifecycle.skillSwitchData.name, this._pendingSkillLifecycle.skillSwitchData.options);
                    }
                }, (err) => {
                    this.log.warn('action system completed with error. Continuing with skill switching', err);
                })
                    .then(() => {
                    pendingSkillName = this._pendingSkillLifecycle ? this._pendingSkillLifecycle.skillSwitchData.name : null;
                    pendingSkillOptions = this._pendingSkillLifecycle ? this._pendingSkillLifecycle.skillSwitchData.options : null;
                    this.log.info('starting skill open', pendingSkillName, pendingSkillOptions);
                    let prevSkillLifecycle = this._currentSkillLifecycle;
                    this._currentSkillLifecycle = this._pendingSkillLifecycle;
                    this._currentSkillRedirectToken = this._pendingSkillRedirectToken;
                    currentSkillName = this._currentSkillLifecycle ? this._currentSkillLifecycle.skillSwitchData.name : null;
                    currentSkillOptions = this._currentSkillLifecycle ? this._currentSkillLifecycle.skillSwitchData.options : null;
                    this._pendingSkillLifecycle = null;
                    this._pendingSkillRedirectToken = null;
                    pendingSkillName = null;
                    pendingSkillOptions = null;
                    TimerSpy_1.default.instance.getCurrentSkillNameCallback = () => {
                        return this._currentSkillLifecycle.skillSwitchData.skill.assetPack;
                    };
                    this._currentSkillLifecycle.startSkillOpen();
                    return Promise.resolve()
                        .then(() => {
                        return SkillSwitchUtil_1.default.openNewSkill(prevSkillLifecycle, this._currentSkillLifecycle);
                    })
                        .then(() => {
                        this._currentSkillLifecycle.skillOpened();
                        this.log.info('skill open success', currentSkillName, currentSkillOptions);
                    }, (err) => {
                        this.log.error('skill open failed', currentSkillName, currentSkillOptions, err);
                        this.requestSkillRedirect(new SkillSwitchData_1.default(this._idleSkill, {}));
                        this._currentSkillLifecycle.skillLifecycleEnded(SkillLifecycleEndState_1.default.SKILL_OPEN_FAILED);
                    });
                });
            }, (err) => {
                if (this._currentSkillLifecycle) {
                    this._currentSkillLifecycle.skillLifecycleEnded(SkillLifecycleEndState_1.default.SKILL_CLOSE_FAILED);
                    this.log.error('error closing skill', currentSkillName, currentSkillOptions, err);
                }
                else if (this._pendingSkillLifecycle) {
                    this._pendingSkillLifecycle.skillLifecycleEnded(SkillLifecycleEndState_1.default.SKILL_OPEN_FAILED);
                    this.log.error('error closing skill', pendingSkillName, pendingSkillOptions, err);
                }
                else {
                    this.log.error('error closing skill', err);
                }
            })
                .then(() => {
                this._recallUpdate();
            });
        }
    }
    _recallUpdate() {
        if (this._updateTimeout) {
            jibo.timer.clearTimeout(this._updateTimeout);
            this._updateTimeout = null;
        }
        if (!this._destroyed) {
            this._updateTimeout = jibo.timer.setTimeout(this._updateMethod, 10);
        }
    }
    _completeAction() {
        return new Promise((resolve, reject) => {
            let currentPendingSkillLifecycle = null;
            let goal = null;
            let actionSystemGoalInterval = jibo.timer.setInterval(() => {
                if (currentPendingSkillLifecycle !== this._pendingSkillLifecycle) {
                    currentPendingSkillLifecycle = this._pendingSkillLifecycle;
                    if (goal) {
                        goal.events.finished.removeAllListeners();
                    }
                    goal = jibo.action.addBeSkillSwitchGoal({
                        skillName: currentPendingSkillLifecycle.skillSwitchData.name,
                        skillOptions: currentPendingSkillLifecycle.skillSwitchData.options,
                        beSkillPriority: currentPendingSkillLifecycle.skillSwitchData.priority,
                        beSkillPreferences: {
                            cancelOrientOnStart: false
                        }
                    });
                    this.log.info("waiting on action system", currentPendingSkillLifecycle.skillSwitchData.name);
                    goal.events.finished.on((status) => {
                        actionSystemGoalInterval.destroy();
                        if (status === jibo.action.types.GoalFinishedStatus.SUCCEEDED) {
                            this.log.info("action system reported accomplished goal", currentPendingSkillLifecycle.skillSwitchData.name);
                            return resolve(currentPendingSkillLifecycle);
                        }
                        else {
                            return reject(new Error(`action system failed to meet goal '${currentPendingSkillLifecycle.skillSwitchData.name}' with status: ${status}`));
                        }
                    });
                }
            }, 10);
        });
    }
    destroy() {
        this._destroyed = true;
        return Promise.resolve()
            .then(() => {
            if (this._updateTimeout) {
                jibo.timer.clearTimeout(this._updateTimeout);
                this._updateTimeout = null;
            }
            if (this._currentSkillRedirectToken) {
                return SkillSwitchUtil_1.default.closeSkill(this._currentSkillLifecycle.skillSwitchData.skill);
            }
        });
    }
}
exports.default = SkillSwitchScheduler;

