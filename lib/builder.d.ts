import { ProbotOctokit } from 'probot';
export default function build(octokit: InstanceType<typeof ProbotOctokit>, pr: number, owner: string, repo: string, callbackfn?: (buildBranch: string) => void): Promise<void>;
