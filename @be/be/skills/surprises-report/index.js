'use strict';
const jibo = require('jibo');
const SurpriseElement = require('@be/surprises').SurpriseElement;

// Element of Surprise: in the morning (5:00-13:59) Jibo offers the cloud personal report, at most once a day,
// and not once the report was heard today (markHeard: jetstream-client calls it when a report is delivered).
// shortcut: "heard" is per robot, not per person; key it by speaker if families ask for one offer each.
let rootPromise = null;
function root() {
    if (!rootPromise) {
        rootPromise = jibo.kb.createModel('/surprises-report').loadRoot().then(node => {
            node.data = node.data || {};
            return node;
        });
        rootPromise.catch(() => { rootPromise = null; });
    }
    return rootPromise;
}
const isToday = time => new Date(time || 0).toDateString() === new Date().toDateString();
function stamp(key) {
    return root().then(node => {
        node.data[key] = Date.now();
        return node.save();
    });
}

class SurprisesReport extends SurpriseElement {
    static markHeard() {
        return stamp('lastHeard');
    }
    getCategoryPriority() {
        return 10;
    }
    getContextualPriority() {
        const hour = new Date().getHours();
        if (hour < 5 || hour >= 14) {
            return Promise.resolve(0);
        }
        return root().then(node => (isToday(node.data.lastOffered) || isToday(node.data.lastHeard)) ? 0 : 1, () => 0);
    }
    open() {
        const speaker = jibo.lps.identity.getActiveSpeaker();
        const id = speaker && speaker.idInfo && speaker.idInfo.id;
        const name = new Promise(resolve => {
            if (!id) { return resolve(''); }
            jibo.kb.loop.getSpokenNameById(id, (err, spoken) => resolve((!err && spoken) || ''));
        });
        Promise.all([name, stamp('lastOffered')]).then(results => this.ask(results[0]), err => {
            this.log.error('personal report offer failed', err);
            this.exit();
        });
    }
    ask(speaker) {
        let answer = null;
        const mim = this.mim = new jibo.bt.behaviors.Mim({
            mimPath: 'mims/en-us/OfferPersonalReport.mim',
            assetPack: this.assetPack,
            getPromptData: () => ({ speaker }),
            onSuccess: result => { answer = result.asrResults && result.asrResults.intent; }
        });
        this.tick = () => {
            if (mim.update() === jibo.bt.Status.IN_PROGRESS) { return; }
            this.stopMim();
            if (answer === 'yes') { this.startReport(); } else { this.exit(); }
        };
        jibo.timer.on('update', this.tick);
        mim.start();
    }
    // Same path as the main menu's full-report button; the cloud then confirms the name and gives the report.
    startReport() {
        jibo.embodied.listen.disableOnce();
        jibo.jetstream.mimicGlobalTurn({ clientASR: 'personal report' }).catch(err => {
            this.log.error('Unable to start the personal report', err);
            this.exit();
        });
    }
    stopMim() {
        if (this.tick) { jibo.timer.removeListener('update', this.tick); }
        if (this.mim) { this.mim.stop(); }
        this.tick = this.mim = null;
    }
    close(done) {
        this.stopMim();
        done();
    }
}
module.exports = SurprisesReport;
