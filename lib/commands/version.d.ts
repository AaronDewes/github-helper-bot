import { Context } from 'probot';
import Command from './command';
export default class CmdVersion extends Command {
    static helptext: string;
    static run(context: Context, _args: string, _isPR: boolean): void;
}
