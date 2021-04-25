import { Context } from 'probot';
import Command from './command';
export default class CmdRemind extends Command {
    static helptext: string;
    static run(context: Context, args: string, _isPR: boolean): void;
}
