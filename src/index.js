import { LOG_LEVELS, merge } from './util';
import { zerg } from './core';
import transport from './transport';

zerg.addTransport(transport.console);

/**
 * @param {object} opt - for config
 * @param {boolean} opt.console - disable/enable console transport
 * @return {undefined}
 */
zerg.config = function (opt) {
    const options = merge({
        console: true,
        consoleLevels: LOG_LEVELS
    }, opt || {});

    if ({}.hasOwnProperty.call(options, 'console')) {
        zerg.removeTransport(transport.console);

        if (options.console) {
            zerg.addTransport(transport.console, options.consoleLevels);
        }
    }
};

export default zerg;