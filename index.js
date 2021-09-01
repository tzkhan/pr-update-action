const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const baseTokenRegex = new RegExp('%basebranch%', "g");
    const headTokenRegex = new RegExp('%headbranch%', "g");

    const inputs = {
      token: core.getInput('repo-token', {required: true}),
      owner: core.getInput('repo') === '' ? github.context.repo.owner : core.getInput('repo').split('/')[0],
      repo: core.getInput('repo') === '' ? github.context.repo.repo : core.getInput('repo').split('/')[1],
      number: core.getInput('number') === '' ? github.context.payload.pull_request.number : parseInt(core.getInput('number')),
      baseBranchRegex: core.getInput('base-branch-regex'),
      headBranchRegex: core.getInput('head-branch-regex'),
      lowercaseBranch: (core.getInput('lowercase-branch').toLowerCase() === 'true'),
      titleTemplate: core.getInput('title-template'),
      titleUpdateAction: core.getInput('title-update-action').toLowerCase(),
      titleInsertSpace: (core.getInput('title-insert-space').toLowerCase() === 'true'),
      titleUppercaseBaseMatch: (core.getInput('title-uppercase-base-match').toLowerCase() === 'true'),
      titleUppercaseHeadMatch: (core.getInput('title-uppercase-head-match').toLowerCase() === 'true'),
      bodyTemplate: core.getInput('body-template'),
      bodyUpdateAction: core.getInput('body-update-action').toLowerCase(),
      bodyNewlineCount: parseInt(core.getInput('body-newline-count')),
      bodyUppercaseBaseMatch: (core.getInput('body-uppercase-base-match').toLowerCase() === 'true'),
      bodyUppercaseHeadMatch: (core.getInput('body-uppercase-head-match').toLowerCase() === 'true'),
    }

    const octokit = github.getOctokit(inputs.token);

    const baseBranchRegex = inputs.baseBranchRegex.trim();
    const matchBaseBranch = baseBranchRegex.length > 0;

    const headBranchRegex = inputs.headBranchRegex.trim();
    const matchHeadBranch = headBranchRegex.length > 0;

    if (!matchBaseBranch && !matchHeadBranch) {
      core.setFailed('No branch regex values have been specified');
      return;
    }

    const matches = {
      baseMatch: '',
      headMatch: '',
    }

    const getPullRequestRequest = {
      owner: inputs.owner,
      repo: inputs.repo,
      pull_number: inputs.number,
    };
    const getPullRequestResponse = await octokit.pulls.get(getPullRequestRequest);

    if (getPullRequestResponse.status !== 200) {
      core.error(`Get pull request ${inputs.number} from repo ${inputs.owner}/${inputs.repo} has failed`);
    }

    if (matchBaseBranch) {

      const baseBranchName = getPullRequestResponse.data.base.ref;
      const baseBranch = inputs.lowercaseBranch ? baseBranchName.toLowerCase() : baseBranchName;
      core.info(`Base branch: ${baseBranch}`);

      const baseMatches = baseBranch.match(new RegExp(baseBranchRegex));
      if (!baseMatches) {
        core.setFailed('Base branch name does not match given regex');
        return;
      }

      matches.baseMatch = baseMatches[0];
      core.info(`Matched base branch text: ${matches.baseMatch}`);

      core.setOutput('baseMatch', matches.baseMatch);
    }

    if (matchHeadBranch) {
      const headBranchName = getPullRequestResponse.data.head.ref;
      const headBranch = inputs.lowercaseBranch ? headBranchName.toLowerCase() : headBranchName;
      core.info(`Head branch: ${headBranch}`);

      const headMatches = headBranch.match(new RegExp(headBranchRegex));
      if (!headMatches) {
        core.setFailed('Head branch name does not match given regex');
        return;
      }

      matches.headMatch = headMatches[0];
      core.info(`Matched head branch text: ${matches.headMatch}`);

      core.setOutput('headMatch', matches.headMatch);
    }

    const request = {
      owner: inputs.owner,
      repo: inputs.repo,
      pull_number: inputs.number,
    }

    const upperCase = (upperCase, text) => upperCase ? text.toUpperCase() : text;

    const title = getPullRequestResponse.data.title || '';
    const processedTitleText = inputs.titleTemplate
      .replace(baseTokenRegex, upperCase(inputs.titleUppercaseBaseMatch, matches.baseMatch))
      .replace(headTokenRegex, upperCase(inputs.titleUppercaseHeadMatch, matches.headMatch));
    core.info(`Processed title text: ${processedTitleText}`);

    const updateTitle = ({
      prefix: !title.toLowerCase().startsWith(processedTitleText.toLowerCase()),
      suffix: !title.toLowerCase().endsWith(processedTitleText.toLowerCase()),
      replace: title.toLowerCase() !== processedTitleText.toLowerCase(),
    })[inputs.titleUpdateAction] || false;

    core.setOutput('titleUpdated', updateTitle.toString());

    if (updateTitle) {
      request.title = ({
        prefix: processedTitleText.concat(inputs.titleInsertSpace ? ' ': '', title),
        suffix: title.concat(inputs.titleInsertSpace ? ' ': '', processedTitleText),
        replace: processedTitleText,
        remove: title.replace(processedTitleText, ''),
      })[inputs.titleUpdateAction];
      core.info(`New title: ${request.title}`);
    } else {
      core.warning('No updates were made to PR title');
    }

    const body = getPullRequestResponse.data.body || '';
    const processedBodyText = inputs.bodyTemplate
      .replace(baseTokenRegex, upperCase(inputs.bodyUppercaseBaseMatch, matches.baseMatch))
      .replace(headTokenRegex, upperCase(inputs.bodyUppercaseHeadMatch, matches.headMatch));
    core.info(`Processed body text: ${processedBodyText}`);

    const updateBody = ({
      prefix: !body.toLowerCase().startsWith(processedBodyText.toLowerCase()),
      suffix: !body.toLowerCase().endsWith(processedBodyText.toLowerCase()),
      replace: body.toLowerCase() !== processedBodyText.toLowerCase(),
    })[inputs.bodyUpdateAction] || false;

    core.setOutput('bodyUpdated', updateBody.toString());

    if (updateBody) {
      request.body = ({
        prefix: processedBodyText.concat('\n'.repeat(inputs.bodyNewlineCount), body),
        suffix: body.concat('\n'.repeat(inputs.bodyNewlineCount), processedBodyText),
        replace: processedBodyText,
        remove: body.replace(processedBodyText, ''),
      })[inputs.bodyUpdateAction];
      core.debug(`New body: ${request.body}`);
    } else {
      core.warning('No updates were made to PR body');
    }

    if (!updateTitle && !updateBody) {
      return;
    }

    const response = await octokit.pulls.update(request);

    core.info(`Response: ${response.status}`);
    if (response.status !== 200) {
      core.error('Updating the pull request has failed');
    }
  }
  catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

run()
