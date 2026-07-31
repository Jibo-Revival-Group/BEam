/**
 * @fileOverview
 *
 * Created on 7/16/16.
 * @author Siggi Orn <siggi@jibo.com>
 */

import { SurpriseSkill } from '../SurpriseSkill';
import { SurpriseElement, LaunchContext } from '../SurpriseElement';
import { SelectionPolicy, CategoryResult } from "./SelectionPolicy";
import * as _ from 'lodash/lodash.min';


export class RandomSelectionPolicy extends SelectionPolicy {

	constructor(eosSkill: SurpriseSkill) {
		super(eosSkill);
	}

	async select(launchContext: LaunchContext, categories: CategoryResult[]): Promise<SurpriseElement> {
		let randomSample = _.sample(categories);
		return randomSample.category;
	}
}