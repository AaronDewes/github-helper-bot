## How to configure CitadelBot

This bot is configured in one of your repos, but changes apply to all of them.

To configure the bot, create a file `.github/CitadelBot.yml` with the following content (change it to fit your needs):

```yaml
version: 1
invalidPRConfig:
        # true if invalid PR detection should be enabled
        enabled: true
        # Filter explanation:
        # 1. PR is from a branch in the local repo.
        # 2. User is not a bot.  If the user is a bot then it was invited to open
        #    pull requests and isn't the kind of mistake this bot was intended to
        #    detect.
        # 3. User does not have push access to the project. They can't push to
        #    their own PR and it isn't going to be useful.
        filters: [
            '@.pull_request.head.user.login == @.pull_request.base.user.login',
            '@.pull_request.user.type != "Bot"',
            '!@.has_push_access'
        ]
        # What to comment if a PR is invalid
        commentBody: >
            Thanks for your submission. 
            It appears that you've created a pull request using one of our repository's branches. Since this is
            almost always a mistake, we're going to go ahead and close this. If it was intentional, please
            let us know what you were intending and we can see about reopening it.
            Thanks again!
        # Set this to true if you want to add a label to invalid PRs
        addLabel: true,
        # If addlabel is true, set this to the name the label should have
        labelName: 'invalid'
        # If addlabel is true, set this to the name the label should have
        labelColor: 'e6e6e6'
    # Which users shouldn't be allowed to use the bot
    blocklist: []
```
