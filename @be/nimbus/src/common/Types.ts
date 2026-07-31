import jibo = require('jibo');
import * as cloud from '@jibo/interfaces';
import { Nimbus } from '../Nimbus';


export interface MIMConfig {
    mim_id?: string;
    mim_type: string;
    rule_name: string;
    gui: {
        type: 'Javascript' | 'Menu';
        data: string|Object;
        pause: boolean;
    };
    prompts: MIMPrompt[];
}

export interface MIMPrompt {
    prompt_category: string;
    prompt_sub_category: string;
    prompt: string;
    media: string;
    prompt_id: string;
    auto_rule_override: Object;
}

export interface Dataflow {
    listenResult?: jibo.jetstream.types.ListenResult;
    lastSkill?: string;
    cloudResponse?: cloud.skill.response.SkillResponseData;
    mims?: MIMConfig[];
}