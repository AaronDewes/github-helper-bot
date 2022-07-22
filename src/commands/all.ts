import label from './label';
import remind from './remind';
import version from './version';
import Command from './command';

const commands: Record<string, typeof Command> = {
    label,
    remind,
    version,
};

export default commands;
