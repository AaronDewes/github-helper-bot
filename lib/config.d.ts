import { ProbotOctokit } from 'probot';
export interface InvalidPRConfig {
    enabled?: boolean;
    filters?: string[];
    commentBody?: string;
    addLabel?: boolean;
    labelName?: string;
    labelColor?: string;
}
export interface InvalidPRDefaultConfig extends InvalidPRConfig {
    enabled: boolean;
    filters: string[];
    commentBody: string;
    addLabel: boolean;
    labelName: string;
    labelColor: string;
}
export interface UmbrelBotConfig {
    version?: number;
    invalidPRConfig?: InvalidPRConfig;
    blocklist?: string[];
}
export interface UmbrelBotDefaultConfig extends UmbrelBotConfig {
    version: number;
    invalidPRConfig: InvalidPRDefaultConfig;
    blocklist: string[];
}
export declare const defaultConfig: UmbrelBotDefaultConfig;
export declare function getConfig(octokit: InstanceType<typeof ProbotOctokit>, owner: string, repo: string): Promise<UmbrelBotConfig>;
