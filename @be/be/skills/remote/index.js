(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.beremote = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo = require("jibo");
const be_framework_1 = require("@be/be-framework");
const jibo_command_protocol_1 = require("jibo-command-protocol");
const TOUCH = 'touch';
const DISCONNECT = 'disconnect';
var ANIM_STATE;
(function (ANIM_STATE) {
    ANIM_STATE[ANIM_STATE["OPENING"] = 0] = "OPENING";
    ANIM_STATE[ANIM_STATE["CLOSING"] = 1] = "CLOSING";
    ANIM_STATE[ANIM_STATE["OPENED"] = 2] = "OPENED";
    ANIM_STATE[ANIM_STATE["CLOSED"] = 3] = "CLOSED";
    ANIM_STATE[ANIM_STATE["SKIPPED"] = 4] = "SKIPPED";
})(ANIM_STATE || (ANIM_STATE = {}));
class Remote extends be_framework_1.BeSkill {
    constructor(assetPack) {
        super(assetPack);
        this.closeReason = null;
        this.mim = null;
        this.animState = ANIM_STATE.CLOSED;
        this.onConnectionClosed = this.onConnectionClosed.bind(this);
    }
    open(result, refresh) {
        if (refresh) {
            if (this.animState === ANIM_STATE.OPENED || this.animState === ANIM_STATE.OPENING) {
                this.close(() => {
                    this.open(result);
                }, null, false);
                return;
            }
        }
        if (result.nlu.intent === "silentRemote") {
            this.animState = ANIM_STATE.SKIPPED;
        }
        this._openHelper(result);
    }
    _openHelper(result) {
        jibo.face.views.forceEyeView();
        jibo.remote.sessionDiscarded.on(this.onConnectionClosed);
        this.closeReason = null;
        if (this.animState !== ANIM_STATE.SKIPPED) {
            this.animState = ANIM_STATE.OPENING;
            this.playRemoteAnim(true)
                .then(() => {
                this.animState = ANIM_STATE.OPENED;
                jibo.remote.ready();
            })
                .catch((err) => {
                this.log.warn('issue with rom intro animation', err);
                this.animState = ANIM_STATE.OPENED;
                jibo.remote.ready();
            });
        }
        else {
            jibo.remote.ready();
        }
    }
    close(done, pendingSkillName, disconnect = true) {
        jibo.remote.sessionDiscarded.off(this.onConnectionClosed);
        if (disconnect && this.closeReason !== DISCONNECT) {
            if (pendingSkillName === '@be/idle') {
                this.closeReason = TOUCH;
            }
            const code = this.closeReason === TOUCH ? jibo_command_protocol_1.DisconnectCode.HeadTouchExit : jibo_command_protocol_1.DisconnectCode.RobotError;
            jibo.remote.closeConnection(code, jibo_command_protocol_1.DisconnectReason[code]);
        }
        if (this.animState !== ANIM_STATE.SKIPPED) {
            this.animState = ANIM_STATE.CLOSING;
            this.forceEye()
                .then(() => {
                this.playRemoteAnim(false)
                    .then(() => {
                    this.animState = ANIM_STATE.CLOSED;
                    done();
                })
                    .catch((err) => {
                    this.log.warn('issue with rom outro animation', err);
                    this.animState = ANIM_STATE.CLOSED;
                    jibo.expression.setLEDColor([0, 0, 0]);
                    done();
                });
            });
        }
        else {
            this.forceEye();
            jibo.expression.setLEDColor([0, 0, 0]);
            done();
        }
    }
    playRemoteAnim(intro = true) {
        return new Promise((resolve, reject) => {
            let meta = intro ? 'TransitionEntry.mim' : 'TransitionExit.mim';
            try {
                this.mim = new jibo.bt.behaviors.Mim({
                    mimPath: String('mims/' + meta),
                    assetPack: this.assetPack,
                    getPromptData: null,
                    onSuccess: (results) => {
                        this.mim.stopAndDestroy();
                        resolve();
                    },
                    onFailure: (results) => {
                        this.log.warn('playRemoteAnim: MIM failure');
                        this.mim.stopAndDestroy();
                        reject();
                    },
                });
                this.mim.start();
            }
            catch (err) {
                this.log.warn('There was an issue playing the' + meta + ' remote anim: ', err);
                reject();
            }
        });
    }
    onConnectionClosed() {
        this.closeReason = DISCONNECT;
        this.exit();
    }
    forceEye() {
        return new Promise((resolve) => {
            jibo.face.views.forceEyeView(() => {
                resolve();
            }, null, jibo.face.views.TRANSITION.IN, jibo.face.views.TRANSITION.DOWN, () => {
                this.log.error('cleanupViews() failure during forceEyeView, calling done anyway');
                resolve();
            });
        });
    }
}
module.exports = Remote;

},{"@be/be-framework":undefined,"jibo":undefined,"jibo-command-protocol":undefined}]},{},[1])(1)
});
//# sourceMappingURL=index.js.map