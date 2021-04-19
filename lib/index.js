"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = void 0;
const pullrequest_1 = require("./pullrequest");
const octokit_auth_probot_1 = require("octokit-auth-probot");
const graphql_1 = require("@octokit/graphql");
const rest_1 = require("@octokit/rest");
const octokit_plugin_config_1 = require("@probot/octokit-plugin-config");
const jsonpath_1 = __importDefault(require("jsonpath"));
const helpers_1 = require("./helpers");
const unfurl_1 = __importDefault(require("./unfurl/unfurl"));
const config_1 = require("./config");
const commands_1 = __importDefault(require("./commands"));
const consts_1 = require("./consts");
const extendedOctokit = rest_1.Octokit.plugin(octokit_plugin_config_1.config);
const ProbotGraphQL = graphql_1.graphql.defaults({
    authStrategy: octokit_auth_probot_1.createProbotAuth,
});
const ProbotREST = new extendedOctokit({
    authStrategy: octokit_auth_probot_1.createProbotAuth,
});
let managedRepos;
let openPRs;
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
async function getConfig(context) {
    const userConfig = (await ProbotREST.config.get({
        ...context.repo(),
        path: '.github/UmbrelBot.yml',
    })).config || {};
    if (userConfig !== {} && userConfig.version && userConfig.version !== consts_1.configVersion) {
        context.octokit.issues.createComment({
            ...context.issue(),
            body: `This repo uses the configuration version '${userConfig.version}' which is not supported by this bot, please use version ${consts_1.configVersion}.`,
        });
    }
    const newConfig = {
        ...config_1.defaultConfig,
        ...userConfig,
    };
    if (lastInterval && lastConfig.prFetchMinutes !== newConfig.prFetchMinutes) {
        clearInterval(lastInterval);
        lastInterval = setInterval(handleOpenPRs, newConfig.prFetchMinutes * 60 * 1000);
    }
    lastConfig = newConfig;
    return newConfig;
}
async function handleChangedPR(repo, number) {
    if (!managedRepos[`getumbrel-${repo}`]) {
        managedRepos[`getumbrel-${repo}`] = new pullrequest_1.Repo('getumbrel', repo);
    }
    managedRepos[`getumbrel-${repo}`].scheduleBuildFromOctokit(number, false, ProbotREST, 'getumbrel', repo, async (buildBranch) => {
        const comment = await ProbotREST.issues.createComment({
            owner: 'getumbrel',
            repo: repo,
            issue_number: number,
            body: `Built image to ${consts_1.buildOrg}/${repo}:${buildBranch}.`,
        });
        managedRepos[`getumbrel-${repo}`].deleteOldCommentsFromOctokit(number, ProbotREST);
        managedRepos[`getumbrel-${repo}`].addComment(number, comment.data.id);
    });
}
async function handleOpenPRs() {
    const lastOpenPRs = openPRs;
    openPRs = await (0, helpers_1.getPRs)(ProbotGraphQL);
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
    PR.scheduleBuild(context.issue().issue_number, true, context, async (buildBranch) => {
        const comment = await ProbotREST.issues.createComment({
            owner: context.repo().owner,
            repo: context.repo().repo,
            issue_number: context.pullRequest().pull_number,
            body: `Built image to ${consts_1.buildOrg}/${context.repo().repo}:${buildBranch}.`,
        });
        repo.deleteOldComments(context.pullRequest().pull_number, context);
        repo.addComment(context.pullRequest().pull_number, comment.data.id);
    });
}
exports.build = build;
module.exports = (app) => {
    app.on(['issue_comment.created', 'issue_comment.edited'], async (context) => {
        if (!consts_1.allowedRepoOwners.includes(context.issue().owner)) {
            context.octokit.issues.createComment({
                ...context.issue(),
                body: getPermissionDeniedError(context.issue().owner),
            });
        }
        const config = await getConfig(context);
        if (config.blocklist && config.blocklist.includes(context.payload.sender.login)) {
            console.warn(`User @${context.payload.sender} tried to use the bot without permission.`);
            return;
        }
        const { comment, issue } = context.payload;
        const command = (comment || issue).body.match(/^\/([\w]+)\b *(.*)?$/m);
        if (!command || (command && !command[1])) {
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
    app.on('pull_request.opened', async (context) => {
        const config = await getConfig(context);
        if (!config.invalidPRConfig?.enabled)
            return;
        const htmlUrl = context.payload.pull_request.html_url;
        app.log.debug(`Inspecting: ${htmlUrl}`);
        const username = context.payload.pull_request.user.login;
        const canPush = await (0, helpers_1.hasPushAccess)(context, context.repo({ username }));
        const data = Object.assign({ has_push_access: canPush }, context.payload);
        const filters = config.invalidPRConfig?.filters || config_1.defaultConfig.invalidPRConfig.filters;
        if (!filters.every((filter, i) => {
            try {
                if (jsonpath_1.default.query([data], `$[?(${filter})]`).length > 0) {
                    app.log.info(`Filter "${filter}" matched the PR ✅ [${i + 1} of ${filters.length}]`);
                    return true;
                }
            }
            catch (e) {
                app.log.debug(`Malformed JSONPath query: "${filter}"`);
            }
            return false;
        })) {
            handleChangedPR(context.pullRequest().repo, context.pullRequest().pull_number);
            return;
        }
        app.log.debug(`Closing PR ${htmlUrl}`);
        await (0, helpers_1.comment)(context, context.issue({
            body: config.invalidPRConfig?.commentBody || config_1.defaultConfig.invalidPRConfig.commentBody,
        }));
        if (config.invalidPRConfig?.addLabel) {
            await (0, helpers_1.addLabel)(context, config.invalidPRConfig.labelName || config_1.defaultConfig.invalidPRConfig.labelName, config.invalidPRConfig.labelColor || config_1.defaultConfig.invalidPRConfig.labelColor);
        }
        return (0, helpers_1.closeIssue)(context, context.issue());
    });
    app.on(['pull_request.closed', 'pull_request.merged'], async (context) => {
        if (managedRepos[`getumbrel-${context.pullRequest().repo}`]) {
            managedRepos[`getumbrel-${context.pullRequest().repo}`].stopManagingPR(context.pullRequest().pull_number);
        }
    });
    lastInterval = setInterval(handleOpenPRs, (lastConfig.prFetchMinutes || config_1.defaultConfig.prFetchMinutes) * 60 * 1000);
};
