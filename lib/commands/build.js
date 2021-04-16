"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const baseCommand_1 = require("./baseCommand");
class Command extends baseCommand_1.BaseCommand {
    static override helptext = "This command builds the current PR branch. Builds normally happen automatically, but you can use this command if you don't want to wait.";
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
exports.default = Command;
//# sourceMappingURL=build.js.map