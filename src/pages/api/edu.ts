import type { APIRoute } from 'astro';

import { getCollection } from 'astro:content';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
	const searchArguments = url.searchParams;
	console.log('URL', searchArguments);

	const resources = await getCollection('resources', ({ data }) => {
		if (searchArguments.has('q')) {
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			return data.title.toLowerCase().includes(searchArguments.get('q')!.toLowerCase());
		}
		if (searchArguments.has('category')) {
			return data.category === searchArguments.get('category');
		}
		return true;
	});

	if (searchArguments.has('sort')) {
		resources.sort((a, b) => {
			if (searchArguments.get('sort') === 'newest') {
				return a.data.updated > b.data.updated ? -1 : 1;
			}
			if (searchArguments.get('sort') === 'oldest') {
				return a.data.updated > b.data.updated ? 1 : -1;
			}
			return 1;
		});
	}
	return new Response(JSON.stringify(resources), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
		},
	});
};
