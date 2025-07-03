type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
	interface Locals extends Runtime {
		user: import('better-auth').User | null;
		session: import('better-auth').Session | null;
	}
}
