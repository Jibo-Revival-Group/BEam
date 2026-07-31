"use strict";

const TestUtils = require('@be/skills-test-utils');
let { Restore, RestoreStatus } = require('../index');
let BeFramework = require('@be/be-framework');

TestUtils.SkillsTestSetup();

describe('Restore Skill Tests', function(){
    describe('index', function(){
        let _secureTransferServiceSim = null;

        before(function(){
             _secureTransferServiceSim = TestUtils.skillsServiceManager.SecureTransferServiceSim.instance;
            jibo.face.views.resetTransTime(10);
        });

        beforeEach(function(){
            _secureTransferServiceSim.toggleUGCKeyReady(false);
        });

        after(function() {
            jibo.face.views.resetTransTime();
        });

        describe('open', function(){
            it('should return immediately on skill refresh', function(done){
                let restoreSkill = new Restore("@be/restore");
                restoreSkill.open({}, true, "", {}, (status)=>{
                    assert.equal(RestoreStatus.REFRESH_FAILED, status, "status expected to be CANCELED");
                    restoreSkill.close(()=>{
                        done();
                    });
                });
            });

            it('should be not interruptible', function(done){
                this.timeout(5000);
                let restoreSkill = new Restore("@be/restore");
                restoreSkill.open({}, false, "", {});
                // interruptible should be set to false sychronously from the open call
                assert.isFalse(restoreSkill.isInterruptible);

                restoreSkill.exit();
                assert.isTrue(restoreSkill.isInterruptible);
                restoreSkill.close(done);
            });

            it('should report error if UGC Key api times out', function(done){
                this.timeout(5000);
                let wipeSpy = sinon.spy(jibo.utils.WipeUtil, "run");
                jibo.secureTransferService.isUGCKeyReady((err, isReady)=>{
                    // check that there's no error and the server currently thinks the key is not ready
                    assert.isNull(err);
                    assert.isFalse(isReady);

                    let restoreSkill = new Restore("@be/restore", 100);
                    restoreSkill.open({}, false, "", {}, (status)=>{
                        assert.equal(RestoreStatus.UGC_KEY_TIMEOUT, status, "status expected to be UGC_KEY_TIMEOUT");
                        restoreSkill.close(()=>{
                            assert(wipeSpy.calledOnce);
                            wipeSpy.restore();
                            done();
                        });
                    });

                    // wait until we've transitioned to the restoreError gui before we tap the screen
                    let guiInterval = setInterval(()=>{
                        if(restoreSkill.currentView && restoreSkill.currentView.id === 'restoreError') {
                            clearInterval(guiInterval);
                            jibo.face.gestures.spoofGesture(jibo.rendering.input.GestureManager.TAP);
                        }
                    }, 10);
                });
            });

            it('should report success if UGC Key is ready and restore was successful', function(done){
                this.timeout(5000);
                let wipeSpy = sinon.spy(jibo.utils.WipeUtil, "run");
                jibo.secureTransferService.isUGCKeyReady((err, isReady)=>{
                    // check that there's no error and the server currently thinks the key is not ready
                    assert.isNull(err);
                    assert.isFalse(isReady);

                    let restoreSkill = new Restore("@be/restore", 100);
                    restoreSkill.open({}, false, "", {}, (status)=>{
                        assert.equal(RestoreStatus.RESTORE_SUCCESS, status, "status expected to be RESTORE_SUCCESS");
                        jibo.secureTransferService.isUGCKeyReady((err, isReady)=>{
                            // check that there's no error and the server currently thinks the key is not ready
                            assert.isNull(err);
                            assert.isTrue(isReady);

                            restoreSkill.close(()=>{
                                assert(wipeSpy.notCalled);
                                wipeSpy.restore();
                                done();
                            });
                        });
                    });

                    // wait until we've transitioned to the appropriate gui before triggering the next action
                    let callOnce = true;
                    let guiInterval = setInterval(()=>{
                        if(restoreSkill.currentView && restoreSkill.currentView.id === 'restoreWaiting' && callOnce) {
                            callOnce = false;
                            _secureTransferServiceSim.toggleUGCKeyReady(true);
                        }
                        else if(restoreSkill.currentView && restoreSkill.currentView.id === 'restoreSuccess') {
                            clearInterval(guiInterval);
                            jibo.face.gestures.spoofGesture(jibo.rendering.input.GestureManager.TAP);
                        }
                    }, 10);
                });
            });

            it('should report error if UGC Key is ready and restore failed', function(done){
                this.timeout(5000);
                let wipeSpy = sinon.spy(jibo.utils.WipeUtil, "run");
                jibo.secureTransferService.isUGCKeyReady((err, isReady)=>{
                    // check that there's no error and the server currently thinks the key is not ready
                    assert.isNull(err);
                    assert.isFalse(isReady);

                    let restoreSkill = new Restore("@be/restore", 100);
                    restoreSkill.open({}, false, "", {}, (status)=>{
                        assert.equal(RestoreStatus.RESTORE_FAILED, status, "status expected to be RESTORE_FAILED");
                        jibo.secureTransferService.isUGCKeyReady((err, isReady)=>{
                            // check that there's no error and the server currently thinks the key is not ready
                            assert.isNull(err);
                            assert.isTrue(isReady);

                            restoreSkill.close(()=>{
                                jibo.systemManager.restore.restore();
                                assert(wipeSpy.calledOnce);
                                wipeSpy.restore();
                                done();
                            });
                        });
                    });

                    // wait until we've transitioned to the appropriate gui before triggering the next action
                    let callOnce = true;
                    let guiInterval = setInterval(()=>{
                        if(restoreSkill.currentView && restoreSkill.currentView.id === 'restoreWaiting' && callOnce) {
                            callOnce = false;
                            // stub restore so it fails
                            sinon.stub(jibo.systemManager, "restore", function(cb){
                                cb("mock error");
                            });

                            _secureTransferServiceSim.toggleUGCKeyReady(true);
                        }
                        else if(restoreSkill.currentView && restoreSkill.currentView.id === 'restoreError') {
                            clearInterval(guiInterval);
                            jibo.face.gestures.spoofGesture(jibo.rendering.input.GestureManager.TAP);
                        }
                    }, 10);
                });
            });
        });

        describe('close', function(){
            it('should cancel long running UGC Key query', function(done){
                this.timeout(4000);
                let restoreSpy = sinon.spy(jibo.systemManager, "restore");

                jibo.secureTransferService.isUGCKeyReady((err, isReady)=>{
                    // check that there's no error and the server currently thinks the key is not ready
                    assert.isNull(err);
                    assert.isFalse(isReady);
                    let openStatus = null;

                    let restoreSkill = new Restore("@be/restore", 100);
                    restoreSkill.open({}, false, "", {}, (status)=>{
                        openStatus = status;
                    });

                    // wait until we've transitioned to the appropriate gui before triggering the next action
                    let callOnce = true;
                    let guiInterval = setInterval(()=>{
                        if(restoreSkill.currentView && restoreSkill.currentView.id === 'restoreWaiting' && callOnce) {
                            callOnce = false;

                            restoreSkill.close(()=>{
                                assert(restoreSpy.notCalled);
                                restoreSpy.restore();
                                assert.equal(RestoreStatus.CANCELED, openStatus, "status expected to be CANCELED");
                                done();
                            });
                        }
                    }, 10);
                });
            });

            it('should cancel long restore operation', function(done){
                this.timeout(4000);
                _secureTransferServiceSim.toggleUGCKeyReady(true);
                jibo.secureTransferService.isUGCKeyReady((err, isReady)=>{
                    // check that there's no error and the server currently thinks the key is not ready
                    assert.isNull(err);
                    assert.isTrue(isReady);
                    let openStatus = null;

                    let restoreSkill = new Restore("@be/restore", 100);

                    let restoreSpy = sinon.stub(jibo.systemManager, "restore", function(/*cb*/){
                        // never call the callback!

                        // call close instead!
                        restoreSkill.close(()=>{
                            assert(restoreSpy.calledOnce);
                            restoreSpy.restore();
                            assert.equal(RestoreStatus.CANCELED, openStatus, "status expected to be CANCELED");
                            done();
                        });
                    });

                    restoreSkill.open({}, false, "", {}, (status)=>{
                        openStatus = status;
                    });
                });
            });

            it('should remove view', function(done){
                this.timeout(5000);
                jibo.secureTransferService.isUGCKeyReady((err, isReady)=>{
                    // check that there's no error and the server currently thinks the key is not ready
                    assert.isNull(err);
                    assert.isFalse(isReady);

                    let originalView = jibo.face.views.currentView;

                    let restoreSkill = new Restore("@be/restore", 100);
                    restoreSkill.open({}, false, "", {}, (status)=>{
                        assert.equal(RestoreStatus.RESTORE_SUCCESS, status, "status expected to be RESTORE_SUCCESS");

                        restoreSkill.close(()=>{
                            assert.equal(jibo.face.views.currentView.id, originalView.id);

                            done();
                        });
                    });

                    // wait until we've transitioned to the appropriate gui before triggering the next action
                    let callOnce = true;
                    let guiInterval = setInterval(()=>{
                        if(restoreSkill.currentView && restoreSkill.currentView.id === 'restoreWaiting' && callOnce) {
                            callOnce = false;
                            _secureTransferServiceSim.toggleUGCKeyReady(true);
                        }
                        else if(restoreSkill.currentView && restoreSkill.currentView.id === 'restoreSuccess') {
                            clearInterval(guiInterval);
                            jibo.face.gestures.spoofGesture(jibo.rendering.input.GestureManager.TAP);
                        }
                    }, 10);
                });
            });
        });

    });
});
