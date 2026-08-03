export interface AnalyticsContext {
    ssm_version: string;
    be_version: string;
    platform_version: string;
    release_version: string;
}
export default class Analytics {
    private _context;
    private _currentSkill;
    private _robotName;
    private _loopSize;
    private _log;
    currentSkill: string;
    /**
     * A convenience method used whenever an event occurs within a skill.
     * @method Analytics.skillAction
     * @param {string} event The name of the event.
     * @param {string} skill The name of the active skill.
     * @param {Object} properties An object containing any relevant properties.
     */
    skillEvent(event: string, properties?: any): void;
}
