"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pullrequest_1 = require("./pullrequest");
const remind_1 = __importDefault(require("./remind"));
const { createProbotAuth } = require("octokit-auth-probot");
const graphql_1 = require("@octokit/graphql");
const rest_1 = require("@octokit/rest");
const helpers_1 = require("./helpers");
const unfurl_1 = __importDefault(require("./unfurl/unfurl"));
// Check for new PRs every PR_FETCH_TIME minutes
const PR_FETCH_TIME = 5;
const ProbotGraphQL = graphql_1.graphql.defaults({
    authStrategy: createProbotAuth,
});
const ProbotREST = new rest_1.Octokit({
    authStrategy: createProbotAuth,
});
let managedRepos;
let openPRs;
function getPermissionDeniedError(username) {
    return `
:wave: Hello!
You tried to use me in your own repositories or organization (@${username}).
I can only be used on authorized repos and not everywhere.
My source code is public, so you can host me myself if you like me.
Check [this repo](https://github.com/AaronDewes/UmbrelBot-v2) to view it.
`;
}
/**
 * Get a list of Pull requests
 * @returns {PRInfo[]} An array of pull requests with basic information about them
 */
async function getPRs() {
    const fetchedData = await ProbotGraphQL(`
      {
        search(query: "org:getumbrel is:pr is:open draft:false", type: ISSUE, last: 100) {
          edges {
            node {
              ... on PullRequest {
                number,
                headRefName,
                commits(last: 1) {
                  edges {
                    node {
                      commit {
                      abbreviatedOid
                      }
                    }
                  }
                }
                baseRepository {
                  name
                }
              }
            }
          }
        }
      }
    `);
    let result = [];
    fetchedData.data.search.edges.forEach((node) => {
        let subNode = node.node;
        result.push({
            branchName: subNode.headRefName,
            head: subNode.commits.edges[0].subNode.commit.abbreviatedOid,
            repo: subNode.baseRepository.name,
            number: subNode.number
        });
    });
    return result;
}
async function build(context, isPR) {
    if (!managedRepos[`${context.repo().owner}-${context.repo().repo}`]) {
        managedRepos[`${context.repo().owner}-${context.repo().repo}`] = new pullrequest_1.Repo(context.repo().owner, context.repo().repo);
    }
    const PR = managedRepos[`${context.repo().owner}-${context.repo().repo}`];
    if (!isPR) {
        context.octokit.issues.createComment({ ...context.issue(), body: "This command only works on pull requests." });
    }
    PR.scheduleBuild(context.issue().issue_number, true, context);
}
async function helpText(context) {
    if (context.payload.sender.login == "AaronDewes") {
        context.octokit.issues.createComment({ ...context.issue(), body: `@AaronDewes you know this hasn't been implemented yet, add it!` });
    }
    if (context.payload.sender.login == "louneskmt") {
        context.octokit.issues.createComment({ ...context.issue(), body: `@louneskmt @AaronDewes didn't implement this yet. You can tell everyone in the podcast about this.\nAnd Pretzel will win in Baguette vs. Pretzel!` });
    }
    context.octokit.issues.createComment({ ...context.issue(), body: `:wave: ${context.payload.sender.login} Thank you for your interest in this bot!\nUnfortunately, there is no help text yet, or the command you sent hasn't been implemented yet. @AaronDewes should add one, but he didn't do it yet.` });
}
async function handleCommand(cmd, args, context, isPR) {
    switch (cmd) {
        case "build":
            build(context, isPR);
            return;
        case "remind":
            remind_1.default(context, args);
            return;
        case "help":
            helpText(context);
            return;
        default:
            return;
    }
}
module.exports = (app) => {
    /* Parse comments */
    app.on(["issue_comment.created", "issue_comment.edited"], async (context) => {
        // Validate repository owner
        // Authorize the Umbrel team to use the Bot in their own repos
        // Probably never useful, but I'll allow it anyway
        const allowedRepoOwners = ["getumbrel", "UmbrelBuilds", "AaronDewes", "louneskmt", "lukechilds", "mayankchhabra"];
        if (!allowedRepoOwners.includes(context.issue().owner)) {
            context.octokit.issues.createComment({
                ...context.issue(),
                body: getPermissionDeniedError(context.issue().owner)
            });
        }
        const { config } = await ProbotREST.config.get({
            ...context.repo(),
            path: ".github/UmbrelBot.yml",
        });
        if (config.blacklist && config.blacklist.includes(context.payload.sender)) {
            console.warn(`Blacklisted user @${context.payload.sender} tried to use the bot.`);
            return;
        }
        // Check if it is a command
        const { comment, issue } = context.payload;
        const command = (comment || issue).body.match(/^\/([\w]+)\b *(.*)?$/m);
        const issueInfo = context.octokit.issues.get(context.issue());
        let isPR = false;
        if ((await issueInfo).data.pull_request) {
            isPR = true;
        }
        handleCommand(command[1], command[2], context, isPR);
        // Delete comment with the command if only the comand is in there
        if (comment && comment.body?.trim() == `${command[1]} ${command[2]}`) {
            context.octokit.issues.deleteComment({ ...context.issue(), comment_id: comment.id });
        }
    });
    app.on(['issue_comment.created'], async (context) => {
        const comment = await context.octokit.issues.getComment({
            ...context.repo(),
            id: context.payload.comment.id
        });
        return unfurl_1.default(context, comment.data.body_html);
    });
    app.on(['issues.opened', 'pull_request.opened'], async (context) => {
        const issue = await context.octokit.issues.getComment(context.issue());
        return unfurl_1.default(context, issue.data.body_html);
    });
    /* Check for new PRs every 5min */
    setInterval(async () => {
        let lastOpenPRs = openPRs;
        openPRs = await getPRs();
        let toDo = await helpers_1.comparePRList(lastOpenPRs, openPRs);
        toDo.forEach(async (pr) => {
            if (!managedRepos[`getumbrel-${pr.repo}`]) {
                managedRepos[`getumbrel-${pr.repo}`] = new pullrequest_1.Repo("getumbrel", pr.repo);
            }
            managedRepos[`getumbrel-${pr.repo}`].scheduleBuildFromOctokit(pr.number, false, ProbotREST, "getumbrel", pr.repo, async (buildBranch) => {
                const comment = await ProbotREST.issues.createComment({
                    owner: "getumbrel",
                    repo: pr.repo,
                    issue_number: pr.number,
                    body: `Built image to umbrelbuilds/${pr.repo}:${buildBranch}.`
                });
                comment.data.id;
            });
        });
    }, PR_FETCH_TIME * 60 * 1000);
};
//# sourceMappingURL=index.js.map