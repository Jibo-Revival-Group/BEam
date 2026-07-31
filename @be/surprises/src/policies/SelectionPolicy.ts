/**
 * @fileOverview
 *
 * Created on 7/16/16.
 * @author Siggi Orn <siggi@jibo.com>
 */

import { SurpriseSkill } from '../SurpriseSkill';
import { SurpriseElement, LaunchContext } from '../SurpriseElement';


export interface CategoryResult {
	category: SurpriseElement;
	contextualPriority: number;
	totalPriority: number;
}

export abstract class SelectionPolicy {

	constructor(protected eosSkill: SurpriseSkill) {

	}

	abstract async select(launchContext: LaunchContext, categories: CategoryResult[]): Promise<SurpriseElement>;

}