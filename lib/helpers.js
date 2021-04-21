"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasPushAccess = exports.labelExists = exports.ensureLabelExists = exports.closeIssue = exports.addLabel = exports.repoExists = exports.randomHash = void 0;
function randomHash(count) {
    if (count === 1)
        return (16 * Math.random()).toString(16).substr(2, 1);
    else {
        let hash = '';
        for (let i = 0; i < count; i++)
            hash += randomHash(1);
        return hash;
    }
}
exports.randomHash = randomHash;
async function repoExists(octokit, owner, repo) {
    try {
        await octokit.repos.get({
            owner,
            repo,
        });
    }
    catch (error) {
        return false;
    }
    return true;
}
exports.repoExists = repoExists;
async function addLabel(octokit, owner, repo, issue_number, name, color) {
    await ensureLabelExists(octokit, owner, repo, name, color);
    await octokit.issues.addLabels({ repo, owner, issue_number, labels: [name] });
}
exports.addLabel = addLabel;
async function closeIssue(octokit, owner, repo, issue_number) {
    octokit.issues.update({ owner, repo, issue_number, state: 'closed' });
}
exports.closeIssue = closeIssue;
async function ensureLabelExists(octokit, owner, repo, name, color) {
    try {
        await octokit.issues.getLabel({ repo, owner, name });
    }
    catch (e) {
        octokit.issues.createLabel({ repo, owner, name, color });
    }
}
exports.ensureLabelExists = ensureLabelExists;
async function labelExists(octokit, owner, repo, name) {
    try {
        await octokit.issues.getLabel({ owner, repo, name });
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.labelExists = labelExists;
async function hasPushAccess(octokit, owner, repo, username) {
    const permissionResponse = await octokit.repos.getCollaboratorPermissionLevel({ owner, repo, username });
    const level = permissionResponse.data.permission;
    return level === 'admin' || level === 'write';
}
exports.hasPushAccess = hasPushAccess;
