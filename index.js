const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const token = core.getInput('repo-token', {required: true});
    const branchRegex = core.getInput('branch-regex', {required: true});
    const removeBranchPrefix = core.getInput('remove-branch-prefix');

    const client = new github.GitHub(token);

    core.info(`client info: ${client.info}`);
    core.info(`branchRegex: ${branchRegex}`);
    core.info(`removeBranchPrefix: ${removeBranchPrefix}`);
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
