# Pull Request Updater

## Summary

This is a GitHub Action that updates a pull request with information extracted from the head and/or base branch name. The pull request title and body can either have the extracted information prefixed or suffixed, or have them be replaced by the information entirely.

The upstream for this action, [found here](https://github.com/tzkhan/pr-update-action), has been inactive since 2020 and the developer has no public commits since 2020. This fork will be kept active, and if I become unavailable me or someone on my behalf will archive this repo to let you know it's no longer being worked on. **This is a mostly drop-in replacement for that action - you just need to specify permissions as seen in the [example](#example)**.

## Usage

Make sure you set the permissions correctly otherwise the action won't be able to access the PR. See the example workflow file in this repo found at [`.github/workflows/update-pr.yml`](.github/workflows/update-pr.yml), or the [example section of this ReadMe](#example) to see how use this action.

### Required

```text
repo-token                  no default       secret token to allow making calls to GitHub's rest API (for e.g. `${{ secrets.GITHUB_TOKEN }}`)
```

### Optional

```text
RegEx Options
------------------
base-branch-regex           no default       regex to match text from the base branch name
head-branch-regex           no default       regex to match text from the head branch name

Internal Options
------------------
lowercase-branch            default: true    whether to make the branch name lowercase internally before matching

Title Options
------------------
title-template              no default       text to insert into/replace the title with. You can use whatever text you like, including any GitHub supported markdown, along with the following tokens: `%basebranch%` | `%headbranch%`
title-update-action         default: prefix  whether to prefix, suffix or replace title with the `title-template`
title-insert-space          default: true    whether to insert a space between title and its prefix or suffix
title-uppercase-base-match  default: true    whether to make the matched text from the base branch uppercase in the title
title-uppercase-head-match  default: true    whether to make the matched text from the head branch uppercase in the title

Body Options
------------------
body-template               no default       text to insert into/replace the body with. You can use whatever text you like, including any GitHub supported markdown, along with the following tokens: `%basebranch%` | `%headbranch%`
body-update-action          default: prefix  whether to prefix, suffix or replace body with `body-template`
body-newline-count          default: 2       number of newlines to separate the body and its prefix or suffix
body-uppercase-base-match   default: true    whether to make the matched text from the base branch uppercase in the body
body-uppercase-head-match   default: true    whether to make the matched text from the head branch uppercase in the body
```

## Notes

- A value for at least one of `base-branch-regex` or `head-branch-regex` should be provided, otherwise the action will return an error. The value should be a [JavaScript Regular Expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions).
- `title-template` and `body-template` can contain any text that you like, along with any of the following tokens (which can be repeated if required) which will be replaced by the matched text from branch name:
  - `%basebranch%`
  - `%headbranch%`
- `title-update-action` and `body-update-action` can be set to one of the following values:
  - `prefix`
  - `suffix`
  - `replace`
- `body-template` can be set to a GitHub secret if necessary to avoid leaking sensitive data. `body-template: ${{ secrets.PR_BODY_TEMPLATE }}`

## Outputs

```text
baseMatch      matched text from base branch if any
headMatch      matched text from head branch if any
titleUpdated   whether the PR title was updated
bodyUpdated    whether the PR body was updated
```

## Building

[ncc](https://github.com/vercel/ncc#installation) is needed

Run `npm run build` in the root directory of this project

## Example

This sample `yaml`:

```yaml
name: "Update Pull Request"
on: pull_request

permissions:
  contents: read
  pull-requests: write

jobs:
  update_pr:
    runs-on: ubuntu-latest
    steps:
      - uses: the-wright-jamie/update-pr-info-action@v1
        with:
          repo-token: "${{ secrets.GITHUB_TOKEN }}"
          base-branch-regex: '[a-z\d-_.\\/]+'
          head-branch-regex: 'go-\d+'
          title-template: "[%headbranch%]"
          body-template: |
            Merging into '%basebranch%'
            [Link to ticket: %headbranch%](https://example.com/%headbranch%)
          body-update-action: "suffix"
```

produces the following effect... :point_down:

### Before

![pr before](img/pr-before.png)

### After

![pr after](img/pr-after.png)
