import { Context } from 'probot';
import Command from './command';
export declare function remind(context: Context, args: string): Promise<void>;
export default class CmdRemind extends Command {
    static helptext: string;
    static run(context: Context, args: string, _isPR: boolean): void;
}
