import { json, err, getSession, CORS_HEADERS } from '../helpers.js'

function randomId(len = 40) {
  const bytes = new Uint8Array(len)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

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

  const userRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'm5launcher-db' },
  })
  const gh = await userRes.json()

  const sessionId = randomId()
  await env.APPS_KV.put(
    `session:${sessionId}`,
    JSON.stringify({ github_token: tokenData.access_token, login: gh.login, name: gh.name ?? null, avatar_url: gh.avatar_url }),
    { expirationTtl: 86400 }
  )
  return Response.redirect(`${origin}/?session=${sessionId}`, 302)
}

export async function handleUser(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS })
  const session = await getSession(request, env)
  if (!session) return err('Unauthorized', 401)
  return json({ login: session.login, name: session.name, avatar_url: session.avatar_url })
}

export async function handleLogout(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS })
  const auth = request.headers.get('Authorization') ?? ''
  const token = auth.replace(/^Bearer\s+/i, '').trim()
  if (token) await env.APPS_KV.delete(`session:${token}`)
  return json({ ok: true })
}
