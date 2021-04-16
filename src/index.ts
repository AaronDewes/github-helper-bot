import { Probot, Context } from 'probot';
import { Repo } from './pullrequest';
import { createProbotAuth } from 'octokit-auth-probot';
import { graphql } from '@octokit/graphql';
import { Octokit } from '@octokit/rest';
// @ts-ignore
import { config, composeConfigGet } from '@probot/octokit-plugin-config'; // eslint-disable-line @typescript-eslint/no-unused-vars
import jp from 'jsonpath';

import { comparePRList, comment, closeIssue, addLabel, hasPushAccess, getPRs } from './helpers';
import unfurl from './unfurl/unfurl';
import { defaultConfig, UmbrelBotConfig } from './config';
import handleCommand from './commands';
import { allowedRepoOwners, buildOrg } from './consts';

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
Check [this repo](https://github.com/AaronDewes/github-helper-bot) to view it.
`;
}

async function getConfig(context: Context): Promise<UmbrelBotConfig> {
    const userConfig =
        (await ProbotREST.config.get({
            ...context.repo(),
            path: '.github/UmbrelBot.yml',
        })) || {};
    return {
        ...defaultConfig,
        ...userConfig,
    };
}

export async function build(context: Context): Promise<void> {
    if (!managedRepos[`${context.repo().owner}-${context.repo().repo}`]) {
        managedRepos[`${context.repo().owner}-${context.repo().repo}`] = new Repo(
            context.repo().owner,
            context.repo().repo,
        );
    }
    const repo = managedRepos[`${context.repo().owner}-${context.repo().repo}`];
    const PR = managedRepos[`${context.repo().owner}-${context.repo().repo}`];
    PR.scheduleBuild(context.issue().issue_number, true, context, async (buildBranch) => {
        const comment = await ProbotREST.issues.createComment({
            owner: context.repo().owner,
            repo: context.repo().repo,
            issue_number: context.pullRequest().pull_number,
            body: `Built image to ${buildOrg}/${context.repo().repo}:${buildBranch}.`,
        });
        repo.deleteOldComments(context.pullRequest().pull_number, context);
        repo.addComment(context.pullRequest().pull_number, comment.data.id);
    });
}

module.exports = (app: Probot) => {
    /* Parse comments */
    app.on(['issue_comment.created', 'issue_comment.edited'], async (context) => {
        if (!allowedRepoOwners.includes(context.issue().owner)) {
            context.octokit.issues.createComment({
                ...context.issue(),
                body: getPermissionDeniedError(context.issue().owner),
            });
        }
        const config = await getConfig(context);
        if (config.blocklist.includes(context.payload.sender.login)) {
            console.warn(`User @${context.payload.sender} tried to use the bot without permission.`);
            return;
        }

        // Check if it is a command
        const { comment, issue } = context.payload;
        const command = <RegExpMatchArray>(comment || issue).body.match(/^\/([\w]+)\b *(.*)?$/m);
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
            id: context.payload.comment.id,
        });
        return unfurl(context, <string>comment.data.body_html);
    });

    app.on(['issues.opened', 'pull_request.opened'], async (context) => {
        const issue = await context.octokit.issues.getComment(context.issue());
        return unfurl(context, <string>issue.data.body_html);
    });

    app.on('pull_request.opened', async (context) => {
        const htmlUrl = context.payload.pull_request.html_url;
        app.log.debug(`Inspecting: ${htmlUrl}`);
        const username = context.payload.pull_request.user.login;
        const canPush = await hasPushAccess(context, context.repo({ username }));
        const data = Object.assign({ has_push_access: canPush }, context.payload);
        const config = await getConfig(context);

        if (
            !config.filters.every((filter: string, i: number) => {
                try {
                    if (jp.query([data], `$[?(${filter})]`).length > 0) {
                        app.log.info(`Filter "${filter}" matched the PR ✅ [${i + 1} of ${config.filters.length}]`);
                        return true;
                    }
                } catch (e) {
                    app.log.debug(`Malformed JSONPath query: "${filter}"`);
                }
                return false;
            })
        )
            return;

        app.log.debug(`Closing PR ${htmlUrl}`);
        await comment(context, context.issue({ body: config.commentBody }));
        if (config.addLabel) {
            await addLabel(context, config.labelName, config.labelColor);
        }
        return closeIssue(context, context.issue());
    });

    app.on(['pull_request.closed', 'pull_request.merged'], async (context) => {
        if (managedRepos[`getumbrel-${context.pullRequest().repo}`]) {
            managedRepos[`getumbrel-${context.pullRequest().repo}`].stopManagingPR(context.pullRequest().pull_number);
        }
    });

    /* Check for new/changed PRs every 5min */
    setInterval(async () => {
        const lastOpenPRs = openPRs;
        openPRs = await getPRs(ProbotGraphQL);
        const toDo = await comparePRList(lastOpenPRs, openPRs);
        toDo.forEach(async (pr) => {
            if (!managedRepos[`getumbrel-${pr.repo}`]) {
                managedRepos[`getumbrel-${pr.repo}`] = new Repo('getumbrel', pr.repo);
            }
            managedRepos[`getumbrel-${pr.repo}`].scheduleBuildFromOctokit(
                pr.number,
                false,
                ProbotREST,
                'getumbrel',
                pr.repo,
                async (buildBranch) => {
                    const comment = await ProbotREST.issues.createComment({
                        owner: 'getumbrel',
                        repo: pr.repo,
                        issue_number: pr.number,
                        body: `Built image to ${buildOrg}/${pr.repo}:${buildBranch}.`,
                    });
                    managedRepos[`getumbrel-${pr.repo}`].deleteOldCommentsFromOctokit(pr.number, ProbotREST);
                    managedRepos[`getumbrel-${pr.repo}`].addComment(pr.number, comment.data.id);
                },
            );
        });
    }, PR_FETCH_TIME * 60 * 1000);
};
