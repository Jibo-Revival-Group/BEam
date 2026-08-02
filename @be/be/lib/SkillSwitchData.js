"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SkillSwitchData {
    constructor(skill, options) {
        if (!options) {
            options = {};
        }
        if (!options.asr) {
            options.asr = { text: '', confidence: 1 };
        }
        if (options.nlu && !options.nlu.entities) {
            options.nlu.entities = {};
        }
        this._skill = skill;
        this._options = options;
    }
    get skill() {
        return this._skill;
    }
    get name() {
        return this._skill.assetPack;
    }
    get options() {
        return this._options;
    }
    get priority() {
        if (this.name === "@be/restore") {
            return 7;
        }
        else if (this._options.nlu && this.name === "@be/settings") {
            if (this._options.nlu.intent === "wipe") {
                return 6;
            }
            else if (this._options.nlu.entities.errorId) {
                return 5;
            }
        }
        else if (this.name === "@be/tutorial" || this.name === "@be/first-contact") {
            return 4;
        }
        else if (this._options.nlu && this.name === "@be/clock" && this._options.nlu.intent === "finished" &&
            ((this._options.nlu.entities.domain === "alarm") || (this._options.nlu.entities.domain === "timer"))) {
            return 3;
        }
        else if (this._options.match && this._options.match.isProactive) {
            return 1;
        }
        else if (this.name === "@be/idle") {
            return 0;
        }
        return 2;
    }
}
exports.default = SkillSwitchData;

