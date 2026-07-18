/**
 * HTTP Client
 * @class HTTPClient
 * @extends EventEmitter
 * @param {String} host Registry host
 * @param {String} port Registry port
 */

    /**
     * Constructor
     */

        /**
         * Host
         * @name HTTPClient#host
         * @type {String}
         */

        /**
         * Port
         * @name HTTPClient#port
         * @type {Number}
         */

    /**
     * Send a request.
     * @method HTTPClient#sendRequest
     * @param {String} method
     * @param {String} path
     * @param {String} body
     * @param {Function} callback
     */

    /**
     * Post JSON data.
     * @method HTTPClient#postJSON
     * @param {String} path The API path. Ex. /media/recording/start
     * @param {Object} json JSON payload
     * @param {Function} callback
     */

    /**
     * Get JSON from request.
     * @method HTTPClient#getJSON
     * @param {String} path The API path. Ex. /media/recording/start
     * @param {Object} json JSON payload
     * @param {Function} callback
     */