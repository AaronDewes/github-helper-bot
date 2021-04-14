import {Probot, Context} from 'probot';
import {Repo} from './pullrequest';
const { createProbotAuth } = require("octokit-auth-probot");
import { graphql, GraphQlQueryResponseData } from "@octokit/graphql";
import { Octokit } from "@octokit/rest";
// @ts-ignore
import { config, composeConfigGet } from '@probot/octokit-plugin-config';
import jp from 'jsonpath';

import { comparePRList, comment, closeIssue, addLabel, hasPushAccess } from './helpers';
import unfurl from './unfurl/unfurl'
import defaultConfig from './default-config';
import handleCommand from './commands';

// Check for new PRs every PR_FETCH_TIME minutes
const PR_FETCH_TIME = 5;

const ProbotGraphQL = graphql.defaults({
  authStrategy: createProbotAuth,
});

const ProbotREST = new Octokit({
  authStrategy: createProbotAuth,
});

let managedRepos: Record<string, Repo>;
let openPRs: PRInfo[];

export interface PRInfo {
  number: number;
  branchName: string;
  repo: string;
  head: string;
}


function getPermissionDeniedError(username: string) {
return `
:wave: Hello!
You tried to use me in your own repositories or organization (@${username}).
I can only be used on authorized repos and not everywhere.
My source code is public, so you can host me myself if you like me.
Check [this repo](https://github.com/AaronDewes/UmbrelBot-v2) to view it.
`
}
/**
 * Get a list of Pull requests 
 * @returns {PRInfo[]} An array of pull requests with basic information about them
 */
async function getPRs(): Promise<PRInfo[]> {
  let fetchedData: GraphQlQueryResponseData = await ProbotGraphQL(
    `
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
    `
  );
  let hasNextPage = fetchedData.data.search.pageInfo.hasNextPage;
  let endCursor = fetchedData.data.search.pageInfo.endCursor;
  while(hasNextPage == true) {
    let nowFetched: GraphQlQueryResponseData = await ProbotGraphQL(
      `
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
      fetchedData.data.search.edges = [...fetchedData.data.search.edges, ...nowFetched.data.search.edges ]
  }
  let result: PRInfo[] = [];
  fetchedData.data.search.edges.forEach((node: any) => {
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

export async function build(context: Context) {
    if(!managedRepos[`${context.repo().owner}-${context.repo().repo}`]) {
      managedRepos[`${context.repo().owner}-${context.repo().repo}`] = new Repo(context.repo().owner, context.repo().repo);
    }
    const PR = managedRepos[`${context.repo().owner}-${context.repo().repo}`];
    PR.scheduleBuild(context.issue().issue_number, true, context);
}


module.exports = (app: Probot) => {
    /* Parse comments */
    app.on(["issue_comment.created", "issue_comment.edited"], async (context) => {
        // Validate repository owner
        // Authorize the Umbrel team to use the Bot in their own repos
        // Probably never useful, but I'll allow it anyway
        const allowedRepoOwners = ["getumbrel", "UmbrelBuilds", "AaronDewes", "louneskmt", "lukechilds", "mayankchhabra"];
        if(!allowedRepoOwners.includes(context.issue().owner)) {
            context.octokit.issues.createComment({
                ...context.issue(),
                body: getPermissionDeniedError(context.issue().owner)
            });
        }

        const { config } = await ProbotREST.config.get({
          ...context.repo(),
          path: ".github/UmbrelBot.yml",
        });

        if(config.blacklist && config.blacklist.includes(context.payload.sender)) {
          console.warn(`Blacklisted user @${context.payload.sender} tried to use the bot.`)
          return;
        }

        // Check if it is a command
        const { comment, issue } = context.payload;
        const command = <RegExpMatchArray>(comment || issue).body.match(/^\/([\w]+)\b *(.*)?$/m);
        const issueInfo = context.octokit.issues.get(context.issue());
        let isPR = false;
        if((await issueInfo).data.pull_request) {
            isPR = true;
        }
        handleCommand(command[1], command[2], context, isPR);

        // Delete comment with the command if only the comand is in there
        if(comment && comment.body?.trim() == `${command[1]} ${command[2]}`) {
          context.octokit.issues.deleteComment({...context.issue(), comment_id: comment.id});
        }
    });

    app.on(['issue_comment.created'], async context => {
      const comment = await context.octokit.issues.getComment({
        ...context.repo(),
        id: context.payload.comment.id
      });
      return unfurl(context, <string>comment.data.body_html);
    });
  
    app.on(['issues.opened', 'pull_request.opened'], async context => {
      const issue = await context.octokit.issues.getComment(context.issue());
      return unfurl(context, <string>issue.data.body_html);
    });
  

    app.on('pull_request.opened', async context => {
      const htmlUrl = context.payload.pull_request.html_url;
      app.log.debug(`Inspecting: ${htmlUrl}`);
      const userConfig = await ProbotREST.config.get({
        ...context.repo(),
        path: ".github/UmbrelBot.yml",
      }) || {};
      const config = {
        ...defaultConfig,
        ...userConfig
      };
      const username = context.payload.pull_request.user.login;
      const canPush = await hasPushAccess(context, context.repo({username}));
      const data = Object.assign({has_push_access: canPush}, context.payload);

      if (!config.filters.every((filter: any, i: number) => {
        try {
          if (jp.query([data], `$[?(${filter})]`).length > 0) {
            app.log.info(`Filter "${filter}" matched the PR ✅ [${i + 1} of ${config.filters.length}]`)
            return true
          }
        } catch (e) {
          app.log.debug(`Malformed JSONPath query: "${filter}"`)
        }
        return false
      })) return

      app.log.debug(`Close PR ${htmlUrl}`);
      await comment(context, context.issue({body: config.commentBody}));
      if (config.addLabel) {
        await addLabel(context, config.labelName, config.labelColor);
      }
      return closeIssue(context, context.issue());
    })

    /* Check for new PRs every 5min */
    setInterval(async () => {
        let lastOpenPRs = openPRs;
        openPRs = await getPRs();
        let toDo = await comparePRList(lastOpenPRs, openPRs);
        toDo.forEach(async (pr) => {
            if(!managedRepos[`getumbrel-${pr.repo}`]) {
              managedRepos[`getumbrel-${pr.repo}`] = new Repo("getumbrel", pr.repo);
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

