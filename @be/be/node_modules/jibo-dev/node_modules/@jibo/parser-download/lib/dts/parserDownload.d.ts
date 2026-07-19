export declare type ParserCallback = (err?: Error | string) => void;
export interface ParserOptions {
    force32?: boolean;
    rename?: boolean;
    verbose?: boolean;
    version?: string;
    type?: string;
    logger?: Function;
    dir?: string;
    url?: string;
}
/**
 * Download and extract the Jibo NLU parser
 * @class ParserDownload
 */
export default class ParserDownload {
    /**
     * The constructor options
     * @name options
     * @type {Object}
     */
    options: ParserOptions;
    /**
     * The download URL
     * @name url
     * @type {String}
     */
    url: string;
    /**
     * The output directory for the parser
     * @name outputDir
     * @type {String}
     */
    outputDir: string;
    /**
     * The version file to store cache name
     * @name versionPath
     * @type {String}
     */
    versionPath: string;
    /**
     * The directory path to save zips to.
     * @name cacheDir
     * @type {String}
     */
    cacheDir: string;
    /**
     * The name of the output cache zip file.
     * @name archiveName
     * @type {String}
     */
    archiveName: string;
    /**
     * Full path to archive file.
     * @name archivePath
     * @type {String}
     */
    archivePath: string;
    /**
     * Temporary extraction directory.
     * @name tempDir
     * @type {String}
     */
    tempDir: string;
    /**
     * The name of the package.
     * @name name
     * @type {String}
     */
    name: string;
    constructor(optionsOrVersion: ParserOptions | string);
    /**
     * Begin the download process.
     * @method start
     */
    start(): Promise<void>;
}
