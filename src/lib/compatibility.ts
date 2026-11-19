import { z } from 'astro/zod';
import { validRange } from 'semver';

export const COMPATIBILITY_STATUSES = ['recommended', 'supported', 'unsupported'] as const;
export type CompatibilityStatus = (typeof COMPATIBILITY_STATUSES)[number];

export type CompatibilityIconName =
	| 'astro'
	| 'approve-check-circle'
	| 'bun'
	| 'cloudflare'
	| 'deno'
	| 'document'
	| 'error'
	| 'netlify'
	| 'node'
	| 'server'
	| 'star'
	| 'vercel'
	| 'warning';

export interface StatusMetadata {
	label: string;
	shortLabel: string;
	description: string;
	icon: CompatibilityIconName;
}

export const STATUS_META: Record<CompatibilityStatus, StatusMetadata> = {
	recommended: {
		label: 'Recommended',
		shortLabel: 'Best practice',
		description: 'Best practice and recommended for this environment.',
		icon: 'star',
	},
	supported: {
		label: 'Works',
		shortLabel: 'Supported',
		description: 'Works as expected in this environment.',
		icon: 'approve-check-circle',
	},
	unsupported: {
		label: "Doesn't work",
		shortLabel: 'Unsupported',
		description: 'Does not work or is not supported in this environment.',
		icon: 'error',
	},
};

export interface TargetMetadata {
	label: string;
	icon: CompatibilityIconName;
	docsUrl: string;
	description: string;
	packageName?: string;
}

export const RENDERING_TARGETS = {
	prerendered: {
		label: 'Prerendered',
		icon: 'document',
		docsUrl: 'https://docs.astro.build/en/guides/on-demand-rendering/',
		description:
			'Built statically at build time (default in static mode, or with `export const prerender = true`).',
	},
	'on-demand': {
		label: 'On-demand',
		icon: 'server',
		docsUrl: 'https://docs.astro.build/en/guides/on-demand-rendering/',
		description:
			'Rendered per request on the server (default in server mode, or with `export const prerender = false`).',
	},
} as const satisfies Record<string, TargetMetadata>;

export const ADAPTER_TARGETS = {
	node: {
		label: 'Node.js',
		icon: 'node',
		packageName: '@astrojs/node',
		docsUrl: 'https://docs.astro.build/en/guides/integrations-guide/node/',
		description: 'Official Astro Node.js adapter (`@astrojs/node`).',
	},
	cloudflare: {
		label: 'Cloudflare',
		icon: 'cloudflare',
		packageName: '@astrojs/cloudflare',
		docsUrl: 'https://docs.astro.build/en/guides/integrations-guide/cloudflare/',
		description: 'Official Astro Cloudflare adapter (`@astrojs/cloudflare`).',
	},
	vercel: {
		label: 'Vercel',
		icon: 'vercel',
		packageName: '@astrojs/vercel',
		docsUrl: 'https://docs.astro.build/en/guides/integrations-guide/vercel/',
		description: 'Official Astro Vercel adapter (`@astrojs/vercel`).',
	},
	netlify: {
		label: 'Netlify',
		icon: 'netlify',
		packageName: '@astrojs/netlify',
		docsUrl: 'https://docs.astro.build/en/guides/integrations-guide/netlify/',
		description: 'Official Astro Netlify adapter (`@astrojs/netlify`).',
	},
	deno: {
		label: 'Deno',
		icon: 'deno',
		packageName: '@deno/astro-adapter',
		docsUrl: 'https://docs.astro.build/en/guides/deploy/deno/',
		description: 'Deno Astro adapter (`@deno/astro-adapter`).',
	},
} as const satisfies Record<string, TargetMetadata>;

export const RUNTIME_TARGETS = {
	node: {
		label: 'Node.js',
		icon: 'node',
		docsUrl: 'https://nodejs.org/',
		description: 'Node.js JavaScript runtime.',
	},
	deno: {
		label: 'Deno',
		icon: 'deno',
		docsUrl: 'https://deno.com/',
		description: 'Deno JavaScript runtime.',
	},
	bun: {
		label: 'Bun',
		icon: 'bun',
		docsUrl: 'https://bun.sh/',
		description: 'Bun JavaScript runtime.',
	},
	cloudflare: {
		label: 'Cloudflare Workers',
		icon: 'cloudflare',
		docsUrl: 'https://workers.cloudflare.com/',
		description: 'Cloudflare Workers (workerd) runtime.',
	},
} as const satisfies Record<string, TargetMetadata>;

export type RenderingTarget = keyof typeof RENDERING_TARGETS;
export type AdapterTarget = keyof typeof ADAPTER_TARGETS;
export type RuntimeTarget = keyof typeof RUNTIME_TARGETS;

const compatibilityEntryObjectSchema = z.object({
	status: z.enum(COMPATIBILITY_STATUSES),
	version: z
		.string()
		.refine((val) => validRange(val) !== null, { error: 'Must be a valid semver range' })
		.optional(),
	note: z.string().min(1).optional(),
});

const compatibilityEntrySchema = z
	.union([z.enum(COMPATIBILITY_STATUSES), compatibilityEntryObjectSchema])
	.transform((entry): CompatibilityEntry => {
		if (typeof entry === 'string') {
			return { status: entry };
		}
		return entry;
	});

export const compatibilityObjectSchema = z.object({
	rendering: z
		.object({
			prerendered: compatibilityEntrySchema.optional(),
			'on-demand': compatibilityEntrySchema.optional(),
		})
		.optional(),
	adapters: z
		.object({
			node: compatibilityEntrySchema.optional(),
			cloudflare: compatibilityEntrySchema.optional(),
			vercel: compatibilityEntrySchema.optional(),
			netlify: compatibilityEntrySchema.optional(),
			deno: compatibilityEntrySchema.optional(),
		})
		.optional(),
	runtimes: z
		.object({
			node: compatibilityEntrySchema.optional(),
			deno: compatibilityEntrySchema.optional(),
			bun: compatibilityEntrySchema.optional(),
			cloudflare: compatibilityEntrySchema.optional(),
		})
		.optional(),
	note: z.string().min(1).optional(),
});

export const compatibilitySchema = compatibilityObjectSchema.optional();

export interface CompatibilityEntry {
	status: CompatibilityStatus;
	version?: string | undefined;
	note?: string | undefined;
}

export type CompatibilityInput = z.input<typeof compatibilityObjectSchema>;
export type CompatibilityData = z.output<typeof compatibilityObjectSchema>;

export type CompatibilitySectionId = 'rendering' | 'adapters' | 'runtimes';

export interface ResolvedCompatibilityRow {
	key: string;
	label: string;
	icon: CompatibilityIconName;
	docsUrl: string;
	description: string;
	packageName?: string | undefined;
	status: CompatibilityStatus;
	version?: string | undefined;
	note?: string | undefined;
	footnoteIndex?: number | undefined;
}

export interface ResolvedCompatibilitySection {
	id: CompatibilitySectionId;
	label: string;
	docsUrl?: string | undefined;
	rows: ResolvedCompatibilityRow[];
}

export interface CompatibilityFootnote {
	index: number;
	sectionLabel: string;
	targetLabel: string;
	note: string;
}

export type OverallCompatibilityTone = 'recommended' | 'supported' | 'limited' | 'unsupported';

export interface OverallCompatibilitySummary {
	tone: OverallCompatibilityTone;
	label: string;
	description: string;
	icon: CompatibilityIconName;
}

export interface ResolvedCompatibility {
	sections: ResolvedCompatibilitySection[];
	footnotes: CompatibilityFootnote[];
	hasAnyVersion: boolean;
	note?: string | undefined;
	overall: OverallCompatibilitySummary;
}

export function normalizeCompatibility(
	input: CompatibilityInput | CompatibilityData | undefined
): CompatibilityData | undefined {
	if (!input) {
		return undefined;
	}
	return compatibilityObjectSchema.parse(input);
}

export function hasCompatibilityInfo(
	input: CompatibilityInput | CompatibilityData | undefined
): boolean {
	if (!input) {
		return false;
	}
	const groups = [input.rendering, input.adapters, input.runtimes];
	return groups.some(
		(group) => group !== undefined && Object.values(group).some((value) => value !== undefined)
	);
}

export function getSemverUrl(pkg: string, range: string): string {
	const params = new URLSearchParams({
		package: pkg,
		range,
		filter: 'on',
	});
	return `https://semver.otterlord.dev/?${params.toString()}`;
}

export function resolveCompatibility(
	input: CompatibilityInput | CompatibilityData,
	astroRange?: string
): ResolvedCompatibility {
	const data = normalizeCompatibility(input) ?? {};
	const sections: ResolvedCompatibilitySection[] = [];
	const footnotes: CompatibilityFootnote[] = [];
	let hasAnyVersion = Boolean(astroRange);

	const collectSection = <T extends Record<string, TargetMetadata>>(
		id: CompatibilitySectionId,
		label: string,
		targets: T,
		entries: Partial<Record<keyof T, CompatibilityEntry | undefined>> | undefined,
		docsUrl?: string
	) => {
		if (!entries) {
			return;
		}
		const rows: ResolvedCompatibilityRow[] = [];
		for (const key of Object.keys(targets) as (keyof T & string)[]) {
			const entry = entries[key];
			if (!entry) {
				continue;
			}
			const meta = targets[key];
			if (!meta) {
				continue;
			}
			let footnoteIndex: number | undefined;
			if (entry.note) {
				footnoteIndex = footnotes.length + 1;
				footnotes.push({
					index: footnoteIndex,
					sectionLabel: label,
					targetLabel: meta.label,
					note: entry.note,
				});
			}
			if (entry.version) {
				hasAnyVersion = true;
			}
			rows.push({
				key,
				label: meta.label,
				icon: meta.icon,
				docsUrl: meta.docsUrl,
				description: meta.description,
				packageName: meta.packageName,
				status: entry.status,
				version: entry.version,
				note: entry.note,
				footnoteIndex,
			});
		}
		if (rows.length > 0) {
			sections.push({ id, label, docsUrl, rows });
		}
	};

	collectSection(
		'rendering',
		'Rendering',
		RENDERING_TARGETS,
		data.rendering,
		'https://docs.astro.build/en/guides/on-demand-rendering/'
	);
	collectSection(
		'adapters',
		'Adapters',
		ADAPTER_TARGETS,
		data.adapters,
		'https://docs.astro.build/en/guides/on-demand-rendering/#server-adapters'
	);
	collectSection('runtimes', 'Runtimes', RUNTIME_TARGETS, data.runtimes);

	const allRows = sections.flatMap((section) => section.rows);
	const counts = {
		recommended: 0,
		supported: 0,
		unsupported: 0,
	};
	for (const row of allRows) {
		counts[row.status] += 1;
	}

	let overall: OverallCompatibilitySummary;
	if (counts.unsupported === 0 && allRows.length > 0) {
		if (counts.recommended > 0 && counts.supported === 0) {
			overall = {
				tone: 'recommended',
				label: 'Recommended',
				description: 'Best-practice approach across all listed environments.',
				icon: 'star',
			};
		} else {
			overall = {
				tone: 'supported',
				label: 'Widely compatible',
				description: 'Works across all listed Astro environments.',
				icon: 'approve-check-circle',
			};
		}
	} else if (counts.recommended > 0 || counts.supported > 0) {
		overall = {
			tone: 'limited',
			label: 'Limited compatibility',
			description: 'Supported in select environments only. Check the full compatibility details.',
			icon: 'warning',
		};
	} else {
		overall = {
			tone: 'unsupported',
			label: 'Not compatible',
			description: 'Not supported in the listed environments.',
			icon: 'error',
		};
	}

	return {
		sections,
		footnotes,
		hasAnyVersion,
		note: data.note,
		overall,
	};
}
