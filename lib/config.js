"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = void 0;
exports.defaultConfig = {
    filters: [
        '@.pull_request.head.user.login == @.pull_request.base.user.login',
        '@.pull_request.user.type != "Bot"',
        '!@.has_push_access',
    ],
    commentBody: `
  Thanks for your submission.
  It appears that you've created a pull request using one of our repository's branches. Since this is
  almost always a mistake, we're going to go ahead and close this. If it was intentional, please
  let us know what you were intending and we can see about reopening it.
  Thanks again!
  `,
    addLabel: true,
    labelName: 'invalid',
    labelColor: 'e6e6e6',
    blocklist: [],
};
