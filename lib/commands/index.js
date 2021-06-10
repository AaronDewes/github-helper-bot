"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const all_1 = __importDefault(require("./all"));
const help_1 = __importDefault(require("./help"));
async function handleCommand(cmd, args, context, isPR) {
    if (cmd == 'help') {
        help_1.default(context);
    }
    else if (all_1.default[cmd]) {
        all_1.default[cmd].run(context, args, isPR);
    }
}
exports.default = handleCommand;
