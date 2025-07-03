import { betterAuth } from 'better-auth';
import { admin, oAuthProxy } from 'better-auth/plugins';
import { D1Dialect } from 'kysely-d1';

export const auth = (url: string, env: Env) => {
	return betterAuth({
		baseURL: url,
		secret: env.BETTER_AUTH_SECRET,
		database: {
			dialect: new D1Dialect({ database: env.DB }),
			type: 'sqlite',
		},
		rateLimit: {
			enabled: true,
		},
		plugins: [
			oAuthProxy({
				productionURL: 'https://astro-tips.dev',
				currentURL: url,
			}),
			admin(),
		],
		socialProviders: {
			github: {
				clientId: env.GITHUB_CLIENT_ID,
				clientSecret: env.GITHUB_CLIENT_SECRET,
				redirectURI: `https://astro-tips.dev/api/auth/callback/github`,
			},
		},
	});
};
