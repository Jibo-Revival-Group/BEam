"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo_log_1 = require("jibo-log");
const jibo = require("jibo");
const fs = require("fs");
const path = require("path");
jibo_log_1.Log.processName = "be";
const log = new jibo_log_1.Log('Be');
exports.default = log;
function loadLogConfig(callback) {
    if (jibo.runMode === jibo.RunMode.ON_ROBOT) {
        jibo.systemManager.getMode((err, mode) => {
            const configPath = path.join(jibo.utils.PathUtils.findRoot(), 'config', `be-${mode}.json`);
            if (fs.existsSync(configPath)) {
                let encounteredError = false;
                try {
                    jibo_log_1.Log.loadConfig(JSON.parse(fs.readFileSync(configPath, 'utf-8')));
                    log.info(`Loaded log configuration from '${configPath}'`);
                }
                catch (err) {
                    encounteredError = true;
                    callback(`Error parsing logging config file '${configPath}': ${err.message}`);
                }
                if (!encounteredError) {
                    callback();
                }
            }
            else {
                callback(`No logging configuration found at '${configPath}'`);
            }
        });
    }
    else {
        jibo_log_1.Log.loadConfig({});
        callback();
    }
}
exports.loadLogConfig = loadLogConfig;

