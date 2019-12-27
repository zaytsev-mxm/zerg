import consoleNode from './consoleNode';
import consoleBrowser from './consoleBrowser';

let console = consoleNode;
if (typeof window !== 'undefined') {
    console = consoleBrowser;
}

export default { console };