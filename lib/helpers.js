"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPRs = exports.hasPushAccess = exports.labelExists = exports.ensureLabelExists = exports.comment = exports.closeIssue = exports.addLabel = exports.comparePRList = exports.repoExists = exports.randomHash = void 0;
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
async function addLabel(octokit, owner, repo, issue_number, name, color) {
    await ensureLabelExists(octokit, owner, repo, name, color);
    await octokit.issues.addLabels({ repo, owner, issue_number, labels: [name] });
}
exports.addLabel = addLabel;
async function closeIssue(octokit, owner, repo, issue_number) {
    octokit.issues.update({ owner, repo, issue_number, state: 'closed' });
}
exports.closeIssue = closeIssue;
async function comment(context, params) {
    context.octokit.issues.createComment(params);
}
exports.comment = comment;
async function ensureLabelExists(octokit, owner, repo, name, color) {
    try {
        await octokit.issues.getLabel({ repo, owner, name });
    }
    catch (e) {
        octokit.issues.createLabel({ repo, owner, name, color });
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
async function getPRs(octokit) {
    const fetchedData = await octokit.graphql(`
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
        const nowFetched = await octokit.graphql(`
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
