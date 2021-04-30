"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const isomorphic_git_1 = __importDefault(require("isomorphic-git"));
const node_1 = __importDefault(require("isomorphic-git/http/node"));
const fs_1 = __importDefault(require("fs"));
const helpers_1 = require("./helpers");
const consts_1 = require("./consts");
const crypto_1 = require("crypto");
async function build(octokit, owner, repo, pr, callbackfn) {
    const prInfo = await octokit.rest.pulls.get({ pull_number: pr, owner, repo });
    const exists = await helpers_1.repoExists(octokit, consts_1.buildOrg, prInfo.data.base.repo.name);
    if (!exists) {
        console.warn(`Tried to run a build in '${prInfo.data.base.repo.name}', but it doesn't exist in '${consts_1.buildOrg}!'`);
        return;
    }
    const pushURL = (await octokit.rest.repos.get({ repo: repo, owner: consts_1.buildOrg })).data.clone_url;
    const jobId = crypto_1.randomBytes(256).toString('hex');
    const buildBranch = `pr-${prInfo.data.number}-${prInfo.data.head.ref}-${prInfo.data.head.sha.substring(0, 7)}`;
    const folderPath = path_1.default.resolve('./private', jobId);
    fs_1.default.mkdirSync(folderPath, {
        recursive: true,
    });
    await isomorphic_git_1.default.clone({ fs: fs_1.default, http: node_1.default, dir: folderPath, url: prInfo.data.base.repo.clone_url });
    await isomorphic_git_1.default.setConfig({ fs: fs_1.default, dir: folderPath, path: 'user.name', value: 'UmbrelBot' });
    await isomorphic_git_1.default.setConfig({ fs: fs_1.default, dir: folderPath, path: 'user.email', value: 'bot@umbrel.tech' });
    await isomorphic_git_1.default.branch({ fs: fs_1.default, dir: folderPath, ref: buildBranch, checkout: true });
    await isomorphic_git_1.default.pull({
        fs: fs_1.default,
        http: node_1.default,
        dir: folderPath,
        url: prInfo.data.head.repo.clone_url,
        ref: prInfo.data.head.ref,
    });
    await isomorphic_git_1.default.push({
        fs: fs_1.default,
        http: node_1.default,
        dir: folderPath,
        url: pushURL,
        onAuth: () => ({ username: consts_1.pushToken }),
        ref: buildBranch,
    });
    typeof callbackfn === 'function' && (await callbackfn(buildBranch));
    fs_1.default.rmSync(folderPath, {
        recursive: true,
    });
}
exports.default = build;
