linkedin-marketing-workflow
===========================

*A simple github action to post on linkedin everytime your update your RSS Feed !*

![post_demo](https://raw.githubusercontent.com/p4p1/linkedin-marketing-workflow/main/assets/screenshot.png)

[How This Was Built](https://leosmith.xyz/blog/github-linkedin-action.html)

## How to use:

1. Star this repo and give me a follow :)
2. Create a .github/workflows directory in a repo relevant to your blog (it's repo indepentant but it needs one)
3. Create a file named linkedin-marketing-workflow.yml inside of that folder
4. Place the following code inside of the previously created file:
```yaml
name: Linkedin Marketing Workflow

on:
  schedule:
    # Make it run every 24 hour
    - cron: '0 0 * * *'
  workflow_dispatch:
jobs:
  linkedin-marketing-workflow:
    name: Does a linked in post using your rss feed
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: ./
        with:
          # Replace with your rss feed link
          rss_feed: "https://leosmith.xyz/rss/blog.xml"
          LINKEDIN_SECRET: ${{secrets.LINKEDIN_SECRET}}
          GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
```
5. Create a assets/ folder inside of the repo
6. Get a linkedin API token and store it in the repo's secrets
7. Run the action

## Variables:
name               | description                               | default                       | required
------------------ | ----------------------------------------- | ----------------------------- | --------
FILE_PATH          | Path of the text file to store last post  | ./assets/lastposted.txt       | false
LINKEDIN_SECRET    | Your linkedin secret token                |                               | true
GITHUB_TOKEN       | Your github secret token                  |                               | true
rss_feed           | RSS feed link                             |                               | true
commiter_username  | Username of commiting bot                 | lkn-p4p1-bot                  | false
commiter_email     | Email of commiting bot                    | p4p1@lkn.bot                  | false
commit_message     | Commit message                            | LinkedIn Marketing commit bot | false
