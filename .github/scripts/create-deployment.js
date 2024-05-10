// @ts-check

/**
 * @param {import('github-script').AsyncFunctionArguments} AsyncFunctionArguments
 */
export default async ({ github, context, core }) => {
	const githubBranch = process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME;
	const productionEnvironment = githubBranch === 'main';
	const environmentName = `[site] (${productionEnvironment ? 'Production' : githubBranch})`;

	const deployment = await github.rest.repos.createDeployment({
		owner: context.repo.owner,
		repo: context.repo.repo,
		ref: githubBranch || context.ref,
		auto_merge: false,
		description: 'Site Cloudflare Pages',
		required_contexts: [],
		environment: environmentName,
		production_environment: productionEnvironment,
	});
	if (deployment.status === 201) {
		core.setOutput('deployment-id', deployment.data.id);
	}
};
