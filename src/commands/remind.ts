import { Context } from 'probot';
import parseReminder, { parsedReminder } from 'parse-reminder';
import { BaseCommand } from './baseCommand';

/**
 * Post a reminder
 *
 * @param context The Probot context
 * @param text The text of the reminder
 * @param author Who asked to remind
 * @param target Who should be reminded
 *
 * @private
 */
async function postReminder(context: Context, text: string, author: string, target: string): Promise<void> {
    if (author == target) {
        await context.octokit.issues.createComment(
            context.issue({
                body: `@${target} You asked me to remind you of ${text}!`,
            }),
        );
        return;
    }
    await context.octokit.issues.createComment(
        context.issue({
            body: `:wave: @${target}, ${author} asked me to remind you of ${text}!`,
        }),
    );
}

/**
 * Creates a new reminder
 *
 * @param context The Probot context
 * @param args The arguments to the /remind command
 */
export async function remind(context: Context, args: string): Promise<void> {
    const reminder: parsedReminder = parseReminder(`remind ${args}`, '');

    if (reminder) {
        if (reminder.who === 'me') {
            reminder.who = context.payload.sender.login;
        }
        if (reminder.who.startsWith('@')) {
            reminder.who = reminder.who.substring(1);
        }
        await context.octokit.issues.createComment(
            context.issue({
                body: `@${context.payload.sender.login} set a reminder for **${reminder.when.toUTCString()}**`,
            }),
        );
    } else {
        await context.octokit.issues.createComment(
            context.issue({
                body: `@${context.payload.sender.login} I had trouble parsing your reminder. Try:\n\n\`/remind me [what] [when]\``,
            }),
        );
        console.warn(`Unable to parse reminder: remind ${args}`);
    }

    setTimeout(
        postReminder,
        +reminder.when - +Date.now(),
        context,
        reminder.what,
        context.payload.sender.login,
        reminder.who,
    );
}

export default class Command extends BaseCommand {
    // TODO: Remove this when Prettier supports override
    // eslint-disable-next-line
    static override helptext = 'Remind someone of something at a specific time. Example: `/remind [who] [what] [when]`. Who can either be "me" or any GitHub user (like @octocat).';
    // Don't use an actual person on GitHub to avoid spamming their notifications, I hope no one is using the octocat account.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static override run(context: Context, args: string, _isPR: boolean): void {
        remind(context, args);
    }
}
