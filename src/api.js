const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5113').replace(/\/$/, '')

async function request(path, { token, method = 'GET', body } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    const message = payload?.message || payload?.title || (payload?.errors ? Object.values(payload.errors).flat().join(' ') : 'Something went wrong. Please try again.')
    throw new Error(message)
  }
  return payload
}

export const authApi = {
  login: (credentials) => request('/api/auth/login', { method: 'POST', body: credentials }),
  register: (account) => request('/api/auth/register', { method: 'POST', body: account }),
  me: (token) => request('/api/auth/me', { token }),
}

export const invitationApi = {
  list: (token) => request('/api/invitations', { token }),
  create: (token, invitation) => request('/api/invitations', { token, method: 'POST', body: invitation }),
  update: (token, id, invitation) => request(`/api/invitations/${encodeURIComponent(id)}`, { token, method: 'PUT', body: invitation }),
  getPublic: (id) => request(`/api/public/invitations/${encodeURIComponent(id)}`),
  submitRsvp: (id, rsvp) => request(`/api/public/invitations/${encodeURIComponent(id)}/rsvps`, { method: 'POST', body: rsvp }),
}
