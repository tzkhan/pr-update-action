const core = require('@actions/core');
const github = require('@actions/github');


async function run() {
  try {
    const baseTokenRegex = (i) => new RegExp(`%base[${i}]%`, "g");
    const headTokenRegex = (i) => new RegExp(`%head[${i}]%`, "g");

    const inputs = {
      token: core.getInput('repo-token', {required: true}),
      baseBranchRegexArr: JSON.parse(core.getInput('base-branch-regex-arr').trim()),
      headBranchRegexArr: JSON.parse(core.getInput('head-branch-regex-arr').trim()),
      titleTemplate: core.getInput('title-template'),
      titleUpdateAction: core.getInput('title-update-action').toLowerCase(),
      titleInsertSpace: (core.getInput('title-insert-space').toLowerCase() === 'true'),
      bodyTemplate: core.getInput('body-template'),
      bodyUpdateAction: core.getInput('body-update-action').toLowerCase(),
      bodyNewlineCount: parseInt(core.getInput('body-newline-count') || 2),
    }

    const { baseBranchRegexArr, headBranchRegexArr } = inputs;
    const matchBaseBranch = Array.isArray(baseBranchRegexArr) && baseBranchRegexArr.length > 0;
    const matchHeadBranch = Array.isArray(headBranchRegexArr) && headBranchRegexArr.length > 0;

    if (!matchBaseBranch && !matchHeadBranch) {
      core.setFailed('No branch regex values have been specified');
      return;
    }

    const matches = {
      base: [],
      head: [],
    }

    let matchFail;

    if (matchBaseBranch) {
      const baseBranch = github.context.payload.pull_request.base.ref;
      core.info(`Base branch: ${baseBranch}`);

      matches.base = baseBranchRegexArr.map(regex => {
        const match = baseBranch.match(new RegExp(regex))
        if (!match) {
          core.setFailed(`Base branch name does not match given regex: ${regex}`);
          matchFail = true;
        }        
      });

      if (matchFail) return;

      core.info(`Matched base branch text: ${matches.base}`);

      core.setOutput('baseMatch', matches.base);
    }

    if (matchHeadBranch) {
      const headBranch = github.context.payload.pull_request.head.ref;
      core.info(`Head branch: ${headBranch}`);

      matches.head = headBranchRegexArr.map(regex => {
        const match = headBranch.match(new RegExp(regex))
        if (!match) {
          core.setFailed(`Head branch name does not match given regex: ${regex}`);
          matchFail = true;
        }        
      });


      if (matchFail) return;

      core.info(`Matched head branch text: ${matches.head}`);

      core.setOutput('headMatch', matches.head);
    }

    const request = {
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: github.context.payload.pull_request.number,
    }

    const upperCase = (upperCase, text) => upperCase ? text.toUpperCase() : text;

    const title = github.context.payload.pull_request.title || '';
    let processedTitleText = inputs.titleTemplate;
    matches.base.forEach((match, i) => processedTitleText = processedTitleText.replace(baseTokenRegex(i), match));
    matches.head.forEach((match, i) => processedTitleText = processedTitleText.replace(headTokenRegex(i), match));
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
      })[inputs.titleUpdateAction];
      core.info(`New title: ${request.title}`);
    } else {
      core.warning('No updates were made to PR title');
    }

    const body = github.context.payload.pull_request.body || '';
    let processedBodyText = inputs.bodyTemplate;
    matches.base.forEach((match, i) => processedBodyText = processedBodyText.replace(baseTokenRegex(i), match));
    matches.head.forEach((match, i) => processedBodyText = processedBodyText.replace(headTokenRegex(i), match));
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
      })[inputs.bodyUpdateAction];
      core.debug(`New body: ${request.body}`);
    } else {
      core.warning('No updates were made to PR body');
    }

    if (!updateTitle && !updateBody) {
      return;
    }

    const octokit = github.getOctokit(inputs.token);
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
