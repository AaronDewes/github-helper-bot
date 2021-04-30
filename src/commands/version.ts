import { Context } from 'probot';
import Command from './command';
import { configVersion, version } from '../consts';

export default class CmdVersion extends Command {
    // TODO: Remove this when Prettier supports override
    // eslint-disable-next-line
    static helptext = "Outputs the current version of this bot.";

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static run(context: Context, _args: string, _isPR: boolean): void {
        context.octokit.rest.issues.createComment({
            ...context.issue(),
            body: `This Bot is running UmbrelBot v${version} and supports version ${configVersion} of the configuration file.`,
        });
    }
}
