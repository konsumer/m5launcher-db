import { json, err, getGitHubUser, slugify, CORS_HEADERS } from '../helpers.js'

export async function handleApps(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS })

  if (request.method === 'GET') {
    // Community apps + M5Burner cache in parallel (2 KV reads regardless of count)
    const [kvList, burnerCache] = await Promise.all([
      env.APPS_KV.list({ prefix: 'app:' }),
      env.APPS_KV.get('burner:cache', 'json'),
    ])
    const community = (await Promise.all(kvList.keys.map((k) => env.APPS_KV.get(k.name, 'json'))))
      .filter(Boolean)
      .map((a) => ({ ...a, source: 'community' }))

    // Dedup: community wins over burner by fid, then by normalized name+author
    const norm = (s) => (s ?? '').toLowerCase().trim()
    const communityFids = new Set(community.map((a) => a.fid).filter(Boolean))
    const communityKeys = new Set(community.map((a) => `${norm(a.name)}|${norm(a.author)}`))

    const burner = (burnerCache ?? []).filter(
      (a) => !communityFids.has(a.fid) && !communityKeys.has(`${norm(a.name)}|${norm(a.author)}`)
    )

    return json([...community, ...burner])
  }

  if (request.method === 'POST') {
    const session = await getGitHubUser(request)
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
      category: body.category ?? null,
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

  const session = await getGitHubUser(request)
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
      category: 'category' in body ? (body.category ?? null) : existing.category ?? null,
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
