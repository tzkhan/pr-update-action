# Pull Request Updater

![Update Pull Request](https://github.com/tzkhan/pr-update-action/workflows/Update%20Pull%20Request/badge.svg)
[![Release](https://img.shields.io/github/release/tzkhan/pr-update-action.svg)](https://github.com/tzkhan/pr-update-action/releases/latest)

This is a GitHub Action that updates a pull request with information extracted from branch name. The branch could be either base or head branch or both. The pull request title and body can either be prefixed, suffixed or replaced.

## Usage

Create a workflow yaml file (for e.g. `.github/workflows/update-pr.yml`). See [Creating a Workflow file](https://docs.github.com/en/free-pro-team@latest/actions/learn-github-actions/introduction-to-github-actions#create-an-example-workflow).

### Inputs

#### Required
- `repo-token`: secret token to allow making calls to GitHub's rest API (for e.g. `${{ secrets.GITHUB_TOKEN }}`)

#### Optional
- `base-branch-regex`: regex to match text from the base branch name
- `head-branch-regex`: regex to match text from the head branch name
- `lowercase-branch`: whether to lowercase branch name before matching (default: `true`)
- `title-template`: text template to update title with
- `title-update-action`: whether to prefix or suffix or replace title with title-template (default: `prefix`)
- `title-insert-space`: whether to insert a space between title and its prefix or suffix (default: `true`)
- `title-uppercase-base-match`: whether to uppercase matched text from base branch in title (default: `true`)
- `title-uppercase-head-match`: whether to uppercase matched text from head branch in title (default: `true`)
- `body-template`: text template to update body with
- `body-update-action`: whether to prefix or replace body with body-template (default: `prefix`)
- `body-newline-count`: number of newlines to separate body and its prefix or suffix (default: `2`)
- `body-uppercase-base-match`: whether to uppercase matched text from base branch in body (default: `true`)
- `body-uppercase-head-match`: whether to uppercase matched text from head branch in body (default: `true`)

#### Notes:

- Value for at least one of `base-branch-regex` or `head-branch-regex` should be provided, otherwise the action will return an error. The value should be a [Javascript regular expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions).
- `title-template` and `body-template` can contain any of the following tokens (can be repeated if required) which will be replaced by the matched text from branch name:
  - `%basebranch%`
  - `%headbranch%`
- `title-update-action` and `body-update-action` can be set to one of the following values:
  - `prefix`
  - `suffix`
  - `replace`
- `body-template` can be set to a GitHub secret if necessary to avoid leaking sensitive data. `body-template: ${{ secrets.PR_BODY_TEMPLATE }}`

### Outputs

- `baseMatch`: matched text from base branch if any
- `headMatch`: matched text from head branch if any
- `titleUpdated`: whether the PR title was updated
- `bodyUpdated`: whether the PR body was updated

## Example

So the following yaml

```
name: "Update Pull Request"
on: pull_request

jobs:
  update_pr:
    runs-on: ubuntu-latest
    steps:
    - uses: tzkhan/pr-update-action@v2
      with:
        repo-token: "${{ secrets.GITHUB_TOKEN }}"
        base-branch-regex: '[a-z\d-_.\\/]+'
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
