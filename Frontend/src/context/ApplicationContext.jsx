import { createContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './useAuth'

const ApplicationContext = createContext(null)

function getStorageKey(userId) {
  return `craftbridge_applied_projects_${userId || 'guest'}`
}

function loadAppliedProjects(userId) {
  try {
    const raw = window.sessionStorage.getItem(getStorageKey(userId))
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function ApplicationProvider({ children }) {
  const { user } = useAuth()
  const [appliedProjectIds, setAppliedProjectIds] = useState([])
  const [syncVersion, setSyncVersion] = useState(0)
  const userId = user?._id || null

  useEffect(() => {
    setAppliedProjectIds(loadAppliedProjects(userId))
  }, [userId])

  useEffect(() => {
    try {
      window.sessionStorage.setItem(getStorageKey(userId), JSON.stringify(appliedProjectIds))
    } catch {
      // Ignore storage errors and keep in-memory state only.
    }
  }, [appliedProjectIds, userId])

  const value = useMemo(() => {
    function markProjectApplied(projectId) {
      if (!projectId) return
      setAppliedProjectIds((current) => [...new Set([...current, projectId])])
      setSyncVersion((current) => current + 1)
    }

    function markApplicationDecision() {
      setSyncVersion((current) => current + 1)
    }

    function resetApplicationState() {
      setAppliedProjectIds([])
      setSyncVersion((current) => current + 1)
    }

    return {
      appliedProjectIds,
      isProjectApplied: (projectId) => appliedProjectIds.includes(projectId),
      markProjectApplied,
      markApplicationDecision,
      resetApplicationState,
      syncVersion,
    }
  }, [appliedProjectIds, syncVersion])

  return <ApplicationContext.Provider value={value}>{children}</ApplicationContext.Provider>
}

export default ApplicationContext
