const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const token = core.getInput('repo-token', {required: true});
    const branchRegex = core.getInput('branch-regex', {required: true});

    core.info(`branchRegex: ${branchRegex}`);

    const client = new github.GitHub(token);

    const title = github.context.payload.pull_request.title.toLowerCase();
    core.info(`title: ${title}`);

    const branch = github.context.payload.pull_request.head.ref.toLowerCase();
    core.info(`title: ${branch}`);
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
