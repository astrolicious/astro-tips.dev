import type { APIRoute } from 'astro';
import { auth as betterAuth } from '../../../lib/auth.ts';

export const prerender = false;

export const ALL: APIRoute = async (ctx) => {
	const auth = betterAuth(new URL(ctx.request.url).origin, ctx.locals.runtime.env);
	return auth.handler(ctx.request);
};
