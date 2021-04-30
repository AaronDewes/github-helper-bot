# UmbrelBot ducomentation

The UmbrelBot provides a few useful tools to make development on GitHub faster and easier.

In the current version, `0.2.1`, it provides the following features:

#### Automated actions

- Automatically close pull requests that are opened from repos the PR author doesn't have push permissions on.
- Automatically build pull requests that are opened after a specific amount of time.
- Edit comments that contain a URL to show a brief description of the page the URL leads too.

#### Commands

- `/help`: Displays a list of available commands
- `/label`: This adds a label to the current PR/issue.
- `/remind`: Remind someone of something at a specific time. Example: `/remind [who] [what] [when]`. Who can either be "me" or any GitHub user (like @octocat).
- `/version`: Outputs the current version of this bot.
- `/appcheck`: Check if all apps used in getumbrel/umbrel are up-to-date.
