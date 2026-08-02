"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SkillLifecycleEndState;
(function (SkillLifecycleEndState) {
    SkillLifecycleEndState[SkillLifecycleEndState["NONE"] = 0] = "NONE";
    SkillLifecycleEndState[SkillLifecycleEndState["PENDING_SKILL_SWITCH_INTERRUPTED"] = 1] = "PENDING_SKILL_SWITCH_INTERRUPTED";
    SkillLifecycleEndState[SkillLifecycleEndState["SKILL_SWITCH_REQUEST_DENIED"] = 2] = "SKILL_SWITCH_REQUEST_DENIED";
    SkillLifecycleEndState[SkillLifecycleEndState["SKILL_REFRESH_FAILED"] = 3] = "SKILL_REFRESH_FAILED";
    SkillLifecycleEndState[SkillLifecycleEndState["SKILL_OPEN_FAILED"] = 4] = "SKILL_OPEN_FAILED";
    SkillLifecycleEndState[SkillLifecycleEndState["SKILL_CLOSE_FAILED"] = 5] = "SKILL_CLOSE_FAILED";
    SkillLifecycleEndState[SkillLifecycleEndState["SKILL_EXITED"] = 6] = "SKILL_EXITED";
    SkillLifecycleEndState[SkillLifecycleEndState["SKILL_REFRESHED"] = 7] = "SKILL_REFRESHED";
})(SkillLifecycleEndState || (SkillLifecycleEndState = {}));
;
exports.default = SkillLifecycleEndState;

