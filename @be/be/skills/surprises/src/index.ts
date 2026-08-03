/**
 * @fileOverview
 *
 * Created on 9/16/16.
 * @author Siggi Orn <siggi@jibo.com>
 */

import { SurpriseSkill } from './SurpriseSkill';
import * as kb from './kb';
import * as policies from './policies';
import * as BeFramework from '@be/be-framework';

export * from './SurpriseElement';
export * from './SurpriseTemplate';

const Skill = SurpriseSkill;

export {
	Skill,
	SurpriseSkill,
	kb,
	policies,
	BeFramework
};
