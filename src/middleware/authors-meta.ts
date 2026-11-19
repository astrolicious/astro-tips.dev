import { getEntries } from 'astro:content';
import { defineRouteMiddleware } from '@astrojs/starlight/route-data';

export const onRequest = defineRouteMiddleware(async (context) => {
	const { entry, head } = context.locals.starlightRoute;
	const authorRefs = entry?.data?.authors;

	if (!authorRefs || authorRefs.length === 0) {
		return;
	}

	const authors = await getEntries(authorRefs);
	for (const author of authors) {
		head.push({
			tag: 'meta',
			attrs: {
				name: 'author',
				content: author.data.name,
			},
		});
	}
});
