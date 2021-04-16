import { Context } from 'probot';

export class BaseCommand {
    static helptext = "description";

    static run(_context: Context, _args: string, _isPR: boolean): void {
        throw new Error("A command didn't implement the run fuction!");
    }
}
