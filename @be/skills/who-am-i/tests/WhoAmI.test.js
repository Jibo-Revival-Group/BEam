const TestUtils = require('./TestUtils');
const {HubMock} = require('./mocks/HubMock');
const types = require('@jibo/jetstream-client').types;

const result = new types.ListenResult({text: "hey jibo who am i", confidence: 1.0}, {onRobot: true, skillID: "@be/who-am-i"})
const FAKE_SPEAKER = { idInfo: {id: '58af35ef37b5e9ad4c096166', status: 'ACCEPTED', score: 1, statusConfidence: 'HIGH-CONFIDENCE' } };
const FAKE_OWNER_ID = FAKE_SPEAKER.idInfo.id;;
const ViewIDs = {
    LOOPER_COIN: 'looperCoin',
    CONTACT_MENU: 'contact_menu'
}

function createLooperListenResult(looper) {
    const asr = { confidence: 1.0, text: looper.getWrittenName() };
    const nlu = { intent: 'loopmember', entities: { loopMemberReferent: looper.id } };
    const match = { onRobot: true, skillID: "@be/who-am-i" };
    return new types.ListenResult(asr, nlu, match)
}

describe('FlowClass', function () {
    describe('removeView', function () {
        it('should not call changeView if current view is the eye', function (done) {
            let whoAmI = this.skill;
            let changeViewSpy = this.sandbox.spy(jibo.face.views, 'changeView');
            this.sandbox.stub(jibo.flow, 'run', () => {
                assert.equal(jibo.face.views.currentView.category, jibo.face.views.CATEGORY_EYE, 'current view is not eye');
                whoAmI.blackboard.flow.removeView()
                .then(() => {
                    assert(changeViewSpy.notCalled, 'changeView was called');
                    done();
                });
           });
            whoAmI.open(result);
        });

        it('should call changeView with transitionClose: "trans_out" if current view is looperCoin', function (done) {
            let whoAmI = this.skill;
            let changeViewStub = null;

            this.sandbox.stub(jibo.flow, 'run', () => {
                whoAmI.blackboard.flow.loopMember = FAKE_SPEAKER.idInfo;
                whoAmI.blackboard.flow.showLooperCoin()
                .then(() => {
                    changeViewStub = this.sandbox.stub(jibo.face.views, 'changeView', (...args) => {
                        changeViewStub.restore();
                        assert.equal(jibo.face.views.currentView.id, ViewIDs.LOOPER_COIN, 'current view is not looperCoin');
                        return jibo.face.views.changeView(...args);
                    });
                    return whoAmI.blackboard.flow.removeView();
                })
                .then(() => {
                    let options = { removeAll: true, transitionClose: jibo.face.views.OUT };
                    assert(changeViewStub.calledWith(options), 'changeViewStub was not called with the correct view options');
                    done();
                });
            });
            whoAmI.open(result);
        });
    });
});

describe('Hypothesis', function () {
    describe('No active speaker ID (no hypothesis)', function () {
        it('loopMember.id should be null', function (done) {
            this.timeout(40000);
            this.flow.when()
                .activityName('Have a guess?')
                .assert((activity, notepad, blackboard) => blackboard.flow.loopMember === undefined, 'loopMember should be undefined');
            this.flow.when()
                .after().activityName('Set loopMember.id to null')
                .do((activity, notepad, blackboard) => {
                    process.nextTick(() => {
                        TestUtils.assertAndFinish(done, () => {
                            assert.deepEqual(blackboard.flow.loopMember, { id: null }, 'loopMember.id should be null');
                            TestUtils.assertEachExecuted(this.flow);
                        });
                    });
                });

            this.skill.open(result);
        });

        it('WhoAmI_NameIsRight.mim should not play', function () {
            this.timeout(40000);
            this.flow.when()
                .activityName('Fix')
                .do((activity, notepad, blackboard) => {
                    process.nextTick(() => {
                        TestUtils.assertAndFinish(done, () => {
                            assert(!this.flow.didExecuteActivity('Who Am I_ Name Is Right'), 'WhoAmI_NameIsRight.mim played');
                            TestUtils.assertEachExecuted(this.flow);
                        });
                    });
                });

            this.skill.open(result);
        });

        it('WhoAmI_DontKnow.mim should play before entering fix.flow', function (done) {
            this.timeout(40000);
            this.flow.when()
                .activityName('WhoAmI_DontKnow')
            this.flow.when()
                .activityName('Fix')
                .do((activity, notepad, blackboard) => {
                    process.nextTick(() => {
                        TestUtils.assertAndFinish(done, () => {
                            TestUtils.assertEachExecuted(this.flow);
                        });
                    });
                });

            this.skill.open(result);
        });
    });

    describe('Active speaker ID (Jibo has a hypothesis)', function () {
        beforeEach(function() {
            this.sandbox.stub(jibo.lps.identity, 'getActiveSpeaker', function(){
                return FAKE_SPEAKER;
            });
        });

        it('loopMember should be set to the node that matches getActiveSpeaker.id', function (done) {
            this.timeout(40000);
            this.flow.when()
                .activityName('Have a guess?')
                .assert((activity, notepad, blackboard) => blackboard.flow.loopMember === undefined, 'loopMember should be undefined');
            this.flow.when()
                .after().activityName('Set loopMember, show looper coin')
                .do((activity, notepad, blackboard) => {
                    process.nextTick(() => {
                        TestUtils.assertAndFinish(done, () => {
                            assert.equal(blackboard.flow.loopMember.id, this.skill.loop[0].id, 'loopMember should be populated with UserNode from getActiveSpeaker()');
                            TestUtils.assertEachExecuted(this.flow);
                        });
                    });
                });

            this.skill.open(result);
        });

        it('WhoAmI_NameIsRight.mim should play with the correct prompt data', function (done) {
            this.timeout(40000);
            this.flow.when()
                .activityName('Who Am I_ Name Is Right')
                .do((activity, notepad, blackboard) => {
                    assert.equal(activity.mim.promptData.loopMember, blackboard.flow.loopMember, 'loopMember in prompt should match loopMember on blackbaord');
                    assert.equal(activity.mim.promptData.gender, blackboard.flow.loopMember.gender, 'gender in prompt should match gender on blackbaord');
                    process.nextTick(() => {
                        TestUtils.assertAndFinish(done, () => {
                            TestUtils.assertEachExecuted(this.flow);
                        });
                    });
                });

            this.skill.open(result);
        });

        it('InteractionError should go back to eye, play WhoAmI_Incomplete.mim, and end skill without going to "Fix" subflow', function (done) {
            this.timeout(40000);
            this.flow.when()
                .activityName('Who Am I_ Name Is Right')
                .activeTransition('~InteractionError');
            this.flow.when()
                .activityName('Who Am I_ Incomplete')
                .do(() => {
                    assert.equal(jibo.face.views.currentView.category, jibo.face.views.CATEGORY_EYE, 'current view should be eye');
                });

            TestUtils.setExits(this, done, TestUtils.EXIT_EXIT, () => {
                TestUtils.assertEachExecuted(this.flow);
                assert(!this.flow.didExecuteActivity('Fix'), 'should not enter "Fix" subflow');
            });


            this.skill.open(result);
        });

        it('Swipe down should go back to eye, play WhoAmI_Incomplete.mim, and end skill without going to "Fix" subflow', function (done) {
            this.timeout(40000);
            this.flow.when()
                .activityName('Who Am I_ Name Is Right')
                .do(() => {
                    jibo.face.gestures.spoofGesture('swipedown');
                });
            this.flow.when()
                .activityName('Who Am I_ Incomplete')
                .do(() => {
                    assert.equal(jibo.face.views.currentView.category, jibo.face.views.CATEGORY_EYE, 'current view should be eye');
                });

            TestUtils.setExits(this, done, TestUtils.EXIT_EXIT, () => {
                TestUtils.assertEachExecuted(this.flow);
                assert(!this.flow.didExecuteActivity('Fix'), 'should not enter "Fix" subflow');
            });

            this.skill.open(result);
        });

        it('LooperCoin should be enlarged ContactButton with "${looperName}?" displayed', function (done) {
            this.timeout(40000);
            this.flow.when()
                .after().activityName('Set loopMember, show looper coin')
                .do(() => {
                    let buttonLabel = jibo.face.views.currentView.getComponentById('buttonLabel0');
                    assert.equal(buttonLabel.text, this.skill.loop[0].getWrittenName() + '?', 'label should be written name plus "?"');
                    assert.equal(jibo.face.views.currentView.id, ViewIDs.LOOPER_COIN, 'view should be looperCoin');
                    assert.equal(jibo.face.views.currentView.list.componentList.length, 1, 'list should only have one component');
                });
            this.flow.when()
                .activityName('Who Am I_ Name Is Right')
                .do((activity, notepad, blackboard) => {
                    process.nextTick(() => {
                        TestUtils.assertAndFinish(done, () => {
                            TestUtils.assertEachExecuted(this.flow);
                        });
                    });
                });

            this.skill.open(result);
        });

        describe('Jibo is right! :D', function () {
            beforeEach(function() {
                this.flow.when()
                    .activityName('Who Am I_ Name Is Right')
                    .activeTransition('yes');
            });

            it('should remove looper coin, go back to eye view', function (done) {
                this.timeout(40000);
                this.flow.when()
                .after().activityName('Remove View')
                .do((activity, notepad, blackboard) => {
                    process.nextTick(() => {
                        TestUtils.assertAndFinish(done, () => {
                            assert.equal(jibo.face.views.currentView.category, jibo.face.views.CATEGORY_EYE, 'current view should be eye');
                            TestUtils.assertEachExecuted(this.flow);
                        });
                    });
                });

                this.skill.open(result);
            });

            it('WhoAmI_Success.mim should play, should not enter "Fix" subflow', function (done) {
                this.timeout(40000);
                this.flow.when()
                .activityName('Who Am I_ Success')

                TestUtils.setExits(this, done, TestUtils.EXIT_EXIT, () => {
                    TestUtils.assertEachExecuted(this.flow);
                    assert(!this.flow.didExecuteActivity('Fix'), 'should not enter "Fix" subflow');
                });

                this.skill.open(result);
            });

            it('Should not redirect to Enrollment', function (done) {
                this.timeout(40000);
                TestUtils.setExits(this, done, TestUtils.EXIT_EXIT, () => { /* no assertions */});

                this.skill.open(result);
            });
        });

        describe('Jibo is wrong :C', function () {
            beforeEach(function() {
                this.flow.when()
                .activityName('Who Am I_ Name Is Right')
                .activeTransition('no');
            });

            it('Should not remove view, go to Fix subflow', function (done) {
                this.timeout(40000);
                this.flow.when()
                .activityName('Fix')
                .do((activity, notepad, blackboard) => {
                    process.nextTick(() => {
                        TestUtils.assertAndFinish(done, () => {
                            assert.equal(jibo.face.views.currentView.id, ViewIDs.LOOPER_COIN, 'current view should still be looperCoin');
                            TestUtils.assertEachExecuted(this.flow);
                        });
                    });
                });

                this.skill.open(result);
            });

            it('WhoAmI_Fail.mim should play', function (done) {
                this.timeout(40000);
                this.flow.when()
                .activityName('Who Am I_ Fail')
                .do((activity, notepad, blackboard) => {
                    process.nextTick(() => {
                        TestUtils.assertAndFinish(done, () => {
                            TestUtils.assertEachExecuted(this.flow);
                        });
                    });
                });

                this.skill.open(result);
            });
        });
    });
});

describe('Fix', function () {
    let hubMock;
    before(function() {
        hubMock = new HubMock();
        return hubMock.init(TestUtils.getHubPort());
    })

    beforeEach(function() {
        hubMock.clearListenResult();
    })

    // Stop HubMock
    after(() => {
        return hubMock.stop();
    });

    describe('WhoAmI_CollectName.mim', function () {
        describe('NO hypothesis', function () {
            it('current view should be eye', function (done) {
                this.timeout(40000);
                this.flow.when()
                    .after().activityName('Made a wrong guess earlier?')
                    .assert(activity=>activity.result === false, 'should not have made guess earlier');
                this.flow.when()
                    .activityName('Who Am I_ Collect Name')
                    .do((activity, notepad, blackboard) => {
                        process.nextTick(() => {
                            TestUtils.assertAndFinish(done, () => {
                                TestUtils.assertEachExecuted(this.flow);
                                assert.equal(jibo.face.views.currentView.category, jibo.face.views.CATEGORY_EYE, 'current view should be eye');
                            });
                        });
                    });
                this.skill.open(result);
            });

            describe('selected', function () {

                it('should set flowClass.loopMember to selected', function (done) {
                    hubMock.pushListenResult(createLooperListenResult(this.skill.loop[0]));

                    this.timeout(40000);
                    this.flow.when()
                        .activityName('Who Am I_ Collect Name')
                        .say(this.skill.loop[0].getWrittenName());
                    this.flow.when()
                        .after().activityName('loopMember = selected. Made a guess earlier?')
                        .do((activity, notepad, blackboard) => {
                            process.nextTick(() => {
                                TestUtils.assertAndFinish(done, () => {
                                    TestUtils.assertEachExecuted(this.flow);
                                    assert.equal(blackboard.flow.selectedLooper, blackboard.flow.loopMember.id, 'loopMember should be set to selected looper');
                                });
                            });
                        });

                    this.skill.open(result);
                });

                it('should display eye view', function (done) {
                    hubMock.pushListenResult(createLooperListenResult(this.skill.loop[0]));

                    this.timeout(40000);
                    this.flow.when()
                        .activityName('Who Am I_ Collect Name')
                        .say(this.skill.loop[0].getWrittenName());
                    this.flow.when()
                        .activityName('Enrolled?')
                        .do(() => {
                            process.nextTick(() => {
                                TestUtils.assertAndFinish(done, () => {
                                    TestUtils.assertEachExecuted(this.flow);
                                    assert.equal(jibo.face.views.currentView.category, jibo.face.views.CATEGORY_EYE, 'current view should be eye');
                                });
                            });
                        });

                    this.skill.open(result);
                });
            });
        });

        describe('WRONG hypothesis', function () {
            beforeEach(function() {
                this.sandbox.stub(jibo.lps.identity, 'getActiveSpeaker', function(){
                    return FAKE_SPEAKER;
                });

                this.flow.when()
                    .activityName('Who Am I_ Name Is Right')
                    .activeTransition('no');
            });

            it('should display contact_menu', function (done) {
                this.timeout(40000);
                this.flow.when()
                    .after().activityName('Made a wrong guess earlier?')
                    .assert(activity=>activity.result === true, 'should have made guess earlier');
                this.flow.when()
                    .activityName('Who Am I_ Collect Name')
                    .do((activity, notepad, blackboard) => {
                        jibo.face.views.events.process.on( (data) => {
                            if (data.status === jibo.rendering.gui.ViewProcess.COMPLETED && jibo.face.views.currentView.id === ViewIDs.CONTACT_MENU) {
                                jibo.face.views.events.process.removeAllListeners();
                                TestUtils.assertAndFinish(done, () => {
                                    TestUtils.assertEachExecuted(this.flow);
                                    assert.equal(jibo.face.views.currentView.id, ViewIDs.CONTACT_MENU, 'current view should be contact_menu');
                                });
                            }
                        });
                    });

                this.skill.open(result);
            });

            it('swipe down when contact_menu is displayed should go to eye view, play WhoAmI_Incomplete.mim, and exit skill', function (done) {
                this.timeout(40000);
                this.flow.when()
                    .activityName('Who Am I_ Collect Name')
                    .do((activity, notepad, blackboard) => {
                        jibo.face.views.events.process.on( (data) => {
                            if (data.status === jibo.rendering.gui.ViewProcess.COMPLETED && jibo.face.views.currentView.id === ViewIDs.CONTACT_MENU) {
                                jibo.face.views.events.process.removeAllListeners();
                                jibo.face.gestures.spoofGesture('swipedown');
                            }
                        });
                    });
                this.flow.when()
                    .activityName('Who Am I_ Incomplete')
                    .do(() => {
                        assert.equal(jibo.face.views.currentView.category, jibo.face.views.CATEGORY_EYE, 'current view should be eye');
                    });

                TestUtils.setExits(this, done, TestUtils.EXIT_EXIT, () => {
                    TestUtils.assertEachExecuted(this.flow);
                });

                this.skill.open(result);
            });

            describe('not in loop', function () {
                beforeEach(function() {
                    this.flow.when()
                        .activityName('Who Am I_ Collect Name')
                        .activeTransition('notInLoop');
                });

                it('should display eye view, get loop owner, play WhoAmI_NotInLoop.mim, and exit skill', function (done) {
                    this.timeout(40000);
                    this.flow.when()
                        .activityName('Who Am I_ Not Loop')
                        .do((activity, notepad, blackboard) => {
                            assert.equal(blackboard.flow.loopOwner.id, FAKE_OWNER_ID, 'loopOwner should be IDed');
                            assert.equal(jibo.face.views.currentView.category, jibo.face.views.CATEGORY_EYE, 'current view should be eye');
                        });

                    TestUtils.setExits(this, done, TestUtils.EXIT_EXIT, () => {
                        TestUtils.assertEachExecuted(this.flow);
                    });

                    this.skill.open(result);
                });

                it('WhoAmI_NotInLoop.mim should have loop owner in prompts', function (done) {
                    this.timeout(40000);
                    this.flow.when()
                        .activityName('Who Am I_ Not Loop')
                        .do((activity, notepad, blackboard) => {
                            assert.equal(activity.options.getPromptData().loopOwner.id, FAKE_OWNER_ID, 'prompt data loopOwner does not match owner');
                        });

                    TestUtils.setExits(this, done, TestUtils.EXIT_EXIT, () => {
                        TestUtils.assertEachExecuted(this.flow);
                    });

                    this.skill.open(result);
                });

                it('should end without redirect to enrollment', function (done) {
                    this.timeout(40000);
                    TestUtils.setExits(this, done, TestUtils.EXIT_EXIT, () => { /* no assertions */});

                    this.skill.open(result);
                });
            });

            describe('selected', function () {
                beforeEach(function() {
                    hubMock.pushListenResult(createLooperListenResult(this.skill.loop[0]));

                    this.flow.when()
                        .activityName('Who Am I_ Collect Name')
                        .say(this.skill.loop[0].getWrittenName());
                });

                it('should set flowClass.loopMember to selected', function (done) {
                    this.timeout(40000);
                    this.flow.when()
                        .after().activityName('loopMember = selected. Made a guess earlier?')
                        .do((activity, notepad, blackboard) => {
                            process.nextTick(() => {
                                TestUtils.assertAndFinish(done, () => {
                                    TestUtils.assertEachExecuted(this.flow);
                                    assert.equal(blackboard.flow.selectedLooper, blackboard.flow.loopMember.id, 'loopMember should be set to selected looper');
                                });
                            });
                        });

                    this.skill.open(result);
                });

                it('should display looperCoin and play WhoAmI_Confirm.mim', function (done) {
                    this.timeout(40000);
                    this.flow.when()
                        .activityName('Who Am I_ Confirm')
                        .do((activity, notepad, blackboard) => {
                            process.nextTick(() => {
                                TestUtils.assertAndFinish(done, () => {
                                    TestUtils.assertEachExecuted(this.flow);
                                    assert.equal(jibo.face.views.currentView.id, ViewIDs.LOOPER_COIN, 'current view is not looperCoin');
                                });
                            });
                        });

                    this.skill.open(result);
                });
            });

            describe('WhoAmI_Confirm.mim', function () {
                beforeEach(function() {
                    hubMock.pushListenResult(createLooperListenResult(this.skill.loop[0]));

                    this.flow.when()
                        .activityName('Who Am I_ Collect Name')
                        .say(this.skill.loop[0].getWrittenName());
                });

                it('swipe down should go to eye view, exit without redirecting', function (done) {
                    this.timeout(40000);
                    this.flow.when()
                        .activityName('Who Am I_ Confirm')
                        .do(() => {
                            jibo.face.gestures.spoofGesture('swipedown');
                        });

                    TestUtils.setExits(this, done, TestUtils.EXIT_EXIT, () => {
                        assert.equal(jibo.face.views.currentView.category, jibo.face.views.CATEGORY_EYE, 'current view should be eye');
                        TestUtils.assertEachExecuted(this.flow);
                    });

                    this.skill.open(result);
                });

                it('first "no" should play WhoAmI_CollectName.mim with loop list visible', function (done) {
                    this.timeout(40000);
                    this.flow.when()
                        .activityName('Who Am I_ Confirm')
                        .activeTransition('no')
                        .do((activity, notepad, blackboard) => {
                            assert.equal(notepad.errorCount, 0, 'notepad.errorCount should be 0');
                        });
                    this.flow.when()
                        .activityName('Who Am I_ Collect Name')
                        .do((activity, notepad, blackboard) => {
                            process.nextTick(()=>{
                                TestUtils.assertAndFinish(done, () => {
                                    TestUtils.assertEachExecuted(this.flow);
                                    assert.equal(notepad.errorCount, 1, 'notepad.errorCount should be 1');
                                });
                            });
                        });

                    this.skill.open(result);
                });

                describe('second "no" should DO THE SAME AS DESCRIBE NOT IN LOOP', function () {
                    beforeEach(function() {
                        hubMock.pushListenResult(createLooperListenResult(this.skill.loop[0]));

                        this.flow.when()
                            .activityName('Who Am I_ Confirm')
                            .activeTransition('no')
                            .do((activity, notepad, blackboard) => {
                                assert.equal(notepad.errorCount, 0, 'notepad.errorCount should be 0');
                            });
                        this.flow.when()
                            .activityName('Who Am I_ Collect Name')
                            .say(this.skill.loop[0].getWrittenName());
                        this.flow.when()
                            .activityName('Who Am I_ Confirm')
                            .activeTransition('no')
                            .do((activity, notepad, blackboard) => {
                                assert.equal(notepad.errorCount, 1, 'notepad.errorCount should be 1');
                            });
                    });

                    it('should display eye view, get loop owner, play WhoAmI_NotInLoop.mim, and exit skill', function (done) {
                        this.timeout(40000);
                        this.flow.when()
                            .activityName('Who Am I_ Not Loop')
                            .do((activity, notepad, blackboard) => {
                                assert.equal(notepad.errorCount, 2, 'notepad.errorCount should be 2');
                                assert.equal(blackboard.flow.loopOwner.id, FAKE_OWNER_ID, 'loopOwner should be IDed');
                                assert.equal(jibo.face.views.currentView.category, jibo.face.views.CATEGORY_EYE, 'current view should be eye');
                            });

                        TestUtils.setExits(this, done, TestUtils.EXIT_EXIT, () => {
                            TestUtils.assertEachExecuted(this.flow);
                        });

                        this.skill.open(result);
                    });

                    it('WhoAmI_NotInLoop.mim should have loop owner in prompts', function (done) {
                        this.timeout(40000);
                        this.flow.when()
                            .activityName('Who Am I_ Not Loop')
                            .do((activity, notepad, blackboard) => {
                                assert.equal(activity.options.getPromptData().loopOwner.id, FAKE_OWNER_ID, 'prompt data loopOwner does not match owner');
                            });

                        TestUtils.setExits(this, done, TestUtils.EXIT_EXIT, () => {
                            TestUtils.assertEachExecuted(this.flow);
                        });

                        this.skill.open(result);
                    });

                    it('should end without redirect to enrollment', function (done) {
                        this.timeout(40000);
                        TestUtils.setExits(this, done, TestUtils.EXIT_EXIT, () => {});

                        this.skill.open(result);
                    });
                });

                describe('yes', function () {
                    beforeEach(function() {
                        this.flow.when()
                            .activityName('Who Am I_ Confirm')
                            .activeTransition('yes');
                    });

                    it('should go to eye view', function (done) {
                        this.timeout(40000);
                        this.flow.when()
                            .activityName('Enrolled?')
                            .do(() => {
                                process.nextTick(() => {
                                    TestUtils.assertAndFinish(done, () => {
                                        TestUtils.assertEachExecuted(this.flow);
                                        assert.equal(jibo.face.views.currentView.category, jibo.face.views.CATEGORY_EYE, 'current view should be eye');
                                    });
                                });
                            });

                        this.skill.open(result);
                    });

                    it('if user is enrolled face AND voice, should play WhoAmI_Learned.mim, exit without redirect', function (done) {
                        this.timeout(40000);
                        this.flow.when()
                            .activityName('Who Am I_ Learned')
                            // don't need to do anything, just asserting we got to this activity

                        TestUtils.setExits(this, done, TestUtils.EXIT_EXIT, () => {
                            TestUtils.assertEachExecuted(this.flow);
                            assert(!this.flow.didExecuteActivity('Who Am I_ Want To Enroll'));
                        });

                        this.skill.open(result);
                    });
                });
            });

            describe('WhoAmI_WantToEnroll', function () {
                beforeEach(function() {
                    hubMock.pushListenResult(createLooperListenResult(this.skill.loop[1]));

                    this.flow.when()
                        .activityName('Who Am I_ Collect Name')
                        .say(this.skill.loop[1].getWrittenName());
                    this.flow.when()
                        .activityName('Who Am I_ Confirm')
                        .activeTransition('yes');
                });

                it('if user is NOT enrolled EITHER face OR voice OR both, should play WhoAmI_WantToEnroll.mim', function (done) {
                    this.timeout(40000);
                    this.flow.when()
                        .activityName('Who Am I_ Want To Enroll')
                        .do(() => {
                            process.nextTick(() => {
                                TestUtils.assertAndFinish(done, () => {
                                    TestUtils.assertEachExecuted(this.flow);
                                });
                            });
                        });

                    this.skill.open(result);
                });

                it('if "no," should play WhoAmI_NoEnroll.mim, exit without redirect', function (done) {
                    this.timeout(40000);
                    this.flow.when()
                        .activityName('Who Am I_ Want To Enroll')
                        .activeTransition('no');
                    this.flow.when()
                        .activityName('Who Am I_ No Enroll')
                        // don't need to do anything, just asserting we got to this activity

                    TestUtils.setExits(this, done, TestUtils.EXIT_EXIT, () => {
                        TestUtils.assertEachExecuted(this.flow);
                    });

                    this.skill.open(result);
                });

                it('if "yes," should redirect to enrollment', function (done) {
                    this.timeout(40000);
                    this.flow.when()
                        .activityName('Who Am I_ Want To Enroll')
                        .activeTransition('yes');

                    TestUtils.setExits(this, done, TestUtils.EXIT_REDIRECT, () => {
                        TestUtils.assertEachExecuted(this.flow);
                    });


                    this.skill.open(result);
                });
            });

            describe('redirect', function () {
                describe('redirect params', function () {
                    beforeEach(function() {
                        hubMock.pushListenResult(createLooperListenResult(this.skill.loop[1]));

                        this.flow.when()
                            .activityName('Who Am I_ Collect Name')
                            .say(this.skill.loop[1].getWrittenName());
                        this.flow.when()
                            .activityName('Who Am I_ Confirm')
                            .activeTransition('yes');
                        this.flow.when()
                            .activityName('Who Am I_ Want To Enroll')
                            .activeTransition('yes');
                    });

                    it('should redirect to introductions', function (done) {
                        this.timeout(40000);
                        let redirectStub = this.sandbox.stub(this.skill, 'redirect', (...args) => {
                            assert.equal(args[0], '@be/introductions');
                            TestUtils.assertEachExecuted(this.flow);
                            done();
                        });

                        this.skill.open(result);
                    });

                    it('result.nlu.intent should be "enrollment"', function (done) {
                        this.timeout(40000);
                        let redirectStub = this.sandbox.stub(this.skill, 'redirect', (...args) => {
                            assert.equal(args[1].nlu.intent, 'enrollment');
                            TestUtils.assertEachExecuted(this.flow);
                            done();
                        });

                        this.skill.open(result);
                    });

                    it('result.nlu.entities.recipient should match loopMember.id', function (done) {
                        this.timeout(40000);
                        let redirectStub = this.sandbox.stub(this.skill, 'redirect', (...args) => {
                            assert.equal(args[1].nlu.entities.recipient, this.skill.blackboard.flow.loopMember.id);
                            TestUtils.assertEachExecuted(this.flow);
                            done();
                        });

                        this.skill.open(result);
                    });
                });

                describe('result.nlu.entities.enrollmentType should match false values in KB', function () {
                    it('face: true, voice: false', function (done) {
                        this.timeout(40000);
                        hubMock.pushListenResult(createLooperListenResult(this.skill.loop[1]));

                        let redirectStub = this.sandbox.stub(this.skill, 'redirect', (...args) => {
                            assert.equal(args[1].nlu.entities.enrollmentType, 'voice');
                            TestUtils.assertEachExecuted(this.flow);
                            done();
                        });

                        this.flow.when()
                            .activityName('Who Am I_ Collect Name')
                            .say(this.skill.loop[1].getWrittenName());
                        this.flow.when()
                            .activityName('Who Am I_ Confirm')
                            .activeTransition('yes');
                        this.flow.when()
                            .activityName('Who Am I_ Want To Enroll')
                            .activeTransition('yes');

                        this.skill.open(result);
                    });

                    it('face: false, voice: true', function (done) {
                        this.timeout(40000);
                        hubMock.pushListenResult(createLooperListenResult(this.skill.loop[2]));
                        
                        let redirectStub = this.sandbox.stub(this.skill, 'redirect', (...args) => {
                            assert.equal(args[1].nlu.entities.enrollmentType, 'face');
                            TestUtils.assertEachExecuted(this.flow);
                            done();
                        });

                        this.flow.when()
                            .activityName('Who Am I_ Collect Name')
                            .say(this.skill.loop[2].getWrittenName());
                        this.flow.when()
                            .activityName('Who Am I_ Confirm')
                            .activeTransition('yes');
                        this.flow.when()
                            .activityName('Who Am I_ Want To Enroll')
                            .activeTransition('yes');

                        this.skill.open(result);
                    });

                    it('face: false, voice: false', function (done) {
                        this.timeout(40000);
                        hubMock.pushListenResult(createLooperListenResult(this.skill.loop[3]));

                        let redirectStub = this.sandbox.stub(this.skill, 'redirect', (...args) => {
                            assert.equal(args[1].nlu.entities.enrollmentType, 'all');
                            TestUtils.assertEachExecuted(this.flow);
                            done();
                        });

                        this.flow.when()
                            .activityName('Who Am I_ Collect Name')
                            .say(this.skill.loop[3].getWrittenName());
                        this.flow.when()
                            .activityName('Who Am I_ Confirm')
                            .activeTransition('yes');
                        this.flow.when()
                            .activityName('Who Am I_ Want To Enroll')
                            .activeTransition('yes');

                        this.skill.open(result);
                    });
                });
            });
        });
    });
});
