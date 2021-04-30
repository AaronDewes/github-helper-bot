"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configVersion = exports.version = exports.pushToken = exports.buildOrg = exports.allowedRepoOwners = void 0;
const dotenv_1 = require("dotenv");
dotenv_1.config();
exports.allowedRepoOwners = (process.env.ALLOWED_REPO_OWNERS && JSON.parse(process.env.ALLOWED_REPO_OWNERS)) || [
    'getumbrel',
    'UmbrelBuilds',
    'AaronDewes',
    'louneskmt',
    'lukechilds',
    'mayankchhabra',
];
exports.buildOrg = process.env.BUILD_ORG || 'UmbrelBuilds';
exports.pushToken = process.env.GH_PUSH_TOKEN;
exports.version = '0.2.1';
exports.configVersion = 1;
