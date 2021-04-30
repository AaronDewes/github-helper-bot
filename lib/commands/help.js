"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const all_1 = __importDefault(require("./all"));
function generateTable() {
    let table = '| command | description                     |\n';
    table += '|---------|---------------------------------|\n';
    for (const command in all_1.default) {
        table += `| \`/${command}\` |${all_1.default[command].helptext}|\n`;
    }
    return table;
}
function helpText(context) {
    context.octokit.rest.issues.createComment({ ...context.issue(), body: generateTable() });
}
exports.default = helpText;
