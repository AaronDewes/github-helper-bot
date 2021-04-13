import { Context } from 'probot';
import { Octokit } from "@octokit/rest";
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
    constructor(number: number, owner: string, repo: string);
    /**
     * Schedules a build to run
     * @param {boolean} now true if the build should be ran now,
     * false or in 5 minutes (if no new one gets triggered in that time)
     */
    scheduleBuild(now: boolean | undefined, buildContext: Context, callbackfn?: (buildBranch: string) => void): Promise<void>;
    /**
     * Schedules a build to run
     * @param {boolean} now true if the build should be ran now,
     * false or in 5 minutes (if no new one gets triggered in that time)
     */
    scheduleBuildFromOctokit(now: boolean | undefined, octokit: Octokit, owner: string, repo: string, callbackfn?: (buildBranch: string) => void): Promise<void>;
    addComment(id: number): Promise<void>;
    deleteOldComments(context: Context): Promise<void>;
    deleteOldCommentsFromOctokit(octokit: Octokit): Promise<void>;
}
export declare class Repo {
    owner: string;
    repo: string;
    PRs: PullRequest[];
    constructor(owner: string, repo: string);
    managePR(number: number): void;
    stopManagingPR(number: number): void;
    scheduleBuild(pr: number, now: boolean | undefined, buildContext: Context, callbackfn?: (buildBranch: string) => void): Promise<void>;
    scheduleBuildFromOctokit(pr: number, now: boolean | undefined, octokit: Octokit, owner: string, repo: string, callbackfn?: (buildBranch: string) => void): Promise<void>;
    addComment(pr: number, id: number): Promise<void>;
    deleteOldComments(pr: number, context: Context): Promise<void>;
    deleteOldCommentsFromOctokit(pr: number, octokit: Octokit): Promise<void>;
}
