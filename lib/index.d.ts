import { Context } from 'probot';
export interface PRInfo {
    number: number;
    branchName: string;
    repo: string;
    head: string;
}
export declare function build(context: Context): Promise<void>;
