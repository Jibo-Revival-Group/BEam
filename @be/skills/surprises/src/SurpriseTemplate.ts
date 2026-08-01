/**
 * @EosBase
 *
 * Created on 6/25/16.
 * @author Siggi Orn <siggi@jibo.com>
 */

import {
    SurpriseElement,
    LaunchContext
} from './SurpriseElement';


export class SurpriseTemplate extends SurpriseElement {

    /**
     * Create new EosCategory
     * @constructor
     * @param {Object} [options] Be options for setting up this skill or the assetPack name.
     * @param {String} [options.assetPack=''] Name of the asset pack if running in the context of another skill.
     * @param {String} [options.rootPath=''] The path to this skill's root folder.
     * @param {number} [categoryPriority=10] Base priority of this category.
     * @param {number} [contextualPriority=10] Contextual priority of this category.
     */
    constructor(options, private categoryPriority = 10, private contextualPriority = 10) {
        super(options);
    }

    getCategoryPriority() {
        return this.categoryPriority;
    }

    async getContextualPriority(context: LaunchContext): Promise<number> {
        return this.contextualPriority;
    }

    open(result?:any):void {
        this.exit();
    }

    /**
     * Unload a skill, must override
     * @method close
     * @param {Function} done Callback to call when completed.
     */
    close(done:Function): void {
        done();
    }
}
