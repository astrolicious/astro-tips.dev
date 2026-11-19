import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { hasCompatibilityInfo } from '../lib/compatibility';

export const onRequest = defineRouteMiddleware((context) => {
	const { entry, toc } = context.locals.starlightRoute;
	if (!toc || !hasCompatibilityInfo(entry.data.compatibility)) {
		return;
	}
	if (toc.items.some((item) => item.slug === 'compatibility')) {
		return;
	}
	toc.items.push({
		depth: 2,
		slug: 'compatibility',
		text: 'Compatibility',
		children: [],
	});
});
