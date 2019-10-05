# Pull Request Updater

This is a GitHub Action that updates a pull request with information extracted from branch name.

## Usage

### Create Workflow

Create a workflow yaml file (eg: `.github/workflows/update-pr.yml` see [Creating a Workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file)):

```
name: "Update Pull Request"

on: pull_request

jobs:
  update_pr:
    runs-on: ubuntu-latest
    steps:
    - uses: tzkhan/pr-update-action@v1
      with:
        repo-token: "${{ secrets.GITHUB_TOKEN }}"                   # required - allows the action to make calls to GitHub's rest API
        branch-regex: 'PROJECT-\d+'                                 # required - regex to match text from the head branch name
        title-template: '[%branch%]'                                # optional - text template to prefix title
        body-template: '[%branch%](https://browse/ticket/%branch%)' # optional - text template to prefix body
```

`body-template` can be set to a GitHub secret if necessary to avoid leaking sensitive data in the URLs for instance. `body-template: ${{ secrets.PR_BODY_PREFIX_TEMPLATE }}`

_Note: template values must contain the `%branch%` token (can occur multiple times) so that it can be replaced with the matched text from the branch name._