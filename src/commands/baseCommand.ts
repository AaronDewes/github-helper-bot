import { Context } from 'probot';

export class BaseCommand {
    static helptext(): string {
        return 'description';
    }

    static run(_context: Context, _args: string, _isPR: boolean): void {
        // Dummy function
    }
}
