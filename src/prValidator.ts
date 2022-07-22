import { Context } from 'probot';

import { closeIssue, addLabel, hasPushAccess } from './helpers';
import { defaultConfig, getConfig } from './config';
import jp from 'jsonpath';

export default async function validatePr(context: Context<'pull_request.opened'>): Promise<void> {
    const config = await getConfig(context.octokit, context.repo().owner, context.repo().repo);
    if (!config.invalidPRConfig?.enabled) return;
    const username = context.payload.pull_request.user.login;
    const canPush = await hasPushAccess(context.octokit, context.repo().owner, context.repo().repo, username);
    const data = Object.assign({ has_push_access: canPush }, context.payload);
    const filters = config.invalidPRConfig?.filters || defaultConfig.invalidPRConfig.filters;
    if (
        !filters.every((filter: string, i: number) => {
            try {
                if (jp.query([data], `$[?(${filter})]`).length > 0) {
                    console.info(`Filter "${filter}" matched the PR ✅ [${i + 1} of ${filters.length}]`);
                    return true;
                }
            } catch (e) {
                console.warn(`Malformed JSONPath query: "${filter}"`);
            }
            return false;
        })
    ) {
        return;
    }

    await context.octokit.rest.issues.createComment({
        ...context.issue(),
        body: config.invalidPRConfig.commentBody,
    });
    if (config.invalidPRConfig?.addLabel) {
        await addLabel(
            context.octokit,
            context.repo().owner,
            context.repo().repo,
            context.issue().issue_number,
            config.invalidPRConfig.labelName,
            config.invalidPRConfig.labelColor,
        );
    }
    return closeIssue(context.octokit, context.repo().owner, context.repo().repo, context.issue().issue_number);
}
