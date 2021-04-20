"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const command_1 = __importDefault(require("./command"));
class CmdBuild extends command_1.default {
    static run(context, _args, isPR) {
        if (!isPR) {
            context.octokit.issues.createComment({
                ...context.issue(),
                body: 'This command only works on pull requests.',
            });
            return;
        }
        (0, index_1.build)(context);
    }
}
exports.default = CmdBuild;
CmdBuild.helptext = "This command builds the current PR branch. Builds normally happen automatically, but you can use this command if you don't want to wait.";
