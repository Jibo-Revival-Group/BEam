"use strict";
const TestUtils = require('@be/skills-test-utils');
const RadioSkill = require('../index');
const radioSkill = new RadioSkill('foo');
radioSkill.assetPack = '';

TestUtils.SkillsTestSetup();

describe('Radio Skill Tests', function(){
    describe('index', function(){
        before(function(done){
            jibo.face.views.resetTransTime(10);
            radioSkill.postInit(done);
        });

        beforeEach(function(done){
            radioSkill.preload(done);
        });

        after(function() {
            jibo.face.views.resetTransTime();
        });

        describe('sanitycheck', function(){
            it('should open and close cleanly', function(done){
                try{
                    radioSkill.open();
                }
                catch(err){
                    assert.fail(`there was an open error ${err}`)
                }
                setTimeout(()=>{
                    try{
                        radioSkill.close(()=>{
                            assert(jibo.face.views.viewStackLength <= 1, 'Should have 1 or fewer views active after close');
                            done();
                        });
                    }
                    catch(err){
                        assert.fail(`there was a close error ${err}`)
                    }
                }, 1000);
            });
        });
    });
});
