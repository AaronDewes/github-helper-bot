import { Context } from 'probot';
import { BaseCommand } from './baseCommand';
export default class Command extends BaseCommand {
    name: string;
    static helptext(): string;
    static run(context: Context, args: string, _isPR: boolean): void;
}
