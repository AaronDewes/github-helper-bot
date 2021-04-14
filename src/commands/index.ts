import { Context } from 'probot';
import commands from './all';
import help from './help';

export default async function handleCommand(cmd: string, args: string, context: Context, isPR: boolean) {
    if(cmd == "help") {
        help(context);
    }
    if(commands[cmd]) {
        commands[cmd].run(context, args, isPR);
    } else {
        context.octokit.issues.createComment({
            ...context.issue(),
            body: 'The command you entered could not be found. You can list all commands using `/help`.'
        });
    }
}
