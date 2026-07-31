/**
 * @fileOverview
 *
 * Created on 8/24/16.
 * @author Siggi Orn <siggi@jibo.com>
 */
const jibo = require('jibo');
const path = require('path');
const HTTPService = require('jibo-service-framework').HTTPService;
const RegistryClient = require('skills-service-manager').RegistryClient;
const Factory = require('skills-service-manager').Factory;
const types = require('@jibo/jetstream-client').types;

const setInterval = global.setInterval;
const clearInterval = global.clearInterval;

let hubPort; // what port the mocked hub is on
/**
 * Initializes a test version of jibo
 * @param {function} done
 */
function beforeTests(done) {
    HTTPService.getPort()
        .then(port => {
        hubPort = port;
        let factory = new Factory({
            RegistryService: { host: '127.0.0.1', port: 0 },
            services: {
                AudioServiceSim: { port: 0 },
                BodyService: { port: 0 },
                ErrorService: { port: 0 },
                ExpressionService: { port: 0 },
                GlobalManagerService: { port: 0 },
                KBService: { port: 0 },
                JetstreamServiceSim: { 
                    port: 0, 
                    hubPort: hubPort, 
                    hubHost: 'localhost', 
                },
                LPSService: { port: 0 },
                MediaManagerService: { port: 0 },
                MediaService: { port: 0 },
                NotificationsService: { port: 0 },
                PerformanceService: { port: 0 },
                SecureTransferServiceSim: { port: 0 },
                SchedulerService: { port: 0 },
                ServerService: { port: 0 },
                SkillsServiceSim: {
                    port: 0,
                    skillsBaseDir: path.join(__dirname, '..'),
                },
                SystemManagerService: { port: 0 },
                SystemMonitoringServiceSim: { port: 0 },
                TTSService: { port: 0 },
                WifiService: { port: 0 },
            },
            logging: {},
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

                        global.framework.BeSkill.init(function(error) {
                            if (error) {
                                done(error);
                            } else {
                                done();
                            }
                        });
                    }
                });
            }
        });
    }).catch(err => {
        console.warn('Error during beforeTests', err);
        done();
    });
}

function afterTests() {
    jibo.init.restore();
}

function createSandbox(addTicker = true) {
    const sandbox = sinon.sandbox.create({useFakeTimers:true});
    if (addTicker) {
        sandbox.clock.ticker = setInterval(() => {
            sandbox.clock.tick(16);
        }, 16);
    }
    return sandbox;
}

function restoreSandbox(sandbox) {
    clearInterval(sandbox.clock.ticker);
    sandbox.restore();
}

function assertEachExecuted(flow) {
    for (let step of flow.getSteps()) {
        assert(step.executed, `Activity "${step.activity}" was not executed`);
    }
}

function flowHasEnded(subSkill) {
    return new Promise((resolve) => {
        let flowEndedPoll = jibo.timer.setInterval(() => {
            if(subSkill.hasTimedOut()) {
                flowEndedPoll.destroy();
                flowEndedPoll = null;
                resolve();
            }
        }, 10);
    })
}

function assertAndFinish(done, assertMethod, params) {
    try {
        assertMethod.apply(null, params);
        done();
    } catch (e) {
        done(e);
    }
}

function getHubPort() {
    return hubPort;
}

function createListenResult(text = 'blah', intent = 'blah', entities = {}) {
    const asr = { confidence: 1.0, text };
    const nlu = { intent, entities };
    const match = { onRobot: true, skillID: "@be/clock" };
    return new types.ListenResult(asr, nlu, match)
}

module.exports = {
    beforeTests,
    afterTests,
    assertEachExecuted,
    flowHasEnded,
    assertAndFinish,
    createSandbox,
    restoreSandbox,
    getHubPort,
    createListenResult
};
