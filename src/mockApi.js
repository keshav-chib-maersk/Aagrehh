const USERS_KEY = 'aagrehh-demo-users'

const wait = (ms = 650) => new Promise((resolve) => window.setTimeout(resolve, ms))

function users() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(USERS_KEY))
    if (Array.isArray(saved) && saved.length) return saved
  } catch { /* use the demo account */ }
  return [{ name: 'Shreya Kapoor', email: 'demo@aagrehh.com', password: 'password123' }]
}

function saveUsers(nextUsers) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers))
}

// Temporary browser-side stand-in for future API calls.
export async function mockAuthRequest(endpoint, payload) {
  await wait()
  const accountList = users()

  if (endpoint === '/api/auth/login') {
    const account = accountList.find((item) => item.email.toLowerCase() === payload.email.toLowerCase() && item.password === payload.password)
    if (!account) throw new Error('That email and password do not match. Try the demo account below.')
    return { user: { name: account.name, email: account.email }, token: `demo-token-${Date.now()}` }
  }

  if (endpoint === '/api/auth/register') {
    if (accountList.some((item) => item.email.toLowerCase() === payload.email.toLowerCase())) throw new Error('An account with this email already exists. Please sign in instead.')
    const account = { name: payload.name, email: payload.email, password: payload.password }
    saveUsers([...accountList, account])
    return { user: { name: account.name, email: account.email }, token: `demo-token-${Date.now()}` }
  }

  throw new Error('This mock endpoint is not available.')
}
