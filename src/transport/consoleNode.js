/* eslint no-console: "off" */

const codes = {
    reset: [0, 0],
    cyan: [36, 39],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    gray: [90, 39]
};

const styles = {};

Object.keys(codes).forEach(function (key) {
    const open = '\u001b[' + codes[key][0] + 'm';
    const close = '\u001b[' + codes[key][1] + 'm';

    styles[key] = (function (open, close) {
        return function (string) {
            return open + string + close;
        }
    })(open, close);
});

const map = {
    verbose: styles.gray,
    debug: styles.cyan,
    error: styles.red,
    info: styles.green,
    warn: styles.yellow
};

/**
 * @param {LogObject} logObject - Object of log event
 * @return {void}
 */
const handler = function (logObject) {
    const style = map[logObject.level];
    const message = style('[' + logObject.name + ']') + ' ' + logObject.message;
    const args = [message].concat(logObject.arguments);
    console.log.apply(console, args);
};

handler.styles = styles;
handler.codes = codes;

export default handler;