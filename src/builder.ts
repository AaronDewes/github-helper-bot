import path from 'path';
import { ProbotOctokit } from 'probot';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs';

import { randomHash, repoExists } from './helpers';
import { buildOrg } from './consts';

export default async function build(
    octokit: InstanceType<typeof ProbotOctokit>,
    pr: number,
    owner: string,
    repo: string,
    callbackfn?: (buildBranch: string) => void,
): Promise<void> {
    const prInfo = await octokit.pulls.get({ pull_number: pr, owner, repo });
    const exists = await repoExists(octokit, buildOrg, prInfo.data.base.repo.name);
    if (!exists) {
        console.warn(`Tried to run a build in '${prInfo.data.base.repo.name}', but it doesn't exist in '${buildOrg}!'`);
        return;
    }
    const pushURL = (await octokit.repos.get({ repo: repo, owner: buildOrg })).data.clone_url;
    const jobId = randomHash(10);
    const buildBranch = `pr-${prInfo.data.number}-${prInfo.data.head.ref}-${prInfo.data.head.sha.substring(0, 7)}`;
    const folderPath = path.resolve('./private', jobId);
    fs.mkdirSync(folderPath, {
        recursive: true,
    });
    git.init({ fs, dir: folderPath });
    fs.mkdirSync(path.resolve(folderPath, ".git"), {
        recursive: true,
    });
    fs.writeFileSync(path.resolve(folderPath, ".git", "config"), "");
    git.setConfig({ fs, dir: folderPath, path: 'user.name', value: 'UmbrelBot' });
    git.setConfig({ fs, dir: folderPath, path: 'user.email', value: 'bot@umbrel.tech' });
    git.fetch({ fs, http, dir: folderPath, url: prInfo.data.head.repo.clone_url });
    git.checkout({ fs, dir: folderPath, ref: prInfo.data.head.sha });
    git.pull({ fs, http, dir: folderPath, url: prInfo.data.base.repo.clone_url });
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
