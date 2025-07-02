import { betterAuth } from 'better-auth';
import { admin } from 'better-auth/plugins';
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
		plugins: [admin()],
		socialProviders: {
			github: {
				clientId: env.GITHUB_CLIENT_ID,
				clientSecret: env.GITHUB_CLIENT_SECRET,
			},
		},
	});
};
