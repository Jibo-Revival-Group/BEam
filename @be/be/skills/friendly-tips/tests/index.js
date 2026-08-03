"use strict";

//make sure we use skill's jibo
require('jibo');
const TestUtils = require('./TestUtils');
const FriendlyTips = require('../index');
const BeFramework = require('@be/be-framework');
const ssm = require('skills-service-manager');
const { FlowHarness, DebugFlowExecutor } = require('@be/skills-test-utils');

describe('skills', function() {
    describe('friendly-tips', function() {
        before(function(done){
            this.timeout(30000);
            global.framework = {
                BeSkill: BeFramework.BeSkill,
            };

            TestUtils.beforeTests(() => {
                this.skill = new FriendlyTips('foo');
                this.skill.assetPack = '';
                done();
            });
        });

        beforeEach(function(done) {
            this.sandbox = sinon.sandbox.create();
            this.flow = new FlowHarness(ssm);
            this.skill.flowOverrides = { harnesses: [this.flow], flowExecutor: DebugFlowExecutor };
            this.skill.preload(done);
        });

        afterEach(function(done){
            this.sandbox.restore();
            this.skill.removeAllListeners();
            this.skill.flowOverrides = null;
            this.flow = null;
            this.skill.close(() => {
                done();
            });
        });

        after(function(){
            TestUtils.afterTests();
            this.skill = null;
        });

        require('./FriendlyTips.test');
    });
});
