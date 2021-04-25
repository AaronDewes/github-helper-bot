import { Probot, Context, ProbotOctokit } from 'probot';

import unfurl from './unfurl/unfurl';
import { getConfig, UmbrelBotConfig } from './config';
import handleCommand from './commands';
import { allowedRepoOwners } from './consts';
import validatePr from './prValidator';
import runBuild from './builder';

// Not authenticated yet
let BotOctokit = new ProbotOctokit();

function getPermissionDeniedError(username: string) {
    return `
:wave: Hello!
You tried to use me in your own repositories or organization (@${username}).
I can only be used on authorized repos and not everywhere.
My source code is public, so you can host me myself if you like me.
Check [this repo](https://github.com/AaronDewes/github-helper-bot) to view it.
`;
}

async function build(context: Context): Promise<void> {
    const prInfo = await BotOctokit.pulls.get(context.pullRequest());
    runBuild(
        context.octokit,
        context.repo().owner,
        context.repo().repo,
        context.pullRequest().pull_number,
        async (buildBranch) => {
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
        const config: UmbrelBotConfig = await getConfig(context.octokit, context.repo().owner, context.repo().repo);
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

    app.on(['pull_request.opened', 'pull_request.synchronize'], async (context) => {
        BotOctokit = context.octokit;
        build(context);
    });
};
