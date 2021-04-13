"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const unfurl_to_attachment_1 = __importDefault(require("./unfurl-to-attachment"));
const probot_attachments_1 = __importDefault(require("probot-attachments"));
const get_links_1 = __importDefault(require("./get-links"));
async function unfurl(context, html) {
    const links = get_links_1.default(html);
    if (links.length > 0) {
        const unfurls = await Promise.all(links.map(link => unfurl_to_attachment_1.default(link)));
        unfurls.forEach((unfurl => {
            return probot_attachments_1.default(context).add(unfurl);
        }));
    }
}
exports.default = unfurl;
//# sourceMappingURL=unfurl.js.map