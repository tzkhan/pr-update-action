# Pull Request Updater

![Main](https://github.com/kognity/pr-update-action/actions/workflows/main.yml/badge.svg)
![Check dist/](https://github.com/kognity/pr-update-action/actions/workflows/check-dist.yml/badge.svg)
![CodeQL](https://github.com/kognity/pr-update-action/actions/workflows/codeql-analysis.yml/badge.svg)
[![Release](https://img.shields.io/github/release/kognity/pr-update-action.svg)](https://github.com/kognity/pr-update-action/releases/latest)

This is a GitHub Action that updates a pull request.

## Usage

Create a workflow yaml file (for e.g. `.github/workflows/update-pr.yml`). See [Creating a Workflow file](https://docs.github.com/en/free-pro-team@latest/actions/learn-github-actions/introduction-to-github-actions#create-an-example-workflow).

### Inputs

#### Required
- `repo-token`: secret token to allow making calls to GitHub's rest API (for e.g. `${{ secrets.GITHUB_TOKEN }}`)

#### Optional
- `title`: Title replacement for the PR
- `title-prefix`: Text to be prepended to the PR title
- `title-suffix`: Text to be appended to the PR title
- `body`: Body replacement for the PR
- `body-prefix`: Text to be prepended to the PR body
- `body-suffix`: Text to be appended to the PR body
- `body-concat-new-line`: Flag to indicate whether to add a new line between the body prefix and suffix

### Outputs

- `new-title`: New PR title
- `new-body`: New PR body

## Example

```
name: "Update Pull Request"
on: pull_request

jobs:
  update_pr:
    runs-on: ubuntu-latest
    steps:
    - uses: kognity/pr-update-action
      with:
        repo-token: "${{ secrets.GITHUB_TOKEN }}"
        title-prefix: "[KOG-9999]"
        body-suffix: |
          My multiline body
          Another line
```

Scaffolding derived from [typescript-action](https://github.com/actions/typescript-action)
