import path from 'path';
import { Context } from 'probot';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs';
import { Octokit } from '@octokit/rest';

import { genericPRInfo, randomHash, repoExists, repoExistsOctokit } from './helpers';
import { buildOrg } from './consts';

/**
 * Clones a PR, merges it with the current master, and pushes it to GitHub
 *
 * @param context The Probot context
 * @returns {Promise<boolean>} Success status
 */
export default async function build(context: Context, callbackfn?: (buildBranch: string) => void): Promise<void> {
    const prInfo = await context.octokit.pulls.get(context.pullRequest());
    const exists = await repoExists(context, buildOrg, prInfo.data.base.repo.name);
    if (!exists) {
        console.warn(`Tried to run a build in '${prInfo.data.base.repo.name}', but it doesn't exist in '${buildOrg}!'`);
    }
    const pushURL = (await context.octokit.repos.get({ ...context.repo(), owner: buildOrg })).data.clone_url;
    genericBuild(prInfo.data, pushURL, callbackfn);
}

export async function buildOctokit(
    octokit: Octokit,
    pr: number,
    owner: string,
    repo: string,
    callbackfn?: (buildBranch: string) => void,
): Promise<void> {
    const prInfo = await octokit.pulls.get({ pull_number: pr, owner, repo });
    const exists = await repoExistsOctokit(octokit, buildOrg, prInfo.data.base.repo.name);
    if (!exists) {
        console.warn(`Tried to run a build in '${prInfo.data.base.repo.name}', but it doesn't exist in '${buildOrg}!'`);
        return;
    }
    const pushURL = (await octokit.repos.get({ repo: repo, owner: buildOrg })).data.clone_url;
    genericBuild(prInfo.data, pushURL, callbackfn);
}

async function genericBuild(prInfo: genericPRInfo, pushURL: string, callbackfn?: (buildBranch: string) => void) {
    const jobId = randomHash(10);
    const buildBranch = `pr-${prInfo.number}-${prInfo.head.ref}-${prInfo.head.sha.substring(0, 7)}`;
    const folderPath = path.resolve('./private', jobId);
    fs.mkdirSync(folderPath, {
        recursive: true,
    });
    git.clone({ fs, http, dir: folderPath, url: prInfo.head.repo.clone_url });
    git.checkout({ fs, dir: folderPath, ref: prInfo.head.sha });
    git.pull({ fs, http, dir: folderPath, url: prInfo.base.repo.clone_url });
    git.branch({ fs, dir: folderPath, ref: buildBranch });
    git.checkout({ fs, dir: folderPath, ref: buildBranch });
    git.push({
        fs,
        http,
        dir: folderPath,
        url: pushURL,
        onAuth: () => ({ username: process.env.PUSH_TOKEN }),
        ref: buildBranch,
    });
    typeof callbackfn === 'function' && callbackfn(buildBranch);
}
