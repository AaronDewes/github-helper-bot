import { Context } from 'probot';
import build, { buildOctokit } from './builder';
import { Octokit } from '@octokit/rest';

/**
 * Manages a Pull Request
 *
 * Currently only manages builds and comments that log that build, but more might be added
 */
export default class PullRequest {
    number: number;
    timeoutID?: number | boolean;
    olderComments?: number[];
    owner: string;
    repo: string;

    constructor(number: number, owner: string, repo: string) {
        this.number = number;
        this.owner = owner;
        this.repo = repo;
    }

    /**
     * Schedules a build to run
     * @param {boolean} now true if the build should be ran now,
     * false or in 5 minutes (if no new one gets triggered in that time)
     */
    public async scheduleBuild(
        now = false,
        buildContext: Context,
        callbackfn?: (buildBranch: string) => void,
    ): Promise<void> {
        if (now) {
            if (typeof this.timeoutID == 'number') {
                clearTimeout(<number>this.timeoutID);
                this.timeoutID = false;
            }
            build(buildContext, callbackfn);
            return;
        }
        this.timeoutID = setTimeout(build, 5 * 60 * 1000, buildContext, callbackfn);
    }

    /**
     * Schedules a build to run
     * @param {boolean} now true if the build should be ran now,
     * false or in 5 minutes (if no new one gets triggered in that time)
     */
    public async scheduleBuildFromOctokit(
        now = false,
        octokit: Octokit,
        owner: string,
        repo: string,
        callbackfn?: (buildBranch: string) => void,
    ): Promise<void> {
        if (now) {
            if (typeof this.timeoutID == 'number') {
                clearTimeout(<number>this.timeoutID);
                this.timeoutID = false;
            }
            return;
        }
        this.timeoutID = setTimeout(buildOctokit, 5 * 60 * 1000, octokit, this.number, owner, repo, callbackfn);
    }

    public async addComment(id: number): Promise<void> {
        this.olderComments?.push(id);
    }

    public async deleteOldComments(context: Context): Promise<void> {
        this.olderComments?.forEach((comment) => {
            context.octokit.issues.deleteComment({
                ...context.repo(),
                comment_id: comment,
            });
        });
    }

    public async deleteOldCommentsFromOctokit(octokit: Octokit): Promise<void> {
        this.olderComments?.forEach((comment) => {
            octokit.issues.deleteComment({
                owner: this.owner,
                repo: this.repo,
                comment_id: comment,
            });
        });
    }
}

export class Repo {
    owner: string;
    repo: string;
    PRs: PullRequest[] = [];

    constructor(owner: string, repo: string) {
        this.owner = owner;
        this.repo = repo;
    }

    managePR(number: number): void {
        if (!this.PRs[number]) {
            this.PRs[number] = new PullRequest(number, this.owner, this.repo);
        }
    }

    stopManagingPR(number: number): void {
        if (this.PRs[number]) {
            delete this.PRs[number];
        }
    }

    public async scheduleBuild(
        pr: number,
        now = false,
        buildContext: Context,
        callbackfn?: (buildBranch: string) => void,
    ): Promise<void> {
        this.managePR(pr);
        this.PRs[pr].scheduleBuild(now, buildContext, callbackfn);
    }

    public async scheduleBuildFromOctokit(
        pr: number,
        now = false,
        octokit: Octokit,
        owner: string,
        repo: string,
        callbackfn?: (buildBranch: string) => void,
    ): Promise<void> {
        this.managePR(pr);
        this.PRs[pr].scheduleBuildFromOctokit(now, octokit, owner, repo, callbackfn);
    }

    public async addComment(pr: number, id: number): Promise<void> {
        this.managePR(pr);
        this.PRs[pr].addComment(id);
    }

    public async deleteOldComments(pr: number, context: Context): Promise<void> {
        this.managePR(pr);
        this.PRs[pr].deleteOldComments(context);
    }

    public async deleteOldCommentsFromOctokit(pr: number, octokit: Octokit): Promise<void> {
        this.managePR(pr);
        this.PRs[pr].deleteOldCommentsFromOctokit(octokit);
    }
}
