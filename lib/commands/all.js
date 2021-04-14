"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const build_1 = __importDefault(require("./build"));
const label_1 = __importDefault(require("./label"));
const remind_1 = __importDefault(require("./remind"));
const commands = {
    build: build_1.default,
    label: label_1.default,
    remind: remind_1.default
};
exports.default = commands;
//# sourceMappingURL=all.js.map