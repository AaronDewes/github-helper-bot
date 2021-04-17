const { getAppUpgrades } = require('../lib/commands/appcheck');
async function getInfo() {
    const data = await getAppUpgrades();
    console.log(data);
}

getInfo();
