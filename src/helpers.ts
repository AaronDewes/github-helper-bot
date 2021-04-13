import { Octokit } from '@octokit/rest';
import {Context} from 'probot';
import {PRInfo} from './index';

/**
 * Generates a random hex value.
 * 
 * This is pseudorandom and not cryptographically secure.
 * @param {number} count How long the generated string should be
 * @returns {string} A randomly generated string
 */
export function randomHash(count: number): string {
    if (count === 1)
      return (16*Math.random()).toString(16).substr(2,1);
    else {
      let hash = '';
      for (let i=0; i<count; i++)
        hash += randomHash(1);
      return hash;
    }
}


/**
 * Checks if a repo exists on GitHub
 * 
 * @param context The Probot context
 * @param {string} owner The owner of the repo to check
 * @param {string} repo The name of the repo to check
 * @returns {string} A randomly generated string
 */
export async function repoExists(context: Context, owner: string, repo: string) {
    try {
        await context.octokit.repos.get({
          owner,
          repo
        })
      } catch (error) {
        if (error.status === 404) {
          return false;
        } else {
            return false;
        }
      }
    return true;
}


export async function repoExistsOctokit(octokit: Octokit, owner: string, repo: string) {
    try {
        await octokit.repos.get({
          owner,
          repo
        })
      } catch (error) {
        if (error.status === 404) {
          return false;
        } else {
            return false;
        }
      }
    return true;
}

export async function comparePRList(list1: PRInfo[], list2: PRInfo[]): Promise<PRInfo[]> {
  let resultingPRs: PRInfo[] = [];
  list2.forEach((pr, number) => {
    if(!list1[number]) {
      resultingPRs.push(pr);
    } else {
      if(list1[number].head !== pr.head) {
        resultingPRs.push(pr);
      }
    }
  })
  return resultingPRs;
}
