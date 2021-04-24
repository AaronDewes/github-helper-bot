"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repo = void 0;
const builder_1 = __importDefault(require("./builder"));
class PullRequest {
    constructor(number, owner, repo) {
        this.number = number;
        this.owner = owner;
        this.repo = repo;
    }
    async scheduleBuild(octokit, owner, repo, callbackfn) {
        builder_1.default(octokit, this.number, repo, owner, callbackfn);
        return;
    }
}
exports.default = PullRequest;
class Repo {
    constructor(owner, repo) {
        this.PRs = [];
        this.owner = owner;
        this.repo = repo;
    }
    managePR(number) {
        if (!this.PRs[number]) {
            this.PRs[number] = new PullRequest(number, this.owner, this.repo);
        }
    }
    stopManagingPR(number) {
        if (this.PRs[number]) {
            delete this.PRs[number];
        }
    }
    async scheduleBuild(octokit, pr, owner, repo, callbackfn) {
        this.PRs[pr].scheduleBuild(octokit, repo, owner, callbackfn);
    }
}
exports.Repo = Repo;
