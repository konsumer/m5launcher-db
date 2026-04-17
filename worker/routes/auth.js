import { json, err, getGitHubUser, CORS_HEADERS } from '../helpers.js'

export function handleLogin(request, env) {
  if (!env.GITHUB_CLIENT_ID) return err('GitHub OAuth not configured', 500)
  const { origin } = new URL(request.url)
  const url = new URL('https://github.com/login/oauth/authorize')
  url.searchParams.set('client_id', env.GITHUB_CLIENT_ID)
  url.searchParams.set('redirect_uri', `${origin}/api/auth/callback`)
  url.searchParams.set('scope', 'read:user')
  return Response.redirect(url.toString(), 302)
}

export async function handleCallback(request, env) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  if (!code) return Response.redirect(`${origin}/?auth_error=no_code`, 302)

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code }),
  })
  const tokenData = await tokenRes.json()
  if (!tokenData.access_token) return Response.redirect(`${origin}/?auth_error=token_exchange_failed`, 302)

  return Response.redirect(`${origin}/?token=${tokenData.access_token}`, 302)
}

export async function handleUser(request) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS })
  const user = await getGitHubUser(request)
  if (!user) return err('Unauthorized', 401)
  return json({ login: user.login, name: user.name ?? null, avatar_url: user.avatar_url })
}

export function handleLogout() {
  // Token lives only in the client — nothing to invalidate server-side
  return json({ ok: true })
}
