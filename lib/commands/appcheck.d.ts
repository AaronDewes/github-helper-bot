import { Context, ProbotOctokit } from 'probot';
import Command from './command';
export declare function getAppUpgrades(octokit: InstanceType<typeof ProbotOctokit>): Promise<string>;
export default class CmdHelp extends Command {
    static helptext: string;
    static run(context: Context, _args: string, _isPR: boolean): Promise<void>;
}
