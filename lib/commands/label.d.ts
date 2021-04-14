import { Context } from "probot";
export default class Command {
    name: string;
    static helptext(): string;
    static run(context: Context, args: string, _isPR: boolean): void;
}
