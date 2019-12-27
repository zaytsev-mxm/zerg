import { LOG_LEVELS } from './util';

class Module {
    constructor(loggerName, zergInstance) {
        var self = this;
        self.name = loggerName;
        self.enable = true;

        LOG_LEVELS.forEach(function (level) {
            self[level] = function (message) {
                if (!self.enable) {
                    return;
                }
                var args = Array.prototype.slice.call(arguments, 1);
                zergInstance.__log(self.name, level, message, args);
            }
        });
    }
}

export default Module;