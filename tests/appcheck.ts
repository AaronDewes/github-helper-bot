import { getAppUpgrades } from '../lib/commands/appcheck';
import marked from 'marked';
import TerminalRenderer from 'marked-terminal';

marked.setOptions({
    renderer: new TerminalRenderer(),
});

async function getInfo() {
    const data = await getAppUpgrades();
    console.log(marked(data));
    console.log("Please check BTCPayServer yourself, it isn't supported");
}

getInfo();
