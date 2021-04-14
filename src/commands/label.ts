
import { Context } from "probot";
import { addLabel, labelExists } from "../helpers";

export default class Command {
    name = "label";
    static helptext() {
        return "This adds a label to the current PR/issue.";
    } 
    static run(context: Context, args: string, _isPR: boolean) {
        if(labelExists(context, args)) {
          addLabel(context, "args", "");
        } else {
          context.octokit.issues.createComment({...context.issue(), body: `This label could not be found.` });
        }
    }
}