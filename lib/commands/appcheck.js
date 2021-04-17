"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppUpgrades = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const rest_1 = require("@octokit/rest");
const baseCommand_1 = require("./baseCommand");
const semver_1 = __importDefault(require("semver"));
async function getAppUpgrades() {
    const octokit = new rest_1.Octokit();
    const data = await (await (0, node_fetch_1.default)('https://raw.githubusercontent.com/getumbrel/umbrel/master/apps/registry.json')).json();
    const potentialUpdates = [];
    for (const app of data) {
        const repoInfo = app.repo.replace('https://github.com/', '').split('/');
        const tagList = await octokit.repos.listTags({ owner: repoInfo[0], repo: repoInfo[1] });
        let tagName = "";
        const appVersion = app.version;
        for (const tag of tagList.data) {
            if (!semver_1.default.valid(app.version)) {
                app.version = "0.0.1";
            }
            if (semver_1.default.valid(tag.name) && !semver_1.default.prerelease(tag.name) && semver_1.default.gt(tag.name, app.version)) {
                tagName = tag.name;
                break;
            }
        }
        if (tagName.startsWith('v')) {
            tagName = tagName.substr(1);
        }
        if (app.version !== tagName && tagName !== "") {
            potentialUpdates.push({
                umbrel: appVersion,
                current: tagName,
                app: app.name,
            });
        }
    }
    if (potentialUpdates == []) {
        return "No updates were found, everything seems up-to-date.";
    }
    let table = '| app | current release | used in Umbrel |\n';
    table += '|-----|-----------------|----------------|\n';
    potentialUpdates.forEach((update) => {
        table += `|${update.app}|${update.current}|${update.umbrel}|\n`;
    });
    return table;
}
exports.getAppUpgrades = getAppUpgrades;
class Command extends baseCommand_1.BaseCommand {
    static async run(context, _args, _isPR) {
        context.octokit.issues.createComment({ ...context.issue(), body: await getAppUpgrades() });
    }
}
exports.default = Command;
Command.helptext = "Check if all apps used in getumbrel/umbrel are up-to-date.";
