const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const textTokens = {
      branch: '%branch%'
    }

    const token = core.getInput('repo-token', {required: true});
    console.log('Where is the console that this logs to?');
    console.log(`${token}`);

    const branchRegex = core.getInput('branch-regex', {required: true});
    core.debug(`branchRegex: ${branchRegex}`);

    const prefixTemplate = core.getInput('prefix-template', {required: true});
    core.debug(`prefixTemplate: ${prefixTemplate}`);

    const { pull_request } = github.context.payload;

    const branch = pull_request.head.ref.toLowerCase();
    core.debug(`branch: ${branch}`);

    const matches = branch.match(new RegExp(branchRegex));
    if (!matches) {
      core.setFailed('Branch name does not match given regex');
      return;
    }

    core.info(`Matched branch text: ${matches[0]}`);

    const prefix = prefixTemplate.replace(textTokens.branch, matches[0]);
    core.info(`prefix: ${prefix}`);

    const title = pull_request.title;
    core.debug(`title: ${title}`);

    if(title.toLowerCase().startsWith(prefix.toLowerCase())) {
      core.info('PR title is prefixed correctly already - no updates made');
      return;
    }

    const newTitle = prefix.toUpperCase().concat(' ', title);
    core.debug(`newTitle: ${newTitle}`);

    const client = new github.GitHub(token);
    const response = await client.pulls.update({
      owner: github.context.payload.repository.owner,
      title: newTitle,
    });

    core.info(`response: ${response}`);
  }
  catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

run()
