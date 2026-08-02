"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const log_1 = require("./log");
const log = log_1.default.createChild("TimerSpy");
class TimerSpy {
    static get instance() {
        if (!TimerSpy._instance) {
            TimerSpy._instance = new TimerSpy();
        }
        return TimerSpy._instance;
    }
    constructor() {
        this.log = log;
        this._globalTimerSymbol = Symbol("global");
        this._initRan = false;
    }
    set getCurrentSkillNameCallback(value) {
        this._getCurrentSkillNameCallback = value;
    }
    init(getCurrentSkillNameCallback) {
        this._initRan = true;
        this._getCurrentSkillNameCallback = getCurrentSkillNameCallback;
        this._skillTimers = {};
        this._originalOn = jibo.timer.on.bind(jibo.timer);
        this._originalRemoveListener = jibo.timer.removeListener.bind(jibo.timer);
        this._originalSetTimeout = jibo.timer.setTimeout.bind(jibo.timer);
        this._originalClearTimeout = jibo.timer.clearTimeout.bind(jibo.timer);
        this._originalSetInterval = jibo.timer.setInterval.bind(jibo.timer);
        this._originalClearInterval = jibo.timer.clearInterval.bind(jibo.timer);
        jibo.timer.on = this.onOverride.bind(this);
        jibo.timer.off = jibo.timer.removeListener = this.removeListenerOverride.bind(this);
        jibo.timer.setTimeout = this.setTimeoutOverride.bind(this);
        jibo.timer.clearTimeout = this.clearTimeoutOverride.bind(this);
        jibo.timer.setInterval = this.setIntervalOverride.bind(this);
        jibo.timer.clearInterval = this.clearIntervalOverride.bind(this);
    }
    restore() {
        if (this._initRan) {
            jibo.timer.on = this._originalOn;
            jibo.timer.off = jibo.timer.removeListener = this._originalRemoveListener;
            jibo.timer.setTimeout = this._originalSetTimeout;
            jibo.timer.clearTimeout = this._originalClearTimeout;
            jibo.timer.setInterval = this._originalSetInterval;
            jibo.timer.clearInterval = this._originalClearInterval;
        }
    }
    getCurrentSkillTimers(skillName) {
        if (!this._skillTimers[skillName]) {
            this._skillTimers[skillName] = new Map();
        }
        return this._skillTimers[skillName];
    }
    checkSkillCleanup() {
        let skillTimers = this.getCurrentSkillTimers(this._getCurrentSkillNameCallback());
        if (skillTimers.size !== 0) {
            log.error("The current skill has uncleaned up timers!!", this._getCurrentSkillNameCallback(), skillTimers);
            delete this._skillTimers[this._getCurrentSkillNameCallback()];
        }
        else {
            log.info("The current skill cleaned up all timers", this._getCurrentSkillNameCallback());
        }
    }
    onOverride(event, method) {
        const skillName = method.isGlobalTimer ? this._globalTimerSymbol : this._getCurrentSkillNameCallback();
        let skillTimers = this.getCurrentSkillTimers(skillName);
        let eventMethodSet = null;
        if (!skillTimers.has(event)) {
            eventMethodSet = new Set();
            skillTimers.set(event, eventMethodSet);
        }
        else {
            eventMethodSet = skillTimers.get(event);
        }
        if (eventMethodSet.has(method)) {
            log.error("Found timeout being set from skill: ", skillName, method);
            eventMethodSet.delete(method);
        }
        eventMethodSet.add(method);
        return this._originalOn(event, method);
    }
    removeListenerOverride(event, method) {
        const skillName = method.isGlobalTimer ? this._globalTimerSymbol : this._getCurrentSkillNameCallback();
        let skillTimers = this.getCurrentSkillTimers(skillName);
        let eventMethodSet = skillTimers.get(event);
        if (eventMethodSet) {
            eventMethodSet.delete(method);
            if (eventMethodSet.size === 0) {
                skillTimers.delete(event);
            }
        }
        return this._originalRemoveListener(event, method);
    }
    setTimeoutOverride(callback, delay, useFrames, autoDestroy) {
        const skillName = callback.isGlobalTimer ? this._globalTimerSymbol : this._getCurrentSkillNameCallback();
        let skillTimers = this.getCurrentSkillTimers(skillName);
        if (skillTimers.has(callback)) {
            log.error("Found timeout being set from skill: ", skillName, callback);
            skillTimers.delete(callback);
        }
        let delayedCall = this._originalSetTimeout(callback, delay, useFrames, autoDestroy);
        delayedCall.isGlobalTimer = callback.isGlobalTimer;
        let currentSkillTimers = this.getCurrentSkillTimers(this._getCurrentSkillNameCallback());
        if (callback.isGlobalTimer && currentSkillTimers &&
            currentSkillTimers.get("update") &&
            currentSkillTimers.get("update").has(delayedCall._update)) {
            currentSkillTimers.get("update").delete(delayedCall._update);
            if (currentSkillTimers.get("update").size === 0) {
                currentSkillTimers.delete("update");
            }
        }
        skillTimers.set(delayedCall, callback);
        const originalDestroy = delayedCall.destroy.bind(delayedCall);
        delayedCall.destroy = () => {
            originalDestroy();
            this.clearTimeoutOverride(delayedCall);
        };
        return delayedCall;
    }
    clearTimeoutOverride(delayedCall) {
        const skillName = delayedCall.isGlobalTimer ? this._globalTimerSymbol : this._getCurrentSkillNameCallback();
        let skillTimers = this.getCurrentSkillTimers(skillName);
        if (skillTimers.get(delayedCall)) {
            skillTimers.delete(delayedCall);
            return this._originalClearTimeout(delayedCall);
        }
        return;
    }
    setIntervalOverride(callback, delay, useFrames) {
        const skillName = callback.isGlobalTimer ? this._globalTimerSymbol : this._getCurrentSkillNameCallback();
        let skillTimers = this.getCurrentSkillTimers(skillName);
        if (skillTimers.has(callback)) {
            log.error("Found interval being set from skill: ", skillName, callback);
            skillTimers.delete(callback);
        }
        let delayedCall = this._originalSetInterval(callback, delay, useFrames);
        delayedCall.isGlobalTimer = callback.isGlobalTimer;
        let currentSkillTimers = this.getCurrentSkillTimers(this._getCurrentSkillNameCallback());
        if (callback.isGlobalTimer && currentSkillTimers &&
            currentSkillTimers.get("update") &&
            currentSkillTimers.get("update").has(delayedCall._update)) {
            currentSkillTimers.get("update").delete(delayedCall._update);
            if (currentSkillTimers.get("update").size === 0) {
                currentSkillTimers.delete("update");
            }
        }
        skillTimers.set(delayedCall, callback);
        const originalDestroy = delayedCall.destroy.bind(delayedCall);
        delayedCall.destroy = () => {
            originalDestroy();
            this.clearIntervalOverride(delayedCall);
        };
        return delayedCall;
    }
    clearIntervalOverride(delayedCall) {
        const skillName = delayedCall.isGlobalTimer ? this._globalTimerSymbol : this._getCurrentSkillNameCallback();
        let skillTimers = this.getCurrentSkillTimers(skillName);
        if (skillTimers.get(delayedCall)) {
            skillTimers.delete(delayedCall);
            return this._originalClearInterval(delayedCall);
        }
        return;
    }
    destroy() {
        this._initRan = false;
        this._skillTimers = {};
    }
}
exports.default = TimerSpy;

