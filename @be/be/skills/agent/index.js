'use strict';
const jibo = require('jibo'), BeSkill = require('@be/be-framework').BeSkill;
const Runtime = require('./runtime'), settings = require('../../beacon/lib/agent-settings'), provider = require('../../beacon/lib/agent-provider');
class AgentSkill extends BeSkill {
    open() {
        const generation = this.generation = (this.generation || 0) + 1;
        Promise.resolve(this.runtime && this.runtime.close()).then(() => {
            if (this.generation !== generation) return;
            this.runtime = new Runtime(jibo, global.PIXI || window.PIXI, settings, provider, () => this.exit({ noElementsOfSurprise: true }));
            this.runtime.open();
        });
    }
    close(done) {
        this.generation = (this.generation || 0) + 1;
        const runtime = this.runtime; this.runtime = null;
        Promise.resolve(runtime && runtime.close()).then(() => done(), done);
    }
    destroy(done) { this.close(error => super.destroy(baseError => done(error || baseError))); }
}
module.exports = AgentSkill;
