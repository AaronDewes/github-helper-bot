import { Context } from 'probot';
import commands from './all';
import help from './help';

export default async function handleCommand(
    cmd: string,
    args: string,
    context: Context<'issue_comment.created'>,
    isPR: boolean,
): Promise<void> {
    if (cmd == 'help') {
        help(context);
    } else if (commands[cmd]) {
        commands[cmd].run(context, args, isPR);
    }
}
