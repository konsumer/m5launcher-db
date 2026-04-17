const BURNER_API = 'http://m5burner-api-fc-hk-cdn.m5stack.com/api/firmware'
const BURNER_CDN = 'https://m5burner.m5stack.com'

export async function fetchBurnerApps() {
  const res = await fetch(BURNER_API)
  if (!res.ok) throw new Error(`M5Burner API responded ${res.status}`)
  const raw = await res.json()
  return raw.map((entry) => ({
    fid: entry.fid,
    name: entry.name,
    author: entry.author,
    github: entry.github || null,
    description: entry.description,
    cover: entry.cover ? `${BURNER_CDN}/cover/${entry.cover}` : null,
    category: entry.category || null,
    versions: entry.versions
      .filter((v) => v.published)
      .map((v) => ({
        version: v.version,
        published_at: v.published_at,
        file: `${BURNER_CDN}/firmware/${v.file}`,
      })),
    source: 'burner',
    download: entry.download ?? 0,
  }))
}

// kv can be any object with a .put(key, value) method:
// - env.APPS_KV in the Worker
// - the wrangler shim in tools/sync-burner.js
export async function syncBurner(kv) {
  const apps = await fetchBurnerApps()
  await kv.put('burner:cache', JSON.stringify(apps))
  console.log(`[syncBurner] cached ${apps.length} entries at ${new Date().toISOString()}`)
}
