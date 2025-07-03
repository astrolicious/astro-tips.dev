import { defineMiddleware } from 'astro:middleware';
import { auth as betterAuth } from '~/lib/auth.ts';

export const onRequest = defineMiddleware(async (context, next) => {
	const auth = betterAuth(new URL(context.request.url).origin, context.locals.runtime.env);

	const isAuthed = await auth.api.getSession({
		headers: context.request.headers,
	});

	if (isAuthed) {
		context.locals.user = isAuthed.user;
		context.locals.session = isAuthed.session;
	} else {
		context.locals.user = null;
		context.locals.session = null;
		if (context.url.pathname === '/admin') return context.redirect('/');
	}

	return next();
});
