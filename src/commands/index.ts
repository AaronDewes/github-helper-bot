import { Context } from 'probot';
import commands from './all';
import help from './help';

export default async function handleCommand(cmd: string, args: string, context: Context, isPR: boolean): Promise<void> {
    if (cmd == 'help') {
        help(context);
    }
    if (commands[cmd]) {
        commands[cmd].run(context, args, isPR);
    }
}
