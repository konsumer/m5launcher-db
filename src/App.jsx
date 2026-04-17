import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from './useAuth'
import { getApps, deleteApp } from './api'
import { Header } from './components/Header'
import { AppCard } from './components/AppCard'
import { SubmitModal } from './components/SubmitModal'

export default function App() {
  const { token, user, loading: authLoading, login, logout } = useAuth()
  const [apps, setApps] = useState([])
  const [appsLoading, setAppsLoading] = useState(true)
  const [submitOpen, setSubmitOpen] = useState(false)
  const [search, setSearch] = useState('')

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

  const filtered = search.trim()
    ? apps.filter((a) =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.description.toLowerCase().includes(search.toLowerCase()) ||
        a.author.toLowerCase().includes(search.toLowerCase())
      )
    : apps

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

        <div className="flex items-center gap-2 max-w-md mx-auto w-full">
          <input
            type="search"
            className="input input-bordered flex-1"
            placeholder="Search apps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {appsLoading ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-base-content/40">
            {search ? 'No apps match your search.' : 'No apps yet. Be the first to submit one!'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((app) => (
              <AppCard key={app.name} app={app} isOwner={user?.login === app.author} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>

      <footer className="footer footer-center p-4 bg-base-200 text-base-content/40 text-xs">
        <p>Launcher DB — community project</p>
      </footer>

      {token && (
        <SubmitModal open={submitOpen} token={token} onClose={() => setSubmitOpen(false)} onCreated={(app) => setApps((prev) => [app, ...prev])} />
      )}
    </div>
  )
}
