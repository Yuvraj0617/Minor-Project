import { createContext, useMemo, useState } from 'react'
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

  const value = useMemo(() => {
    const login = (payload) => {
      setToken(payload.token || null)
      setUser(payload.data || null)

      if (payload.token) {
        setAuthToken(payload.token)
      }

      if (payload.data) {
        setAuthUser(payload.data)
      }
    }

    const saveProfileInfo = (profile) => {
      setUserInfoState(profile)
      setUserInfo(profile)
    }

    const logout = () => {
      setToken(null)
      setUser(null)
      setUserInfoState(null)
      clearAuthToken()
    }

    return {
      token,
      user,
      userInfo,
      isAuthenticated: Boolean(token),
      login,
      saveProfileInfo,
      logout,
    }
  }, [token, user, userInfo])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
