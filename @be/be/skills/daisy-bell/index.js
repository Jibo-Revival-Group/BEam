'use strict';
const path = require('path'), fs = require('fs'), os = require('os'), urls = require('url');
const jibo = require('jibo'), BeSkill = require('@be/be-framework').BeSkill;

// Launched by BEefy for "sing Daisy Bell": Jibo sings the chorus (his own voice, Super Mario World piano), as the
// IBM 7094 did in 1961, then leaves. Touching him or "Hey Jibo" stops it, as in the Music skill.
// BEefy can send another song as nlu.entities.url (an mp3 it hosts), so new songs need no OTA.
class DaisyBellSkill extends BeSkill {
    open(result) {
        this.stop();
        const run = this.run = {};
        const leave = () => { if (this.run === run) { this.stop(); this.exit({ noElementsOfSurprise: true }); } };
        this.events = [];
        const watch = (owner, name) => {
            const event = owner && owner.events && owner.events[name];
            if (!event || !event.on || !event.off) return;
            event.on(leave); this.events.push(() => event.off(leave));
        };
        ['hjHeard', 'globalTurnStarted', 'skillSwitch'].forEach(name => watch(jibo.jetstream, name));
        watch(jibo.system, 'touchOn');
        const play = (file) => {
            if (this.run !== run) return;
            const audio = this.audio = new Audio('file://' + file);
            audio.addEventListener('ended', leave);
            audio.addEventListener('error', leave);
            Promise.resolve(audio.play()).catch(leave);
        };
        const url = result && result.nlu && result.nlu.entities && result.nlu.entities.url;
        if (!url) return play(path.join(__dirname, 'daisy-bell.ogg'));
        DaisyBellSkill.download(url, (error, file) => error ? leave() : play(file));
    }
    // Node with BEam's CA list, not the page: the robot's Chromium doesn't trust Let's Encrypt (api.5x1.com).
    static download(url, done) {
        const options = urls.parse(url);
        const file = path.join(os.tmpdir(), 'jibo-song' + path.extname(options.pathname || ''));
        if (options.protocol === 'https:') {
            options.ca = fs.readFileSync(path.join(__dirname, '../../beacon/certs/mozilla-ca.pem'), 'utf8');
        }
        const request = require(options.protocol === 'https:' ? 'https' : 'http').get(options, (response) => {
            if (response.statusCode !== 200) { response.resume(); return done(new Error('HTTP ' + response.statusCode)); }
            const out = fs.createWriteStream(file);
            response.pipe(out);
            out.on('finish', () => done(null, file));
            out.on('error', done);
        });
        request.on('error', done);
        request.setTimeout(30000, () => request.abort());
    }
    stop() {
        this.run = null;
        (this.events || []).forEach(off => off());
        this.events = [];
        const audio = this.audio;
        this.audio = null;
        if (audio) { audio.pause(); audio.removeAttribute('src'); audio.load(); }
    }
    // Be refuses skills that don't define open and close.
    close(done) { this.stop(); done(); }
}
module.exports = DaisyBellSkill;
