# Pull Request Updater

![Update Pull Request](https://github.com/bmcooley/pr-update-action/workflows/Update%20Pull%20Request/badge.svg)
[![Release](https://img.shields.io/github/release/tzkhan/pr-update-action.svg)](https://github.com/bmcooley/pr-update-action/releases/latest)

This is a GitHub Action that updates a pull request with information extracted from branch name. The branch could be either base or head branch or both. The pull request title and body can either be prefixed, suffixed or replaced.

## Usage

Create a workflow yaml file (for e.g. `.github/workflows/update-pr.yml`). See [Creating a Workflow file](https://docs.github.com/en/free-pro-team@latest/actions/learn-github-actions/introduction-to-github-actions#create-an-example-workflow).

### Inputs

#### Required
- `repo-token`: secret token to allow making calls to GitHub's rest API (for e.g. `${{ secrets.GITHUB_TOKEN }}`)

#### Optional
- `base-branch-regex-arr`: array of regex to match text from the base branch name
- `head-branch-regex-arr`: array of regex to match text from the head branch name
- `title-template`: text template to update title with
- `title-update-action`: whether to prefix or suffix or replace title with title-template (default: `prefix`)
- `title-insert-space`: whether to insert a space between title and its prefix or suffix (default: `true`)
- `body-template`: text template to update body with
- `body-update-action`: whether to prefix or replace body with body-template (default: `prefix`)
- `body-newline-count`: number of newlines to separate body and its prefix or suffix (default: `2`)

#### Notes:

- Value for at least one of `base-branch-regex-arr` or `head-branch-regex-arr` should be provided, otherwise the action will return an error. The value should be an array of [Javascript regular expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions).
- `title-template` and `body-template` can contain any of the following tokens (can be repeated if required, i should be replaced with the corresponding index in the provided regex array)  which will be replaced by the matched text from branch name:
  - `%base[i]%`
  - `%head[i]%`
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
    - uses: bmcooley/pr-update-action@v2
      with:
        repo-token: "${{ secrets.GITHUB_TOKEN }}"
        base-branch-regex: ['[a-z\d-_.\\/]+']
        head-branch-regex: ['foo-\d+']
        title-template: '[%head[0]%] '
        body-template: |
          Merging into '%base[0]]%'
          [Link to %head[0]%](https://url/to/browse/ticket/%head[0]%)
        body-update-action: 'suffix'
        body-uppercase-base-match: false
```

produces this effect... :point_down:

#### before:
![pr before](img/pr-before.png)

#### after:
![pr after](img/pr-after.png)
