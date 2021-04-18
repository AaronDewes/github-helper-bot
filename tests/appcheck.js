"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appcheck_1 = require("../lib/commands/appcheck");
const marked_1 = __importDefault(require("marked"));
const marked_terminal_1 = __importDefault(require("marked-terminal"));
marked_1.default.setOptions({
    renderer: new marked_terminal_1.default(),
});
async function getInfo() {
    const data = await (0, appcheck_1.getAppUpgrades)();
    console.log((0, marked_1.default)(data));
    console.log("Please check BTCPayServer yourself, it isn't supported");
}
getInfo();
