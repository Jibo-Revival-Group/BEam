/**
 * @fileOverview
 *
 * Created on 8/24/16.
 * @author Siggi Orn <siggi@jibo.com>
 */
const jibo = require('jibo');
const path = require('path');
const RegistryClient = require('skills-service-manager').RegistryClient;
const Factory = require('skills-service-manager').Factory;

const setInterval = global.setInterval;
const clearInterval = global.clearInterval;

/**
 * Initializes a test version of jibo
 * @param {function} done
 */
function beforeTests(done) {
    let factory = new Factory({
        RegistryService: { host: '127.0.0.1', port: 0 },
        services: {
            AudioServiceSim: { port: 0 },
            BodyService: { port: 0 },
            ErrorService: { port: 0 },
            ExpressionService: { port: 0 },
            GlobalManagerService: { port: 0 },
            KBService: { port: 0 },
            JetstreamServiceSim: { port: 0 },
            LPSService: { port: 0 },
            MediaManagerService: { port: 0 },
            MediaService: { port: 0 },
            NotificationsService: { port: 0 },
            PerformanceService: { port: 0 },
            SecureTransferServiceSim: { port: 0 },
            ServerService: { port: 0 },
            SkillsServiceSim: {
                port: 0,
                skillsBaseDir: path.join(__dirname, '..'),
            },
            SystemManagerService: { port: 0 },
            SystemMonitoringServiceSim: { port: 0 },
            TTSService: { port: 0 },
            WifiService: { port: 0 },
        }
    }, __dirname);

    factory.init(function(error){
        if (error) {
            done(error);
        } else {

            let display = document.createElement('div');
            display.id = 'face';
            document.body.appendChild(display);

            jibo.init({ display: "face", registryHost: "http://127.0.0.1:" + RegistryClient.instance.port + "/registry" }, function(error){
                if (error) {
                    done(error);
                } else {
                    // stub the jibo.init method so every time we construct an instance of Be it doesnt get run.
                    sinon.stub(jibo, "init", function(face, cb){
                        cb();
                    });

                    //stub the TTS, so that we can complete it instantly
                    sinon.stub(jibo.mim.speakDelegate, 'speak', function() {
                        return new Promise((resolve) => {
                            setTimeout(resolve, 10);
                        });
                    });

                    global.framework.BeSkill.init(function(error) {
                        if (error) {
                            isDone(error);
                        } else {
                            isDone();
                        }
                    });
                }
            });
        }
    });

    function isDone(error) {
        process.env.runMode = 'UNIT_TESTS';
        done(error);
    }
}

function afterTests() {
    jibo.init.restore();
}

function createSandbox() {
    const sandbox = sinon.sandbox.create({useFakeTimers:true});
    sandbox.clock.ticker = setInterval(() => {
        sandbox.clock.tick(16);
    }, 16);
    return sandbox;
}

function restoreSandbox(sandbox) {
    clearInterval(sandbox.clock.ticker);
    sandbox.restore();
}

function assertEachExecuted(flow) {
    for (let step of flow.getSteps()) {
        assert(step.executed, `Step '${step.activity}' was not executed`);
    }
}

function assertAndFinish(done, assertMethod, params) {
    try {
        assertMethod.apply(null, params);
        done();
    } catch (e) {
        done(e);
    }
}

const EXIT_LIFECYCLE = 'lifecycle';
const EXIT_EXIT = 'exit';
const EXIT_REDIRECT = 'redirect';

function setExits(test, done, exitOn, assert) {
    if (exitOn === EXIT_LIFECYCLE) {
        test.sandbox.stub(jibo.lifecycle, 'finished', () => {
            assertAndFinish(done, assert);
        });
    } else {
        test.sandbox.stub(jibo.lifecycle, 'finished', () => {
            done('Skill should not have timed out');
        });
    }
    if (exitOn === EXIT_EXIT) {
        test.skill.on('exit', () => {
            assertAndFinish(done, assert);
        });
    } else {
        test.skill.on('exit', () => {
            done('Skill should not have exited');
        });
    }
    if (exitOn === EXIT_REDIRECT) {
        test.skill.on('redirect', (skill) => {
            assertAndFinish(done, assert, [skill]);
        });
    } else {
        test.skill.on('redirect', () => {
            done('Skill should not have redirected');
        });
    }
}

module.exports = {
    beforeTests,
    afterTests,
    createSandbox,
    restoreSandbox,
    assertEachExecuted,
    assertAndFinish,
    EXIT_LIFECYCLE,
    EXIT_EXIT,
    EXIT_REDIRECT,
    setExits,
};
