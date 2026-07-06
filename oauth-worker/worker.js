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
 * Variables to set on the Worker:
 *   OAUTH_CLIENT_ID      = GitHub OAuth App Client ID
 *   OAUTH_CLIENT_SECRET  = GitHub OAuth App Client Secret (Encrypt)
 * GitHub OAuth App callback URL must be:  https://<this-worker-host>/callback
 */

const PROVIDER = 'github';

function html(status, content) {
  const message = `authorization:${PROVIDER}:${status}:${JSON.stringify(content)}`;
  return `<!doctype html><html><head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;padding:2rem">
<p id="s">Completing sign-in…</p>
<script>
(function () {
  var message = ${JSON.stringify(message)};
  var s = document.getElementById('s');
  function log(m){ try{ console.log('[oauth] '+m); }catch(e){} }
  log('status=${status} opener=' + (window.opener ? 'yes' : 'NO'));
  if (!window.opener) { s.textContent = 'No opener window — was this opened by the editor? Try enabling pop-ups.'; return; }
  function receive(e) {
    log('received from ' + e.origin + ': ' + JSON.stringify(e.data));
    window.opener.postMessage(message, e.origin);
    log('posted result to ' + e.origin);
    s.textContent = 'Done — you can close this window.';
  }
  window.addEventListener('message', receive, false);
  log('posting handshake authorizing:${PROVIDER}');
  window.opener.postMessage('authorizing:${PROVIDER}', '*');
  // Fallback: if no handshake echo arrives, post directly after 1s.
  setTimeout(function () {
    log('fallback: posting result to * (no echo received)');
    window.opener.postMessage(message, '*');
  }, 1000);
})();
</script>
</body></html>`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/auth') {
      const authorize = new URL('https://github.com/login/oauth/authorize');
      authorize.searchParams.set('client_id', env.OAUTH_CLIENT_ID);
      authorize.searchParams.set('redirect_uri', `${url.origin}/callback`);
      authorize.searchParams.set('scope', url.searchParams.get('scope') || 'repo');
      authorize.searchParams.set('state', crypto.randomUUID());
      return Response.redirect(authorize.toString(), 302);
    }

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

      const body = data.access_token
        ? html('success', { token: data.access_token, provider: PROVIDER })
        : html('error', { error: data.error || 'Unknown error' });

      return new Response(body, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    return new Response('Decap OAuth broker. Use /auth to sign in.', { status: 200 });
  },
};
