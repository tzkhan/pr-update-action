const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const textTokens = {
      branch: '%branch%'
    }

    const token = core.getInput('repo-token', {required: true});

    const branchRegex = core.getInput('branch-regex', {required: true});
    core.debug(`branchRegex: ${branchRegex}`);

    const prefixTemplate = core.getInput('prefix-template', {required: true});
    core.debug(`prefixTemplate: ${prefixTemplate}`);

    const branch = github.context.payload.pull_request.head.ref.toLowerCase();
    core.debug(`branch: ${branch}`);

    const matches = branch.match(new RegExp(branchRegex));
    if (!matches) {
      core.setFailed('Branch name does not match given regex');
      return;
    }

    core.info(`Matched branch text: ${matches[0]}`);

    const prefix = prefixTemplate.replace(textTokens.branch, matches[0]);
    core.debug(`prefix: ${prefix}`);

    const title = github.context.payload.pull_request.title;
    core.debug(`title: ${title}`);

    if(title.toLowerCase().startsWith(prefix.toLowerCase())) {
      core.warn('PR title is prefixed correctly already - no updates made');
      return;
    }

    const newTitle = prefix.toUpperCase().concat(' ', title);
    core.debug(`newTitle: ${newTitle}`);

    const client = new github.GitHub(token);
    const response = await client.pulls.update({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: github.context.payload.pull_request.number,
      title: newTitle,
    });

    core.info(`response: ${response.status}`);
    if(response.status !== 200) {
      core.error('Updating the pull request has failed');
    }
  }
  catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

run()
