/**
 * @fileOverview
 *
 * Created on 9/15/16.
 * @author Siggi Orn <siggi@jibo.com>
 */

import { libraries } from '@be/be-framework';
import { KBTools, Node } from './KBTools';
const { PromiseUtils } = libraries.jibo_cai_utils;


export enum UserLikesEoS {
	TRUE = <any> 'TRUE',
	FALSE = <any> 'FALSE',
	UNKNOWN = <any> 'UNKNOWN',
}

export interface UserData {
	userID: string;
	likesEoS: UserLikesEoS;
}

export class UserKBNode {

	/**
	 * Retrieves an UserKBNode. Initializes it if needed
	 * @return {Promise<Node>}
	 */
	static async getOrCreate(userID: string): Promise<UserKBNode> {
		const usersRoot = await KBTools.getUsersNode();
		const node = await KBTools.getOrCreateEdge(userID, usersRoot, UserKBNode._createInitialUserData);
		return new UserKBNode(node);
	}

	/**
	 * Creates an initial UserData object
	 * @param {string} userID
	 * @returns {UserData}
	 * @private
	 */
	static _createInitialUserData(userID: string): UserData {
		return {
			userID,
			likesEoS: UserLikesEoS.UNKNOWN
		};
	}

	constructor(private node: Node) {

	}

	/**
	 * Get User data
	 * @return {UserData}
	 */
	getData(): UserData {
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
	(<any>global)._eosTest.UserKBNode = module.exports;
}