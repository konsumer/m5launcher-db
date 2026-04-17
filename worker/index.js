import { handleApps, handleApp } from './routes/apps.js'
import { handleLogin, handleCallback, handleUser, handleLogout } from './routes/auth.js'
import { syncBurner } from './jobs/sync-burner.js'

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
    if (event.cron === '0 */2 * * *') {
      await syncBurner(env.APPS_KV)
    }
  },
}
