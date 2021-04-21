"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = void 0;
const probot_1 = require("probot");
const pullrequest_1 = require("./pullrequest");
const unfurl_1 = __importDefault(require("./unfurl/unfurl"));
const config_1 = require("./config");
const commands_1 = __importDefault(require("./commands"));
const consts_1 = require("./consts");
const prValidator_1 = __importDefault(require("./prValidator"));
let BotOctokit = new probot_1.ProbotOctokit();
const managedRepos = {};
function getPermissionDeniedError(username) {
    return `
:wave: Hello!
You tried to use me in your own repositories or organization (@${username}).
I can only be used on authorized repos and not everywhere.
My source code is public, so you can host me myself if you like me.
Check [this repo](https://github.com/AaronDewes/github-helper-bot) to view it.
`;
}
async function build(context) {
    if (!managedRepos[`${context.repo().owner}-${context.repo().repo}`]) {
        managedRepos[`${context.repo().owner}-${context.repo().repo}`] = new pullrequest_1.Repo(context.repo().owner, context.repo().repo);
    }
    const repo = managedRepos[`${context.repo().owner}-${context.repo().repo}`];
    repo.managePR(context.pullRequest().pull_number);
    const prInfo = await BotOctokit.pulls.get(context.pullRequest());
    repo.scheduleBuild(context.octokit, context.issue().issue_number, context.repo().owner, context.repo().repo, async (buildBranch) => {
        BotOctokit.checks.create({
            ...context.repo(),
            status: 'completed',
            conclusion: 'success',
            output: {
                title: 'Started build of the image',
                summary: `The image will soon be on Docker Hub as umbrelbuilds/${context
                    .repo()
                    .repo.replace('umbrel-', '')}:${buildBranch}`,
            },
            head_sha: prInfo.data.head.sha,
            name: 'umbrel-build',
        });
    });
}
exports.build = build;
module.exports = (app) => {
    app.on(['issue_comment.created', 'issue_comment.edited'], async (context) => {
        BotOctokit = context.octokit;
        if (!consts_1.allowedRepoOwners.includes(context.issue().owner)) {
            context.octokit.issues.createComment({
                ...context.issue(),
                body: getPermissionDeniedError(context.issue().owner),
            });
        }
        const config = await (0, config_1.getConfig)(context.octokit, context.repo().owner, context.repo().repo);
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
    app.on(['pull_request.opened', 'pull_request.synchronize'], async (context) => {
        BotOctokit = context.octokit;
        build(context);
    });
};
