import { defineRouteMiddleware, type StarlightRouteData } from '@astrojs/starlight/route-data';
import { getLatestResourceNewUntil } from '../lib/resources';

type SidebarEntry = StarlightRouteData['sidebar'][number];

const EXTERNAL_RESOURCES_PATHS = new Set(['/external-resources', '/external-resources/']);

const SIDEBAR_BADGE_EXPIRY_SCRIPT = `(() => {
	const prune = () => {
		const now = Date.now();
		for (const link of document.querySelectorAll('a[data-resources-new-until]')) {
			const until = Date.parse(link.getAttribute('data-resources-new-until') ?? '');
			if (!Number.isNaN(until) && now > until) {
				link.querySelector('.sl-badge')?.remove();
			}
		}
		for (const card of document.querySelectorAll('[data-resource-card][data-new-until]')) {
			const until = Date.parse(card.getAttribute('data-new-until') ?? '');
			if (!Number.isNaN(until) && now > until) {
				card.setAttribute('data-is-new', 'false');
				const badge = card.querySelector('[data-new-badge]');
				if (badge instanceof HTMLElement) {
					badge.hidden = true;
				}
			}
		}
	};
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', prune, { once: true });
	} else {
		prune();
	}
})();`;

function annotateResourcesLink(entries: SidebarEntry[], expiresIso: string): boolean {
	for (const entry of entries) {
		if (entry.type === 'link' && EXTERNAL_RESOURCES_PATHS.has(entry.href)) {
			entry.badge = { text: 'New', variant: 'tip' };
			entry.attrs = {
				...entry.attrs,
				'data-resources-new-until': expiresIso,
			};
			return true;
		}
		if (entry.type === 'group' && annotateResourcesLink(entry.entries, expiresIso)) {
			return true;
		}
	}
	return false;
}

export const onRequest = defineRouteMiddleware(async (context) => {
	const latestNewUntilIso = await getLatestResourceNewUntil();
	if (!latestNewUntilIso) {
		return;
	}

	const { sidebar, head } = context.locals.starlightRoute;
	const annotated = annotateResourcesLink(sidebar, latestNewUntilIso);

	if (annotated) {
		head.push({
			tag: 'script',
			content: SIDEBAR_BADGE_EXPIRY_SCRIPT,
		});
	}
});
