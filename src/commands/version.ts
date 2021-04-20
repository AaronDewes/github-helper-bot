import { Context } from 'probot';
import Command from './command';
import { configVersion, version } from '../consts';

export default class CmdVersion extends Command {
    // TODO: Remove this when Prettier supports override
    // eslint-disable-next-line
    static override helptext = "Outputs the current version of this bot.";

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static override run(context: Context, _args: string, _isPR: boolean): void {
        context.octokit.issues.createComment({
            ...context.issue(),
            body: `This Bot is running UmbrelBot v${version} and supports version ${configVersion} of the configuration file.`
        });
    }
}
