# Pull Request Updater

![Update Pull Request](https://github.com/tzkhan/pr-update-action/workflows/Update%20Pull%20Request/badge.svg)
[![Release](https://img.shields.io/github/release/tzkhan/pr-update-action.svg)](https://github.com/tzkhan/pr-update-action/releases/latest)

This is a GitHub Action that updates a pull request with information extracted from branch name. The branch could be either base or head branch or both. The pull request title and body can either be prefixed, suffixed or replaced.

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
    - uses: tzkhan/pr-update-action@v2
      with:
        repo-token: '${{ secrets.GITHUB_TOKEN }}'   # required - allows the action to make calls to GitHub's rest API
        base-branch-regex: ''                       # optional - regex to match text from the base branch name
        head-branch-regex: ''                       # optional - regex to match text from the head branch name
        lowercase-branch: true                      # optional - whether to lowercase branch name before matching
        title-template: ''                          # optional - text template to update title with
        title-update-action: 'prefix'               # optional - whether to prefix or suffix or replace title with title-template
        title-uppercase-base-match: true            # optional - whether to uppercase matched text from base branch in title
        title-uppercase-head-match: true            # optional - whether to uppercase matched text from head branch in title
        body-template: ''                           # optional - text template to update body with
        body-update-action: 'prefix'                # optional - whether to prefix or replace body with body-template
        body-newline-count: 2                       # optional - number of newlines to separate body and its prefix or suffix
        body-uppercase-base-match: true             # optional - whether to uppercase matched text from base branch in body
        body-uppercase-head-match: true             # optional - whether to uppercase matched text from head branch in body
```

#### Notes:

- Value for at least one of `base-branch-regex` or `head-branch-regex` should be provided, otherwise the action will return an error. The value should be a [Javascript regular expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions).
- `title-template` and `body-template` can contain any of the following tokens (can be repeated if required) which will be replaced by the matched text from branch name:
 - `%basebranch%`
 - `%headbranch%`
- `title-update-action` and `body-update-action` can be set to one of the following values:
 - `prefix`
 - `suffix`
 - `replace`
- The following outputs are available:
 - `baseMatch`: Matched text from base branch if any
 - `headMatch`: Matched text from head branch if any
 - `titleUpdated`: Whether the PR title was updated
 - `bodyUpdated`: Whether the PR body was updated

**Tip**: `body-template` can be set to a GitHub secret if necessary to avoid leaking sensitive data. `body-template: ${{ secrets.PR_BODY_PREFIX_TEMPLATE }}`

## Example

So the following yaml

```
name: "Update Pull Request"
on: pull_request

jobs:
  pr_update_text:
    runs-on: ubuntu-latest
    steps:
    - uses: tzkhan/pr-update-action@v2
      with:
        repo-token: "${{ secrets.GITHUB_TOKEN }}"
        base-branch-regex: '[a-z\\d-_.\\/]+'
        head-branch-regex: 'foo-\d+'
        title-template: '[%headbranch%] '
        title-update-action: 'prefix'
        body-template: |
          Merging into '%basebranch%'
          [Link to %headbranch%](https://url/to/browse/ticket/%headbranch%)
        body-update-action: 'suffix'
        body-newline-count: 2
```

produces this effect... :point_down:

#### before:
![pr before](img/pr-before.png)

#### after:
![pr after](img/pr-after.png)
