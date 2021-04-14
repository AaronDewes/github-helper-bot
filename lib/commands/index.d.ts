import { Context } from 'probot';
export default function handleCommand(cmd: string, args: string, context: Context, isPR: boolean): Promise<void>;
