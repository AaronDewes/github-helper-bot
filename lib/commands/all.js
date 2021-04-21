"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appcheck_1 = __importDefault(require("./appcheck"));
const label_1 = __importDefault(require("./label"));
const remind_1 = __importDefault(require("./remind"));
const version_1 = __importDefault(require("./version"));
const commands = {
    appcheck: appcheck_1.default,
    label: label_1.default,
    remind: remind_1.default,
    version: version_1.default,
};
exports.default = commands;
