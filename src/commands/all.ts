import appcheck from './appcheck';
import build from './build';
import label from './label';
import remind from './remind';
import version from './version';
import { BaseCommand } from './baseCommand';

const commands: Record<string, typeof BaseCommand> = {
    appcheck,
    build,
    label,
    remind,
    version,
};

export default commands;
