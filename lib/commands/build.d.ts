import { Context } from "probot";
export default class Command {
    static helptext(): string;
    static run(context: Context, _args: string, isPR: boolean): void;
}
