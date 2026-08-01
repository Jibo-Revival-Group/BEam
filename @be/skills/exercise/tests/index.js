"use strict";

//make sure we use skill's jibo
require('jibo');
const TestUtils = require('./TestUtils');
const Exercise = require('../index');
const BeSkill = require('@be/be-framework');

describe('Exercise', function() {

    this.timeout(100000);

    before(function (done) {
        this.timeout(30000);
        global.framework = {
            BeSkill: BeSkill.BeSkill
        };

        TestUtils.beforeTests(done);
    });

    beforeEach(function () {
        jibo.face.views.resetTransTime(10);
    });

    afterEach(function (done) {
        jibo.face.views.changeView({ removeAll: true },
            () => {
                done();
            }, (err) => {
                done(err);
            });
    });

    after(function () {
        TestUtils.afterTests();
        jibo.face.views.resetTransTime();
    });

    require('./Exercise.test');
});
