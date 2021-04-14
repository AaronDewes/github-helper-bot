import { Context } from 'probot';
import { build } from '../index';
import { BaseCommand } from './baseCommand';
export default class Command extends BaseCommand {
    static helptext(): string {
        return "This command builds the current PR branch. Builds normally happen automatically, but you can use this if you don't want to wait";
    }
    static run(context: Context, _args: string, isPR: boolean): void {
        if (!isPR) {
            context.octokit.issues.createComment({
                ...context.issue(),
                body: 'This command only works on pull requests.',
            });
            return;
        }
        build(context);
    }
}
