
import path from 'path';
import {Context} from 'probot';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs';
import { Octokit } from "@octokit/rest";

import {randomHash, repoExists, repoExistsOctokit} from './helpers';

/**
 * Clones a PR, merges it with the current master, and pushes it to GitHub
 * 
 * @param context The Probot context
 * @returns {Promise<boolean>} Success status
 */
export default async function build(context: Context, callbackfn: (buildBranch: string) => void): Promise<boolean> {
    const id = randomHash(10);
    const prInfo = await context.octokit.pulls.get(context.pullRequest());
    if(!repoExists(context, "UmbrelBuilds", prInfo.data.base.repo.name)) {
        return false;
    }
    const pushURL = (await context.octokit.repos.get({...context.repo(), owner: "UmbrelBuilds"})).data.clone_url;
    const buildBranch = `pr-${context.pullRequest().pull_number}-${prInfo.data.head.ref}-${prInfo.data.head.sha.substring(0, 7)}`;
    const folderPath = path.resolve("./private", id);
    await fs.mkdir(folderPath, {
        recursive: true
    }, () => {})
    git.clone({fs, http, dir: folderPath, url: prInfo.data.head.repo.clone_url});
    git.checkout({fs, dir: folderPath, ref: prInfo.data.head.sha});
    git.pull({fs, http, dir: folderPath, url: prInfo.data.base.repo.clone_url});
    git.branch({fs, dir: folderPath, ref: buildBranch});
    git.checkout({fs, dir: folderPath, ref: buildBranch});
    git.push({
        fs, http, dir: folderPath, url: pushURL,
        onAuth: () => ({ username: process.env.PUSH_TOKEN }),
        ref: buildBranch
    });
    callbackfn(buildBranch);
    return true;
}

export async function buildOctokit(octokit: Octokit, pr: number, owner: string, repo: string, callbackfn: (buildBranch: string) => void): Promise<boolean> {
    const id = randomHash(10);
    const prInfo = await octokit.pulls.get({pull_number: pr, owner, repo});
    if(!repoExistsOctokit(octokit, "UmbrelBuilds", prInfo.data.base.repo.name)) {
        return false;
    }
    const pushURL = (await octokit.repos.get({repo, owner: "UmbrelBuilds"})).data.clone_url;
    const buildBranch = `pr-${pr}-${prInfo.data.head.ref}-${prInfo.data.head.sha.substring(0, 7)}`;
    const folderPath = path.resolve("./private", id);
    await fs.mkdir(folderPath, {
        recursive: true
    }, () => {})
    git.clone({fs, http, dir: folderPath, url: prInfo.data.head.repo.clone_url});
    git.checkout({fs, dir: folderPath, ref: prInfo.data.head.sha});
    git.pull({fs, http, dir: folderPath, url: prInfo.data.base.repo.clone_url});
    git.branch({fs, dir: folderPath, ref: buildBranch});
    git.checkout({fs, dir: folderPath, ref: buildBranch});
    git.push({
        fs, http, dir: folderPath, url: pushURL,
        onAuth: () => ({ username: process.env.PUSH_TOKEN }),
        ref: buildBranch
    });
    callbackfn(buildBranch);
    return true;
}
