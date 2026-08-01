/**
 * @fileOverview
 *
 * Created on 9/15/16.
 * @author Siggi Orn <siggi@jibo.com>
 */

import { libraries } from '@be/be-framework';
import * as jibo from 'jibo';
const { PromiseUtils } = libraries.jibo_cai_utils;

/*
 * Faking the jibo.kb interfaces because of limitation
 * of jibo typings that they can't be a part of your
 * exported interface
 */
export type Callback = (error?: Error|string) => void;

export interface Edge { }

export interface Node {
	data: any;
	getEdges(name: string): Edge[];
	addEdges(node: Node): void;
	save(cb: Callback): void;
}

export interface Model {
	loadRoot(cb: Callback): void;
	load(edge: Edge, cb: Callback): void;
	createNode(name: string): Node;
}

export interface KBNodeData {
	lastEoSDelivery: number;
}

export type DateProvider = () => Date;


export class KBTools {

	private static _kbModel: Model;

	public static dateProvider: DateProvider = () => new Date();

	/**
	 * Creates the KB model and stores it in static variable
	 * @param {string} [path='/jibo/eos'] Path to EoS KB model
	 * @private
	 */
	static async _createModel(path='/jibo/eos'): Promise<void> {
		KBTools._kbModel = (<any>jibo.kb).createModel(path);
		await PromiseUtils.promisify( h => KBTools._kbModel.loadRoot(h) ); // This works around a bug
		return null;
	}

	/**
	 * Gets the kb model or creates it if it doesn't exist
	 * @return {Model}
	 */
	static async getOrCreateModel(): Promise<Model> {
		if (!KBTools._kbModel) {
			await KBTools._createModel();
		}
		return KBTools._kbModel;
	}

	/**
	 * Retrieves the KB root node. Initializes it if needed
	 * @return {Promise<Node>}
	 */
	static async getRoot(): Promise<Node> {
		const model = await KBTools.getOrCreateModel();
		return PromiseUtils.promisify<Node>( h => model.loadRoot(h) );
	}

	/**
	 * Retrieves categories node. Initializes it if needed
	 * @return {Promise<Node>}
	 */
	static async getCategoriesNode(): Promise<Node> {
		return await KBTools.getOrCreateEdge('categories', null, () => {
			return {};
		});
	}

	/**
	 * Retrieves users node. Initializes it if needed
	 * @return {Promise<Node>}
	 */
	static async getUsersNode(): Promise<Node> {
		return await KBTools.getOrCreateEdge('users', null, () => {
			return {};
		});
	}

	/**
	 * Gets an edge node by name (and creates it if needed)
	 * @param {string} edgeName
	 * @param {Node} [node] Node to create edge on, if omitted then root node is used
	 * @param {function} [dataInitializer] A function to initialize data in new node
	 * If not provided, then a new node won't be created
	 * @return {Node}
	 */
	static async getOrCreateEdge(edgeName: string, node?: Node, dataInitializer?: (edgeName:string)=>any): Promise<Node> {
		const model = await KBTools.getOrCreateModel();
		let rootToUse = node || await KBTools.getRoot();
		const edges = rootToUse.getEdges(edgeName);
		// If edge found
		if (edges.length > 0) {
			return await PromiseUtils.promisify<Node>( h => model.load(edges[0], h) );
		}
		// Otherwise we create an edge (if initializer provided)
		else if (dataInitializer) {
			let node = model.createNode(edgeName);
			node.data = dataInitializer(edgeName);
			await PromiseUtils.promisify( h => node.save(h) );
			rootToUse.addEdges(node);
			await PromiseUtils.promisify(h => rootToUse.save(h) );
			return node;
		}
		else {
			return null;
		}
	}
}


// Give access to internal module components for testing
if ((<any>global)._eosTest) {
	(<any>global)._eosTest.KBTools = module.exports;
}
