/**
 * @fileOverview
 *
 * Created on 7/16/16.
 * @author Siggi Orn <siggi@jibo.com>
 */

import { SurpriseSkill } from '../SurpriseSkill';
import { SurpriseElement, LaunchContext } from '../SurpriseElement';
import { SelectionPolicy, CategoryResult } from "./SelectionPolicy";


export class HighestPriorityPolicy extends SelectionPolicy {

	_selectedTimes = new Map<string, number>();
	_lastSelected: string;

	constructor(eosSkill: SurpriseSkill) {
		super(eosSkill);
	}

	async select(launchContext: LaunchContext, categories: CategoryResult[]): Promise<SurpriseElement> {
		if (categories.length > 0) {
			// Find all that tied with equally high score
			const highScore = categories[0].totalPriority;
			let ties: CategoryResult[] = [categories[0]];
			for (let i = 1; i < categories.length; i++) {
				if (categories[i].totalPriority !== highScore) {
					break;
				}
				ties.push(categories[i]);
			}

			let selected: SurpriseElement;

			// If we have a tie, select the one that hasn't been played the longest
			if (ties.length > 1) {
				const lastPlayed = ties.map(categoryRes => {
					const time = this._selectedTimes.get(categoryRes.category.assetPack) || 0;
					return { categoryRes, time };
				});
				lastPlayed.sort((a, b) => (a.time - b.time) );
				selected = lastPlayed[0].categoryRes.category;
			} else if (categories.length === 1) {
				selected = categories[0].category;
			} else {
				// If we selected this last time then we select the next highest priority category now
				selected = (categories[0].category.assetPack !== this._lastSelected) ?
					categories[0].category : categories[1].category;
			}

			// Mark the selection time for this category
			this._selectedTimes.set(selected.assetPack, Date.now());
			this._lastSelected = selected.assetPack;
			return selected;
		}
		else {
			return null;
		}
	}
}

// Give access to internal module components for testing
if ((<any>global)._eosTest) {
	(<any>global)._eosTest.HighestPriorityPolicy = module.exports;
}
