import * as core from '@actions/core';
import * as github from '@actions/github';
import {Endpoints, RequestParameters} from '@octokit/types';
import {getInputs, updateTitle, updateBody, isRequestError} from './utils';

async function run() {
  try {
    const inputs = getInputs();
    const prTitle: string = github.context.payload.pull_request?.title ?? '';
    const prBody: string = github.context.payload.pull_request?.body ?? '';
    const newPrTitle = updateTitle(inputs, prTitle);
    const newPrBody = updateBody(inputs, prBody);
    const requestEndpoint: keyof Endpoints =
      'PATCH /repos/{owner}/{repo}/pulls/{pull_number}';
    type requestParameters = Endpoints[typeof requestEndpoint]['parameters'] &
      RequestParameters;
    const updateRequest: requestParameters = {
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: github.context.payload.pull_request?.number ?? NaN,
    };

    if (newPrTitle) updateRequest.title = newPrTitle;
    if (newPrBody) updateRequest.body = newPrBody;

    if (!newPrTitle && !newPrBody) return;

    const octokit = github.getOctokit(inputs.token);
    await octokit.request(requestEndpoint, updateRequest);
  } catch (error) {
    if (isRequestError(error)) {
      core.error(error.name);
      core.setFailed(error.name);
    }
  }
}

run();
