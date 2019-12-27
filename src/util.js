export const LOG_LEVELS = ['verbose', 'debug', 'info', 'warn', 'error'];

export const merge = function(obj, src) {
    for (var key in src) {
        if ({}.hasOwnProperty.call(src, key)) {
            obj[key] = src[key];
        }
    }

    return obj;
};