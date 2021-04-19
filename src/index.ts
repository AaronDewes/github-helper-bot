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
import { defaultConfig, UmbrelBotConfig, UmbrelBotDefaultConfig } from './config';
import handleCommand from './commands';
import { allowedRepoOwners, buildOrg, configVersion } from './consts';

const extendedOctokit = Octokit.plugin(config);

const ProbotGraphQL = graphql.defaults({
    authStrategy: createProbotAuth,
});

const ProbotREST = new extendedOctokit({
    authStrategy: createProbotAuth,
});

let managedRepos: Record<string, Repo>;
let openPRs: PRInfo[];
let lastConfig: UmbrelBotConfig = defaultConfig;
let lastInterval: NodeJS.Timeout;

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
    const userConfig: UmbrelBotConfig =
        (
            await ProbotREST.config.get({
                ...context.repo(),
                path: '.github/UmbrelBot.yml',
            })
        ).config || {};
    if (userConfig !== {} && userConfig.version && userConfig.version !== configVersion) {
        context.octokit.issues.createComment({
            ...context.issue(),
            body: `This repo uses the configuration version '${userConfig.version}' which is not supported by this bot, please use version ${configVersion}.`,
        });
    }
    const newConfig: UmbrelBotDefaultConfig = {
        ...defaultConfig,
        ...(<UmbrelBotDefaultConfig>userConfig),
    };
    if (lastInterval && lastConfig.prFetchMinutes !== newConfig.prFetchMinutes) {
        clearInterval(lastInterval);
        lastInterval = setInterval(handleOpenPRs, newConfig.prFetchMinutes * 60 * 1000);
    }
    lastConfig = newConfig;
    return newConfig;
}

async function handleChangedPR(repo: string, number: number) {
    if (!managedRepos[`getumbrel-${repo}`]) {
        managedRepos[`getumbrel-${repo}`] = new Repo('getumbrel', repo);
    }
    managedRepos[`getumbrel-${repo}`].scheduleBuildFromOctokit(
        number,
        false,
        ProbotREST,
        'getumbrel',
        repo,
        async (buildBranch) => {
            const comment = await ProbotREST.issues.createComment({
                owner: 'getumbrel',
                repo: repo,
                issue_number: number,
                body: `Built image to ${buildOrg}/${repo}:${buildBranch}.`,
            });
            managedRepos[`getumbrel-${repo}`].deleteOldCommentsFromOctokit(number, ProbotREST);
            managedRepos[`getumbrel-${repo}`].addComment(number, comment.data.id);
        },
    );
}
async function handleOpenPRs() {
    const lastOpenPRs = openPRs;
    openPRs = await getPRs(ProbotGraphQL);
    const toDo = await comparePRList(lastOpenPRs, openPRs);
    toDo.forEach(async (pr) => {
        handleChangedPR(pr.repo, pr.number);
    });
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
        if (config.blocklist && config.blocklist.includes(context.payload.sender.login)) {
            console.warn(`User @${context.payload.sender} tried to use the bot without permission.`);
            return;
        }

        // Check if it is a command
        const { comment, issue } = context.payload;
        const command = <RegExpMatchArray>(comment || issue).body.match(/^\/([\w]+)\b *(.*)?$/m);
        if (!command || (command && !command[1]) || context.payload.sender.type == 'bot') {
            return;
        }
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
        const config = await getConfig(context);
        if (!config.invalidPRConfig?.enabled) return;
        const htmlUrl = context.payload.pull_request.html_url;
        app.log.debug(`Inspecting: ${htmlUrl}`);
        const username = context.payload.pull_request.user.login;
        const canPush = await hasPushAccess(context, context.repo({ username }));
        const data = Object.assign({ has_push_access: canPush }, context.payload);
        const filters = config.invalidPRConfig?.filters || defaultConfig.invalidPRConfig.filters;
        if (
            !filters.every((filter: string, i: number) => {
                try {
                    if (jp.query([data], `$[?(${filter})]`).length > 0) {
                        app.log.info(`Filter "${filter}" matched the PR ✅ [${i + 1} of ${filters.length}]`);
                        return true;
                    }
                } catch (e) {
                    app.log.debug(`Malformed JSONPath query: "${filter}"`);
                }
                return false;
            })
        ) {
            handleChangedPR(context.pullRequest().repo, context.pullRequest().pull_number);
            return;
        }

        app.log.debug(`Closing PR ${htmlUrl}`);
        await comment(
            context,
            context.issue({
                body: config.invalidPRConfig?.commentBody || defaultConfig.invalidPRConfig.commentBody,
            }),
        );
        if (config.invalidPRConfig?.addLabel) {
            await addLabel(
                context,
                config.invalidPRConfig.labelName || defaultConfig.invalidPRConfig.labelName,
                config.invalidPRConfig.labelColor || defaultConfig.invalidPRConfig.labelColor,
            );
        }
        return closeIssue(context, context.issue());
    });

    app.on(['pull_request.closed', 'pull_request.merged'], async (context) => {
        if (managedRepos[`getumbrel-${context.pullRequest().repo}`]) {
            managedRepos[`getumbrel-${context.pullRequest().repo}`].stopManagingPR(context.pullRequest().pull_number);
        }
    });

    /* Check for new/changed PRs every 5min */
    lastInterval = setInterval(handleOpenPRs, (lastConfig.prFetchMinutes || defaultConfig.prFetchMinutes) * 60 * 1000);
};
