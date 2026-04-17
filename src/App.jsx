import { useState, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from './useAuth'
import { getApps, deleteApp } from './api'
import { Header } from './components/Header'
import { AppCard } from './components/AppCard'
import { SubmitModal } from './components/SubmitModal'
import { CATEGORIES } from './categories'

export default function App() {
  const { token, user, loading: authLoading, login, logout } = useAuth()
  const [apps, setApps] = useState([])
  const [appsLoading, setAppsLoading] = useState(true)
  const [submitOpen, setSubmitOpen] = useState(false)
  const [editApp, setEditApp] = useState(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [orderBy, setOrderBy] = useState('downloads')

  useEffect(() => {
    getApps()
      .then(setApps)
      .catch(() => toast.error('Failed to load apps'))
      .finally(() => setAppsLoading(false))
  }, [])

  async function handleDelete(name) {
    if (!token) return
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await deleteApp(name, token)
      setApps((prev) => prev.filter((a) => a.name !== name))
      toast.success(`"${name}" deleted`)
    } catch (err) {
      toast.error(err.message ?? 'Delete failed')
    }
  }

  const filtered = useMemo(() => {
    let out = apps
    if (category) out = out.filter((a) => a.category === category)
    if (search.trim()) {
      const q = search.toLowerCase()
      out = out.filter((a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.author.toLowerCase().includes(q)
      )
    }
    return [...out].sort((a, b) => {
      if (orderBy === 'downloads') return (b.download ?? 0) - (a.download ?? 0)
      if (orderBy === 'name') return a.name.localeCompare(b.name)
      if (orderBy === 'published_at') {
        const latest = (app) => app.versions?.reduce((max, v) => v.published_at > max ? v.published_at : max, '') ?? ''
        return latest(b).localeCompare(latest(a))
      }
      return 0
    })
  }, [apps, category, search, orderBy])

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <Header user={user} authLoading={authLoading} onLogin={login} onLogout={logout} onSubmit={() => setSubmitOpen(true)} />

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 flex flex-col gap-6">
        <div className="text-center py-6">
          <h1 className="text-4xl font-extrabold text-primary mb-2">Launcher App Database</h1>
          <p className="text-base-content/60 max-w-xl mx-auto pl-4">
            Community-maintained firmware apps for many ESP32 devices. Browse, download, and submit your own.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 max-w-3xl mx-auto w-full">
          <input
            type="search"
            className="input input-bordered flex-1 min-w-40"
            placeholder="Search apps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="select select-bordered w-40 shrink-0"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All devices</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            className="select select-bordered w-48 shrink-0"
            value={orderBy}
            onChange={(e) => setOrderBy(e.target.value)}
          >
            <option value="downloads">Order by downloads</option>
            <option value="name">Order by name</option>
            <option value="published_at">Order by latest version date</option>
          </select>
        </div>

        {appsLoading ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-base-content/40">
            {search || category ? 'No apps match your filters.' : 'No apps yet. Be the first to submit one!'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((app) => (
              <AppCard key={app.fid ?? app.name} app={app} isOwner={user?.login === app.author} onDelete={handleDelete} onEdit={setEditApp} />
            ))}
          </div>
        )}
      </main>

      <footer className="footer footer-center p-4 bg-base-200 text-base-content/40 text-xs">
        <p>Launcher DB — community project</p>
      </footer>

      {token && (
        <SubmitModal
          open={submitOpen}
          token={token}
          onClose={() => setSubmitOpen(false)}
          onCreated={(app) => setApps((prev) => [app, ...prev])}
        />
      )}
      {token && editApp && (
        <SubmitModal
          open={!!editApp}
          token={token}
          app={editApp}
          onClose={() => setEditApp(null)}
          onUpdated={(updated) => setApps((prev) => prev.map((a) => a.name === editApp.name ? updated : a))}
        />
      )}
    </div>
  )
}
