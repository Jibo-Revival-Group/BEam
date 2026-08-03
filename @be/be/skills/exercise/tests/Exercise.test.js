const TestUtils = require('./TestUtils');
const Exercise = require('../index');

mocha.bail(true);
let exerciseSkill;

describe('Exercise Skill Tests', function() {
    describe('index', function() {
        describe.skip('sanitycheck', function() {
            before(function(done) {
                exerciseSkill = new Exercise();
                exerciseSkill.postInit(()=>{});
                exerciseSkill.preload(done);
            });

            beforeEach(function(done) {
                this.sandbox = TestUtils.createSandbox();
                this.sandbox.stub(global.framework.BeSkill.prototype, "init", function () { });
                done();
            });

            afterEach(function(done) {
                if (this.sandbox) {
                    TestUtils.restoreSandbox(this.sandbox);
                    this.sandbox = null;
                }
                done();
            });

            it('should open and close cleanly', function(done) {
                try {
                    exerciseSkill.open();
                }
                catch (err) {
                    assert.fail(`there was an open error ${err}`)
                }
                setTimeout(() => {
                    try {
                        exerciseSkill.close((err) => {
                            assert(
                                jibo.face.views.viewStackLength <= 1,
                                'Should have 1 or fewer views active after close'
                            );
                            done();
                        });
                    }
                    catch (err) {
                        assert.fail(`there was a close error ${err}`);
                    }
                }, 1000);
            });
        });

        describe('rounds', function() {
            let rounds;
            before(function(done) {
                jibo.loader.load('resources/yoga-rounds.json', (err, data)=>{
                    assert.isOk(data, `there are no rounds`);
                    rounds = data;
                    done();
                });
            });

            describe('validate existence', function(done) {
                it('all rounds must have a name', (done)=>{
                    rounds.forEach((round, i) => {
                        assert.isOk(round.name, `round ${i} missing a name`);
                    });
                    done();
                });

                it('all rounds must have a valid type', (done)=>{
                    rounds.forEach((round, i) => {
                        assert.isOk(round.type, `round ${i} missing a type`);
                        assert.match(round.type, /^(esml|image)/g, `round ${i} must have a valid type`);
                    });
                    done();
                });
            });
        });

        describe('routines', function() {
            let routines;
            before(function(done) {
                jibo.loader.load('resources/yoga-routines.json', (err, data)=>{
                    assert.isOk(data, `there are no routines`);
                    routines = data;
                    done();
                });
            });

            describe('validate existence', function(done) {
                it('all routines must have a name', (done)=>{
                    routines.forEach((routine, i) => {
                        assert.isOk(routine.name, `routine ${i} missing a name`);
                    });
                    done();
                });

                it('all routines must have a sequence', (done)=>{
                    routines.forEach((routine, i) => {
                        assert.isOk(routine.sequence, `routine ${i} missing a sequence`);
                    });
                    done();
                });

                it('all rounds of a routine sequence must exist in the rounds file', (done) => {
                    let rounds;
                    jibo.loader.load('resources/yoga-rounds.json', (err, data)=>{
                        rounds = data;
                        routines.forEach((routine, i) => {
                            routine.sequence.forEach((roundName, j) => {
                                let roundExists = rounds.findIndex((round)=>{ return round.name === roundName }) >= 0;
                                assert(roundExists, `round ${roundName} in routine ${routine.name} doesn't exist in rounds json`);
                            });
                        });
                        done();
                    })
                });
            });
        });
    });
});
