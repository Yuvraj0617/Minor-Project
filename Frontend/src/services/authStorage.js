const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'
const USER_INFO_KEY = 'user_info'

export function setAuthToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAuthUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getAuthUser() {
  const raw = localStorage.getItem(USER_KEY)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setUserInfo(userInfo) {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
}

export function getUserInfo() {
  const raw = localStorage.getItem(USER_INFO_KEY)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(USER_INFO_KEY)
}