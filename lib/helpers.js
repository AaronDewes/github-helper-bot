"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPRs = exports.hasPushAccess = exports.labelExists = exports.ensureLabelExists = exports.comment = exports.closeIssue = exports.addLabel = exports.comparePRList = exports.repoExistsOctokit = exports.repoExists = exports.randomHash = void 0;
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
 * Checks if a repo exists on GitHub (using a Probot context)
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
            repo,
        });
    }
    catch (error) {
        return false;
    }
    return true;
}
exports.repoExists = repoExists;
/**
 * Checks if a repo exists on GitHub (using Octokit)
 *
 * @param octokit An octokit instance
 * @param {string} owner The owner of the repo to check
 * @param {string} repo The name of the repo to check
 * @returns {string} A randomly generated string
 */
async function repoExistsOctokit(octokit, owner, repo) {
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
exports.repoExistsOctokit = repoExistsOctokit;
/**
 * Compares two lists of PRs and returns the PRs that wer added/changed from list1 to list2
 *
 * @param list1 The first list of PRs
 * @param list2 The second list of PRs
 * @returns {string} All changed/added PRs between list1 and list2
 */
async function comparePRList(list1, list2) {
    const resultingPRs = [];
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
/**
 * Adds a label to a GitHub repo
 *
 * @param context The Probot context
 * @param {string} name The name of the label
 * @param {string} color The color that the label should have if it's not present (hex string)
 */
async function addLabel(context, name, color) {
    await ensureLabelExists(context, { name, color });
    await context.octokit.issues.addLabels({ ...context.issue(), labels: [name] });
}
exports.addLabel = addLabel;
async function closeIssue(context, params) {
    const closeParams = Object.assign({}, params, { state: 'closed' });
    context.octokit.issues.update(closeParams);
}
exports.closeIssue = closeIssue;
async function comment(context, params) {
    context.octokit.issues.createComment(params);
}
exports.comment = comment;
async function ensureLabelExists(context, { name, color }) {
    try {
        await context.octokit.issues.getLabel(context.repo({ name }));
    }
    catch (e) {
        context.octokit.issues.createLabel({ ...context.repo(), name, color });
    }
}
exports.ensureLabelExists = ensureLabelExists;
async function labelExists(context, name) {
    try {
        await context.octokit.issues.getLabel(context.repo({ name }));
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.labelExists = labelExists;
async function hasPushAccess(context, params) {
    const permissionResponse = await context.octokit.repos.getCollaboratorPermissionLevel(params);
    const level = permissionResponse.data.permission;
    return level === 'admin' || level === 'write';
}
exports.hasPushAccess = hasPushAccess;
/**
 * Get a list of Pull requests
 *
 * @param octokit A GrapQL octokit instance
 * @returns {PRInfo[]} An array of pull requests with basic information about them
 */
async function getPRs(octokit) {
    const fetchedData = await octokit(`
      {
        search(query: "org:getumbrel is:pr is:open draft:false", type: ISSUE, first: 100) {
          pageInfo { 
            hasNextPage
            endCursor
          }
          edges {
            node {
              ... on PullRequest {
                number,
                headRefName,
                commits(last: 1) {
                  edges {
                    node {
                      commit {
                      abbreviatedOid
                      }
                    }
                  }
                }
                baseRepository {
                  name
                }
              }
            }
          }
        }
      }
    `);
    let hasNextPage = fetchedData.data.search.pageInfo.hasNextPage;
    let endCursor = fetchedData.data.search.pageInfo.endCursor;
    while (hasNextPage == true) {
        const nowFetched = await octokit(`
        {
          search(query: "org:getumbrel is:pr is:open draft:false", type: ISSUE, first: 100, after: ${endCursor}) {
            pageInfo { 
              hasNextPage
              endCursor
            }
            edges {
              node {
                ... on PullRequest {
                  number,
                  headRefName,
                  commits(last: 1) {
                    edges {
                      node {
                        commit {
                        abbreviatedOid
                        }
                      }
                    }
                  }
                  baseRepository {
                    name
                  }
                }
              }
            }
          }
        }
      `);
        hasNextPage = nowFetched.data.search.pageInfo.hasNextPage;
        endCursor = fetchedData.data.search.pageInfo.endCursor;
        fetchedData.data.search.edges = [...fetchedData.data.search.edges, ...nowFetched.data.search.edges];
    }
    const result = [];
    fetchedData.data.search.edges.forEach((node) => {
        const subNode = node.node;
        result.push({
            branchName: subNode.headRefName,
            head: subNode.commits.edges[0].subNode.commit.abbreviatedOid,
            repo: subNode.baseRepository.name,
            number: subNode.number,
        });
    });
    return result;
}
exports.getPRs = getPRs;
//# sourceMappingURL=helpers.js.map