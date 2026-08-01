'use strict';

const SurpriseSkill = global._eosTest.main.Skill;
const SurpriseTemplate = global._eosTest.main.SurpriseTemplate;

function runTest(categories, options, expectedSkill, done) {
	const instance = new SurpriseSkill();
	instance.supplyCategories(categories);

	sinon.stub(instance, 'open', () => {
		instance.open.restore();
		instance._open(options).then(res => {
			const name = res[0];
			expect(name, expectedSkill);
			done();
		}).catch(done);
	});

	instance.init();
}


describe('SurpriseSkill', function() {
	it('Loading EoS through main export', function() {
		expect(typeof SurpriseSkill).to.equal('function');
		expect(SurpriseSkill.name).to.equal('SurpriseSkill');
	});

	it('Opening instance of skill', function(done) {
		runTest([
			new SurpriseTemplate({assetPack: '@be/a'}, 10, 10),
			new SurpriseTemplate({assetPack: '@be/b'}, 10, 20),
		], {}, 'b', done);
	});
});

