import { ProbotOctokit } from 'probot';
import { configVersion } from './consts';

interface InvalidPRConfig {
    enabled?: boolean;
    filters?: string[];
    commentBody?: string;
    addLabel?: boolean;
    labelName?: string;
    labelColor?: string;
}

interface InvalidPRDefaultConfig extends InvalidPRConfig {
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

interface UmbrelBotDefaultConfig extends UmbrelBotConfig {
    version: number;
    invalidPRConfig: InvalidPRDefaultConfig;
    blocklist: string[];
}

export const defaultConfig: UmbrelBotDefaultConfig = {
    version: configVersion,
    invalidPRConfig: {
        // Filter explanation:
        // 1. PR is from a branch in the local repo.
        // 2. User is not a bot.  If the user is a bot then it was invited to open
        //    pull requests and isn't the kind of mistake this bot was intended to
        //    detect.
        // 3. User does not have push access to the project. They can't push to
        //    their own PR and it isn't going to be useful.
        filters: [
            '@.pull_request.head.user.login == @.pull_request.base.user.login',
            '@.pull_request.user.type != "Bot"',
            '!@.has_push_access',
        ],
        commentBody: `
      Thanks for your submission.
      It appears that you've created a pull request using one of our repository's branches. Since this is
      almost always a mistake, we're going to go ahead and close this. If it was intentional, please
      let us know what you were intending and we can see about reopening it.
      Thanks again!
      `,
        addLabel: true,
        labelName: 'invalid',
        labelColor: 'e6e6e6',
        enabled: true,
    },
    blocklist: [],
};

export async function getConfig(
    octokit: InstanceType<typeof ProbotOctokit>,
    owner: string,
    repo: string,
): Promise<UmbrelBotConfig> {
    const userConfig: UmbrelBotConfig =
        (
            await octokit.config.get({
                owner,
                repo,
                path: '.github/UmbrelBot.yml',
            })
        ).config || {};
    const newConfig: UmbrelBotDefaultConfig = {
        ...defaultConfig,
        ...(<UmbrelBotDefaultConfig>userConfig),
    };
    if (userConfig !== {} && userConfig.version && userConfig.version !== configVersion) {
        return defaultConfig;
    }
    return newConfig;
}
