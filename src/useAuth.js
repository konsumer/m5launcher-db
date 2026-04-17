import { useState, useEffect, useCallback } from 'react'
import { getUser, logout as apiLogout } from './api'

const SESSION_KEY = 'm5launcher_session'

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem(SESSION_KEY))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sessionFromUrl = params.get('session')
    if (sessionFromUrl) {
      localStorage.setItem(SESSION_KEY, sessionFromUrl)
      setToken(sessionFromUrl)
      params.delete('session')
      params.delete('auth_error')
      const clean = params.toString() ? `?${params}` : window.location.pathname
      window.history.replaceState({}, '', clean)
    }
  }, [])

  useEffect(() => {
    if (!token) { setUser(null); return }
    setLoading(true)
    getUser(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(SESSION_KEY)
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [token])

  const login = useCallback(() => { window.location.href = '/api/auth/login' }, [])

  const logout = useCallback(async () => {
    if (token) await apiLogout(token).catch(() => {})
    localStorage.removeItem(SESSION_KEY)
    setToken(null)
    setUser(null)
  }, [token])

  return { token, user, loading, login, logout }
}
