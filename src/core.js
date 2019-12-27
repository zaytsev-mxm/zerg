import { LOG_LEVELS } from './util';
import Module from './module';

/**
 * @typedef {Object} LogObject
 * @property {number} timestamp - Time of create log event
 * @property {string} level - Level of event
 * @property {string} name - Module name with send log event
 * @property {string} message - Message of log event
 * @property {Array.<any>} arguments - Extended info
 */

/**
 * @callback transportCallback
 * @return {undefined}
 */

/**
 * @constructor
 */
class Zerg {
    constructor() {
        this.__modules = [];
        this.__transports = [];
        this.__enableRules = [];
    }

    /**
     * Create named Module instance
     * @param {string} moduleName - Name for log function
     * @return {Module} - Instance {@link Module}
     */
    module(moduleName) {
        let module = this.getModule(moduleName);

        if (!module) {
            module = new Module(moduleName, this);
            module.enable = this.isModuleEnable(module);
            this.__addModule(module);
        }

        return module;
    }

    /**
     * @typedef {Object} Rule
     * @property {string} moduleName
     * @property {boolean} namespace
     * @property {boolean} enable
     */

    /**
     * @param {string} string - rule string
     * @returns {Rule} rule for module
     */
    parseRule(string) {
        let isEnable = true;
        let isNameSpace = false;
        let moduleName = string;

        if (!moduleName) {
            moduleName = '*';
        }

        if (moduleName.length !== 1 && moduleName[0] === '-') {
            isEnable = false;
            moduleName = moduleName.substring(1);
        }

        if (moduleName.length !== 1 && moduleName[moduleName.length - 1] === '*') {
            isNameSpace = true;
            moduleName = moduleName.substring(0, moduleName.length - 1)
        }

        return {
            moduleName: moduleName,
            namespace: isNameSpace,
            enable: isEnable
        }
    }

    /**
     * @param {Array.<string>} rules — list of rules
     * @returns {undefined}
     */
    enable(rules) {
        this.__enableRules = [];
        const rulesLen = rules.length;
        for (let ri = 0; ri < rulesLen; ri++) {
            const rule = this.parseRule(rules[ri]);
            this.__enableRules.push(rule);
        }

        const modules = this.getModules();

        Object.keys(modules).forEach((name) => {
            const module = modules[name];
            module.enable = this.isModuleEnable(module);
        });
    }

    /**
     * @param {Module} module — logger module
     * @returns {boolean} - is module enable
     */
    isModuleEnable(module) {
        const rulesCount = this.__enableRules.length;
        let byDefault = false;

        if (!rulesCount) {
            return true;
        }

        for (let i = 0; i < rulesCount; i++) {
            const rule = this.__enableRules[i];

            // if only disable rules, enable module by default
            if (!byDefault && !rule.enable) {
                byDefault = true;
            }

            if (rule.moduleName === '*') {
                return true;
            }

            if (rule.moduleName === '-') {
                return false;
            }

            if (rule.namespace && module.name.indexOf(rule.moduleName) === 0) {
                return rule.enable;
            }

            if (!rule.namespace && rule.moduleName === module.name) {
                return rule.enable;
            }
        }

        return byDefault;
    }

    /**
     * @param {string} moduleName - Name of {@link Module}
     * @returns {Module|boolean} - module instance or false if not exist
     */
    getModule(moduleName) {
        return this.__modules[moduleName] || false;
    }

    /**
     * @param {Module} module - instance {@link Module}
     * @private
     * @return {undefined}
     */
    __addModule(module) {
        this.__modules[module.name] = module;
    }

    /**
     * @returns {Object.<string, Module>} - all registered modules
     */
    getModules() {
        return this.__modules;
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

        this.__transports.push({
            callback: callback,
            levels: logLevels
        });
    }

    /**
     * @param {function} callback - Function with transport
     * @return {undefined}
     */
    removeTransport(callback) {
        for (let i = 0; i < this.__transports.length; i++) {
            const subscriber = this.__transports[i];

            if (subscriber.callback === callback) {
                this.__transports.splice(i, 1);
            }
        }
    }

    removeAllTransports() {
        this.__transports = [];
    }

    /**
     * Propagation event for transport
     * @param {LogObject} logInfo - Just LogObject
     * @private
     * @returns {boolean} result
     */
    __emit(logInfo) {
        const subscriberCount = this.__transports.length;

        for (let i = 0; i < subscriberCount; i++) {
            const subscriber = this.__transports[i];
            if (subscriber.levels.indexOf(logInfo.level) > -1) {
                subscriber.callback(logInfo);
            }
        }
    }

    /**
     * Master function creating LogObject
     * @param {string} moduleName - {@link Module} module name
     * @param {string} level - Level of log
     * @param {string} message - Message of log
     * @param {Array.<any>} args - Extended info
     * @private
     * @return {undefined}
     */
    __log(moduleName, level, message, args) {
        const logObject = {
            timestamp: Date.now(),
            level: level,
            name: moduleName,
            message: message,
            arguments: args
        };

        this.__emit(logObject);
    }
}

export const zerg = new Zerg();

export default Zerg;
