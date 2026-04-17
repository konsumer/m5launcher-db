async function apiFetch(path, init = {}) {
  const res = await fetch(path, init)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }
  return res.json()
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` }
}

export const getApps = () => apiFetch('/api/apps')

export const getApp = (name) => apiFetch(`/api/apps/${encodeURIComponent(name)}`)

export const createApp = (app, token) =>
  apiFetch('/api/apps', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(app),
  })

export const updateApp = (name, app, token) =>
  apiFetch(`/api/apps/${encodeURIComponent(name)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(app),
  })

export const addVersion = (name, version, token) =>
  apiFetch(`/api/apps/${encodeURIComponent(name)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(version),
  })

export const deleteApp = (name, token) =>
  apiFetch(`/api/apps/${encodeURIComponent(name)}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })

export const getUser = (token) =>
  apiFetch('/api/auth/user', { headers: authHeaders(token) })

export const logout = (token) =>
  apiFetch('/api/auth/logout', { method: 'POST', headers: authHeaders(token) })
