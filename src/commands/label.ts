import { Context } from 'probot';
import { addLabel, labelExists } from '../helpers';
import Command from './command';

export default class CmdLabel extends Command {
    static helptext = 'This adds a label to the current PR/issue.';

    static async run(context: Context<'issue_comment.created'>, args: string): Promise<void> {
        try {
            if (await labelExists(context.octokit, context.repo().owner, context.repo().repo, args)) {
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
