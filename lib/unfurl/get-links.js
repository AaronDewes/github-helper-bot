"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsdom_1 = require("jsdom");
function getLinks(html) {
    const links = [];
    // Parse the HTML
    const frag = jsdom_1.JSDOM.fragment(html);
    // Check if the content came from an email
    const isEmail = !!frag.querySelectorAll('.email-fragment').length;
    if (!isEmail) {
        // Find all the links
        frag.querySelectorAll('a').forEach((a) => {
            // Only unfurl raw links. GitHub also adds a trailing `/`
            if (a.href === a.innerHTML || a.href === `${a.innerHTML}/`) {
                links.push(a.href);
            }
        });
    }
    // Avoid duplicate identical links
    return Array.from(new Set(links));
}
exports.default = getLinks;
//# sourceMappingURL=get-links.js.map