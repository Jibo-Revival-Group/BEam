'use strict';
const TestUtils = require('@be/skills-test-utils');

global._nimbusTest = {};
global._nimbusTest.main = require("..");

describe('skills', function () {
    TestUtils.SkillsTestSetup();
    require('./nimbus');
});
