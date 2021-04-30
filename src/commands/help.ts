import { Context } from 'probot';
import commands from './all';

function generateTable(): string {
    let table = '| command | description                     |\n';
    table += '|---------|---------------------------------|\n';
    for (const command in commands) {
        table += `| \`/${command}\` |${commands[command].helptext}|\n`;
    }
    return table;
}
export default function helpText(context: Context): void {
    context.octokit.rest.issues.createComment({ ...context.issue(), body: generateTable() });
}
