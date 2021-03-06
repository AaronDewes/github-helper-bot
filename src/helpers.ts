import { ProbotOctokit } from 'probot';

/**
 * Checks if a repo exists on GitHub (using Octokit)
 *
 * @param {ProbotOctokit} octokit An octokit instance with probot plugins
 * @param {string} owner The owner of the repo to check
 * @param {string} repo The name of the repo to check
 */
export async function repoExists(
    octokit: InstanceType<typeof ProbotOctokit>,
    owner: string,
    repo: string,
): Promise<boolean> {
    try {
        await octokit.rest.repos.get({
            owner,
            repo,
        });
    } catch (error) {
        return false;
    }
    return true;
}

/**
 * Adds a label to an issue
 *
 * @param {ProbotOctokit} octokit An octokit instance with probot plugins
 * @param {string} owner The owner of the repo where this issue is
 * @param {string} repo The name of the repo where this issue is
 * @param {number} issue The number of the issue
 * @param {string} name The name of the label
 * @param {string} color The color that the label should have if it's not present (hex string)
 */
export async function addLabel(
    octokit: InstanceType<typeof ProbotOctokit>,
    owner: string,
    repo: string,
    issue_number: number,
    name: string,
    color: string,
): Promise<void> {
    await ensureLabelExists(octokit, owner, repo, name, color);
    await octokit.rest.issues.addLabels({ repo, owner, issue_number, labels: [name] });
}

/**
 * Closes an issue on GitHub
 *
 * @param {ProbotOctokit} octokit An octokit instance with probot plugins
 * @param {string} owner The owner of the repo where this issue is
 * @param {string} repo The name of the repo where this issue is
 * @param {number} issue The number of the issue
 */
export async function closeIssue(
    octokit: InstanceType<typeof ProbotOctokit>,
    owner: string,
    repo: string,
    issue_number: number,
): Promise<void> {
    octokit.rest.issues.update({ owner, repo, issue_number, state: 'closed' });
}

/**
 * Checks if a label exists on a GitHub repo, and creates it if not
 *
 * @param {ProbotOctokit} octokit An octokit instance with probot plugins
 * @param {string} owner The owner of the repo to check
 * @param {string} repo The name of the repo to check
 * @param {string} name The name of the label
 * @param {string} color The color that the label should have if it's not present (hex string)
 */
async function ensureLabelExists(
    octokit: InstanceType<typeof ProbotOctokit>,
    owner: string,
    repo: string,
    name: string,
    color: string,
): Promise<void> {
    try {
        await octokit.rest.issues.getLabel({ repo, owner, name });
    } catch (e) {
        octokit.rest.issues.createLabel({ repo, owner, name, color });
    }
}

/**
 * Checks if a label exists on a GitHub repo
 *
 * @param {ProbotOctokit} octokit An octokit instance with probot plugins
 * @param {string} owner The owner of the repo to check
 * @param {string} repo The name of the repo to check
 * @param {string} name The name of the label
 */
export async function labelExists(
    octokit: InstanceType<typeof ProbotOctokit>,
    owner: string,
    repo: string,
    name: string,
): Promise<boolean> {
    try {
        await octokit.rest.issues.getLabel({ owner, repo, name });
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Checks if an user has push access to a repo
 *
 * @param {ProbotOctokit} octokit An octokit instance with probot plugins
 * @param {string} owner The owner of the repo to check
 * @param {string} repo The name of the repo to check
 * @param {string} username The GitHub username of the user
 */
export async function hasPushAccess(
    octokit: InstanceType<typeof ProbotOctokit>,
    owner: string,
    repo: string,
    username: string,
): Promise<boolean> {
    const permissionResponse = await octokit.rest.repos.getCollaboratorPermissionLevel({ owner, repo, username });
    const level = permissionResponse.data.permission;

    return level === 'admin' || level === 'write';
}
