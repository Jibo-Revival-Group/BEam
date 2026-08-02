"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SkillLifecycleState;
(function (SkillLifecycleState) {
    SkillLifecycleState[SkillLifecycleState["NONE"] = 0] = "NONE";
    SkillLifecycleState[SkillLifecycleState["SKILL_SWITCH_REQUESTED"] = 1] = "SKILL_SWITCH_REQUESTED";
    SkillLifecycleState[SkillLifecycleState["SKILL_SWITCH_PENDING"] = 2] = "SKILL_SWITCH_PENDING";
    SkillLifecycleState[SkillLifecycleState["SKILL_START_OPEN"] = 4] = "SKILL_START_OPEN";
    SkillLifecycleState[SkillLifecycleState["SKILL_OPENED"] = 5] = "SKILL_OPENED";
    SkillLifecycleState[SkillLifecycleState["LIFECYCLE_ENDED"] = 6] = "LIFECYCLE_ENDED";
})(SkillLifecycleState || (SkillLifecycleState = {}));
;
exports.default = SkillLifecycleState;

