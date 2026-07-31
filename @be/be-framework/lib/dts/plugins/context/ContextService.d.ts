import Router = require('router');
import { ServiceOptions, HTTPService } from 'jibo-service-framework';
export declare class SingletonEnforcer {
}
/**
 * @description
 * Service endpoint which exposes on-robot context data to those outside Be.
 *
 * @class ContextService
 * @extends HTTPService
 */
export declare class ContextService extends HTTPService {
    private static _instance;
    static createInstance(options: ServiceOptions, rootDir?: string): ContextService;
    static readonly instance: ContextService;
    constructor(enforcer: SingletonEnforcer, options: ServiceOptions, rootDir?: string);
    routes(url: Router): void;
    private getContext(req, res);
}
