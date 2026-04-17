import { useState, useEffect, useCallback } from 'react'
import { getUser } from './api'

const TOKEN_KEY = 'm5launcher_token'

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tokenFromUrl = params.get('token')
    if (tokenFromUrl) {
      localStorage.setItem(TOKEN_KEY, tokenFromUrl)
      setToken(tokenFromUrl)
      params.delete('token')
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
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [token])

  const login = useCallback(() => { window.location.href = '/api/auth/login' }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  return { token, user, loading, login, logout }
}
