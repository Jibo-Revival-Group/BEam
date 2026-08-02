"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const jibo = require("jibo");
class ModuleVersions {
    static log(log, beRootDir) {
        const bePackageJson = require(path.resolve(beRootDir, "package.json"));
        let packageInfo = {};
        for (let packageName in bePackageJson.dependencies) {
            try {
                const packageJson = require(path.resolve(beRootDir, "node_modules", packageName, "package.json"));
                packageInfo[packageName] = packageJson.version;
            }
            catch (error) {
                packageInfo[packageName] = "Not Installed? (Hoisted?)";
            }
        }
        if (jibo.runMode !== undefined &&
            jibo.runMode !== jibo.RunMode.UNIT_TESTS) {
            log.info('Skill versions:', packageInfo);
        }
    }
}
exports.default = ModuleVersions;

