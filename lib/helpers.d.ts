import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
import { Context } from 'probot';
import { PRInfo } from './index';
import { graphql } from '@octokit/graphql';
export declare function randomHash(count: number): string;
export declare function repoExists(context: Context, owner: string, repo: string): Promise<boolean>;
export declare function repoExistsOctokit(octokit: Octokit, owner: string, repo: string): Promise<boolean>;
export declare function comparePRList(list1: PRInfo[], list2: PRInfo[]): Promise<PRInfo[]>;
export declare function addLabel(context: Context, name: string, color: string): Promise<void>;
export declare function closeIssue(context: Context, params: RestEndpointMethodTypes['issues']['update']['parameters']): Promise<void>;
export declare function comment(context: Context, params: RestEndpointMethodTypes['issues']['createComment']['parameters']): Promise<void>;
export declare function ensureLabelExists(context: Context, { name, color }: Record<string, string>): Promise<void>;
export declare function labelExists(context: Context, name: string): Promise<boolean>;
export declare function hasPushAccess(context: Context, params: RestEndpointMethodTypes['repos']['getCollaboratorPermissionLevel']['parameters']): Promise<boolean>;
export declare function getPRs(octokit: typeof graphql): Promise<PRInfo[]>;
export declare type genericPRInfo = {
    number: number;
    head: {
        sha: string;
        ref: string;
        repo: {
            clone_url: string;
        };
    };
    base: {
        ref: string;
        sha: string;
        repo: {
            clone_url: string;
        };
    };
};
