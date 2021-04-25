import { ProbotOctokit } from 'probot';
export default function build(octokit: InstanceType<typeof ProbotOctokit>, owner: string, repo: string, pr: number, callbackfn?: (buildBranch: string) => void): Promise<void>;
