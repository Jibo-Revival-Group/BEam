/**
 * @fileOverview
 *
 * Created on 9/14/16.
 * @author Siggi Orn <siggi@jibo.com>
 */

import {
	UserKBNode,
	UserLikesEoS,
	CategoryKBNode,
	KBTools,
	EoSKBNode
} from './kb';

import { Utils } from './Utils';
import { libraries } from '@be/be-framework';
export import CU = libraries.jibo_cai_utils;


/**
 * An interface of options that can be read from a test json file
 * to control the flow of the EoS selection
 */
const ControlType = {
	lastSkill: 'lastSkill',
	hasAnyDateFactPlayedToday: 'hasAnyDateFactPlayedToday',
	userID: 'userID',
	likesEoS: 'likesEoS',
	timeSinceLastEoSOfferMs: 'timeSinceLastEoSOfferMs',
	probabilityDateFact: 'probabilityDateFact',
	probabilityEOSType: 'probabilityEOSType',
	probabilityPoliteComment: 'probabilityPoliteComment',
	pickNoCategory: 'pickNoCategory',
};


export class EoSControl extends CU.TestConfiguration {

	public defaultLastSkill: string;

	constructor(public identity: any) {
		super('@be/surprises');
	}

	async pickNoCategory(): Promise<boolean> {
		return this.getBooleanFromTestConfig(ControlType.pickNoCategory, () => false);
	}

	async hasAnyDateFactPlayed(): Promise<boolean> {
		return this.getBooleanFromTestConfig(ControlType.hasAnyDateFactPlayedToday,
			this._hasAnyDateFactPlayed.bind(this));
	}

	async getTimeSinceLastEoSOffer(): Promise<number> {
		return this.getNumberFromTestConfig(ControlType.timeSinceLastEoSOfferMs,
			this._getTimeSinceLastEoSOffer.bind(this));
	}

	async getLastSkill(): Promise<string> {
		return this.getStringFromTestConfig(ControlType.lastSkill, () => this.defaultLastSkill);
	}

	async getProbabilityDateFact(): Promise<number> {
		return this.getNumberFromTestConfig(ControlType.probabilityDateFact,
			() => Math.random());
	}

	async getProbabilityPoliteComment(): Promise<number> {
		return this.getNumberFromTestConfig(ControlType.probabilityPoliteComment,
			() => Math.random());
	}

	async getProbabilityEOSType(): Promise<number> {
		return this.getNumberFromTestConfig(ControlType.probabilityEOSType,
			() => Math.random());
	}

	async getUserLikesEoS(): Promise<UserLikesEoS> {
		const likesStr = await this.getStringFromTestConfig(ControlType.likesEoS,
			this._userLikesEoS.bind(this));
		return UserLikesEoS[likesStr];
	}

	async getUserID(): Promise<string> {
		return this.getStringFromTestConfig(ControlType.userID, this._getUserID.bind(this));
	}

	/*
	 * All of the methods below are the actual methods to retrieve control data
	 */

	private async _hasAnyDateFactPlayed(): Promise<boolean> {
		const catNode = await CategoryKBNode.getOrCreate(Utils.SkillNames.DATE_COMMENTARY);
		if (catNode.getData().lastSelectedTime === -1) {
			return false;
		}
		const lastSelected = new Date(catNode.getData().lastSelectedTime);
		const today = KBTools.dateProvider();

		// If we are in the same day
		if (lastSelected.getDay() === today.getDay() &&
			lastSelected.getMonth() === today.getMonth() &&
			lastSelected.getFullYear() === today.getFullYear())
		{
			// If we are truly in the daytime but eos was delivered last night
			return !(today.getHours() > 7 && lastSelected.getHours() <= 7);
		}
		else {
			return false;
		}
	}

	private async _getUserID(): Promise<string> {
		const personList = this.identity.getPresentPersons();
		return (personList.length !== 0) ? personList[0].id : null;
	}

	private async _userLikesEoS(): Promise<string> {
		const userID = await this._getUserID();
		if (userID) {
			const userNode = await UserKBNode.getOrCreate(userID);
			return <any>userNode.getData().likesEoS as string;
		}
		else {
			return <any>UserLikesEoS.UNKNOWN as string;
		}
	}

	private async _getTimeSinceLastEoSOffer(): Promise<number> {
		const eosNode = await EoSKBNode.getOrCreate();
		const now = KBTools.dateProvider();
		const last = new Date(eosNode.getData().lastEoSDelivery);
		return now.getTime() - last.getTime();
	}
}


// Give access to internal module components for testing
if ((<any>global)._eosTest) {
	(<any>global)._eosTest.EoSControl = module.exports;
}