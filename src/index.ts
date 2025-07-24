interface Env {
	SVELTEKIT_URL: string;
	ALLOWED_ORIGIN: string;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		if (request.method !== 'POST' || new URL(request.url).pathname !== '/apple-callback-proxy') {
			return new Response('Method or path not allowed', { status: 405 });
		}

		try {
			const formData: FormData = await request.formData();

			const code = formData.get('code');
			const state = formData.get('state');
			if (!code || !state) {
				return new Response('Missing code or state', { status: 400 });
			}
			const url = new URL(env.SVELTEKIT_URL);
			url.searchParams.append('code', encodeURIComponent(code as string));
			url.searchParams.append('state', encodeURIComponent(state as string));
			console.log('Redirecting browser to:', url.toString());
			return Response.redirect(url.toString(), 302);
		} catch (err) {
			console.error('Proxy error:', err);
			return new Response('Proxy failed', { status: 500 });
		}
	},
};
