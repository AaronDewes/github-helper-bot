import { ProbotOctokit } from 'probot';
export default class PullRequest {
    number: number;
    timeoutID?: number | boolean;
    olderComments?: number[];
    owner: string;
    repo: string;
    constructor(number: number, owner: string, repo: string);
    scheduleBuild(octokit: InstanceType<typeof ProbotOctokit>, owner: string, repo: string, callbackfn?: (buildBranch: string) => void): Promise<void>;
}
export declare class Repo {
    owner: string;
    repo: string;
    PRs: PullRequest[];
    constructor(owner: string, repo: string);
    managePR(number: number): void;
    stopManagingPR(number: number): void;
    scheduleBuild(octokit: InstanceType<typeof ProbotOctokit>, pr: number, owner: string, repo: string, callbackfn?: (buildBranch: string) => void): Promise<void>;
}
