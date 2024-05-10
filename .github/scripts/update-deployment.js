// @ts-check

/**
 * @param {import('github-script').AsyncFunctionArguments} AsyncFunctionArguments
 */
export default async ({ github, context, core }) => {
	const githubBranch = process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME;
	const productionEnvironment = githubBranch === 'main';
	const environmentName = `[site] (${productionEnvironment ? 'Production' : githubBranch})`;

	github.rest.repos.createDeploymentStatus({
		owner: context.repo.owner,
		repo: context.repo.repo,
		deployment_id: Number.parseInt(process.env.DEPLOYMENT_ID),
		environment: environmentName,
		environment_url: process.env.DEPLOYMENT_URL,
		production_environment: productionEnvironment,
		description: 'Cloudflare Pages',
		state: 'success',
		auto_inactive: false,
	});
};
