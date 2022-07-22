import { Context } from 'probot';
import Command from './command';
import { configVersion, version } from '../consts';

export default class CmdVersion extends Command {
    static helptext = 'Outputs the current version of this bot.';

    static run(context: Context<'issue_comment.created'>): void {
        context.octokit.rest.issues.createComment({
            ...context.issue(),
            body: `This bot is running CitadelBot v${version} and supports version ${configVersion} of the configuration file.`,
        });
    }
}
