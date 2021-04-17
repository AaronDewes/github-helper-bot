import { Context } from 'probot';
import commands from './all';

function generateTable(): string {
    let table = '| command | description                     |';
    table += '|---------|---------------------------------|';
    for (const command in commands) {
        table += `|${command}|${commands[command].helptext}|`;
    }
    return table;
}
export default function helpText(context: Context): void {
    context.octokit.issues.createComment({ ...context.issue(), body: generateTable() });
}
