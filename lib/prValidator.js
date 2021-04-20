"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
const config_1 = require("./config");
const jsonpath_1 = __importDefault(require("jsonpath"));
async function validatePr(context) {
    const config = await (0, config_1.getConfig)(context.octokit, context.repo().owner, context.repo().repo);
    if (!config.invalidPRConfig?.enabled)
        return;
    const username = context.payload.pull_request.user.login;
    const canPush = await (0, helpers_1.hasPushAccess)(context, context.repo({ username }));
    const data = Object.assign({ has_push_access: canPush }, context.payload);
    const filters = config.invalidPRConfig?.filters || config_1.defaultConfig.invalidPRConfig.filters;
    if (!filters.every((filter, i) => {
        try {
            if (jsonpath_1.default.query([data], `$[?(${filter})]`).length > 0) {
                console.info(`Filter "${filter}" matched the PR ✅ [${i + 1} of ${filters.length}]`);
                return true;
            }
        }
        catch (e) {
            console.warn(`Malformed JSONPath query: "${filter}"`);
        }
        return false;
    })) {
        return;
    }
    await context.octokit.issues.createComment({
        ...context.issue(),
        body: config.invalidPRConfig?.commentBody || config_1.defaultConfig.invalidPRConfig.commentBody,
    });
    if (config.invalidPRConfig?.addLabel) {
        await (0, helpers_1.addLabel)(context.octokit, context.repo().owner, context.repo().repo, context.issue().issue_number, config.invalidPRConfig.labelName || config_1.defaultConfig.invalidPRConfig.labelName, config.invalidPRConfig.labelColor || config_1.defaultConfig.invalidPRConfig.labelColor);
    }
    return (0, helpers_1.closeIssue)(context.octokit, context.repo().owner, context.repo().repo, context.issue().issue_number);
}
exports.default = validatePr;
