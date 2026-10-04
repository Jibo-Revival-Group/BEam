'use strict';

// Serialized session lifecycle, independent of the robot SDK for offline tests.
const EventEmitter = require('events');
const preferences = require('./camera-stream-settings');

function fail(message, status) {
    const error = new Error(message);
    error.status = status || 503;
    return error;
}

class CameraStream extends EventEmitter {
    constructor(runtime, transport, settings) {
        super();
        this.runtime = runtime;
        this.transport = transport;
        this.settings = settings || preferences;
        this.state = 'off';
        this.lastError = null;
        this.queue = Promise.resolve();
        transport.on('failure', () => {
            this.lastError = 'Native camera stream interrupted';
            this.command('stop').catch(() => {});
        });
    }
    get enabled() { return this.state !== 'off'; }
    status() {
        return { state: this.state, streaming: this.state === 'streaming',
            allowed: this.settings.get(),
            width: 640, height: 360, targetFps: 15, error: this.lastError };
    }
    setState(state) {
        this.state = state;
        this.emit('state', this.status());
    }
    command(action, options) {
        if (['start', 'stop', 'toggle'].indexOf(action) === -1) {
            return Promise.reject(fail('Invalid camera stream action', 400));
        }
        const run = () => {
            const start = action === 'start' || (action === 'toggle' && this.state === 'off');
            return start ? this.start() : this.stop(options);
        };
        const result = this.queue.then(run);
        this.queue = result.catch(() => {});
        return result;
    }
    start() {
        if (!this.settings.get()) { return Promise.reject(fail('Camera streaming is disabled in BEacon More settings', 409)); }
        if (this.state === 'streaming') { return Promise.resolve(this.status()); }
        if (this.state !== 'off') { return Promise.reject(fail('Finish stopping the camera before starting again', 409)); }
        this.lastError = null;
        return Promise.resolve().then(() => {
            if (this.runtime.isPrivate()) { throw fail('Turn off privacy mode before streaming', 409); }
            // Load native transport settings before disturbing the current skill.
            return this.transport.prepare();
        }).then(() => {
            if (this.runtime.isPrivate()) { throw fail('Privacy mode is active', 409); }
            this.setState('starting');
            return this.runtime.enter(this);
        }).then(() => {
            if (this.runtime.isPrivate()) { throw fail('Privacy mode is active', 409); }
            return this.transport.start();
        }).then(() => {
            this.setState('streaming');
            return this.status();
        }).catch(error => {
            this.lastError = error.status ? error.message : 'Camera startup failed';
            if (this.state === 'off') { throw error; }
            return this.stop().then(() => { throw error; }, () => { throw error; });
        });
    }
    stop(options) {
        if (this.state === 'off') { return Promise.resolve(this.status()); }
        this.setState('stopping');
        let firstError = null;
        return Promise.resolve().then(() => this.transport.stop()).then(() => this.runtime.leave()).catch(error => {
            firstError = firstError || error;
        }).then(() => {
            if (firstError) {
                // Do not declare the robot normal when capture teardown is unconfirmed.
                const detail = firstError.status ? firstError.message : 'robot interaction restoration failed';
                this.lastError = 'Camera cleanup failed: ' + detail + '; retry Stop Camera Stream';
                throw fail(this.lastError);
            }
            this.setState('off');
            if (!options || !options.skipResume) { this.runtime.resume(); }
            return this.status();
        });
    }
    configure(enabled) {
        const result = this.queue.then(() => {
            this.settings.set(enabled);
            return enabled ? this.status() : this.stop();
        });
        this.queue = result.catch(() => {});
        return result;
    }
    stream(req, res) {
        if (this.state !== 'streaming') { throw fail('Camera stream is inactive', 409); }
        return this.transport.stream(req, res);
    }
}

let singleton = null;
function getController() {
    if (singleton) { return singleton; }
    if (typeof window === 'undefined' || !global.be) { throw fail('Camera streaming requires the robot runtime'); }
    const jibo = require('jibo');
    const Runtime = require('./camera-stream-runtime');
    const NativeTransport = require('./camera-stream-native');
    singleton = new CameraStream(new Runtime(jibo, global.be), new NativeTransport(jibo));
    jibo.cameraStreamController = singleton;
    return singleton;
}

module.exports = { CameraStream: CameraStream, fail: fail, getController: getController,
    settings: () => ({ enabled: preferences.get() }),
    configure: enabled => {
        if (singleton) { return singleton.configure(enabled).then(() => ({ enabled: preferences.get() })); }
        preferences.set(enabled);
        return Promise.resolve({ enabled: preferences.get() });
    },
    isRestricted: () => !!(singleton && singleton.enabled) };
