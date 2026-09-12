/**
 * Local Fahrenheit → Celsius rewrite for personal-report weather copy.
 *
 * The OpenJibo hub still emits imperial phrasing; when BEacon Etc selects
 * Celsius, Nimbus rewrites spoken ESML and GUI labels before playback.
 * Patterns match JiboInteractionService.ReportFormatting /
 * ResponsePlanToSocketMessagesMapper (read-only reference).
 */

const fs = require('fs');

const UNITS_PATH = '/opt/jibo/Knowledge/beacon/units.json';
// OpenJibo weather/personal-report use report-skill; legacy Pegasus used personal-report-skill.
const WEATHER_SKILL_IDS: { [id: string]: boolean } = {
    'report-skill': true,
    'personal-report-skill': true
};

export class TemperatureUnits {

    static unitsPath (): string {
        return UNITS_PATH;
    }

    static fToC (fahrenheit: number): number {
        return Math.round((fahrenheit - 32) * 5 / 9);
    }

    static isMetricPreferred (): boolean {
        try {
            if (!fs.existsSync(UNITS_PATH)) { return false; }
            const data = JSON.parse(fs.readFileSync(UNITS_PATH, 'utf8'));
            return !!(data && String(data.temperature).toLowerCase() === 'celsius');
        } catch (err) {
            return false;
        }
    }

    static shouldConvertPersonalReport (skillId: string): boolean {
        return !!(skillId && WEATHER_SKILL_IDS[skillId] && TemperatureUnits.isMetricPreferred());
    }

    static convertSpokenText (text: string): string {
        if (!text || typeof text !== 'string') { return text; }

        let out = text;

        out = out.replace(/Temperatures are in Fahrenheit\./gi, 'Temperatures are in Celsius.');

        out = out.replace(/(-?\d+)\s*degrees\s+Fahrenheit\b/gi, (_match, raw) => {
            return TemperatureUnits.fToC(Number(raw)) + ' degrees Celsius';
        });

        // MIM lines like "a high of 65 degrees" (unit name omitted).
        out = out.replace(/(-?\d+)\s*degrees\b(?!\s*(?:Celsius|Fahrenheit))/gi, (_match, raw) => {
            return TemperatureUnits.fToC(Number(raw)) + ' degrees';
        });

        // "Today's high is 65" / "low will be 54" — skip values already tied to degrees.
        out = out.replace(
            /\b((?:high|low)\s+(?:is|of|will be|near|around)\s+)(-?\d+)\b(?!\s*degrees)/gi,
            (_match, prefix, raw) => prefix + TemperatureUnits.fToC(Number(raw))
        );

        // Weekly: "Monday: sunny, high 70, low 55."
        out = out.replace(
            /\b(high\s+)(-?\d+)(\s*,\s*low\s+)(-?\d+)\b/gi,
            (_match, highPrefix, highRaw, mid, lowRaw) => {
                return highPrefix +
                    TemperatureUnits.fToC(Number(highRaw)) +
                    mid +
                    TemperatureUnits.fToC(Number(lowRaw));
            }
        );

        return out;
    }

    static convertGuiValue (key: string, value: any): any {
        if (value === undefined || value === null) { return value; }

        const keyLower = String(key || '').toLowerCase();

        if (typeof value === 'number' && isFinite(value)) {
            if (keyLower === 'weather_high' ||
                keyLower === 'weather_low' ||
                keyLower === 'hightemp' ||
                keyLower === 'lowtemp' ||
                keyLower === 'temperature' ||
                keyLower === 'high' ||
                keyLower === 'low') {
                return TemperatureUnits.fToC(value);
            }
            return value;
        }

        if (typeof value === 'string') {
            if (keyLower === 'weather_unit' ||
                keyLower === 'temperatureunit' ||
                keyLower === 'unit' ||
                /unitlabel$/i.test(String(key))) {
                if (value === 'F' || value === 'f') { return 'C'; }
                if (/^fahrenheit$/i.test(value)) { return 'Celsius'; }
            }

            if (keyLower === 'text' || keyLower === 'label' || keyLower === 'esml' || keyLower === 'prompt') {
                const degOnly = /^(-?\d+)\s*°$/.exec(value.trim());
                if (degOnly) {
                    return TemperatureUnits.fToC(Number(degOnly[1])) + '°';
                }
                if (value.trim() === 'F' || value.trim() === 'f') { return 'C'; }
                return TemperatureUnits.convertSpokenText(value);
            }

            if (keyLower === 'weather_high' ||
                keyLower === 'weather_low' ||
                keyLower === 'hightemp' ||
                keyLower === 'lowtemp' ||
                keyLower === 'temperature') {
                if (/^-?\d+$/.test(value.trim())) {
                    return String(TemperatureUnits.fToC(Number(value.trim())));
                }
            }

            const degOnly = /^(-?\d+)\s*°$/.exec(value.trim());
            if (degOnly) {
                return TemperatureUnits.fToC(Number(degOnly[1])) + '°';
            }

            if (/Fahrenheit|\bdegrees\b|high\s+\d|low\s+\d/i.test(value)) {
                return TemperatureUnits.convertSpokenText(value);
            }

            return value;
        }

        if (Array.isArray(value)) {
            return value.map((item, index) => TemperatureUnits.convertGuiValue(String(index), item));
        }

        if (typeof value === 'object') {
            const out: any = Array.isArray(value) ? [] : {};
            const id = typeof value.id === 'string' ? value.id : '';
            Object.keys(value).forEach((childKey) => {
                let child = value[childKey];
                if (childKey === 'text' && typeof child === 'string') {
                    if (/UnitLabel$/i.test(id) && (child === 'F' || child === 'f')) {
                        out[childKey] = 'C';
                        return;
                    }
                    if (/NumLabel$/i.test(id)) {
                        const degOnly = /^(-?\d+)\s*°$/.exec(child.trim());
                        if (degOnly) {
                            out[childKey] = TemperatureUnits.fToC(Number(degOnly[1])) + '°';
                            return;
                        }
                    }
                }
                out[childKey] = TemperatureUnits.convertGuiValue(childKey, child);
            });
            return out;
        }

        return value;
    }

    static convertSlimConfig (config: any): void {
        if (!config) { return; }
        if (config.play && typeof config.play.esml === 'string') {
            config.play.esml = TemperatureUnits.convertSpokenText(config.play.esml);
        }
        if (config.display && config.display.view) {
            config.display.view = TemperatureUnits.convertGuiValue('view', config.display.view);
        }
        // OpenJibo also embeds the weather card under gui / views / local.views.
        if (config.gui) {
            config.gui = TemperatureUnits.convertGuiValue('gui', config.gui);
        }
        if (config.views) {
            config.views = TemperatureUnits.convertGuiValue('views', config.views);
        }
        if (config.local) {
            config.local = TemperatureUnits.convertGuiValue('local', config.local);
        }
    }

    static convertCloudBehaviors (behaviors: {
        slim?: { config?: any };
        slimSequence?: { children?: Array<{ config?: any }> };
    }): void {
        if (!behaviors) { return; }
        if (behaviors.slim && behaviors.slim.config) {
            TemperatureUnits.convertSlimConfig(behaviors.slim.config);
        }
        if (behaviors.slimSequence && Array.isArray(behaviors.slimSequence.children)) {
            behaviors.slimSequence.children.forEach((child) => {
                if (child && child.config) {
                    TemperatureUnits.convertSlimConfig(child.config);
                }
            });
        }
    }
}
