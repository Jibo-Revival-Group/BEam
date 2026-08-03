/**
 * @fileOverview
 *
 * Created on 9/17/16.
 * @author Siggi Orn <siggi@jibo.com>
 */

export class Utils {

	static MINUTE_TO_MS = 60 * 1000;
	static HOUR_TO_MS = 60 * Utils.MINUTE_TO_MS;

	static SkillNames = {
		JOT: '@be/jot',
		SNAP: '@be/snap',
		GREETINGS: '@be/greetings',
		SETTINGS: '@be/settings',
		CLOCK: '@be/clock',
		DATE_COMMENTARY: '@be/surprises-date',
	};
}


// Give access to internal module components for testing
if ((<any>global)._eosTest) {
	(<any>global)._eosTest.Utils = module.exports;
}
