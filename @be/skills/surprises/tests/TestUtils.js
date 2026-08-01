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

const BeSkill = require('@be/be-framework').BeSkill;


/**
 * Initializes a test version of jibo
 * @param {function} done
 */
function beforeTests(done) {
    let  factory = new Factory({
        RegistryService: { host: '127.0.0.1', port: 0 },
        services: {
            AudioServiceSim: { port: 0 },
            BodyService: { port: 0 },
            ErrorService: { port: 0 },
            ExpressionService: { port: 0 },
            KBService: { port: 0 },
            JetstreamServiceSim: { port: 0 },
            LPSService: { port: 0 },
            MediaManagerService: { port: 0 },
            MediaService: { port: 0 },
            PerformanceService: { port: 0 },
            SchedulerService: { port: 0 },
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
            return done(error);
        }
        jibo.init({ registryHost: "http://127.0.0.1:" + RegistryClient.instance.port + "/registry" }, function(error){
            if (error) {
                return done(error);
            }
            // stub the jibo.init method so every time we construct an instance of Be it doesnt get run.
            sinon.stub(jibo, "init", function(face, cb){
                cb();
            });

            BeSkill.init(function(error) {
                if (error) {
                    return done(error);
                }
                done();
            });
        });
        //because the face may not have been initialized, add the eye cache that KeysAnimation instances use for caching
        jibo.loader.addCache(jibo.face.eye.CACHE_ID);
    });
}

function afterTests() {
    if (typeof jibo.init.restore === 'function') {
        jibo.init.restore();
    }
}


module.exports = {
    beforeTests,
    afterTests
};
