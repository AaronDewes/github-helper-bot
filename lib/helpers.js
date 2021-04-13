"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePRList = exports.repoExistsOctokit = exports.repoExists = exports.randomHash = void 0;
/**
 * Generates a random hex value.
 *
 * This is pseudorandom and not cryptographically secure.
 * @param {number} count How long the generated string should be
 * @returns {string} A randomly generated string
 */
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
/**
 * Checks if a repo exists on GitHub
 *
 * @param context The Probot context
 * @param {string} owner The owner of the repo to check
 * @param {string} repo The name of the repo to check
 * @returns {string} A randomly generated string
 */
async function repoExists(context, owner, repo) {
    try {
        await context.octokit.repos.get({
            owner,
            repo
        });
    }
    catch (error) {
        if (error.status === 404) {
            return false;
        }
        else {
            return false;
        }
    }
    return true;
}
exports.repoExists = repoExists;
async function repoExistsOctokit(octokit, owner, repo) {
    try {
        await octokit.repos.get({
            owner,
            repo
        });
    }
    catch (error) {
        if (error.status === 404) {
            return false;
        }
        else {
            return false;
        }
    }
    return true;
}
exports.repoExistsOctokit = repoExistsOctokit;
async function comparePRList(list1, list2) {
    let resultingPRs = [];
    list2.forEach((pr, number) => {
        if (!list1[number]) {
            resultingPRs.push(pr);
        }
        else {
            if (list1[number].head !== pr.head) {
                resultingPRs.push(pr);
            }
        }
    });
    return resultingPRs;
}
exports.comparePRList = comparePRList;
//# sourceMappingURL=helpers.js.map