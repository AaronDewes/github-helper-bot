"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const probot_1 = require("probot");
const config_1 = require("./config");
const commands_1 = __importDefault(require("./commands"));
const consts_1 = require("./consts");
const prValidator_1 = __importDefault(require("./prValidator"));
const builder_1 = __importDefault(require("./builder"));
let BotOctokit = new probot_1.ProbotOctokit();
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
    const prInfo = await BotOctokit.pulls.get(context.pullRequest());
    builder_1.default(context.octokit, context.repo().owner, context.repo().repo, context.pullRequest().pull_number, async (buildBranch) => {
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
module.exports = (app) => {
    app.on(['issue_comment.created', 'issue_comment.edited'], async (context) => {
        BotOctokit = context.octokit;
        if (!consts_1.allowedRepoOwners.includes(context.issue().owner)) {
            context.octokit.issues.createComment({
                ...context.issue(),
                body: getPermissionDeniedError(context.issue().owner),
            });
        }
        const config = await config_1.getConfig(context.octokit, context.repo().owner, context.repo().repo);
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
        commands_1.default(command[1], command[2], context, isPR);
        if (comment && comment.body?.trim() == `${command[1]} ${command[2]}`) {
            context.octokit.issues.deleteComment({ ...context.issue(), comment_id: comment.id });
        }
    });
    app.on('pull_request.opened', prValidator_1.default);
    app.on(['pull_request.opened', 'pull_request.synchronize'], async (context) => {
        BotOctokit = context.octokit;
        build(context);
    });
};
