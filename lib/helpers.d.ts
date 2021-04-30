import { ProbotOctokit } from 'probot';
export declare function repoExists(octokit: InstanceType<typeof ProbotOctokit>, owner: string, repo: string): Promise<boolean>;
export declare function addLabel(octokit: InstanceType<typeof ProbotOctokit>, owner: string, repo: string, issue_number: number, name: string, color: string): Promise<void>;
export declare function closeIssue(octokit: InstanceType<typeof ProbotOctokit>, owner: string, repo: string, issue_number: number): Promise<void>;
export declare function labelExists(octokit: InstanceType<typeof ProbotOctokit>, owner: string, repo: string, name: string): Promise<boolean>;
export declare function hasPushAccess(octokit: InstanceType<typeof ProbotOctokit>, owner: string, repo: string, username: string): Promise<boolean>;
