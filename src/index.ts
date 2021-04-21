import { Probot, Context, ProbotOctokit } from 'probot';
import { Repo } from './pullrequest';

import { comparePRList, getPRs } from './helpers';
import unfurl from './unfurl/unfurl';
import { defaultConfig, UmbrelBotConfig, getConfig } from './config';
import handleCommand from './commands';
import { allowedRepoOwners, buildOrg } from './consts';
import validatePr from './prValidator';

// Not authenticated yet
let BotOctokit = new ProbotOctokit();

const managedRepos: Record<string, Repo> = {};
let openPRs: PRInfo[] = [];
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

async function handleChangedPR(repo: string, number: number) {
    if (!managedRepos[`getumbrel-${repo}`]) {
        managedRepos[`getumbrel-${repo}`] = new Repo('getumbrel', repo);
    }
    managedRepos[`getumbrel-${repo}`].scheduleBuild(
        false,
        BotOctokit,
        number,
        'getumbrel',
        repo,
        async (buildBranch) => {
            const comment = await BotOctokit.issues.createComment({
                owner: 'getumbrel',
                repo: repo,
                issue_number: number,
                body: `Built image to ${buildOrg}/${repo}:${buildBranch}.`,
            });
            managedRepos[`getumbrel-${repo}`].deleteOldComments(BotOctokit, number, 'getumbrel', repo);
            managedRepos[`getumbrel-${repo}`].addComment(number, comment.data.id);
        },
    );
}

async function handleOpenPRs() {
    const lastOpenPRs = openPRs;
    openPRs = await getPRs(BotOctokit);
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
    repo.managePR(context.pullRequest().pull_number);
    repo.scheduleBuild(
        true,
        context.octokit,
        context.issue().issue_number,
        context.repo().owner,
        context.repo().repo,
        async (buildBranch) => {
            const comment = await BotOctokit.issues.createComment({
                owner: context.repo().owner,
                repo: context.repo().repo,
                issue_number: context.pullRequest().pull_number,
                body: `Built image to ${buildOrg}/${context.repo().repo}:${buildBranch}.`,
            });
            repo.deleteOldComments(
                context.octokit,
                context.pullRequest().pull_number,
                context.repo().owner,
                context.repo().repo,
            );
            repo.addComment(context.pullRequest().pull_number, comment.data.id);
        },
    );
}

module.exports = (app: Probot) => {
    BotOctokit = new ProbotOctokit();
    /* Parse comments */
    app.on(['issue_comment.created', 'issue_comment.edited'], async (context) => {
        if (!allowedRepoOwners.includes(context.issue().owner)) {
            context.octokit.issues.createComment({
                ...context.issue(),
                body: getPermissionDeniedError(context.issue().owner),
            });
        }
        const config = await getConfig(context.octokit, context.repo().owner, context.repo().repo);
        if (lastConfig.prFetchMinutes !== config.prFetchMinutes) {
            clearInterval(lastInterval);
            lastInterval = setInterval(handleOpenPRs, <number>lastConfig.prFetchMinutes * 60 * 1000);
        }
        lastConfig = config;
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

    app.on('pull_request.opened', validatePr);

    app.on(['pull_request.closed', 'pull_request.merged'], async (context) => {
        if (managedRepos[`getumbrel-${context.pullRequest().repo}`]) {
            managedRepos[`getumbrel-${context.pullRequest().repo}`].stopManagingPR(context.pullRequest().pull_number);
        }
    });

    /* Check for new/changed PRs every 5min */
    lastInterval = setInterval(handleOpenPRs, (lastConfig.prFetchMinutes || defaultConfig.prFetchMinutes) * 60 * 1000);
};
