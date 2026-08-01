"use strict";
const jibo = require("jibo");
const path = require("path");
const libraries = require("@be/be-framework").libraries;
const cu = libraries.jibo_cai_utils;
const nimbus = global._nimbusTest.main;
const Nimbus = global._nimbusTest.main.Skill;
let MimRunner = nimbus.MimRunner;
let ProcessCloudState = nimbus.ProcessCloudState;
let BeFramework = require('@be/be-framework');

let assetPack = {
    assetPack: "@be/nimbus",
    rootPath: jibo.utils.PathUtils.findRoot()
};
const NL_TIMEOUT = 15 * 1000;
const TIMOUT_ERROR_MESSAGE = "Error: ETIMEDOUT";

const actions = require('../res/test-actions.json');

let instance = new Nimbus(assetPack);
let sandbox = sinon.sandbox.create();

describe('nimbus', function() {

    afterEach( function(done){
        setTimeout(done, 200);  // Wait for 200ms in between each test
    });

    it("Instance is ok", function() {
        expect(instance.core).to.be.ok;
        expect(instance.outer).to.be.ok;
        instance.core.toDotFile('nimbus.dot');
        instance.outer.toDotFile('outer-nimbus.dot');
    });

    describe("User Flows", function () {

        before((done) => {
            done();
        });

        afterEach(function () {
            sandbox.restore();
        });

        function generateSSWData(action) {
            return {
                asr: 'blah',
                nlu: 'blah',
                match: action.skill.id,
                cloudSkillResponse: Promise.resolve(action)
            }
        }

        function setPassingCriteria(expectedStates, redirect, assertions, done) {
            let mimPaths = [];

            sandbox.stub(MimRunner.prototype, 'init', (options) => {
                mimPaths.push(options.mimPath);
            });
            sandbox.stub(MimRunner.prototype, 'run', () => {
                return Promise.resolve();
            });
            sandbox.stub(instance, 'exit', (trans, data) => {
                const traceStates = instance.core.getTrace().map((e) => {
                    return e.transition.getDestinationState();
                });
                try {
                    expect(traceStates).to.deep.equal(expectedStates);
                    assertions.forEach(assert => {
                        assert();
                    })
                    instance.close((err) => {
                        done(err);
                    });
                } catch (e) {
                    console.error("traceStates")
                    console.error(traceStates)
                    console.error("expectedStates")
                    console.error(expectedStates)
                    done(e);
                }
            });
        }

        it("Slim Action", function (done) {
            const sswResult = generateSSWData(actions.slim);
            const expectedStates = [
                instance.coreStates.initialize,
                instance.coreStates.processCloud,
                instance.coreStates.doCloudAction,
                instance.coreStates.done
            ];
            setPassingCriteria(
                expectedStates,
                false,
                [],
                done
            );
            instance.open(sswResult);
        });

        it("Sequence of Slims action", function (done) {
            const sswResult = generateSSWData(actions.sequence_of_slims);
            const expectedStates = [
                instance.coreStates.initialize,
                instance.coreStates.processCloud,
                instance.coreStates.doCloudAction,
                instance.coreStates.doCloudAction,
                instance.coreStates.doCloudAction,
                instance.coreStates.done
            ];
            setPassingCriteria(
                expectedStates,
                false,
                [],
                done
            );
            instance.open(sswResult);
        });

        it("Sequence of (Slim, Emotion Impact) action", function (done) {
            const sswResult = generateSSWData(actions.sequence_of_slim_and_emotion);
            const expectedStates = [
                instance.coreStates.initialize,
                instance.coreStates.processCloud,
                instance.coreStates.doCloudAction,
                instance.coreStates.done
            ];
            const emotionSpy = sandbox.spy(jibo.emotion, 'triggerImpact');
            setPassingCriteria(
                expectedStates,
                false,
                [() => assert(emotionSpy.calledOnce)],
                done
            );
            instance.open(sswResult);
        });

        it("Sequence of (Sequence of Slims, Speaker Update) action", function (done) {
            const sswResult = generateSSWData(actions.sequence_of_sequence_of_slims_and_speaker_update);
            const expectedStates = [
                instance.coreStates.initialize,
                instance.coreStates.processCloud,
                instance.coreStates.doCloudAction,
                instance.coreStates.doCloudAction,
                instance.coreStates.doCloudAction,
                instance.coreStates.done
            ];
            const identitySpy = sandbox.spy(jibo.lps.identity, 'setActiveSpeaker');
            setPassingCriteria(
                expectedStates,
                false,
                [() => assert(identitySpy.calledOnce)],
                done
            );
            instance.open(sswResult);
        });

        it("Parallel of (Sequence of Slims, Speaker Update, Emotion Impact) action", function (done) {
            const sswResult = generateSSWData(actions.parallel_of_sequence_of_slims_and_speaker_update_and_emotion);
            const expectedStates = [
                instance.coreStates.initialize,
                instance.coreStates.processCloud,
                instance.coreStates.doCloudAction,
                instance.coreStates.doCloudAction,
                instance.coreStates.doCloudAction,
                instance.coreStates.done
            ];
            const emotionSpy = sandbox.spy(jibo.emotion, 'triggerImpact');
            const identitySpy = sandbox.spy(jibo.lps.identity, 'setActiveSpeaker');
            setPassingCriteria(
                expectedStates,
                false,
                [() => assert(emotionSpy.calledOnce), () => assert(identitySpy.calledOnce)],
                done
            );
            instance.open(sswResult);
        });

    });

});
