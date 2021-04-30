import { Context } from 'probot';
import { addLabel, labelExists } from '../helpers';
import Command from './command';

export default class CmdLabel extends Command {
    static helptext = 'This adds a label to the current PR/issue.';

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static run(context: Context, args: string, _isPR: boolean): void {
        try {
            if (labelExists(context.octokit, context.repo().owner, context.repo().repo, args)) {
                addLabel(
                    context.octokit,
                    context.repo().owner,
                    context.repo().repo,
                    context.issue().issue_number,
                    args,
                    '',
                );
            } else {
                context.octokit.rest.issues.createComment({
                    ...context.issue(),
                    body: 'This label could not be found.',
                });
            }
        } catch {
            context.octokit.rest.issues.createComment({ ...context.issue(), body: 'This label could not be found.' });
        }
    }
}
