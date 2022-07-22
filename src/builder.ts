import path from 'path';
import { ProbotOctokit } from 'probot';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs';

import { repoExists } from './helpers';
import { buildOrg, pushToken } from './consts';

import { randomBytes } from 'crypto';

export default async function build(
    octokit: InstanceType<typeof ProbotOctokit>,
    owner: string,
    repo: string,
    pr: number,
    callbackfn?: (buildBranch: string) => void,
): Promise<void> {
    const prInfo = await octokit.rest.pulls.get({ pull_number: pr, owner, repo });
    const exists = await repoExists(octokit, buildOrg, prInfo.data.base.repo.name);
    if (!exists) {
        console.warn(`Tried to run a build in '${prInfo.data.base.repo.name}', but it doesn't exist in '${buildOrg}!'`);
        return;
    }
    const pushURL = (await octokit.rest.repos.get({ repo: repo, owner: buildOrg })).data.clone_url;
    const jobId = randomBytes(256).toString('hex').substring(0, 10);
    const buildBranch = `pr-${prInfo.data.number}-${prInfo.data.head.ref}-${prInfo.data.head.sha.substring(0, 7)}`;
    const folderPath = path.resolve('./private', jobId);
    fs.mkdirSync(folderPath, {
        recursive: true,
    });
    await git.clone({ fs, http, dir: folderPath, url: prInfo.data.base.repo.clone_url });
    await git.setConfig({ fs, dir: folderPath, path: 'user.name', value: 'CitadelBot' });
    await git.setConfig({ fs, dir: folderPath, path: 'user.email', value: 'bot@umbrel.tech' });
    await git.branch({ fs, dir: folderPath, ref: buildBranch, checkout: true });
    await git.pull({
        fs,
        http,
        dir: folderPath,
        url: prInfo.data.head.repo?.clone_url,
        remoteRef: prInfo.data.head.sha,
    });
    await git.push({
        fs,
        http,
        dir: folderPath,
        url: pushURL,
        onAuth: () => ({ username: pushToken }),
        ref: buildBranch,
    });
    typeof callbackfn === 'function' && (await callbackfn(buildBranch));
    fs.rmSync(folderPath, {
        recursive: true,
    });
}
