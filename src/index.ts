import { Probot, Context, ProbotOctokit } from 'probot';

import { getConfig, CitadelBotConfig } from './config';
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

I recommend uninstalling this bot to prevent spam messages like this one.
`;
}

async function build(context: Context<'pull_request.opened' | 'pull_request.synchronize'>): Promise<void> {
    const prInfo = await BotOctokit.rest.pulls.get(context.pullRequest());
    runBuild(
        context.octokit,
        context.repo().owner,
        context.repo().repo,
        context.pullRequest().pull_number,
        async (buildBranch) => {
            BotOctokit.rest.checks.create({
                ...context.repo(),
                status: 'completed',
                conclusion: 'success',
                output: {
                    title: 'Started build of the Docker container',
                    summary: `A Docker container fot this Pull Request will soon be available on Docker Hub as umbrelbuilds/${context
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
    app.on('issue_comment.created', async (context: Context<'issue_comment.created'>) => {
        BotOctokit = context.octokit;
        if (!allowedRepoOwners.includes(context.issue().owner)) {
            context.octokit.rest.issues.createComment({
                ...context.issue(),
                body: getPermissionDeniedError(context.issue().owner),
            });
        }
        const config: CitadelBotConfig = await getConfig(context.octokit, context.repo().owner, context.repo().repo);
        if (config.blocklist && config.blocklist.includes(context.payload.sender.login)) {
            console.warn(`User @${context.payload.sender} tried to use the bot without permission.`);
            return;
        }

        // Check if it is a command
        const { comment, issue } = context.payload;
        const command = <RegExpMatchArray>(comment || issue).body.match(/^\/([\w]+)\b *(.*)?$/m);
        if (!command || (command && !command[1]) || context.payload.sender.type == 'Bot') {
            return;
        }
        const issueInfo = context.octokit.rest.issues.get(context.issue());
        let isPR = false;
        if ((await issueInfo).data.pull_request) {
            isPR = true;
        }
        handleCommand(command[1], command[2], context, isPR);

        // Delete comment with the command if only the comand is in there
        if (comment && comment.body?.trim() == `${command[1]} ${command[2]}`) {
            context.octokit.rest.issues.deleteComment({ ...context.issue(), comment_id: comment.id });
        }
    });

    app.on('pull_request.opened', validatePr);

    app.on(['pull_request.opened', 'pull_request.synchronize'], async (context) => {
        BotOctokit = context.octokit;
        build(context);
    });
};
