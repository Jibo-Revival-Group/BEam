/**
 * @fileOverview
 *
 * Created on 9/15/16.
 * @author Siggi Orn <siggi@jibo.com>
 */

import { libraries } from '@be/be-framework';
import { KBTools, Node } from './KBTools';
const { PromiseUtils } = libraries.jibo_cai_utils;


export interface EoSData {
	lastEoSDelivery: number;
}


export class EoSKBNode {

	/**
	 * Retrieves an EoSKBNode. Initializes it if needed
	 * @return {Promise<Node>}
	 */
	static async getOrCreate(): Promise<EoSKBNode> {
		const node = await KBTools.getOrCreateEdge('eos', null, EoSKBNode._createInitialRootData);
		return new EoSKBNode(node);
	}

	/**
	 * Creates an initial EoSData object
	 * @returns {EoSData}
	 * @private
	 */
	static _createInitialRootData(): EoSData {
		return {
			lastEoSDelivery: -1,
		};
	}

	constructor(private node: Node) {

	}

	/**
	 * Sets that any EoS category was delivered
	 * @param {Date} [date] The time at which it was selected
	 */
	async markDelivered(date: Date = KBTools.dateProvider()): Promise<void> {
		this.getData().lastEoSDelivery = date.getTime();
		await PromiseUtils.promisify( h => this.node.save(h) );
	}

	/**
	 * Get data
	 * @return {CategoryData}
	 */
	getData(): EoSData {
		return this.node.data;
	}

	/**
	 * Save kb node
	 * @return {Promise<void>}
	 */
	async save(): Promise<void> {
		await PromiseUtils.promisify( h => this.node.save(h) );
	}
}


// Give access to internal module components for testing
if ((<any>global)._eosTest) {
	(<any>global)._eosTest.EoSKBNode = module.exports;
}