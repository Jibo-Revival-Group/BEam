/**
 * @fileOverview
 *
 * Created on 9/14/16.
 * @author Siggi Orn <siggi@jibo.com>
 */
import { UserLikesEoS } from './kb';
import { libraries } from '@be/be-framework';
export import CU = libraries.jibo_cai_utils;
export declare class EoSControl extends CU.TestConfiguration {
    identity: any;
    defaultLastSkill: string;
    constructor(identity: any);
    pickNoCategory(): Promise<boolean>;
    hasAnyDateFactPlayed(): Promise<boolean>;
    getTimeSinceLastEoSOffer(): Promise<number>;
    getLastSkill(): Promise<string>;
    getProbabilityDateFact(): Promise<number>;
    getProbabilityPoliteComment(): Promise<number>;
    getProbabilityEOSType(): Promise<number>;
    getUserLikesEoS(): Promise<UserLikesEoS>;
    getUserID(): Promise<string>;
    private _hasAnyDateFactPlayed();
    private _getUserID();
    private _userLikesEoS();
    private _getTimeSinceLastEoSOffer();
}
