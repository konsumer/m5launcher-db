export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  })
}

export function err(message, status = 400) {
  return json({ error: message }, status)
}

export async function getGitHubUser(request) {
  const auth = request.headers.get('Authorization') ?? ''
  const token = auth.replace(/^Bearer\s+/i, '').trim()
  if (!token) return null
  const res = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'm5launcher-db' },
  })
  if (!res.ok) return null
  return res.json()
}

export function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
