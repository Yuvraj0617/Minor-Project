import { createContext, useCallback, useMemo, useState } from 'react'
import {
  clearAuthToken,
  getAuthToken,
  getAuthUser,
  getUserInfo,
  setAuthToken,
  setAuthUser,
  setUserInfo,
} from '../services/authStorage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getAuthToken())
  const [user, setUser] = useState(() => getAuthUser())
  const [userInfo, setUserInfoState] = useState(() => getUserInfo())

  const login = useCallback((payload) => {
    const nextToken = payload?.token || null
    const nextUser = payload?.data || payload?.user || null

    setToken(nextToken)
    setUser(nextUser)

    if (nextToken) {
      setAuthToken(nextToken)
    }

    if (nextUser) {
      setAuthUser(nextUser)
    }
  }, [])

  const saveProfileInfo = useCallback((profile) => {
    setUserInfoState(profile)
    setUserInfo(profile)
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    setUserInfoState(null)
    clearAuthToken()
  }, [])

  const value = useMemo(() => {
    return {
      token,
      user,
      userInfo,
      isAuthenticated: Boolean(token),
      login,
      saveProfileInfo,
      logout,
    }
  }, [login, logout, saveProfileInfo, token, user, userInfo])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
