"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DateSetter {
    static shiftDate(year, month, day, hours = 12, minutes = 0, seconds = 0) {
        if (month <= 0) {
            console.warn(`${month} found for month, replacing with 1. Fake dates are indexed by 1 on input for usability.`);
            month = 1;
        }
        if (this._origDate) {
            global.Date = this._origDate;
        }
        const OrigDate = global.Date;
        this._origDate = OrigDate;
        const fakeDateArgs = [year, month - 1, day, hours, minutes, seconds];
        const fakeDate = Reflect.construct(OrigDate, fakeDateArgs);
        const fakeDateStartTime = OrigDate.now();
        global.Date = function () {
            if (arguments.length === 0) {
                const updatedFakeDateMs = fakeDate.getTime() + (OrigDate.now() - fakeDateStartTime);
                return Reflect.construct(OrigDate, [updatedFakeDateMs]);
            }
            else {
                return Reflect.construct(OrigDate, arguments);
            }
        };
        global.Date.prototype = OrigDate.prototype;
        global.Date.now = function () {
            const timeSinceFakeDateStart = (OrigDate.now() - fakeDateStartTime);
            return fakeDate.getTime() + timeSinceFakeDateStart;
        };
        global.Date.parse = OrigDate.parse;
        global.Date.UTC = OrigDate.UTC;
        console.log(`Setting up fake Date of: ${fakeDate.toString()}.`);
    }
    static restoreDate() {
        if (this._origDate) {
            global.Date = this._origDate;
            this._origDate = null;
            console.info(`Date Restored to: ${(new Date()).toString()}.`);
        }
        else {
            console.warn('No fake Date to restore.');
        }
    }
}
exports.default = DateSetter;

