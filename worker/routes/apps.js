import { json, err, getSession, slugify, CORS_HEADERS } from '../helpers.js'

export async function handleApps(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS })

  if (request.method === 'GET') {
    const list = await env.APPS_KV.list({ prefix: 'app:' })
    const apps = await Promise.all(list.keys.map((k) => env.APPS_KV.get(k.name, 'json')))
    return json(apps.filter(Boolean))
  }

  if (request.method === 'POST') {
    const session = await getSession(request, env)
    if (!session) return err('Unauthorized', 401)

    let body
    try { body = await request.json() } catch { return err('Invalid JSON') }

    if (!body.name?.trim()) return err('name is required')
    if (!body.github?.trim()) return err('github is required')
    if (!body.description?.trim()) return err('description is required')
    if (!body.cover?.trim()) return err('cover is required')

    const slug = slugify(body.name)
    if (await env.APPS_KV.get(`app:${slug}`)) return err('An app with that name already exists', 409)

    const app = {
      name: body.name.trim(),
      author: session.login,
      github: body.github.trim(),
      description: body.description.trim(),
      cover: body.cover.trim(),
      versions: Array.isArray(body.versions) ? body.versions : [],
    }
    await env.APPS_KV.put(`app:${slug}`, JSON.stringify(app))
    return json(app, 201)
  }

  return err('Method not allowed', 405)
}

export async function handleApp(request, env, name) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS })

  const key = `app:${slugify(name)}`

  if (request.method === 'GET') {
    const app = await env.APPS_KV.get(key, 'json')
    return app ? json(app) : err('Not found', 404)
  }

  const session = await getSession(request, env)
  if (!session) return err('Unauthorized', 401)

  const existing = await env.APPS_KV.get(key, 'json')
  if (!existing) return err('Not found', 404)
  if (existing.author !== session.login) return err('Forbidden', 403)

  if (request.method === 'PUT') {
    let body
    try { body = await request.json() } catch { return err('Invalid JSON') }
    const updated = {
      name: body.name?.trim() ?? existing.name,
      author: existing.author,
      github: body.github?.trim() ?? existing.github,
      description: body.description?.trim() ?? existing.description,
      cover: body.cover?.trim() ?? existing.cover,
      versions: Array.isArray(body.versions) ? body.versions : existing.versions,
    }
    await env.APPS_KV.put(key, JSON.stringify(updated))
    return json(updated)
  }

  if (request.method === 'DELETE') {
    await env.APPS_KV.delete(key)
    return json({ ok: true })
  }

  if (request.method === 'PATCH') {
    let v
    try { v = await request.json() } catch { return err('Invalid JSON') }
    if (!v.version?.trim()) return err('version is required')
    if (!v.file?.trim()) return err('file is required')
    if (!v.published_at?.trim()) return err('published_at is required')
    existing.versions = [
      ...existing.versions.filter((x) => x.version !== v.version),
      { version: v.version.trim(), published_at: v.published_at.trim(), file: v.file.trim() },
    ]
    await env.APPS_KV.put(key, JSON.stringify(existing))
    return json(existing)
  }

  return err('Method not allowed', 405)
}
