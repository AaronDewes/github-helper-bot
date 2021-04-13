"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildOctokit = void 0;
const path_1 = __importDefault(require("path"));
const isomorphic_git_1 = __importDefault(require("isomorphic-git"));
const node_1 = __importDefault(require("isomorphic-git/http/node"));
const fs_1 = __importDefault(require("fs"));
const helpers_1 = require("./helpers");
/**
 * Clones a PR, merges it with the current master, and pushes it to GitHub
 *
 * @param context The Probot context
 * @returns {Promise<boolean>} Success status
 */
async function build(context, callbackfn) {
    const id = helpers_1.randomHash(10);
    const prInfo = await context.octokit.pulls.get(context.pullRequest());
    if (!helpers_1.repoExists(context, "UmbrelBuilds", prInfo.data.base.repo.name)) {
        return false;
    }
    const pushURL = (await context.octokit.repos.get({ ...context.repo(), owner: "UmbrelBuilds" })).data.clone_url;
    const buildBranch = `pr-${context.pullRequest().pull_number}-${prInfo.data.head.ref}-${prInfo.data.head.sha.substring(0, 7)}`;
    const folderPath = path_1.default.resolve("./private", id);
    await fs_1.default.mkdir(folderPath, {
        recursive: true
    }, () => { });
    isomorphic_git_1.default.clone({ fs: fs_1.default, http: node_1.default, dir: folderPath, url: prInfo.data.head.repo.clone_url });
    isomorphic_git_1.default.checkout({ fs: fs_1.default, dir: folderPath, ref: prInfo.data.head.sha });
    isomorphic_git_1.default.pull({ fs: fs_1.default, http: node_1.default, dir: folderPath, url: prInfo.data.base.repo.clone_url });
    isomorphic_git_1.default.branch({ fs: fs_1.default, dir: folderPath, ref: buildBranch });
    isomorphic_git_1.default.checkout({ fs: fs_1.default, dir: folderPath, ref: buildBranch });
    isomorphic_git_1.default.push({
        fs: fs_1.default, http: node_1.default, dir: folderPath, url: pushURL,
        onAuth: () => ({ username: process.env.PUSH_TOKEN }),
        ref: buildBranch
    });
    callbackfn(buildBranch);
    return true;
}
exports.default = build;
async function buildOctokit(octokit, pr, owner, repo, callbackfn) {
    const id = helpers_1.randomHash(10);
    const prInfo = await octokit.pulls.get({ pull_number: pr, owner, repo });
    if (!helpers_1.repoExistsOctokit(octokit, "UmbrelBuilds", prInfo.data.base.repo.name)) {
        return false;
    }
    const pushURL = (await octokit.repos.get({ repo, owner: "UmbrelBuilds" })).data.clone_url;
    const buildBranch = `pr-${pr}-${prInfo.data.head.ref}-${prInfo.data.head.sha.substring(0, 7)}`;
    const folderPath = path_1.default.resolve("./private", id);
    await fs_1.default.mkdir(folderPath, {
        recursive: true
    }, () => { });
    isomorphic_git_1.default.clone({ fs: fs_1.default, http: node_1.default, dir: folderPath, url: prInfo.data.head.repo.clone_url });
    isomorphic_git_1.default.checkout({ fs: fs_1.default, dir: folderPath, ref: prInfo.data.head.sha });
    isomorphic_git_1.default.pull({ fs: fs_1.default, http: node_1.default, dir: folderPath, url: prInfo.data.base.repo.clone_url });
    isomorphic_git_1.default.branch({ fs: fs_1.default, dir: folderPath, ref: buildBranch });
    isomorphic_git_1.default.checkout({ fs: fs_1.default, dir: folderPath, ref: buildBranch });
    isomorphic_git_1.default.push({
        fs: fs_1.default, http: node_1.default, dir: folderPath, url: pushURL,
        onAuth: () => ({ username: process.env.PUSH_TOKEN }),
        ref: buildBranch
    });
    callbackfn(buildBranch);
    return true;
}
exports.buildOctokit = buildOctokit;
//# sourceMappingURL=builder.js.map