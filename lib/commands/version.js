"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const baseCommand_1 = require("./baseCommand");
const consts_1 = require("../consts");
class Command extends baseCommand_1.BaseCommand {
    static override helptext = "Outputs the current version of this bot.";
    static run(context, _args, _isPR) {
        context.octokit.issues.createComment({
            ...context.issue(),
            body: `This Bot is running UmbrelBot v${consts_1.version} and supports version ${consts_1.configVersion} of the configuration file.`
        });
    }
}
exports.default = Command;
