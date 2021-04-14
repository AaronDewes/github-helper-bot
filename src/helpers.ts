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
 * Checks if a repo exists on GitHub (using a Probot context)
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


/**
 * Checks if a repo exists on GitHub (using Octokit)
 * 
 * @param octokit An octokit instance
 * @param {string} owner The owner of the repo to check
 * @param {string} repo The name of the repo to check
 * @returns {string} A randomly generated string
 */
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

/**
 * Compares two lists of PRs and returns the PRs that wer added/changed from list1 to list2
 * 
 * @param list1 The first list of PRs
 * @param list2 The second list of PRs
 * @returns {string} All changed/added PRs between list1 and list2
 */
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


/**
 * Adds a label to a GitHub repo
 * 
 * @param context The Probot context
 * @param {string} name The name of the label
 * @param {string} color The color that the label should have if it's not present (hex string)
 */
export async function addLabel(context: Context, name: string, color: string) {
  await ensureLabelExists(context, {name, color})
  await context.octokit.issues.addLabels({...context.issue(), labels: [name]});
}

export async function closeIssue(context: Context, params: any) {
  const closeParams = Object.assign({}, params, {state: 'closed'})

  return context.octokit.issues.update(closeParams);
}

export async function comment(context: Context, params:any) {
  return context.octokit.issues.createComment(params);
}

export async function ensureLabelExists(context: Context, {name, color}: Record<string, string>) {
  try {
    return await context.octokit.issues.getLabel(context.repo({name}));
  } catch (e) {
    return context.octokit.issues.createLabel({...context.repo(), name, color});
  }
}

export async function labelExists(context: Context, name: string) {
  try {
    await context.octokit.issues.getLabel(context.repo({name}));
    return true;
  } catch (e) {
    return false;
  }
}

export async function hasPushAccess(context: Context, params: any) {
  const permissionResponse = await context.octokit.repos.getCollaboratorPermissionLevel(params);
  const level = permissionResponse.data.permission;

  return level === 'admin' || level === 'write';
}
