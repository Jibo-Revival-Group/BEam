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
export declare abstract class SelectionPolicy {
    protected eosSkill: SurpriseSkill;
    constructor(eosSkill: SurpriseSkill);
    abstract select(launchContext: LaunchContext, categories: CategoryResult[]): Promise<SurpriseElement>;
}
