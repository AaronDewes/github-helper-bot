import { Octokit } from '@octokit/rest';
import { Context } from 'probot';
import { PRInfo } from './index';
import { graphql } from '@octokit/graphql';
/**
 * Generates a random hex value.
 *
 * This is pseudorandom and not cryptographically secure.
 * @param {number} count How long the generated string should be
 * @returns {string} A randomly generated string
 */
export declare function randomHash(count: number): string;
/**
 * Checks if a repo exists on GitHub (using a Probot context)
 *
 * @param context The Probot context
 * @param {string} owner The owner of the repo to check
 * @param {string} repo The name of the repo to check
 * @returns {string} A randomly generated string
 */
export declare function repoExists(context: Context, owner: string, repo: string): Promise<boolean>;
/**
 * Checks if a repo exists on GitHub (using Octokit)
 *
 * @param octokit An octokit instance
 * @param {string} owner The owner of the repo to check
 * @param {string} repo The name of the repo to check
 * @returns {string} A randomly generated string
 */
export declare function repoExistsOctokit(octokit: Octokit, owner: string, repo: string): Promise<boolean>;
/**
 * Compares two lists of PRs and returns the PRs that wer added/changed from list1 to list2
 *
 * @param list1 The first list of PRs
 * @param list2 The second list of PRs
 * @returns {string} All changed/added PRs between list1 and list2
 */
export declare function comparePRList(list1: PRInfo[], list2: PRInfo[]): Promise<PRInfo[]>;
/**
 * Adds a label to a GitHub repo
 *
 * @param context The Probot context
 * @param {string} name The name of the label
 * @param {string} color The color that the label should have if it's not present (hex string)
 */
export declare function addLabel(context: Context, name: string, color: string): Promise<void>;
export declare function closeIssue(context: Context, params: any): Promise<void>;
export declare function comment(context: Context, params: any): Promise<void>;
export declare function ensureLabelExists(context: Context, { name, color }: Record<string, string>): Promise<void>;
export declare function labelExists(context: Context, name: string): Promise<boolean>;
export declare function hasPushAccess(context: Context, params: any): Promise<boolean>;
/**
 * Get a list of Pull requests
 *
 * @param octokit A GrapQL octokit instance
 * @returns {PRInfo[]} An array of pull requests with basic information about them
 */
export declare function getPRs(octokit: typeof graphql): Promise<PRInfo[]>;
