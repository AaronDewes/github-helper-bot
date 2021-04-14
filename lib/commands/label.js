"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../helpers");
class Command {
    constructor() {
        this.name = "label";
    }
    static helptext() {
        return "This adds a label to the current PR/issue.";
    }
    static run(context, args, _isPR) {
        if (helpers_1.labelExists(context, args)) {
            helpers_1.addLabel(context, "args", "");
        }
        else {
            context.octokit.issues.createComment({ ...context.issue(), body: `This label could not be found.` });
        }
    }
}
exports.default = Command;
//# sourceMappingURL=label.js.map