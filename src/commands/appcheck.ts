import fetch from 'node-fetch';
import { Octokit } from '@octokit/rest';
import { Context } from 'probot';
import Command from './command';
import semver from 'semver';

interface UmbrelApp {
    id: string;
    category: string;
    name: string;
    version: string;
    tagline: string;
    description: string;
    developer: string;
    website: string;
    dependencies: string[];
    repo: string;
    support: string;
    port: number;
    gallery: string[];
    path: string;
    defaultPassword: string;
    versionCheck?: boolean;
}

interface VersionDiff {
    app: string;
    umbrel: string;
    current: string;
}

export async function getAppUpgrades(): Promise<string> {
    const octokit = new Octokit();
    const data: UmbrelApp[] = await (
        await fetch('https://raw.githubusercontent.com/getumbrel/umbrel/master/apps/registry.json')
    ).json();
    const potentialUpdates: VersionDiff[] = [];
    for (const app of data) {
        console.info(`Checking app ${app.name}...`);
        if (app.versionCheck === false) {
            console.info('Version checking is disabled for this app.');
            continue;
        }
        const repoInfo = app.repo.replace('https://github.com/', '').split('/');
        let tagName = '';
        const appVersion = app.version;
        if(app.id === "lnbits") {
            const lnbitsRepo = await octokit.rest.repos.getCommit({owner: "lnbits", repo: "lnbits", ref: "master"});
            if(lnbitsRepo.data.commit.tree.sha.substr(0, 7) !== app.version) {
                potentialUpdates.push({
                    umbrel: appVersion,
                    current: lnbitsRepo.data.commit.tree.sha,
                    app: app.name,
                });
            }
            break;
        } else {
            const tagList = await octokit.rest.repos.listTags({ owner: repoInfo[0], repo: repoInfo[1] });
            for (const tag of tagList.data) {
                if (!semver.valid(app.version) && app.id !== "lnbits") {
                    console.info('Not a valid semver.');
                    continue;
                }
                if (semver.valid(tag.name) && !semver.prerelease(tag.name) && semver.gt(tag.name, app.version)) {
                    tagName = tag.name;
                    break;
                }
            }
            if (tagName.startsWith('v')) {
                tagName = tagName.substr(1);
            }
            if (app.version !== tagName && tagName !== '') {
                potentialUpdates.push({
                    umbrel: appVersion,
                    current: tagName,
                    app: app.name,
                });
            }
        }
    }
    if (potentialUpdates == []) {
        return 'No updates were found, everything seems up-to-date.';
    }
    let table = '| app | current release | used in Umbrel |\n';
    table += '|-----|-----------------|----------------|\n';
    potentialUpdates.forEach((update) => {
        table += `| ${update.app} | ${update.current} | ${update.umbrel} |\n`;
    });
    return table;
}

export default class CmdHelp extends Command {
    static helptext = 'Check if all apps used in getumbrel/umbrel are up-to-date.';

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static async run(context: Context, _args: string, _isPR: boolean): Promise<void> {
        context.octokit.issues.createComment({ ...context.issue(), body: await getAppUpgrades() });
    }
}
