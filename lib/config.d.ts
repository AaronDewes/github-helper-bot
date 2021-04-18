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
    prFetchMinutes?: number;
}
export interface UmbrelBotDefaultConfig extends UmbrelBotConfig {
    version: number;
    invalidPRConfig: InvalidPRDefaultConfig;
    blocklist: string[];
    prFetchMinutes: number;
}
export declare const defaultConfig: UmbrelBotDefaultConfig;
