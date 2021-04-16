"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsdom_1 = require("jsdom");
function getLinks(html) {
    const links = [];
    const frag = jsdom_1.JSDOM.fragment(html);
    const isEmail = !!frag.querySelectorAll('.email-fragment').length;
    if (!isEmail) {
        frag.querySelectorAll('a').forEach((a) => {
            if (a.href === a.innerHTML || a.href === `${a.innerHTML}/`) {
                links.push(a.href);
            }
        });
    }
    return Array.from(new Set(links));
}
exports.default = getLinks;
