'use strict';

const HighestPriorityPolicy = global._eosTest.main.policies.HighestPriorityPolicy;

function createCategoryResult(name,  totalPriority) {
	return {
		category: {
			assetPack: name
		},
		totalPriority: totalPriority,
	}
}

describe('HighestPrioritySelectionPolicy', function() {

	it('With no categories', function() {
		let policy = new HighestPriorityPolicy(null);
		return policy.select(null, [])
		.then(res => expect(res).to.equal(null) );
	});

	it('With one category', function() {
		let policy = new HighestPriorityPolicy(null);
		return policy.select(null, [
			createCategoryResult('a', 10)
		])
		.then(res => expect(res.assetPack).to.equal('a') );
	});

	it('With many categories and different priorities', function() {
		let policy = new HighestPriorityPolicy(null);
		let categories = [createCategoryResult('a', 100)];
		for (let i = 0; i < 100; i++) {
			categories.push(createCategoryResult('b', 50));
		}
		return policy.select(null, categories)
		.then(res => expect(res.assetPack).to.equal('a') );
	});

	it('Choosing lower priority the second time when there are ties', function() {
		let policy = new HighestPriorityPolicy(null);
		let categories = [
			createCategoryResult('a', 100),
			createCategoryResult('b', 50),
		];

		return policy.select(null, categories)
		.then(res => {
			expect(res.assetPack).to.equal('a') 
			return policy.select(null, categories);
		})
		.then(res => {
			expect(res.assetPack).to.equal('b') 
			return policy.select(null, categories);
		});
	});

	it('Choosing lower priority the second time when there are ties', function() {
		let policy = new HighestPriorityPolicy(null);
		let categories = [
			createCategoryResult('a', 100),
			createCategoryResult('b', 100),
			createCategoryResult('c', 50),
		];

		return policy.select(null, categories)
		.then(res => {
			expect(res.assetPack).to.equal('a') 
			return policy.select(null, categories);
		})
		.then(res => {
			expect(res.assetPack).to.equal('b') 
			return policy.select(null, categories);
		})
		.then(res => {
			expect(res.assetPack).to.equal('a') 
		});
	});
});
