import { Context } from 'probot';
import { addLabel, labelExists } from '../helpers';
import Command from './command';

export default class CmdLabel extends Command {
    // TODO: Remove this when Prettier supports override
    // eslint-disable-next-line
    static override helptext = "This adds a label to the current PR/issue.";

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static override run(context: Context, args: string, _isPR: boolean): void {
        if (labelExists(context.octokit, context.repo().owner, context.repo().repo, args)) {
            addLabel(context.octokit, context.repo().owner, context.repo().repo, context.issue().issue_number, args, '');
        } else {
            context.octokit.issues.createComment({ ...context.issue(), body: `This label could not be found.` });
        }
    }
}
