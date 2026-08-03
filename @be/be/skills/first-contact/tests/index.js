"use strict";

const TestUtils = require('@be/skills-test-utils');
let { FirstContactSkill, FirstContactCloseStatus } = require('../index');
let BeFramework = require('@be/be-framework');

TestUtils.SkillsTestSetup();

describe('First Contact Skill Tests', function(){
    describe('index', function(){
        it('should "close from a flow" normally', function(done){
            let firstContactSkill = new FirstContactSkill("@be/restore");
    
            new Promise((resolve)=>{
                sinon.stub(jibo.flow, "run", function(){
                    jibo.flow.run.restore();
                    let flow = jibo.flow.run(...arguments);
                    let interval = setInterval(()=>{
                        if(flow.state === jibo.flow.State.IN_PROGRESS) {
                            clearInterval(interval);
                            resolve();
                        }
                    }, 10);
                    return flow;
                });
            })
            .then(()=>{
                firstContactSkill.close((status, returnValue)=>{
                    assert.isNull(status);
                    assert.equal(returnValue, FirstContactCloseStatus.STOPPED_AND_DESTROYED_FLOW);
                    done();
                });
            });

            firstContactSkill.open();
        });

        it('should not "close from a flow" if first contact is closed before the expression system has finished turning attention mode to off', function(done){
            let firstContactSkill = new FirstContactSkill("@be/restore");
    
            sinon.stub(jibo.expression, "pushAttentionMode", function(mode){
                jibo.expression.pushAttentionMode.restore();
                assert.equal(mode, jibo.expression.AttentionMode.OFF);

                firstContactSkill.close((status, returnValue)=>{
                    assert.isNull(status);
                    assert.equal(returnValue, FirstContactCloseStatus.NO_FLOW);
                    done();
                });

                return jibo.expression.pushAttentionMode(mode);
            });

            firstContactSkill.open();
        });
    });
});
