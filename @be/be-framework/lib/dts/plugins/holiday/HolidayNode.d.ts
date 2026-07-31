import jibo = require("jibo");
export declare class HolidayNode extends jibo.kb.Node {
    data: {
        id: string;
        name: string;
        category: string;
        subcategory?: string;
        loopId: string;
        memberId?: string;
        isEnabled: boolean;
        date: string;
        endDate: string;
        created: number;
    };
    /**
     * UUID of the holiday.
     * @type {String}
     */
    readonly id: string;
    /**
     * Date of the holiday
     * @type {String}
     */
    readonly date: string;
    /**
     * End date of the holiday
     */
    readonly endDate: string;
    /**
     * Name of the holiday
     * @type {String}
     */
    readonly name: string;
    /**
     * Whether members have enabled this holiday
     * @type {String}
     */
    readonly isEnabled: boolean;
    /**
     * The category of the holiday (e.g., birthday, national)
     * @type {String}
     */
    readonly category: string;
    /**
     * @return {String} The loop member's preferred spoken name.
     */
    toString(): string;
    /**
     * Check whether the holiday is on the passed in date
     * @param {Date} date to check
     * @return {boolean} indicates whether holiday is on the passed in date
     */
    isOnDate(date: Date): boolean;
}
