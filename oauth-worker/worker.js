/**
 * Decap CMS GitHub OAuth broker — Cloudflare Worker.
 *
 * This tiny service lets the /admin/ editor sign in with GitHub. It is used
 * ONLY for login — it does not host the site or touch DNS.
 *
 * Two routes:
 *   /auth      → redirects the editor to GitHub's authorization screen
 *   /callback  → exchanges the code for a token and hands it back to the CMS
 *
 * Deploy this as a Cloudflare Worker and set two variables (Settings → Variables):
 *   OAUTH_CLIENT_ID      = your GitHub OAuth App Client ID
 *   OAUTH_CLIENT_SECRET  = your GitHub OAuth App Client Secret   (mark as "Encrypt")
 *
 * The GitHub OAuth App's "Authorization callback URL" must be:
 *   https://<this-worker-host>/callback
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Step 1: send the user to GitHub to authorise.
    if (url.pathname === '/auth') {
      const redirectUri = `${url.origin}/callback`;
      const authorize = new URL('https://github.com/login/oauth/authorize');
      authorize.searchParams.set('client_id', env.OAUTH_CLIENT_ID);
      authorize.searchParams.set('redirect_uri', redirectUri);
      authorize.searchParams.set('scope', url.searchParams.get('scope') || 'repo');
      authorize.searchParams.set('state', crypto.randomUUID());
      return Response.redirect(authorize.toString(), 302);
    }

    // Step 2: GitHub redirects back here with ?code=...
    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      if (!code) return new Response('Missing code', { status: 400 });

      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          client_id: env.OAUTH_CLIENT_ID,
          client_secret: env.OAUTH_CLIENT_SECRET,
          code,
        }),
      });
      const data = await tokenRes.json();

      const status = data.access_token ? 'success' : 'error';
      const content = data.access_token
        ? { token: data.access_token, provider: 'github' }
        : { error: data.error || 'Unknown error' };

      // Hand the token back to the CMS window via postMessage.
      const body = `<!doctype html><html><body><script>
        (function() {
          function receiveMessage(e) {
            window.opener.postMessage(
              'authorization:github:${status}:${JSON.stringify(content)}',
              e.origin
            );
            window.removeEventListener('message', receiveMessage, false);
          }
          window.addEventListener('message', receiveMessage, false);
          window.opener.postMessage('authorizing:github', '*');
        })();
      </script></body></html>`;

      return new Response(body, { headers: { 'Content-Type': 'text/html' } });
    }

    return new Response('Decap OAuth broker. Use /auth to sign in.', { status: 200 });
  },
};
