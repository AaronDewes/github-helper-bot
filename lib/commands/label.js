"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../helpers");
const command_1 = __importDefault(require("./command"));
class CmdLabel extends command_1.default {
    static run(context, args, _isPR) {
        if (helpers_1.labelExists(context.octokit, context.repo().owner, context.repo().repo, args)) {
            helpers_1.addLabel(context.octokit, context.repo().owner, context.repo().repo, context.issue().issue_number, args, '');
        }
        else {
            context.octokit.issues.createComment({ ...context.issue(), body: `This label could not be found.` });
        }
    }
}
exports.default = CmdLabel;
CmdLabel.helptext = "This adds a label to the current PR/issue.";
