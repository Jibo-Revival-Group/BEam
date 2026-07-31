'use strict';

const TestUtils = require('./TestUtils');

// Sets up test containers
const pack = require('../package.json');
global._eosTest = {};
global._eosTest.main = require('../' + pack.main);

describe('skills', function() {
    describe('surprises', function() {

        before(function(done) {
            this.timeout(30000);
            TestUtils.beforeTests(done);
        });

        after(function() {
            TestUtils.afterTests();
        });

        require('./EoSKB.test');
        require('./SurpriseSkill.test');
        require('./HighestPriorityPolicy.test');
        require('./SurpriseElement.test');
    });
});
