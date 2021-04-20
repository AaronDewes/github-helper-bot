import { Context } from 'probot';
export declare abstract class BaseCommand {
    static helptext: string;
    static run: (_context: Context, _args: string, _isPR: boolean) => void;
}
