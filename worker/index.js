import { handleApps, handleApp } from './routes/apps.js'
import { handleLogin, handleCallback, handleUser, handleLogout } from './routes/auth.js'

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url)

    if (pathname === '/api/apps') return handleApps(request, env)
    if (pathname.startsWith('/api/apps/')) return handleApp(request, env, decodeURIComponent(pathname.slice('/api/apps/'.length)))
    if (pathname === '/api/auth/login') return handleLogin(request, env)
    if (pathname === '/api/auth/callback') return handleCallback(request, env)
    if (pathname === '/api/auth/user') return handleUser(request, env)
    if (pathname === '/api/auth/logout') return handleLogout(request, env)

    return env.ASSETS.fetch(request)
  },

  async scheduled(event, env) {
    switch (event.cron) {
      case '0 0 * * *':
        await dailyCleanup(env)
        break
    }
  },
}

async function dailyCleanup(env) {
  // Example: scan for anything you want to prune.
  // KV session keys already expire via their TTL, so there's nothing
  // to clean there. Add your own logic here as needed, e.g.:
  //   - mirror release metadata from GitHub
  //   - prune apps whose GitHub repos no longer exist
  console.log('daily cleanup ran at', new Date().toISOString())
}
