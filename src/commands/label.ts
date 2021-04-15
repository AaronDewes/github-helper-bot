import { Context } from 'probot';
import { addLabel, labelExists } from '../helpers';
import { BaseCommand } from './baseCommand';

export default class Command extends BaseCommand {
    name = 'label';
    static helptext(): string {
        return 'This adds a label to the current PR/issue.';
    }
    static run(context: Context, args: string, _isPR: boolean): void {
        if (labelExists(context, args)) {
            addLabel(context, 'args', '');
        } else {
            context.octokit.issues.createComment({ ...context.issue(), body: `This label could not be found.` });
        }
    }
}