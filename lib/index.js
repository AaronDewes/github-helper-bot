"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = void 0;
const probot_1 = require("probot");
const pullrequest_1 = require("./pullrequest");
const helpers_1 = require("./helpers");
const unfurl_1 = __importDefault(require("./unfurl/unfurl"));
const config_1 = require("./config");
const commands_1 = __importDefault(require("./commands"));
const consts_1 = require("./consts");
const prValidator_1 = __importDefault(require("./prValidator"));
let BotOctokit = new probot_1.ProbotOctokit();
const managedRepos = {};
let openPRs = [];
let lastConfig = config_1.defaultConfig;
let lastInterval;
function getPermissionDeniedError(username) {
    return `
:wave: Hello!
You tried to use me in your own repositories or organization (@${username}).
I can only be used on authorized repos and not everywhere.
My source code is public, so you can host me myself if you like me.
Check [this repo](https://github.com/AaronDewes/github-helper-bot) to view it.
`;
}
async function handleChangedPR(repo, number) {
    if (!managedRepos[`getumbrel-${repo}`]) {
        managedRepos[`getumbrel-${repo}`] = new pullrequest_1.Repo('getumbrel', repo);
    }
    managedRepos[`getumbrel-${repo}`].scheduleBuild(false, BotOctokit, number, 'getumbrel', repo, async (buildBranch) => {
        const comment = await BotOctokit.issues.createComment({
            owner: 'getumbrel',
            repo: repo,
            issue_number: number,
            body: `Built image to ${consts_1.buildOrg}/${repo}:${buildBranch}.`,
        });
        managedRepos[`getumbrel-${repo}`].deleteOldComments(BotOctokit, number, 'getumbrel', repo);
        managedRepos[`getumbrel-${repo}`].addComment(number, comment.data.id);
    });
}
async function handleOpenPRs() {
    const lastOpenPRs = openPRs;
    openPRs = await (0, helpers_1.getPRs)(BotOctokit);
    const toDo = await (0, helpers_1.comparePRList)(lastOpenPRs, openPRs);
    toDo.forEach(async (pr) => {
        handleChangedPR(pr.repo, pr.number);
    });
}
async function build(context) {
    if (!managedRepos[`${context.repo().owner}-${context.repo().repo}`]) {
        managedRepos[`${context.repo().owner}-${context.repo().repo}`] = new pullrequest_1.Repo(context.repo().owner, context.repo().repo);
    }
    const repo = managedRepos[`${context.repo().owner}-${context.repo().repo}`];
    const PR = managedRepos[`${context.repo().owner}-${context.repo().repo}`];
    PR.scheduleBuild(true, context.octokit, context.issue().issue_number, context.repo().owner, context.repo().repo, async (buildBranch) => {
        const comment = await BotOctokit.issues.createComment({
            owner: context.repo().owner,
            repo: context.repo().repo,
            issue_number: context.pullRequest().pull_number,
            body: `Built image to ${consts_1.buildOrg}/${context.repo().repo}:${buildBranch}.`,
        });
        repo.deleteOldComments(context.octokit, context.pullRequest().pull_number, context.repo().owner, context.repo().repo);
        repo.addComment(context.pullRequest().pull_number, comment.data.id);
    });
}
exports.build = build;
module.exports = (app) => {
    BotOctokit = new probot_1.ProbotOctokit();
    app.on(['issue_comment.created', 'issue_comment.edited'], async (context) => {
        if (!consts_1.allowedRepoOwners.includes(context.issue().owner)) {
            context.octokit.issues.createComment({
                ...context.issue(),
                body: getPermissionDeniedError(context.issue().owner),
            });
        }
        const config = await (0, config_1.getConfig)(context.octokit, context.repo().owner, context.repo().repo);
        if (lastConfig.prFetchMinutes !== config.prFetchMinutes) {
            clearInterval(lastInterval);
            lastInterval = setInterval(handleOpenPRs, lastConfig.prFetchMinutes * 60 * 1000);
        }
        lastConfig = config;
        if (config.blocklist && config.blocklist.includes(context.payload.sender.login)) {
            console.warn(`User @${context.payload.sender} tried to use the bot without permission.`);
            return;
        }
        const { comment, issue } = context.payload;
        const command = (comment || issue).body.match(/^\/([\w]+)\b *(.*)?$/m);
        if (!command || (command && !command[1]) || context.payload.sender.type == 'bot') {
            return;
        }
        const issueInfo = context.octokit.issues.get(context.issue());
        let isPR = false;
        if ((await issueInfo).data.pull_request) {
            isPR = true;
        }
        (0, commands_1.default)(command[1], command[2], context, isPR);
        if (comment && comment.body?.trim() == `${command[1]} ${command[2]}`) {
            context.octokit.issues.deleteComment({ ...context.issue(), comment_id: comment.id });
        }
    });
    app.on(['issue_comment.created'], async (context) => {
        const comment = await context.octokit.issues.getComment({
            ...context.repo(),
            id: context.payload.comment.id,
        });
        return (0, unfurl_1.default)(context, comment.data.body_html);
    });
    app.on(['issues.opened', 'pull_request.opened'], async (context) => {
        const issue = await context.octokit.issues.getComment(context.issue());
        return (0, unfurl_1.default)(context, issue.data.body_html);
    });
    app.on('pull_request.opened', prValidator_1.default);
    app.on(['pull_request.closed', 'pull_request.merged'], async (context) => {
        if (managedRepos[`getumbrel-${context.pullRequest().repo}`]) {
            managedRepos[`getumbrel-${context.pullRequest().repo}`].stopManagingPR(context.pullRequest().pull_number);
        }
    });
    lastInterval = setInterval(handleOpenPRs, (lastConfig.prFetchMinutes || config_1.defaultConfig.prFetchMinutes) * 60 * 1000);
};
