"use strict";
const TestUtils = require('@be/skills-test-utils');
let HueControlSkill = require('../index');

TestUtils.SkillsTestSetup();

describe('HueControl Skill Tests', function(){
    describe('index', function(){
        before(function(){
            jibo.face.views.resetTransTime(10);
        });

        beforeEach(function(){
        });

        after(function() {
            jibo.face.views.resetTransTime();
        });

        describe('sanitycheck', function(){
            it('should open and close cleanly', function(done){
                let hueControlSkill = new HueControlSkill("@be/hue-control");
                try{
                    hueControlSkill.open();
                }
                catch(err){
                    assert.fail(`there was an open error ${err}`)
                }
                setTimeout(()=>{
                    try{
                        hueControlSkill.close(()=>{
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
