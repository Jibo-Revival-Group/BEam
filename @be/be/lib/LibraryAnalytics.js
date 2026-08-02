"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const be_framework_1 = require("@be/be-framework");
class LibraryAnalytics {
    get currentSkill() {
        const plugin = be_framework_1.BeSkill.plugins.analytics;
        if (plugin) {
            return plugin.currentSkill;
        }
        return 'none';
    }
    set LOG_TO_CONSOLE(value) {
        const plugin = be_framework_1.BeSkill.plugins.analytics;
        if (plugin && plugin._segmentAnalytics) {
            plugin._segmentAnalytics.LOG_TO_CONSOLE = value;
        }
    }
    track(event, data) {
        const plugin = be_framework_1.BeSkill.plugins.analytics;
        if (plugin) {
            plugin.skillEvent(event, data);
        }
    }
    flush() {
        const plugin = be_framework_1.BeSkill.plugins.analytics;
        if (plugin) {
            plugin.flush();
        }
    }
}
exports.default = LibraryAnalytics;

