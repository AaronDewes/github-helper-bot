import { Context } from "probot";
import commands from './all';


function generateTable() {
    let table = "| command | description                     |";
    table    += "|---------|---------------------------------|";
    for(let command in commands) {
        table    += `|${command}|${commands[command].helptext()}|`;

    }
    return table;
}
export default function helpText(context: Context) {
    if(context.payload.sender.login == "AaronDewes") {
        context.octokit.issues.createComment({...context.issue(), body: `@AaronDewes You implemented this bot, you should know this.` });
    }
    if(context.payload.sender.login == "louneskmt") {
        context.octokit.issues.createComment({...context.issue(), body: `@louneskmt I won't help baguettes!` });
        // Let him wait a bit
        setTimeout(() => {context.octokit.issues.createComment({...context.issue(), body: generateTable() }) }, 15 * 1000);
    }
    context.octokit.issues.createComment({...context.issue(), body: generateTable() });
}
