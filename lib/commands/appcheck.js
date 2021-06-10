"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppUpgrades = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const command_1 = __importDefault(require("./command"));
const semver_1 = __importDefault(require("semver"));
async function getAppUpgrades(octokit) {
    const data = await (await node_fetch_1.default('https://raw.githubusercontent.com/getumbrel/umbrel/master/apps/registry.json')).json();
    const potentialUpdates = [];
    for (const app of data) {
        console.info(`Checking app ${app.name}...`);
        if (app.versionCheck === false) {
            console.info('Version checking is disabled for this app.');
            continue;
        }
        const repoInfo = app.repo.replace('https://github.com/', '').split('/');
        let tagName = '';
        const appVersion = app.version;
        if (app.id === 'lnbits' || app.useCommits) {
            const appRepo = await octokit.rest.repos.getCommit({
                owner: repoInfo[0],
                repo: repoInfo[1],
                ref: 'master',
            });
            if (appRepo.data.commit.tree.sha.substr(0, 7) !== app.version) {
                potentialUpdates.push({
                    umbrel: appVersion,
                    current: appRepo.data.commit.tree.sha.substr(0, 7),
                    app: app.name,
                });
            }
            break;
        }
        else {
            const tagList = await octokit.rest.repos.listTags({ owner: repoInfo[0], repo: repoInfo[1] });
            for (const tag of tagList.data) {
                if (!semver_1.default.valid(app.version)) {
                    console.info('Not a valid semver.');
                    continue;
                }
                if (semver_1.default.valid(tag.name) && !semver_1.default.prerelease(tag.name) && semver_1.default.gt(tag.name, app.version)) {
                    tagName = tag.name;
                    break;
                }
            }
            if (tagName.startsWith('v')) {
                tagName = tagName.substr(1);
            }
            if (app.version !== tagName && tagName !== '') {
                potentialUpdates.push({
                    umbrel: appVersion,
                    current: tagName,
                    app: app.name,
                });
            }
        }
    }
    if (potentialUpdates == []) {
        return 'No updates were found, everything seems up-to-date.';
    }
    let table = '| app | current release | used in Umbrel |\n';
    table += '|-----|-----------------|----------------|\n';
    potentialUpdates.forEach((update) => {
        table += `| ${update.app} | ${update.current} | ${update.umbrel} |\n`;
    });
    return table;
}
exports.getAppUpgrades = getAppUpgrades;
class CmdHelp extends command_1.default {
    static async run(context, _args, _isPR) {
        context.octokit.rest.issues.createComment({ ...context.issue(), body: await getAppUpgrades(context.octokit) });
    }
}
exports.default = CmdHelp;
CmdHelp.helptext = 'Check if all apps used in getumbrel/umbrel are up-to-date.';
