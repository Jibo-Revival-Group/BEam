'use strict';
const TestUtils = require('@be/skills-test-utils');

describe('skills', function () {
    TestUtils.SkillsTestSetup();
    require('./remote');
});
