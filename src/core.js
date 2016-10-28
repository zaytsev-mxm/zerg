'use strict';

const LOG_LEVELS = ['verbose', 'debug', 'info', 'warn', 'error'];

/**
 * @type {Zerg}
 */
let loggerInst = null;

/**
 * @type {Object.<Log>}
 * @private
 */
const __logs = {};

/**
 * @type {Array.<Object>}
 * @private
 */
const __transports = [];

/**
 * @type {Array.<function>}
 */
const __filters = [];

/**
 * @typedef {Object} LogObject
 * @property {number} timestamp Time of create log event
 * @property {string} level Level of event
 * @property {string} name Module name with send log event
 * @property {string} message Message of log event
 * @property {Array.<any>} event.arguments Extended info
 */


/**
 * @callback transportCallback
 * @return {undefined}
 */


class Zerg {

    constructor() {
        loggerInst = this;
    }


    /**
     * Create named Log instance
     * @param {string} loggerName - Name for log function
     * @return {Log} - Instance Log function
     */
    create(loggerName) {
        let log = this.getLog(loggerName);
        if (log === false) {
            log = new Log(loggerName);
            this.__addLog(log);
        } else {
            log = this.getLog(loggerName);
        }

        return log;
    }


    getLog(logName) {
        return __logs[logName] || false;
    }


    __addLog(log) {
        __logs[log.name] = log;
    }


    getLogs() {
        return __logs;
    }


    /**
     * @param {function} callback - Function for custom transport
     * @param {Array.<string>} [levels] - Function for custom transport
     * @return {undefined}
     */
    addTransport(callback, levels) {
        if (typeof callback !== 'function') {
            throw new Error('addTransport: callback must be a function');
        }

        let logLevels = [];
        if (typeof levels === 'undefined') {
            logLevels = LOG_LEVELS;
        } else {
            logLevels = levels;
        }

        if (!Array.isArray(logLevels)) {
            throw new Error('addTransport: levels must me array of string')
        }

        __transports.push({
            callback: callback,
            levels: logLevels
        });
    }


    /**
     * @param {function} callback - Function with transport
     * @return {undefined}
     */
    removeTransport(callback) {
        for (let i = 0; i < __transports.length; i++) {
            let subscriber = __transports[i];

            if (subscriber.callback === callback) {
                __transports.splice(i, 1);
            }
        }
    }

    /**
     * @param {function} fn - filtered function
     * @returns {undefined}
     */
    addFilter(fn) {
        __filters.push(fn);
    }


    /**
     * Propagation event for transport
     * @param {LogObject} logInfo - Just LogObject
     * @private
     * @return {boolean} result
     */
    __emit(logInfo) {

        const filterCount = __filters.length;
        const subscriberCount = __transports.length;

        for (let fi = 0; fi < filterCount; fi++) {
            let filter = __filters[fi];

            if (!filter(logInfo)) {
                return false;
            }
        }

        for (let i = 0; i < subscriberCount; i++) {
            let subscriber = __transports[i];
            if (subscriber.levels.indexOf(logInfo.level) > -1) {
                subscriber.callback(logInfo);
            }
        }
    }


    /**
     * Master function creating LogObject
     * @param {string} moduleName - Log module name
     * @param {string} level - Level of log
     * @param {string} message - Message of log
     * @param {Array.<any>} args - Extended info
     * @private
     * @return {undefined}
     */
    __log(moduleName, level, message, args) {
        let logObject = {
            timestamp: Date.now(),
            level: level,
            name: moduleName,
            message: message,
            arguments: args
        };

        this.__emit(logObject);
    }

}

/**
 * Zerg module
 */
class Log {
    constructor(loggerName) {
        this.name = loggerName;

        LOG_LEVELS.forEach((level) => {
            this[level] = function (message) {
                let args = Array.prototype.slice.call(arguments, 1);
                loggerInst.__log(this.name, level, message, args);
            }
        });
    }
}

module.exports = new Zerg();
