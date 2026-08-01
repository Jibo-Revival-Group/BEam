/**
 * @class PackageUtils
 * @memberof utils
 */
export default class PackageUtils {
    /**
     * Checks wheather `jibo.debug[.namespace]` in `package.json` is set to `true`.
     * If no namespace is provided and `jibo.debug: true` then return `true`;
     * If no namespace is provided and `jibo.debug: {}` is object then return `false`;
     * @method utils.PackageUtils.debugMode
     * @param {string} [debugNamespace] Namespace to debug.
     * @returns {boolean} `true` if `jibo.debug[.namespace]` in `package.json` is `true`.
     */
    static debugMode(debugNamespace?: string): boolean;
    /**
     * Checks wheather `jibo.debug[.namespace]` in `package.json` is set to `true`.
     * If no namespace is provided and `jibo.debug: true` then return `true`;
     * If no namespace is provided and `jibo.debug: {}` is object then return `false`;
     * @method utils.PackageUtils._debugMode
     * @param {object} packageObj `package.json` object.
     * @param {string} [debugNamespace] Namespace to debug.
     * @returns {boolean} `true` if `jibo.debug[.namespace]` in `package.json` is `true`.
     */
    static _debugMode(packageObj: any, debugNamespace?: string): boolean;
}
