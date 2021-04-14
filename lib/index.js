"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = void 0;
const pullrequest_1 = require("./pullrequest");
const { createProbotAuth } = require("octokit-auth-probot");
const graphql_1 = require("@octokit/graphql");
const rest_1 = require("@octokit/rest");
const jsonpath_1 = __importDefault(require("jsonpath"));
const helpers_1 = require("./helpers");
const unfurl_1 = __importDefault(require("./unfurl/unfurl"));
const default_config_1 = __importDefault(require("./default-config"));
const commands_1 = __importDefault(require("./commands"));
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
    let fetchedData = await ProbotGraphQL(`
      {
        search(query: "org:getumbrel is:pr is:open draft:false", type: ISSUE, first: 100) {
          pageInfo { 
            hasNextPage
            endCursor
          }
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
    let hasNextPage = fetchedData.data.search.pageInfo.hasNextPage;
    let endCursor = fetchedData.data.search.pageInfo.endCursor;
    while (hasNextPage == true) {
        let nowFetched = await ProbotGraphQL(`
        {
          search(query: "org:getumbrel is:pr is:open draft:false", type: ISSUE, first: 100, after: ${endCursor}) {
            pageInfo { 
              hasNextPage
              endCursor
            }
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
        hasNextPage = nowFetched.data.search.pageInfo.hasNextPage;
        endCursor = fetchedData.data.search.pageInfo.endCursor;
        fetchedData.data.search.edges = [...fetchedData.data.search.edges, ...nowFetched.data.search.edges];
    }
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
async function build(context) {
    if (!managedRepos[`${context.repo().owner}-${context.repo().repo}`]) {
        managedRepos[`${context.repo().owner}-${context.repo().repo}`] = new pullrequest_1.Repo(context.repo().owner, context.repo().repo);
    }
    const PR = managedRepos[`${context.repo().owner}-${context.repo().repo}`];
    PR.scheduleBuild(context.issue().issue_number, true, context);
}
exports.build = build;
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
        commands_1.default(command[1], command[2], context, isPR);
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
    app.on('pull_request.opened', async (context) => {
        const htmlUrl = context.payload.pull_request.html_url;
        app.log.debug(`Inspecting: ${htmlUrl}`);
        const userConfig = await ProbotREST.config.get({
            ...context.repo(),
            path: ".github/UmbrelBot.yml",
        }) || {};
        const config = {
            ...default_config_1.default,
            ...userConfig
        };
        const username = context.payload.pull_request.user.login;
        const canPush = await helpers_1.hasPushAccess(context, context.repo({ username }));
        const data = Object.assign({ has_push_access: canPush }, context.payload);
        if (!config.filters.every((filter, i) => {
            try {
                if (jsonpath_1.default.query([data], `$[?(${filter})]`).length > 0) {
                    app.log.info(`Filter "${filter}" matched the PR ✅ [${i + 1} of ${config.filters.length}]`);
                    return true;
                }
            }
            catch (e) {
                app.log.debug(`Malformed JSONPath query: "${filter}"`);
            }
            return false;
        }))
            return;
        app.log.debug(`Close PR ${htmlUrl}`);
        await helpers_1.comment(context, context.issue({ body: config.commentBody }));
        if (config.addLabel) {
            await helpers_1.addLabel(context, config.labelName, config.labelColor);
        }
        return helpers_1.closeIssue(context, context.issue());
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