'use strict';

const KBTools = global._eosTest.KBTools.KBTools;
const CategoryKBNode = global._eosTest.CategoryKBNode.CategoryKBNode;
const UserKBNode = global._eosTest.UserKBNode.UserKBNode;
const EoSKBNode = global._eosTest.EoSKBNode.EoSKBNode;

describe('KB', function() {

	after(function() {
		// Clear test kb
		KBTools._kbModel = undefined;
	});

	describe('KBTools', function() {

		it('Create test KB model', function() {
			return KBTools._createModel('/jibo/eos_test');
		});

		it('Get root', function() {
			return KBTools.getRoot()
				.then( root => {
					expect(typeof root.data).to.equal('object');
				});
		});

		it('Create categories node', function() {
			let catRoot;
			return KBTools.getCategoriesNode()
				.then( _catRoot => {
					catRoot = _catRoot;
					expect(typeof catRoot.data).to.equal('object');
					return KBTools.getRoot();
				}).then( root => {
					expect(root.edges.categories[0]).to.equal(catRoot._id);
				});
		});

		it('Create users node', function() {
			let userRoot;
			return KBTools.getUsersNode()
				.then( _userRoot => {
					userRoot = _userRoot;
					expect(typeof userRoot.data).to.equal('object');
					return KBTools.getRoot();
				}).then( root => {
					expect(root.edges.users[0]).to.equal(userRoot._id);
				});
		});
	});

	describe('CategoryKBNode', function() {
		let lastSelectedTime;
		it('Load category', function() {
			return CategoryKBNode.getOrCreate('testCategory')
				.then( cat => {
					lastSelectedTime = cat.getData().lastSelectedTime;
					expect(cat.getData().categoryName).to.equal('testCategory');
					expect(typeof lastSelectedTime).to.equal('number');
				});
		});

		it('Write to category', function() {
			return CategoryKBNode.getOrCreate('testCategory')
				.then( cat => {
					cat.getData().lastSelectedTime = lastSelectedTime + 1;
					return cat.save();
				}).then( () => CategoryKBNode.getOrCreate('testCategory') )
				.then( cat => {
					expect(cat.getData().categoryName).to.equal('testCategory');
					expect(cat.getData().lastSelectedTime).to.equal(lastSelectedTime + 1);
				});
		});
	});

	describe('UserKBNode', function() {
		it('Load User', function() {
			return UserKBNode.getOrCreate('testUser')
				.then( user => {
					expect(user.getData().userID).to.equal('testUser');
				});
		});
	});

	describe('EoSKBNode', function() {
		it('Load EoSNode', function() {
			return EoSKBNode.getOrCreate()
				.then( user => {
					expect(typeof user.getData().lastEoSDelivery).to.equal('number');
				});
		});
	});
});
