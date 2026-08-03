(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.berestore = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
const jibo = require("jibo");
const be_framework_1 = require("@be/be-framework");
var CancelTokenSession = be_framework_1.libraries.jibo_cai_utils.CancelTokenSession;
var ActionData = jibo.rendering.gui.actions.ActionData;
var ViewConfigs;
(function (ViewConfigs) {
    ViewConfigs.WAITING_VIEW_CONFIG = "resources/views/waiting.json";
    ViewConfigs.SUCCESS_VIEW_CONFIG = "resources/views/success.json";
    ViewConfigs.ERRORS_VIEW_CONFIG = "resources/views/errors.json";
})(ViewConfigs || (ViewConfigs = {}));
var RestoreStatus;
(function (RestoreStatus) {
    RestoreStatus[RestoreStatus["UGC_KEY_TIMEOUT"] = 0] = "UGC_KEY_TIMEOUT";
    RestoreStatus[RestoreStatus["RESTORE_SUCCESS"] = 1] = "RESTORE_SUCCESS";
    RestoreStatus[RestoreStatus["RESTORE_FAILED"] = 2] = "RESTORE_FAILED";
    RestoreStatus[RestoreStatus["REFRESH_FAILED"] = 3] = "REFRESH_FAILED";
    RestoreStatus[RestoreStatus["CANCELED"] = 4] = "CANCELED";
})(RestoreStatus || (RestoreStatus = {}));
class Restore extends be_framework_1.BeSkill {
    constructor(assetPack, ugcKeyTimeoutMS = 600000) {
        super(assetPack);
        this._promiseSession = null;
        this._ugcKeyTimeoutMS = 0;
        this._currentView = null;
        this._statusCallback = null;
        this._promiseSession = new CancelTokenSession();
        this._ugcKeyTimeoutMS = ugcKeyTimeoutMS;
    }
    get currentView() {
        return this._currentView;
    }
    preload(done) {
        done();
    }
    open(result, refresh, previousSkillName, previousSkillOptions, callback) {
        this.log.info("restore open");
        if (refresh) {
            this.log.warn("refresh called on a restore that should already be in progress");
            callback(RestoreStatus.REFRESH_FAILED);
            return;
        }
        this._isInterruptible = false;
        if (!this._statusCallback && callback) {
            this._statusCallback = callback;
        }
        this._promiseSession.wrap(this._renderScreen(ViewConfigs.WAITING_VIEW_CONFIG))
            .then(() => {
            this.log.info("Waiting for UGC key");
            this._promiseSession.wrap(this._waitForUGCKey())
                .then(() => {
                this.log.info("UGC Key is ready. beginning restore");
                jibo.systemManager.restore((error) => {
                    if (error) {
                        this.log.error("restore returned an error");
                        this._wipeOnRestoreFailed(RestoreStatus.RESTORE_FAILED);
                    }
                    else {
                        this.log.info("restore completed without error");
                        let actionData = new ActionData(ActionData.CALLBACK, { callback: this._successfulRestore.bind(this) });
                        this._promiseSession.wrap(this._renderScreen(ViewConfigs.SUCCESS_VIEW_CONFIG, actionData));
                    }
                });
            })
                .catch((err) => {
                this.log.error("waiting for UGC Key timed out", err);
                this._wipeOnRestoreFailed(RestoreStatus.UGC_KEY_TIMEOUT);
            });
        });
    }
    close(done) {
        this.log.info("restore close");
        Promise.resolve()
            .then(() => {
            return this._promiseSession.cancel()
                .catch((err) => {
                this.log.error("promise session cancel error", err);
            })
                .then(() => {
                if (this._statusCallback) {
                    this._statusCallback(RestoreStatus.CANCELED);
                    this._statusCallback = null;
                }
            });
        })
            .then(() => {
            if (this._currentView) {
                return new Promise((resolve) => {
                    jibo.face.views.removeView(() => {
                        this.log.info("restore waiting view destroyed");
                        resolve();
                    }, jibo.face.views.DOWN, jibo.face.views.DOWN, (err) => {
                        this.log.error(err);
                        resolve();
                    });
                });
            }
        })
            .then(() => {
            done();
        });
    }
    _waitForUGCKey() {
        return new Promise((resolve, reject) => {
            let itr = null;
            let ugcKeyRetryMethod = function* () {
                let tryAgain = true;
                let startTime = Date.now();
                while (tryAgain) {
                    jibo.secureTransferService.isUGCKeyReady((error, isReady) => {
                        if (error) {
                            tryAgain = false;
                            reject(error);
                        }
                        else if (isReady) {
                            tryAgain = false;
                            resolve();
                        }
                        else if (Date.now() - startTime >= this._ugcKeyTimeoutMS) {
                            tryAgain = false;
                            reject(new Error("timed out"));
                        }
                        itr.next();
                    });
                    yield tryAgain;
                }
            }.bind(this);
            itr = ugcKeyRetryMethod();
            itr.next();
        });
    }
    _renderScreen(viewConfigPath, actionData = null) {
        return new Promise((resolve) => {
            let viewComplete = (view) => {
                this.log.info(`restore view ${viewConfigPath} loaded`);
                this._currentView = view;
                if (actionData) {
                    this._currentView.addAction(actionData, null, false, false, jibo.face.views.TAP);
                }
                resolve();
            };
            let onFailure = (err) => {
                this._currentView = null;
                this.log.warn(`restore view ${viewConfigPath} failed to load`, err);
                resolve();
            };
            let changeViewOptions = {
                addView: viewConfigPath,
                remove: true
            };
            jibo.face.views.changeView(changeViewOptions, viewComplete, onFailure);
        });
    }
    _successfulRestore() {
        this.log.info("Restore success");
        jibo.systemManager.reboot((err) => {
            if (err) {
                this.log.error("Reboot reports failure", err);
            }
            if (this._statusCallback) {
                this._statusCallback(RestoreStatus.RESTORE_SUCCESS);
                this._statusCallback = null;
            }
        });
    }
    _failedRestore(status) {
        this.log.info("Restore failed");
        jibo.systemManager.reboot((err) => {
            if (err) {
                this.log.error("Reboot reports failure", err);
            }
            if (this._statusCallback) {
                this._statusCallback(status);
                this._statusCallback = null;
            }
        });
    }
    _wipeOnRestoreFailed(status) {
        jibo.wifi.verifyConnection(this._promiseSession.wrapCallback((err) => {
            jibo.utils.WipeUtil.run(this.log, !!err)
                .catch((err) => {
                this.log.error("unexpected error from wipe util", err);
            })
                .then(() => {
                let actionData = new ActionData(ActionData.CALLBACK, { callback: () => {
                        this._failedRestore(status);
                    } });
                this._promiseSession.wrap(this._renderScreen(ViewConfigs.ERRORS_VIEW_CONFIG, actionData));
            });
        }));
    }
}
Restore.Types = {
    BeSkill: be_framework_1.BeSkill
};
module.exports = {
    Skill: Restore,
    Restore: Restore,
    ViewConfigs: ViewConfigs,
    RestoreStatus: RestoreStatus
};

},{"@be/be-framework":undefined,"jibo":undefined}]},{},[1])(1)
});
//# sourceMappingURL=index.js.map