import jibo = require("jibo");
import { HolidayNode } from './HolidayNode';
export default class Holiday {
    holidayModel: jibo.kb.Model;
    /**
     * Sets up the jibo server client
     */
    init(): Promise<void>;
    /**
     * Fetches the holiday list
     * @return {Promise<HolidayNode[]|null>}
     */
    fetchHolidayList(): Promise<HolidayNode[] | null>;
    /**
     * Go through the list of holidays and pick out the user-enabled non-birthday days.
     * @param {HolidayNode} holidays list of holidays
     * @return {string[]} list of enabled holiday names
     */
    filterEnabledHolidayNames(holidays: HolidayNode[]): string[];
    /**
     * Fill a Set with the users active holidays to use in MiMs
     * @return {Set<string>} set of active holidays.
     */
    getActiveHolidaySet(): Promise<Set<string>>;
    /**
     * Go through a list of holidays and pick out the names of holidays for a particular date
     * @param {Date} filterDate the date for which to filter holidays
     * @param {boolean} onlyEnabledHolidays whether to only include enabled holidays
     * @return {string[]} list of todays holiday names
     */
    filterHolidayNamesByDate(filterDate: Date, onlyEnabledHolidays: boolean): Promise<string[]>;
}
