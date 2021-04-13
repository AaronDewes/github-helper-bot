import { Context } from 'probot';
import { Octokit } from "@octokit/rest";
/**
 * Clones a PR, merges it with the current master, and pushes it to GitHub
 *
 * @param context The Probot context
 * @returns {Promise<boolean>} Success status
 */
export default function build(context: Context, callbackfn: (buildBranch: string) => void): Promise<boolean>;
export declare function buildOctokit(octokit: Octokit, pr: number, owner: string, repo: string, callbackfn: (buildBranch: string) => void): Promise<boolean>;
