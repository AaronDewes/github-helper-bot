import { Probot, Context, ProbotOctokit } from 'probot';
import { Repo } from './pullrequest';

import unfurl from './unfurl/unfurl';
import { getConfig } from './config';
import handleCommand from './commands';
import { allowedRepoOwners } from './consts';
import validatePr from './prValidator';

// Not authenticated yet
let BotOctokit = new ProbotOctokit();

const managedRepos: Record<string, Repo> = {};

function getPermissionDeniedError(username: string) {
    return `
:wave: Hello!
You tried to use me in your own repositories or organization (@${username}).
I can only be used on authorized repos and not everywhere.
My source code is public, so you can host me myself if you like me.
Check [this repo](https://github.com/AaronDewes/github-helper-bot) to view it.
`;
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
    const PR = await BotOctokit.pulls.get(context.pullRequest());
    repo.scheduleBuild(
        context.octokit,
        context.issue().issue_number,
        context.repo().owner,
        context.repo().repo,
        async (_buildBranch) => {
            BotOctokit.checks.create({
                ...context.repo(),
                status: 'success',
                head_sha: PR.data.head.sha,
                name: 'umbrel-build'
            });
        },
    );
}

module.exports = (app: Probot) => {
    app.on(['issue_comment.created', 'issue_comment.edited'], async (context) => {
        BotOctokit = context.octokit;
        if (!allowedRepoOwners.includes(context.issue().owner)) {
            context.octokit.issues.createComment({
                ...context.issue(),
                body: getPermissionDeniedError(context.issue().owner),
            });
        }
        const config = await getConfig(context.octokit, context.repo().owner, context.repo().repo);
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

    app.on(['pull_request.opened', 'pull_request.synchronize'], async (context) => {
        build(context);
    });
};
