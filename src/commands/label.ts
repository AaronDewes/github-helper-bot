import { Context } from 'probot';
import { addLabel, labelExists } from '../helpers';
import { BaseCommand } from './baseCommand';

export default class Command extends BaseCommand {
    // TODO: Remove this when Prettier supports override
    // eslint-disable-next-line
    static override helptext = "This adds a label to the current PR/issue.";

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static override run(context: Context, args: string, _isPR: boolean): void {
        if (labelExists(context, args)) {
            addLabel(context, 'args', '');
        } else {
            context.octokit.issues.createComment({ ...context.issue(), body: `This label could not be found.` });
        }
    }
}
