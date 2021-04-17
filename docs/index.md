# UmbrelBot ducomentation

The UmbrelBot provides a few useful tools to make development on GitHub faster and easier.

In the current version, `0.0.1-alpha.3`, it provides the following features:

#### Automated actions

- Automatically close pull requests that are opened from repos the PR author doesn't have push permissions on.
- Automatically build pull requests that are opened after a specific amount of time.
- Edit comments that contain a URL to show a brief description of the page the URL leads too.

#### Commands

- `/help`: Displays a list of available commands
- `/build`: This command builds the current PR branch. Builds normally happen automatically, but you can use this command if you don't want to wait.
- `/label`: This adds a label to the current PR/issue.
- `/remind`: Remind someone of something at a specific time. Example: `/remind [who] [what] [when]`. Who can either be "me" or any GitHub user (like @octocat).
- `/version`: Outputs the current version of this bot.
