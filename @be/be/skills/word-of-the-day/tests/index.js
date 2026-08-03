"use strict";
const TestUtils = require('@be/skills-test-utils');
const WordOfTheDay = require('../index');
const skill = new WordOfTheDay('@be/word-of-the-day');
skill.assetPack = '';

TestUtils.SkillsTestSetup();

describe('WordOfTheDay Data Validation', function() {
    describe('words', function() {
        let words = 'hi';
        before(function(done) {
            jibo.loader.load('assets/words.json', (err, data)=>{
                words = data;
                done();
            });
        });

        beforeEach(function() {

        });

        after(function() {
        });

        describe('validate', function(done) {
            it('all questions must have unique IDs', (done)=>{
                let word;
                for(let i = 0; i < words.length; i++){
                    assert.isString(words[i].id, `word ${i} missing id`);
                    for(let j = 0; j < words.length; j++){
                        if(j === i){
                            continue;
                        }
                        assert.notEqual(words[i].id, words[j].id, `word ${i} id matches word ${j} id`);
                    }
                }
                done();
            });

            it('all questions must have questions', (done)=>{
                words.forEach((word)=>{
                    assert.isString(word.question, `word ${word.id} has bad question`);
                    assert(!!word.question.length, `word ${word.id} has empty question`);
                });
                done();
            });

            it('all questions must have 3 answers', (done)=>{
                words.forEach((word)=>{
                    assert(word.answers.length === 3, `word ${word.id} has wrong number of answers`);
                });
                done();
            });

            it('all questions must have 1 right answer', (done)=>{
                words.forEach((word)=>{
                    let correct = [];
                    word.answers.forEach((answer)=>{
                        assert.isString(answer.answer, 'answer should be string');
                        if(answer.correct){
                            correct.push(answer.answer);
                        }
                    })
                    assert(correct.length === 1, `word ${word.id} has ${correct.length} correct answers, ${correct}`);
                });
                done();
            });
        });
    });
});

describe('WordOfTheDay Skill Tests', function() {
    describe('index', function() {
        before(function(done) {
            jibo.face.views.resetTransTime(10);
            skill.postInit(done);
        });

        beforeEach(function(done) {
            skill.preload(done);
        });

        after(function() {
            jibo.face.views.resetTransTime();
        });

        describe('sanitycheck', function() {
            it('should open and close cleanly', function(done) {
                try {
                    skill.open();
                }
                catch (err) {
                    assert.fail(`there was an open error ${err}`)
                }
                setTimeout(() => {
                    try {
                        skill.close((err) => {
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
    });
});

describe('QuestionSelector tests', function() {
    describe('selectQuestion', function() {
        before(function(done) {
            jibo.face.views.resetTransTime(10);
            skill.postInit(done);
        });

        after(function() {
            jibo.face.views.resetTransTime();
        });

        it('selectQuestion should choose unused questions when possible', function(done) {
            skill._mainRoot.data.lastPlayed = 0;
            skill.preload(() => {
                skill._questionSelector._playedRoot.data = {};
                let questions = [];
                const numQuestions = skill._questionSelector._questions.length;
                let currentQuestion = 0;
                const selectQuestions = ()=>{
                    return skill._questionSelector.selectQuestion()
                        .then((question)=>{questions.push(question.id);})
                        .then(()=>{
                            if(++currentQuestion < numQuestions){
                                skill._questionSelector._thisTime += 1000 * 60 * 60 * 24;
                                return selectQuestions();
                            }
                        });
                };
                selectQuestions().then(()=>{
                    let questionSet = new Set(questions);//Set eliminates duplicate values
                    done(questionSet.size === questions.length ? null : new Error('questions should be unique'));
                });
            });
        });

        it('selectQuestion should choose a random question when all questions have been used', function(done) {
            skill._mainRoot.data.lastPlayed = 0;
            skill.preload(() => {
                const OVERAGE = 3;
                skill._questionSelector._playedRoot.data = {};
                let questions = [];
                const numQuestions = skill._questionSelector._questions.length + OVERAGE;
                let currentQuestion = 0;
                const selectQuestions = ()=>{
                    return skill._questionSelector.selectQuestion()
                        .then((question)=>{questions.push(question.id);})
                        .then(()=>{
                            if(++currentQuestion < numQuestions){
                                skill._questionSelector._thisTime += 1000 * 60 * 60 * 24;
                                return selectQuestions();
                            }
                        });
                };
                selectQuestions().then(()=>{
                    let questionSet = new Set(questions);//Set eliminates duplicate values
                    done(questionSet.size === questions.length - OVERAGE ? null : new Error('questions should be resused after we run out'));
                });
            });
        });

        it('selectQuestion should choose same question when day hasnt changed', function(done) {
            const fakeYesterday = 0;
            const fakeToday = 1000 * 60 * 60 * 24;
            const origDateNow = global.Date.now;
            global.Date.now = ()=>{return fakeToday};
            skill._mainRoot.data.lastPlayed = fakeYesterday;
            skill.preload(() => {
                global.Date.now = origDateNow;//restore original Date.now()
                skill._questionSelector._playedRoot.data = {};

                skill._questionSelector.selectQuestion().then((question1)=>{
                    skill._questionSelector.selectQuestion().then((question2)=>{
                        done(question1.id === question2.id ? null : 'should choose the same word all day');
                    });
                });
            });
        });
    });
});
describe('RuleGenerator tests', function() {
    before(function(done) {
        jibo.face.views.resetTransTime(10);
        skill.postInit(done);
    });

    after(function() {
        jibo.face.views.resetTransTime();
    });
    describe('generateRule', function() {
        before(function(done) {
            skill.preload(() => {done();});
        });
        const questions = require('../assets/words.json');
        for(let question of questions){
            it(`should generate valid rule for question ${question.id}`, function(){
                const rule = skill._ruleGenerator.generateRule(question);
                assert.equal(rule.parse(question.answers[0].answer), 'right', 'Right answer should parse as "right"');
                assert.equal(rule.parse(question.answers[1].answer), 'decoy1', 'Decoy 1 answer should parse as "decoy1"');
                assert.equal(rule.parse(question.answers[2].answer), 'decoy2', 'Decoy 2 answer should parse as "decoy2"');
                assert.equal(rule.parse('asldfahwerasdf'), 'noMatch', 'Non answer should parse as "noMatch"');
            });
        }
    });
});
