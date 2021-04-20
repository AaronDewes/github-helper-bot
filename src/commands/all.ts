import appcheck from './appcheck';
import build from './build';
import label from './label';
import remind from './remind';
import version from './version';
import Command from './command';

const commands: Record<string, typeof Command> = {
    appcheck,
    build,
    label,
    remind,
    version,
};

export default commands;
