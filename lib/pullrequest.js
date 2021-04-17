"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repo = void 0;
const builder_1 = __importStar(require("./builder"));
class PullRequest {
    constructor(number, owner, repo) {
        this.number = number;
        this.owner = owner;
        this.repo = repo;
    }
    async scheduleBuild(now = false, buildContext, callbackfn) {
        if (now) {
            if (typeof this.timeoutID == 'number') {
                clearTimeout(this.timeoutID);
                this.timeoutID = false;
            }
            return;
        }
        this.timeoutID = setTimeout(builder_1.default, 5 * 60 * 1000, buildContext, callbackfn);
    }
    async scheduleBuildFromOctokit(now = false, octokit, owner, repo, callbackfn) {
        if (now) {
            if (typeof this.timeoutID == 'number') {
                clearTimeout(this.timeoutID);
                this.timeoutID = false;
            }
            return;
        }
        this.timeoutID = setTimeout(builder_1.buildOctokit, 5 * 60 * 1000, octokit, this.number, owner, repo, callbackfn);
    }
    async addComment(id) {
        this.olderComments?.push(id);
    }
    async deleteOldComments(context) {
        this.olderComments?.forEach((comment) => {
            context.octokit.issues.deleteComment({
                ...context.repo(),
                comment_id: comment,
            });
        });
    }
    async deleteOldCommentsFromOctokit(octokit) {
        this.olderComments?.forEach((comment) => {
            octokit.issues.deleteComment({
                owner: this.owner,
                repo: this.repo,
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
    async scheduleBuild(pr, now = false, buildContext, callbackfn) {
        this.managePR(pr);
        this.PRs[pr].scheduleBuild(now, buildContext, callbackfn);
    }
    async scheduleBuildFromOctokit(pr, now = false, octokit, owner, repo, callbackfn) {
        this.managePR(pr);
        this.PRs[pr].scheduleBuildFromOctokit(now, octokit, owner, repo, callbackfn);
    }
    async addComment(pr, id) {
        this.managePR(pr);
        this.PRs[pr].addComment(id);
    }
    async deleteOldComments(pr, context) {
        this.managePR(pr);
        this.PRs[pr].deleteOldComments(context);
    }
    async deleteOldCommentsFromOctokit(pr, octokit) {
        this.managePR(pr);
        this.PRs[pr].deleteOldCommentsFromOctokit(octokit);
    }
}
exports.Repo = Repo;
