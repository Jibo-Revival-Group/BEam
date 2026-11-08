'use strict';
const jibo = require('jibo'), BeSkill = require('@be/be-framework').BeSkill;
const Runtime = require('./runtime'), comeback = require('./comeback'), settings = require('../../beacon/lib/agent-settings'), provider = require('../../beacon/lib/agent-provider');
let resume = null; // set when a quick action finished and Agent Mode is being reopened for it
class AgentSkill extends BeSkill {
    open() {
        const generation = this.generation = (this.generation || 0) + 1;
        const back = resume && Date.now() - resume.at < 15000 ? resume : null; resume = null;
        Promise.resolve(this.runtime && this.runtime.close()).then(() => {
            if (this.generation !== generation) return;
            this.runtime = new Runtime(jibo, global.PIXI || window.PIXI, settings, provider, () => this.exit({ noElementsOfSurprise: true }), command => this.act(command));
            this.runtime.open(back ? Runtime.resumeHistory(back.history, back.said) : undefined);
        });
    }
    act(command, history) {
        let skills = [];
        try { skills = require('../../beacon/lib/custom-skills').inventory().skills; } catch (_) {}
        const pkg = Runtime.storeSkill(command, skills);
        if (pkg) { this.redirect(pkg, { nlu: { entities: { domain: pkg }, intent: 'menu' } }); return; }
        if (history && comeback.RETURNS.test(command)) try {
            comeback.watch(jibo, global.be, said => {
                resume = { at: Date.now(), history: history, said: said };
                jibo.globalEvents.onSkillRelaunch({ result: { asr: { text: '' }, nlu: { intent: 'chat', entities: {} },
                    match: { skillID: '@be/agent', onRobot: true, skipSurprises: true } } });
            });
        } catch (error) { console.error('[agent] comeback', error); }
        // Same route as the main menu's weather/news/dance tiles: as if the user said it.
        jibo.embodied.listen.disableOnce();
        jibo.jetstream.mimicGlobalTurn({ clientASR: command }).catch(() => this.exit({ noElementsOfSurprise: true }));
    }
    close(done) {
        this.generation = (this.generation || 0) + 1;
        const runtime = this.runtime; this.runtime = null;
        Promise.resolve(runtime && runtime.close()).then(() => done(), done);
    }
    destroy(done) { this.close(error => super.destroy(baseError => done(error || baseError))); }
}
module.exports = AgentSkill;
