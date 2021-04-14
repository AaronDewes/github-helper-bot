"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remind = void 0;
const parse_reminder_1 = __importDefault(require("parse-reminder"));
const baseCommand_1 = require("./baseCommand");
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
async function postReminder(context, text, author, target) {
    if (author == target) {
        await context.octokit.issues.createComment(context.issue({
            body: `@${target} You asked me to remind you of ${text}!`,
        }));
        return;
    }
    await context.octokit.issues.createComment(context.issue({
        body: `:wave: @${target}, ${author} asked me to remind you of ${text}!`,
    }));
}
/**
 * Creates a new reminder
 *
 * @param context The Probot context
 * @param args The arguments to the /remind command
 */
async function remind(context, args) {
    const reminder = parse_reminder_1.default(`remind ${args}`, '');
    if (reminder) {
        if (reminder.who === 'me') {
            reminder.who = context.payload.sender.login;
        }
        if (reminder.who.startsWith('@')) {
            reminder.who = reminder.who.substring(1);
        }
        await context.octokit.issues.createComment(context.issue({
            body: `@${context.payload.sender.login} set a reminder for **${reminder.when.toUTCString()}**`,
        }));
    }
    else {
        await context.octokit.issues.createComment(context.issue({
            body: `@${context.payload.sender.login} I had trouble parsing your reminder. Try:\n\n\`/remind me [what] [when]\``,
        }));
        console.warn(`Unable to parse reminder: remind ${args}`);
    }
    setTimeout(postReminder, +reminder.when - +Date.now(), context, reminder.what, context.payload.sender.login, reminder.who);
}
exports.remind = remind;
class Command extends baseCommand_1.BaseCommand {
    static helptext() {
        return 'Remind someone of something at a specific time. Example: `/remind [who] [what] [when]`. Who can either be "me" or any GitHub user (like @octocat).';
    }
    static run(context, args, _isPR) {
        remind(context, args);
    }
}
exports.default = Command;
//# sourceMappingURL=remind.js.map