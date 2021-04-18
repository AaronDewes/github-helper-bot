import { Context } from 'probot';
import { Octokit } from '@octokit/rest';
export default function build(context: Context, callbackfn?: (buildBranch: string) => void): Promise<void>;
export declare function buildOctokit(octokit: Octokit, pr: number, owner: string, repo: string, callbackfn?: (buildBranch: string) => void): Promise<void>;
