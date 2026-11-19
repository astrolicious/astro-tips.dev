import { execFileSync } from 'node:child_process';

export const NEW_RESOURCE_WINDOW_DAYS = 30;
export const NEW_RESOURCE_UPDATED_GUARD_DAYS = 60;

const DAY_MS = 24 * 60 * 60 * 1000;
const RESOURCES_FILE_PATH = 'src/content/resources.json';
const LINK_LINE_REGEX = /"link"\s*:\s*("(?:\\.|[^"\\])*")/;

interface GitAddedResult {
	isShallow: boolean;
	addedByLink: Map<string, Date>;
}

let cachedGitResult: GitAddedResult | null = null;
let warnedShallowOrUnavailable = false;

function getGitAddedDates(): GitAddedResult {
	if (cachedGitResult) {
		return cachedGitResult;
	}

	try {
		const shallowOutput = execFileSync('git', ['rev-parse', '--is-shallow-repository'], {
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'pipe'],
		}).trim();

		if (shallowOutput === 'true') {
			if (!warnedShallowOrUnavailable) {
				warnedShallowOrUnavailable = true;
				console.warn(
					'[resources-loader] Shallow git clone detected; falling back to resource `updated` dates for "New" badges.'
				);
			}
			cachedGitResult = { isShallow: true, addedByLink: new Map() };
			return cachedGitResult;
		}

		const gitLogOutput = execFileSync(
			'git',
			['log', '--reverse', '--format=COMMIT %cI', '-p', '-U0', '--', RESOURCES_FILE_PATH],
			{
				encoding: 'utf8',
				maxBuffer: 50 * 1024 * 1024,
				stdio: ['ignore', 'pipe', 'pipe'],
			}
		);

		const addedByLink = new Map<string, Date>();
		let currentCommitDate: Date | null = null;

		for (const line of gitLogOutput.split('\n')) {
			if (line.startsWith('COMMIT ')) {
				const parsed = new Date(line.slice(7).trim());
				currentCommitDate = Number.isNaN(parsed.getTime()) ? null : parsed;
				continue;
			}

			if (!currentCommitDate || !line.startsWith('+') || line.startsWith('+++')) {
				continue;
			}

			const match = line.match(LINK_LINE_REGEX);
			if (!match?.[1]) {
				continue;
			}

			try {
				const link = JSON.parse(match[1]) as unknown;
				if (typeof link === 'string' && !addedByLink.has(link)) {
					addedByLink.set(link, currentCommitDate);
				}
			} catch {
				// Skip malformed diff line
			}
		}

		cachedGitResult = { isShallow: false, addedByLink };
		return cachedGitResult;
	} catch (error) {
		if (!warnedShallowOrUnavailable) {
			warnedShallowOrUnavailable = true;
			const message = error instanceof Error ? error.message : String(error);
			console.warn(
				`[resources-loader] Unable to read git history (${message}); falling back to resource \`updated\` dates for "New" badges.`
			);
		}
		cachedGitResult = { isShallow: true, addedByLink: new Map() };
		return cachedGitResult;
	}
}

function coerceDate(value: unknown): Date | null {
	if (value instanceof Date) {
		return Number.isNaN(value.getTime()) ? null : value;
	}
	if (typeof value === 'string' || typeof value === 'number') {
		const parsed = new Date(value);
		return Number.isNaN(parsed.getTime()) ? null : parsed;
	}
	return null;
}

export function parseResourcesWithGitMetadata(text: string): Record<string, unknown>[] {
	const raw = JSON.parse(text) as unknown;
	if (!Array.isArray(raw)) {
		throw new Error(`Expected ${RESOURCES_FILE_PATH} to contain a JSON array.`);
	}

	const { isShallow, addedByLink } = getGitAddedDates();
	const now = new Date();
	const newWindowMs = NEW_RESOURCE_WINDOW_DAYS * DAY_MS;
	const updatedGuardMs = NEW_RESOURCE_UPDATED_GUARD_DAYS * DAY_MS;

	return raw.map((item) => {
		if (typeof item !== 'object' || item === null) {
			return item as Record<string, unknown>;
		}

		const record = item as Record<string, unknown>;
		const updatedDate = coerceDate(record.updated);
		const link = typeof record.link === 'string' ? record.link : undefined;

		let addedAt: Date | null = null;
		if (isShallow) {
			addedAt = updatedDate;
		} else if (link && addedByLink.has(link)) {
			addedAt = addedByLink.get(link) ?? null;
		} else {
			// Uncommitted entry in local working tree: treat as newly added now for dev preview.
			addedAt = now;
		}

		let newUntil: Date | null = null;
		if (addedAt && updatedDate) {
			const ageGapMs = addedAt.getTime() - updatedDate.getTime();
			if (ageGapMs <= updatedGuardMs) {
				newUntil = new Date(addedAt.getTime() + newWindowMs);
			}
		}

		return {
			...record,
			...(addedAt ? { addedAt } : {}),
			newUntil,
		};
	});
}
