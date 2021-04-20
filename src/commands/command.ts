import { Context } from 'probot';

export default abstract class Command {
    static helptext: string;

    static run: (_context: Context, _args: string, _isPR: boolean) => void;
}
