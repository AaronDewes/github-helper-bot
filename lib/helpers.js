"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasPushAccess = exports.labelExists = exports.closeIssue = exports.addLabel = exports.repoExists = void 0;
async function repoExists(octokit, owner, repo) {
    try {
        await octokit.rest.repos.get({
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
    await octokit.rest.issues.addLabels({ repo, owner, issue_number, labels: [name] });
}
exports.addLabel = addLabel;
async function closeIssue(octokit, owner, repo, issue_number) {
    octokit.rest.issues.update({ owner, repo, issue_number, state: 'closed' });
}
exports.closeIssue = closeIssue;
async function ensureLabelExists(octokit, owner, repo, name, color) {
    try {
        await octokit.rest.issues.getLabel({ repo, owner, name });
    }
    catch (e) {
        octokit.rest.issues.createLabel({ repo, owner, name, color });
    }
}
async function labelExists(octokit, owner, repo, name) {
    try {
        await octokit.rest.issues.getLabel({ owner, repo, name });
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.labelExists = labelExists;
async function hasPushAccess(octokit, owner, repo, username) {
    const permissionResponse = await octokit.rest.repos.getCollaboratorPermissionLevel({ owner, repo, username });
    const level = permissionResponse.data.permission;
    return level === 'admin' || level === 'write';
}
exports.hasPushAccess = hasPushAccess;
