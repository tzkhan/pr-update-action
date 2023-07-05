import * as core from '@actions/core';
import {RequestError} from '@octokit/types';

export function getInputs() {
  return {
    token: core.getInput('repo-token', {required: true}),
    title: core.getInput('title'),
    titlePrefix: core.getInput('title-prefix'),
    titleSuffix: core.getInput('title-suffix'),
    body: core.getMultilineInput('body'),
    bodyPrefix: core.getMultilineInput('body-prefix'),
    bodySuffix: core.getMultilineInput('body-suffix'),
    bodyConcatNewLine: core.getBooleanInput('body-concat-new-line'),
  };
}

export function updateTitle(
  inputs: ReturnType<typeof getInputs>,
  prTitle: string
): string | undefined {
  const {title, titlePrefix, titleSuffix} = inputs;
  core.info(`Current PR title: ${prTitle}`);

  if (title || titlePrefix || titleSuffix) {
    const newTitle = [titlePrefix, title || prTitle, titleSuffix]
      .filter(Boolean)
      .join(' ');
    core.info(`New title: ${newTitle}`);
    core.setOutput('new-title', newTitle);
    return newTitle;
  }

  core.warning('No updates were made to PR title');
}

export function updateBody(
  inputs: ReturnType<typeof getInputs>,
  prBody: string
): string | undefined {
  const {body, bodyPrefix, bodySuffix, bodyConcatNewLine} = inputs;
  const concatStrategy = bodyConcatNewLine ? '\n' : ' ';
  core.info(`Current PR body: ${prBody}`);

  if (body || bodyPrefix || bodySuffix) {
    const newBody = [bodyPrefix, body || prBody, bodySuffix]
      .filter(Boolean)
      .join(concatStrategy);
    core.info(`New body: ${newBody}`);
    core.setOutput('new-body', newBody);
    return newBody;
  }

  core.warning('No updates were made to PR body');
}

export function isRequestError(error: unknown): error is RequestError {
  return (
    typeof error === 'object' && error !== null && 'documentation_url' in error
  );
}
