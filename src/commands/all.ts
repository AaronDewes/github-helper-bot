import build from './build';
import label from './label';
import remind from './remind';
import { BaseCommand } from './baseCommand';

const commands: Record<string, typeof BaseCommand> = {
    build,
    label,
    remind,
};

export default commands;
