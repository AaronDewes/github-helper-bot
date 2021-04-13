import { Octokit } from '@octokit/rest';
import { Context } from 'probot';
import { PRInfo } from './index';
/**
 * Generates a random hex value.
 *
 * This is pseudorandom and not cryptographically secure.
 * @param {number} count How long the generated string should be
 * @returns {string} A randomly generated string
 */
export declare function randomHash(count: number): string;
/**
 * Checks if a repo exists on GitHub
 *
 * @param context The Probot context
 * @param {string} owner The owner of the repo to check
 * @param {string} repo The name of the repo to check
 * @returns {string} A randomly generated string
 */
export declare function repoExists(context: Context, owner: string, repo: string): Promise<boolean>;
export declare function repoExistsOctokit(octokit: Octokit, owner: string, repo: string): Promise<boolean>;
export declare function comparePRList(list1: PRInfo[], list2: PRInfo[]): Promise<PRInfo[]>;
