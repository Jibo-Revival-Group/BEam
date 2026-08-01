'use strict';

const async = require('async');

const ElementsOfSurprise = global._eosTest.main.Skill;

const Utils = global._eosTest.Utils.Utils;

/**
 * Stubs out the getEosControlOptions method (which would normally attempt to read them from disk)
 * and opens the skill, waits for a result and compares it with the expected choice
 * @param {object} instance Skill instance
 * @param {object} openOptions Options to open skill with
 * @param {object} eosControlOptions Control options object
 * @param {string} eventName Test event name to wait for
 * @param {object} expectedPayload The payload we expect with the event
 * @param {function} done Callback for when done
 * @param {number} [repeat=1] How many times to repeat test
 */
function runSkillTest(instance, openOptions, eosControlOptions, eventName, expectedPayload, done, repeat) {
    if (!repeat) {
        repeat = 1;
    }

    // Here we enable the control options
    instance.eosControl.setOverridingTestConfig(eosControlOptions);

    let tasks = [];
    for (let i = 0; i < repeat; i++) {
        tasks.push( cb => {
            instance.postInit( error => {
                if (error) return cb(error);
                Utils._testEmitter.once(eventName, data => {
                    cb(undefined, data)
                });
                instance.open(openOptions);
            });
        });
    }

    async.series(tasks, (error, result) => {
        // Here we enable the control options
        instance.eosControl.clearOverridingTestConfig();
        if (error) return done(error);
        try {
            // Make sure that each payload was as expected
            result.forEach(payload => expect(payload).to.deep.equal(expectedPayload) );
            done();
        } catch (e) {
            done(e);
        }
    });
}


let instance;

describe('Beta2SelectionPolicy', function() {

	let originalCategoryName;

	beforeEach(function() {
		instance = new ElementsOfSurprise({assetPack: '@be/elements-of-surprise'});
		instance._standalone();
		originalCategoryName = instance.categories[0].assetPack;
		instance.categories[0].assetPack = Utils.SkillNames.DATE_COMMENTARY;
	});

	afterEach(function() {
		instance.categories[0].assetPack = originalCategoryName;
	});

	it('< 1 day since OOBE', function(done) {
		runSkillTest(instance, {}, {
			daysSinceOOBE: 0
		}, 'exit', ['SELECTED', null], done);
	});

	it('Clock skill with low prob', function(done) {
		runSkillTest(instance, {lastSkill: Utils.SkillNames.CLOCK}, {
			daysSinceOOBE: 100,
			hasAnyDateFactPlayedToday: false,
			probabilityDateFact: 0.1,
		}, 'exit', ['SELECTED', null], done)
	});

	it('Clock skill with high prob', function(done) {
		runSkillTest(instance, {lastSkill: Utils.SkillNames.CLOCK}, {
			daysSinceOOBE: 100,
			hasAnyDateFactPlayedToday: false,
			probabilityDateFact: 0.8,
		}, 'exit', ['SELECTED', Utils.SkillNames.DATE_COMMENTARY], done)
	});

	it('Greetings skill not IDed, politeComments=0.49', function(done) {
		runSkillTest(instance, {lastSkill: Utils.SkillNames.GREETINGS}, {
			daysSinceOOBE: 100,
			userIDed: false,
			probabilityPoliteComment: 0.49,
		}, 'exit', ['SELECTED', null], done)
	});

	it('Greetings skill not IDed, politeComments=0.51, has not played DC today', function(done) {
		runSkillTest(instance, {lastSkill: Utils.SkillNames.GREETINGS}, {
			daysSinceOOBE: 100,
			userIDed: false,
			hasAnyDateFactPlayedToday: false,
			probabilityPoliteComment: 0.51,
		}, 'exit', ['SELECTED', Utils.SkillNames.DATE_COMMENTARY], done)
	});

	it('Greetings skill not IDed, politeComments=0.51, has played DC today', function(done) {
		runSkillTest(instance, {lastSkill: Utils.SkillNames.GREETINGS}, {
			daysSinceOOBE: 100,
			userIDed: false,
			hasAnyDateFactPlayedToday: true,
			probabilityPoliteComment: 0.51,
		}, 'exit', ['SELECTED', null], done)
	});


	it('Greetings skill IDed and doesnt like EoS', function(done) {
		runSkillTest(instance, {lastSkill: Utils.SkillNames.GREETINGS}, {
			daysSinceOOBE: 100,
			userIDed: true,
			likesEoS: 'FALSE',
		}, 'exit', ['SELECTED', null], done)
	});

	it('Greetings skill IDed, likesEos=UNKNOWN, timeSinceLast = 12hrs goes to Idle', function(done) {
		runSkillTest(instance, {lastSkill: Utils.SkillNames.GREETINGS}, {
			daysSinceOOBE: 100,
			userIDed: true,
			likesEoS: 'UNKNOWN',
			timeSinceLastEoSOfferMs: 3 * Utils.HOUR_TO_MS
		}, 'exit', ['SELECTED', null], done)
	});

	it('Greetings skill IDed, likesEos=TRUE, timeSinceLast = 6hrs goes to Idle', function(done) {
		runSkillTest(instance, {lastSkill: Utils.SkillNames.GREETINGS}, {
			daysSinceOOBE: 100,
			userIDed: true,
			likesEoS: 'TRUE',
			timeSinceLastEoSOfferMs: 3 * Utils.HOUR_TO_MS
		}, 'exit', ['SELECTED', null], done)
	});

	it('Greetings skill IDed, likesEos=UNKNOWN, timeSinceLast = 13hrs, goes to PC_EOSType', function(done) {
		runSkillTest(instance, {lastSkill: Utils.SkillNames.GREETINGS}, {
			daysSinceOOBE: 100,
			userIDed: true,
			likesEoS: 'UNKNOWN',
			timeSinceLastEoSOfferMs: 20 * Utils.HOUR_TO_MS
		}, 'EOSType', undefined, done)
	});

	it('Greetings skill IDed, likesEos=TRUE, timeSinceLast = 7hrs, goes to PC_EOSType', function(done) {
		runSkillTest(instance, {lastSkill: Utils.SkillNames.GREETINGS}, {
			daysSinceOOBE: 100,
			userIDed: true,
			likesEoS: 'TRUE',
			timeSinceLastEoSOfferMs: 7 * Utils.HOUR_TO_MS
		}, 'EOSType', undefined, done)
	});

	it('Greetings skill IDed, likesEos=TRUE, timeSinceLast = 7hrs, PC_EOSType=0.59, goes to date commentary', function(done) {
		runSkillTest(instance, {lastSkill: Utils.SkillNames.GREETINGS}, {
			daysSinceOOBE: 100,
			userIDed: true,
			likesEoS: 'TRUE',
			timeSinceLastEoSOfferMs: 7 * Utils.HOUR_TO_MS,
			probabilityEOSType: 0.59
		}, 'exit', ['SELECTED', Utils.SkillNames.DATE_COMMENTARY], done)
	});

	it('Greetings skill IDed, likesEos=TRUE, timeSinceLast = 7hrs, PC_EOSType=0.61, goes to Idle', function(done) {
		runSkillTest(instance, {lastSkill: Utils.SkillNames.GREETINGS}, {
			daysSinceOOBE: 100,
			userIDed: true,
			likesEoS: 'TRUE',
			timeSinceLastEoSOfferMs: 7 * Utils.HOUR_TO_MS,
			probabilityEOSType: 0.61
		}, 'exit', ['SELECTED', null], done)
	});
});
