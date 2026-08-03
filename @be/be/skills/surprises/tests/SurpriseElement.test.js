'use strict';

const SurpriseElement = global._eosTest.main.SurpriseElement;
let instance;

describe('SurpriseElement', function() {

	beforeEach(function() {
		instance = new SurpriseElement({assetPack: '@be/something'});
	});

	it('Loading EoSCategory through main export', function() {
		expect(typeof SurpriseElement).to.equal('function');
		expect(SurpriseElement.name).to.equal('SurpriseElement');
	});

	it('Initializing and starting', function(done) {
		sinon.stub(instance, 'open', (/*result*/) => {
			instance.open.restore();
			done();
		});
		instance.init();
	});
});