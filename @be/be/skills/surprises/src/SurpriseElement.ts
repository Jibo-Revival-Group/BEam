/**
 * @EosBase
 *
 * Created on 6/25/16.
 * @author Siggi Orn <siggi@jibo.com>
 */

import { BeSkill } from '@be/be-framework';


/**
 * Context for categories to make decision of whether they want
 * control and with what priority
 */
export interface LaunchContext {
    lastSkill: string;
    userID?: string;
}

export abstract class SurpriseElement extends BeSkill {

    /**
     * Create new ElementsOfSurpriseCategory
     * @constructor
     * @param {Object} [options] Be options for setting up this skill or the assetPack name.
     * @param {String} [options.assetPack=''] Name of the asset pack if running in the context of another skill.
     * @param {String} [options.rootPath=''] The path to this skill's root folder.
     */
    constructor(options) {
        super(options);
    }

    /**
     * A boolean read-only flag to indicate to Be that this is an Element of Surprise category
     * @type {boolean}
     */
    get isElementOfSurprise(): boolean {
        return true;
    }

    /**
     * Provides the priority with which this category wants to get
     * control given a certain context
     * @param {Object} context Relevant context that is active at the time of this call
     * @param {string} context.personId Id of person currently interacting with Jibo
     * @returns {Promise<number>} priority >= 0
     */
    abstract async getContextualPriority(context: LaunchContext): Promise<number>;

    /**
     * The static priority for this category (how important is this category)
     * @returns {number} priority >= 0
     */
    abstract getCategoryPriority(): number;
}
