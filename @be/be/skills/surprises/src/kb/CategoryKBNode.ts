/**
 * @fileOverview
 *
 * Created on 9/15/16.
 * @author Siggi Orn <siggi@jibo.com>
 */

import { libraries } from '@be/be-framework';
import { KBTools, Node } from './KBTools';
const { PromiseUtils } = libraries.jibo_cai_utils;


export interface CategoryData {
	categoryName: string;
	lastSelectedTime: number;
}

export class CategoryKBNode {

	/**
	 * Retrieves a CategoryKBNode. Initializes it if needed
	 * @return {Promise<Node>}
	 */
	static async getOrCreate(categoryName: string): Promise<CategoryKBNode> {
		const categoryRoot = await KBTools.getCategoriesNode();
		const node = await KBTools.getOrCreateEdge(categoryName, categoryRoot, CategoryKBNode._createInitialCategoryData);
		return new CategoryKBNode(node);
	}

	/**
	 * Creates an initial CategoryData object
	 * @param {string} categoryName
	 * @returns {CategoryData}
	 * @private
	 */
	static _createInitialCategoryData(categoryName: string): CategoryData {
		return {
			categoryName,
			lastSelectedTime: -1,
		};
	}

	constructor(private node: Node) {

	}

	/**
	 * Sets that a particular category has been selected at a certain time
	 * @param {Date} [date] The time at which it was selected
	 */
	async markSelected(date: Date = KBTools.dateProvider()): Promise<void> {
		this.getData().lastSelectedTime = date.getTime();
		await PromiseUtils.promisify( h => this.node.save(h) );
	}

	/**
	 * Get EoSCategory data
	 * @return {CategoryData}
	 */
	getData(): CategoryData {
		return this.node.data;
	}

	/**
	 * Save kb node
	 * @return {Promise<void>}
	 */
	async save() {
		return PromiseUtils.promisify( h => this.node.save(h) );
	}
}


// Give access to internal module components for testing
if ((<any>global)._eosTest) {
	(<any>global)._eosTest.CategoryKBNode = module.exports;
}