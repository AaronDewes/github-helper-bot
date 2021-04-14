import { Context } from 'probot';
/**
 * Creates a new reminder
 *
 * @param context The Probot context
 * @param args The arguments to the /remind command
 */
export declare function remind(context: Context, args: string): Promise<void>;
export default class Command {
    static helptext(): string;
    static run(context: Context, args: string, _isPR: boolean): void;
}
