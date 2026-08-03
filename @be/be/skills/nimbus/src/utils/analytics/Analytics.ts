import { BeSkill } from '@be/be-framework';
import * as cloud from '@jibo/interfaces';
import jibo = require('jibo');


export const SkillRename = {
    'chitchat-skill': 'chitchat',
    'personal-report-skill': 'personal-report'
};

export class Analytics {

    private skill: BeSkill;

    constructor(skill: BeSkill) {
        this.skill = skill;
    }

    public renameSkill(skillName: string) {
        //some skills get different names
        skillName = SkillRename[skillName] || skillName;
        return skillName;
    }
}