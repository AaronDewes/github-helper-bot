"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = __importDefault(require("./command"));
const consts_1 = require("../consts");
class CmdVersion extends command_1.default {
    static run(context, _args, _isPR) {
        context.octokit.issues.createComment({
            ...context.issue(),
            body: `This Bot is running UmbrelBot v${consts_1.version} and supports version ${consts_1.configVersion} of the configuration file.`
        });
    }
}
exports.default = CmdVersion;
CmdVersion.helptext = "Outputs the current version of this bot.";
