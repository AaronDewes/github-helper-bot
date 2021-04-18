# GitHub helper bot

A bot to make GitHub development much easier, originally developed for Umbrel.
## Sources

This bot wouldn't be possible without these amazing projects:

* [Probot](https://github.com/probot)
* [probot-unfurl](https://github.com/probot/unfurl/)
* [mistaken-pull-closer](https://github.com/probot/mistaken-pull-closer)

... And, of course, every dependency in our dependency tree.

Thanks to everyone who created or helped creating these projects!

Special thanks to [Luke Childs](https://github.com/lukechilds) who provides the server for UmbrelBot and of course provides some packages in the dependency tree (he probably does that for 99% of projects using npm).

### What this bot does

This bot can listen for PRs and push them to a seperate GitHub org for building them, remind you of something, close mistaken PRs and more.

### Current status

This code is untested and not production-ready.

### Useful tools

#### Check for Umbrel releases from CLI

- Install all dependencies using `yarn`
- Let it fetch app info: `yarn node tests/appcheck.js`

BTCPayPayServer isn't using semantic versioning and not supported because of that.
