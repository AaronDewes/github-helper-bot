"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unfurl_js_1 = require("unfurl.js");
async function unfurlToAttachment(url) {
    const data = await (0, unfurl_js_1.unfurl)(url);
    const description = data.open_graph.description || data.twitter_card.description;
    const authorName = data.oEmbed?.author_name;
    const title = data.open_graph.title.trim() || data.twitter_card.title?.trim();
    const titleLink = data.open_graph.url || url;
    const thumbUrl = data.open_graph.images && data.open_graph.images[0]?.url;
    return {
        author_name: authorName,
        title: title,
        title_link: titleLink,
        text: description,
        thumb_url: thumbUrl,
    };
}
exports.default = unfurlToAttachment;
