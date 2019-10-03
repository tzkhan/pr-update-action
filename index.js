const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const textTokens = {
      branch: '%branch%'
    }

    const token = core.getInput('repo-token', {required: true});

    const branchRegex = core.getInput('branch-regex', {required: true});
    core.info(`branchRegex: ${branchRegex}`);

    const prefixTemplate = core.getInput('prefix-template', {required: true});
    core.info(`prefixTemplate: ${prefixTemplate}`);

    const { pull_request } = github.context.payload;

    const branch = pull_request.head.ref.toLowerCase();
    core.info(`title: ${branch}`);

    const matches = branch.match(new RegExp(branchRegex));
    if (!matches) {
      core.setFailed('Branch name does not match given regex');
      return;
    }

    const prefix = prefixTemplate.replace(textTokens.branch, matches[0].toUpperCase());
    core.info(`title: ${prefix}`);

    const title = pull_request.title.toLowerCase();
    core.info(`title: ${title}`);

    if(title.startsWith(prefix)) {
      core.info('PR title is prefixed correctly already - no updates made');
      return;
    }

    const newTitle = prefix.concat(title);
    core.info(`newTitle: ${newTitle}`);

    const client = new github.GitHub(token);
    const patchExists = client.pulls.patch;
    core.info(`patchExists: ${patchExists}`);
  }
  catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

run()
