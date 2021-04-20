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
    async scheduleBuild(now = false, octokit, owner, repo, callbackfn) {
        if (now) {
            if (typeof this.timeoutID == 'number') {
                clearTimeout(this.timeoutID);
                this.timeoutID = false;
            }
            (0, builder_1.default)(octokit, this.number, repo, owner, callbackfn);
            return;
        }
        this.timeoutID = setTimeout(builder_1.default, 5 * 60 * 1000, octokit, this.number, repo, owner, callbackfn);
    }
    async addComment(id) {
        this.olderComments?.push(id);
    }
    async deleteOldComments(octokit, owner, repo) {
        this.olderComments?.forEach((comment) => {
            octokit.issues.deleteComment({
                owner,
                repo,
                comment_id: comment,
            });
        });
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
    async scheduleBuild(now = false, octokit, pr, owner, repo, callbackfn) {
        this.PRs[pr].scheduleBuild(now, octokit, repo, owner, callbackfn);
    }
    async addComment(pr, id) {
        this.managePR(pr);
        this.PRs[pr].addComment(id);
    }
    async deleteOldComments(octokit, pr, owner, repo) {
        this.managePR(pr);
        this.PRs[pr].deleteOldComments(octokit, owner, repo);
    }
}
exports.Repo = Repo;
