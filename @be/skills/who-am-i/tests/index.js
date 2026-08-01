"use strict";

//make sure we use skill's jibo
require('jibo');
const TestUtils = require('./TestUtils');
const WhoAmI = require('../index');
const BeFramework = require('@be/be-framework');
const ssm = require('skills-service-manager');
const { FlowHarness, DebugFlowExecutor } = require('@be/skills-test-utils');

describe('skills', function() {
    describe('who-am-i', function() {
        before(function(done){
            this.timeout(30000);
            global.framework = {
                BeSkill: BeFramework.BeSkill,
            };

            TestUtils.beforeTests(() => {
                this.skill = new WhoAmI('foo');
                this.skill.assetPack = '';
                jibo.kb.loop.loadLoop().then((loop) => {
                    this.skill.loop = loop;
                    done()
                });
            });
        });

        beforeEach(function(done) {
            jibo.face.views.resetTransTime(10);
            this.sandbox = TestUtils.createSandbox();
            this.flow = new FlowHarness(ssm);
            this.skill.flowOverrides = { harnesses: [this.flow], flowExecutor: DebugFlowExecutor };
            this.skill.identity = jibo.lps.identity;
            //preload would just install embodied speech, which we don't want
            //this.skill.preload(done);
            done();
        });

        afterEach(function(done){
            this.timeout(4000);
            jibo.face.views.resetTransTime();
            this.skill.removeAllListeners();
            this.skill.flowOverrides = null;
            this.flow = null;
            this.skill.close(() => {
                //restore the sandbox afterwards, to ensure we don't orphan any fakeTimer callbacks
                if (this.sandbox) {
                    TestUtils.restoreSandbox(this.sandbox);
                    this.sandbox = null;
                }
                done();
            });
        });

        after(function(){
            this.skill.loop = null;
            TestUtils.afterTests();
            this.skill = null;
        });

        require('./WhoAmI.test');
    });
});
