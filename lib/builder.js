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
const consts_1 = require("./consts");
async function build(context, callbackfn) {
    const id = (0, helpers_1.randomHash)(10);
    const prInfo = await context.octokit.pulls.get(context.pullRequest());
    const exists = await (0, helpers_1.repoExists)(context, consts_1.buildOrg, prInfo.data.base.repo.name);
    if (!exists) {
        console.warn(`Tried to run a build in '${prInfo.data.base.repo.name}', but it doesn't exist in '${consts_1.buildOrg}!'`);
    }
    const pushURL = (await context.octokit.repos.get({ ...context.repo(), owner: consts_1.buildOrg })).data.clone_url;
    const buildBranch = `pr-${context.pullRequest().pull_number}-${prInfo.data.head.ref}-${prInfo.data.head.sha.substring(0, 7)}`;
    const folderPath = path_1.default.resolve('./private', id);
    fs_1.default.mkdirSync(folderPath, {
        recursive: true,
    });
    isomorphic_git_1.default.clone({ fs: fs_1.default, http: node_1.default, dir: folderPath, url: prInfo.data.head.repo.clone_url });
    isomorphic_git_1.default.checkout({ fs: fs_1.default, dir: folderPath, ref: prInfo.data.head.sha });
    isomorphic_git_1.default.pull({ fs: fs_1.default, http: node_1.default, dir: folderPath, url: prInfo.data.base.repo.clone_url });
    isomorphic_git_1.default.branch({ fs: fs_1.default, dir: folderPath, ref: buildBranch });
    isomorphic_git_1.default.checkout({ fs: fs_1.default, dir: folderPath, ref: buildBranch });
    isomorphic_git_1.default.push({
        fs: fs_1.default,
        http: node_1.default,
        dir: folderPath,
        url: pushURL,
        onAuth: () => ({ username: process.env.PUSH_TOKEN }),
        ref: buildBranch,
    });
    typeof callbackfn === 'function' && callbackfn(buildBranch);
}
exports.default = build;
async function buildOctokit(octokit, pr, owner, repo, callbackfn) {
    const id = (0, helpers_1.randomHash)(10);
    const prInfo = await octokit.pulls.get({ pull_number: pr, owner, repo });
    const exists = await (0, helpers_1.repoExistsOctokit)(octokit, consts_1.buildOrg, prInfo.data.base.repo.name);
    if (!exists) {
        console.warn(`Tried to run a build in '${prInfo.data.base.repo.name}', but it doesn't exist in '${consts_1.buildOrg}!'`);
        return;
    }
    const pushURL = (await octokit.repos.get({ repo, owner: consts_1.buildOrg })).data.clone_url;
    const buildBranch = `pr-${pr}-${prInfo.data.head.ref}-${prInfo.data.head.sha.substring(0, 7)}`;
    const folderPath = path_1.default.resolve('./private', id);
    fs_1.default.mkdirSync(folderPath, {
        recursive: true,
    });
    isomorphic_git_1.default.clone({ fs: fs_1.default, http: node_1.default, dir: folderPath, url: prInfo.data.head.repo.clone_url });
    isomorphic_git_1.default.checkout({ fs: fs_1.default, dir: folderPath, ref: prInfo.data.head.sha });
    isomorphic_git_1.default.pull({ fs: fs_1.default, http: node_1.default, dir: folderPath, url: prInfo.data.base.repo.clone_url });
    isomorphic_git_1.default.branch({ fs: fs_1.default, dir: folderPath, ref: buildBranch });
    isomorphic_git_1.default.checkout({ fs: fs_1.default, dir: folderPath, ref: buildBranch });
    isomorphic_git_1.default.push({
        fs: fs_1.default,
        http: node_1.default,
        dir: folderPath,
        url: pushURL,
        onAuth: () => ({ username: process.env.PUSH_TOKEN }),
        ref: buildBranch,
    });
    typeof callbackfn === 'function' && callbackfn(buildBranch);
}
exports.buildOctokit = buildOctokit;
