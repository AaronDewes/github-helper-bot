"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const all_1 = __importDefault(require("./all"));
function generateTable() {
    let table = '| command | description                     |';
    table += '|---------|---------------------------------|';
    for (const command in all_1.default) {
        table += `|${command}|${all_1.default[command].helptext}|`;
    }
    return table;
}
function helpText(context) {
    if (context.payload.sender.login == 'AaronDewes') {
        context.octokit.issues.createComment({
            ...context.issue(),
            body: `@AaronDewes You implemented this bot, you should know this.`,
        });
    }
    if (context.payload.sender.login == 'louneskmt') {
        context.octokit.issues.createComment({ ...context.issue(), body: `@louneskmt I won't help baguettes!` });
        setTimeout(() => {
            context.octokit.issues.createComment({ ...context.issue(), body: generateTable() });
        }, 15 * 1000);
    }
    context.octokit.issues.createComment({ ...context.issue(), body: generateTable() });
}
exports.default = helpText;
