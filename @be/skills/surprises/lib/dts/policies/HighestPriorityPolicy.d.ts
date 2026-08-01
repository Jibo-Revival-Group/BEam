/**
 * @fileOverview
 *
 * Created on 7/16/16.
 * @author Siggi Orn <siggi@jibo.com>
 */
import { SurpriseSkill } from '../SurpriseSkill';
import { SurpriseElement, LaunchContext } from '../SurpriseElement';
import { SelectionPolicy, CategoryResult } from "./SelectionPolicy";
export declare class HighestPriorityPolicy extends SelectionPolicy {
    _selectedTimes: Map<string, number>;
    _lastSelected: string;
    constructor(eosSkill: SurpriseSkill);
    select(launchContext: LaunchContext, categories: CategoryResult[]): Promise<SurpriseElement>;
}
