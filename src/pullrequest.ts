import { ProbotOctokit } from 'probot';
import build from './builder';

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
        octokit: InstanceType<typeof ProbotOctokit>,
        owner: string,
        repo: string,
        callbackfn?: (buildBranch: string) => void,
    ): Promise<void> {
        build(octokit, this.number, repo, owner, callbackfn);
        return;
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
        octokit: InstanceType<typeof ProbotOctokit>,
        pr: number,
        owner: string,
        repo: string,
        callbackfn?: (buildBranch: string) => void,
    ): Promise<void> {
        this.PRs[pr].scheduleBuild(octokit, repo, owner, callbackfn);
    }
}
