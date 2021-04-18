import { Context } from 'probot';
import { BaseCommand } from './baseCommand';
export default class Command extends BaseCommand {
    static helptext: string;
    static run(context: Context, _args: string, _isPR: boolean): void;
}
