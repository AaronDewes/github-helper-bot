import { Context } from 'probot';
import Command from './command';
export default class CmdBuild extends Command {
    static helptext: string;
    static run(context: Context, _args: string, isPR: boolean): void;
}
