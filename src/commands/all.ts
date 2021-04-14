import build from './build';
import label from './label';
import remind from './remind';

const commands: Record<string, any> = {
    build,
    label,
    remind
};

export default commands;