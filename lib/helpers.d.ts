import { Octokit } from '@octokit/rest';
import { Context } from 'probot';
import { PRInfo } from './index';
/**
 * Generates a random hex value.
 *
 * This is pseudorandom and not cryptographically secure.
 * @param {number} count How long the generated string should be
 * @returns {string} A randomly generated string
 */
export declare function randomHash(count: number): string;
/**
 * Checks if a repo exists on GitHub (using a Probot context)
 *
 * @param context The Probot context
 * @param {string} owner The owner of the repo to check
 * @param {string} repo The name of the repo to check
 * @returns {string} A randomly generated string
 */
export declare function repoExists(context: Context, owner: string, repo: string): Promise<boolean>;
/**
 * Checks if a repo exists on GitHub (using Octokit)
 *
 * @param octokit An octokit instance
 * @param {string} owner The owner of the repo to check
 * @param {string} repo The name of the repo to check
 * @returns {string} A randomly generated string
 */
export declare function repoExistsOctokit(octokit: Octokit, owner: string, repo: string): Promise<boolean>;
/**
 * Compares two lists of PRs and returns the PRs that wer added/changed from list1 to list2
 *
 * @param list1 The first list of PRs
 * @param list2 The second list of PRs
 * @returns {string} All changed/added PRs between list1 and list2
 */
export declare function comparePRList(list1: PRInfo[], list2: PRInfo[]): Promise<PRInfo[]>;
/**
 * Adds a label to a GitHub repo
 *
 * @param context The Probot context
 * @param {string} name The name of the label
 * @param {string} color The color that the label should have if it's not present (hex string)
 */
export declare function addLabel(context: Context, name: string, color: string): Promise<void>;
export declare function closeIssue(context: Context, params: any): Promise<import("@octokit/types").OctokitResponse<{
    id: number;
    node_id: string;
    url: string;
    repository_url: string;
    labels_url: string;
    comments_url: string;
    events_url: string;
    html_url: string;
    number: number;
    state: string;
    title: string;
    body?: string | undefined;
    user: {
        login: string;
        id: number;
        node_id: string;
        avatar_url: string;
        gravatar_id: string | null;
        url: string;
        html_url: string;
        followers_url: string;
        following_url: string;
        gists_url: string;
        starred_url: string;
        subscriptions_url: string;
        organizations_url: string;
        repos_url: string;
        events_url: string;
        received_events_url: string;
        type: string;
        site_admin: boolean;
        starred_at?: string | undefined;
    } | null;
    labels: (string | {
        id?: number | undefined;
        node_id?: string | undefined;
        url?: string | undefined;
        name?: string | undefined;
        description?: string | null | undefined;
        color?: string | null | undefined;
        default?: boolean | undefined;
    })[];
    assignee: {
        login: string;
        id: number;
        node_id: string;
        avatar_url: string;
        gravatar_id: string | null;
        url: string;
        html_url: string;
        followers_url: string;
        following_url: string;
        gists_url: string;
        starred_url: string;
        subscriptions_url: string;
        organizations_url: string;
        repos_url: string;
        events_url: string;
        received_events_url: string;
        type: string;
        site_admin: boolean;
        starred_at?: string | undefined;
    } | null;
    assignees?: ({
        login: string;
        id: number;
        node_id: string;
        avatar_url: string;
        gravatar_id: string | null;
        url: string;
        html_url: string;
        followers_url: string;
        following_url: string;
        gists_url: string;
        starred_url: string;
        subscriptions_url: string;
        organizations_url: string;
        repos_url: string;
        events_url: string;
        received_events_url: string;
        type: string;
        site_admin: boolean;
        starred_at?: string | undefined;
    } | null)[] | null | undefined;
    milestone: {
        url: string;
        html_url: string;
        labels_url: string;
        id: number;
        node_id: string;
        number: number;
        state: "closed" | "open";
        title: string;
        description: string | null;
        creator: {
            login: string;
            id: number;
            node_id: string;
            avatar_url: string;
            gravatar_id: string | null;
            url: string;
            html_url: string;
            followers_url: string;
            following_url: string;
            gists_url: string;
            starred_url: string;
            subscriptions_url: string;
            organizations_url: string;
            repos_url: string;
            events_url: string;
            received_events_url: string;
            type: string;
            site_admin: boolean;
            starred_at?: string | undefined;
        } | null;
        open_issues: number;
        closed_issues: number;
        created_at: string;
        updated_at: string;
        closed_at: string | null;
        due_on: string | null;
    } | null;
    locked: boolean;
    active_lock_reason?: string | null | undefined;
    comments: number;
    pull_request?: {
        merged_at?: string | null | undefined;
        diff_url: string | null;
        html_url: string | null;
        patch_url: string | null;
        url: string | null;
    } | undefined;
    closed_at: string | null;
    created_at: string;
    updated_at: string;
    closed_by?: {
        login: string;
        id: number;
        node_id: string;
        avatar_url: string;
        gravatar_id: string | null;
        url: string;
        html_url: string;
        followers_url: string;
        following_url: string;
        gists_url: string;
        starred_url: string;
        subscriptions_url: string;
        organizations_url: string;
        repos_url: string;
        events_url: string;
        received_events_url: string;
        type: string;
        site_admin: boolean;
        starred_at?: string | undefined;
    } | null | undefined;
    body_html?: string | undefined;
    body_text?: string | undefined;
    timeline_url?: string | undefined;
    repository?: {
        id: number;
        node_id: string;
        name: string;
        full_name: string;
        license: {
            key: string;
            name: string;
            url: string | null;
            spdx_id: string | null;
            node_id: string;
            html_url?: string | undefined;
        } | null;
        forks: number;
        permissions?: {
            admin: boolean;
            pull: boolean;
            triage?: boolean | undefined;
            push: boolean;
            maintain?: boolean | undefined;
        } | undefined;
        owner: {
            login: string;
            id: number;
            node_id: string;
            avatar_url: string;
            gravatar_id: string | null;
            url: string;
            html_url: string;
            followers_url: string;
            following_url: string;
            gists_url: string;
            starred_url: string;
            subscriptions_url: string;
            organizations_url: string;
            repos_url: string;
            events_url: string;
            received_events_url: string;
            type: string;
            site_admin: boolean;
            starred_at?: string | undefined;
        } | null;
        private: boolean;
        html_url: string;
        description: string | null;
        fork: boolean;
        url: string;
        archive_url: string;
        assignees_url: string;
        blobs_url: string;
        branches_url: string;
        collaborators_url: string;
        comments_url: string;
        commits_url: string;
        compare_url: string;
        contents_url: string;
        contributors_url: string;
        deployments_url: string;
        downloads_url: string;
        events_url: string;
        forks_url: string;
        git_commits_url: string;
        git_refs_url: string;
        git_tags_url: string;
        git_url: string;
        issue_comment_url: string;
        issue_events_url: string;
        issues_url: string;
        keys_url: string;
        labels_url: string;
        languages_url: string;
        merges_url: string;
        milestones_url: string;
        notifications_url: string;
        pulls_url: string;
        releases_url: string;
        ssh_url: string;
        stargazers_url: string;
        statuses_url: string;
        subscribers_url: string;
        subscription_url: string;
        tags_url: string;
        teams_url: string;
        trees_url: string;
        clone_url: string;
        mirror_url: string | null;
        hooks_url: string;
        svn_url: string;
        homepage: string | null;
        language: string | null;
        forks_count: number;
        stargazers_count: number;
        watchers_count: number;
        size: number;
        default_branch: string;
        open_issues_count: number;
        is_template?: boolean | undefined;
        topics?: string[] | undefined;
        has_issues: boolean;
        has_projects: boolean;
        has_wiki: boolean;
        has_pages: boolean;
        has_downloads: boolean;
        archived: boolean;
        disabled: boolean;
        visibility?: string | undefined;
        pushed_at: string | null;
        created_at: string | null;
        updated_at: string | null;
        allow_rebase_merge?: boolean | undefined;
        template_repository?: {
            id?: number | undefined;
            node_id?: string | undefined;
            name?: string | undefined;
            full_name?: string | undefined;
            owner?: {
                login?: string | undefined;
                id?: number | undefined;
                node_id?: string | undefined;
                avatar_url?: string | undefined;
                gravatar_id?: string | undefined;
                url?: string | undefined;
                html_url?: string | undefined;
                followers_url?: string | undefined;
                following_url?: string | undefined;
                gists_url?: string | undefined;
                starred_url?: string | undefined;
                subscriptions_url?: string | undefined;
                organizations_url?: string | undefined;
                repos_url?: string | undefined;
                events_url?: string | undefined;
                received_events_url?: string | undefined;
                type?: string | undefined;
                site_admin?: boolean | undefined;
            } | undefined;
            private?: boolean | undefined;
            html_url?: string | undefined;
            description?: string | undefined;
            fork?: boolean | undefined;
            url?: string | undefined;
            archive_url?: string | undefined;
            assignees_url?: string | undefined;
            blobs_url?: string | undefined;
            branches_url?: string | undefined;
            collaborators_url?: string | undefined;
            comments_url?: string | undefined;
            commits_url?: string | undefined;
            compare_url?: string | undefined;
            contents_url?: string | undefined;
            contributors_url?: string | undefined;
            deployments_url?: string | undefined;
            downloads_url?: string | undefined;
            events_url?: string | undefined;
            forks_url?: string | undefined;
            git_commits_url?: string | undefined;
            git_refs_url?: string | undefined;
            git_tags_url?: string | undefined;
            git_url?: string | undefined;
            issue_comment_url?: string | undefined;
            issue_events_url?: string | undefined;
            issues_url?: string | undefined;
            keys_url?: string | undefined;
            labels_url?: string | undefined;
            languages_url?: string | undefined;
            merges_url?: string | undefined;
            milestones_url?: string | undefined;
            notifications_url?: string | undefined;
            pulls_url?: string | undefined;
            releases_url?: string | undefined;
            ssh_url?: string | undefined;
            stargazers_url?: string | undefined;
            statuses_url?: string | undefined;
            subscribers_url?: string | undefined;
            subscription_url?: string | undefined;
            tags_url?: string | undefined;
            teams_url?: string | undefined;
            trees_url?: string | undefined;
            clone_url?: string | undefined;
            mirror_url?: string | undefined;
            hooks_url?: string | undefined;
            svn_url?: string | undefined;
            homepage?: string | undefined;
            language?: string | undefined;
            forks_count?: number | undefined;
            stargazers_count?: number | undefined;
            watchers_count?: number | undefined;
            size?: number | undefined;
            default_branch?: string | undefined;
            open_issues_count?: number | undefined;
            is_template?: boolean | undefined;
            topics?: string[] | undefined;
            has_issues?: boolean | undefined;
            has_projects?: boolean | undefined;
            has_wiki?: boolean | undefined;
            has_pages?: boolean | undefined;
            has_downloads?: boolean | undefined;
            archived?: boolean | undefined;
            disabled?: boolean | undefined;
            visibility?: string | undefined;
            pushed_at?: string | undefined;
            created_at?: string | undefined;
            updated_at?: string | undefined;
            permissions?: {
                admin?: boolean | undefined;
                push?: boolean | undefined;
                pull?: boolean | undefined;
            } | undefined;
            allow_rebase_merge?: boolean | undefined;
            temp_clone_token?: string | undefined;
            allow_squash_merge?: boolean | undefined;
            delete_branch_on_merge?: boolean | undefined;
            allow_merge_commit?: boolean | undefined;
            subscribers_count?: number | undefined;
            network_count?: number | undefined;
        } | null | undefined;
        temp_clone_token?: string | undefined;
        allow_squash_merge?: boolean | undefined;
        delete_branch_on_merge?: boolean | undefined;
        allow_merge_commit?: boolean | undefined;
        subscribers_count?: number | undefined;
        network_count?: number | undefined;
        open_issues: number;
        watchers: number;
        master_branch?: string | undefined;
        starred_at?: string | undefined;
    } | undefined;
    performed_via_github_app?: ({
        id: number;
        slug?: string | undefined;
        node_id: string;
        owner: {
            login: string;
            id: number;
            node_id: string;
            avatar_url: string;
            gravatar_id: string | null;
            url: string;
            html_url: string;
            followers_url: string;
            following_url: string;
            gists_url: string;
            starred_url: string;
            subscriptions_url: string;
            organizations_url: string;
            repos_url: string;
            events_url: string;
            received_events_url: string;
            type: string;
            site_admin: boolean;
            starred_at?: string | undefined;
        } | null;
        name: string;
        description: string | null;
        external_url: string;
        html_url: string;
        created_at: string;
        updated_at: string;
        permissions: {
            issues?: string | undefined;
            checks?: string | undefined;
            metadata?: string | undefined;
            contents?: string | undefined;
            deployments?: string | undefined;
        } & {
            [key: string]: string;
        };
        events: string[];
        installations_count?: number | undefined;
        client_id?: string | undefined;
        client_secret?: string | undefined;
        webhook_secret?: string | undefined;
        pem?: string | undefined;
    } & {
        [key: string]: any;
    }) | null | undefined;
    author_association: "COLLABORATOR" | "CONTRIBUTOR" | "FIRST_TIMER" | "FIRST_TIME_CONTRIBUTOR" | "MANNEQUIN" | "MEMBER" | "NONE" | "OWNER";
    reactions?: {
        url: string;
        total_count: number;
        "+1": number;
        "-1": number;
        laugh: number;
        confused: number;
        heart: number;
        hooray: number;
        eyes: number;
        rocket: number;
    } | undefined;
}, 200>>;
export declare function comment(context: Context, params: any): Promise<import("@octokit/types").OctokitResponse<{
    id: number;
    node_id: string;
    url: string;
    body?: string | undefined;
    body_text?: string | undefined;
    body_html?: string | undefined;
    html_url: string;
    user: {
        login: string;
        id: number;
        node_id: string;
        avatar_url: string;
        gravatar_id: string | null;
        url: string;
        html_url: string;
        followers_url: string;
        following_url: string;
        gists_url: string;
        starred_url: string;
        subscriptions_url: string;
        organizations_url: string;
        repos_url: string;
        events_url: string;
        received_events_url: string;
        type: string;
        site_admin: boolean;
        starred_at?: string | undefined;
    } | null;
    created_at: string;
    updated_at: string;
    issue_url: string;
    author_association: "COLLABORATOR" | "CONTRIBUTOR" | "FIRST_TIMER" | "FIRST_TIME_CONTRIBUTOR" | "MANNEQUIN" | "MEMBER" | "NONE" | "OWNER";
    performed_via_github_app?: ({
        id: number;
        slug?: string | undefined;
        node_id: string;
        owner: {
            login: string;
            id: number;
            node_id: string;
            avatar_url: string;
            gravatar_id: string | null;
            url: string;
            html_url: string;
            followers_url: string;
            following_url: string;
            gists_url: string;
            starred_url: string;
            subscriptions_url: string;
            organizations_url: string;
            repos_url: string;
            events_url: string;
            received_events_url: string;
            type: string;
            site_admin: boolean;
            starred_at?: string | undefined;
        } | null;
        name: string;
        description: string | null;
        external_url: string;
        html_url: string;
        created_at: string;
        updated_at: string;
        permissions: {
            issues?: string | undefined;
            checks?: string | undefined;
            metadata?: string | undefined;
            contents?: string | undefined;
            deployments?: string | undefined;
        } & {
            [key: string]: string;
        };
        events: string[];
        installations_count?: number | undefined;
        client_id?: string | undefined;
        client_secret?: string | undefined;
        webhook_secret?: string | undefined;
        pem?: string | undefined;
    } & {
        [key: string]: any;
    }) | null | undefined;
    reactions?: {
        url: string;
        total_count: number;
        "+1": number;
        "-1": number;
        laugh: number;
        confused: number;
        heart: number;
        hooray: number;
        eyes: number;
        rocket: number;
    } | undefined;
}, 201>>;
export declare function ensureLabelExists(context: Context, { name, color }: Record<string, string>): Promise<import("@octokit/types").OctokitResponse<{
    id: number;
    node_id: string;
    url: string;
    name: string;
    description: string | null;
    color: string;
    default: boolean;
}, 200> | import("@octokit/types").OctokitResponse<{
    id: number;
    node_id: string;
    url: string;
    name: string;
    description: string | null;
    color: string;
    default: boolean;
}, 201>>;
export declare function labelExists(context: Context, name: string): Promise<boolean>;
export declare function hasPushAccess(context: Context, params: any): Promise<boolean>;
