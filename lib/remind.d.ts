import { Context } from 'probot';
/**
 * Creates a new reminder
 *
 * @param context The Probot context
 * @param args The arguments to the /remind command
 */
export default function remind(context: Context, args: string): Promise<void>;
