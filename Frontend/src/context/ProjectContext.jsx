import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import {
  createProject as createProjectRequest,
  deleteProject as deleteProjectRequest,
  getProjects,
  updateProject as updateProjectRequest,
} from '../services/authApi'
import { useAuth } from './useAuth'

const ProjectContext = createContext(null)

const defaultFilters = { skill: '', technology: '', type: '' }

function normalizeProjects(response) {
  return Array.isArray(response) ? response : response?.data || []
}

export function ProjectProvider({ children }) {
  const { token, user } = useAuth()
  const [projects, setProjects] = useState([])
  const [filters, setFiltersState] = useState(defaultFilters)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [syncVersion, setSyncVersion] = useState(0)

  const loadProjects = useCallback(async (nextFilters = defaultFilters) => {
    if (!token) {
      setProjects([])
      return []
    }

    setLoading(true)
    setError('')

    try {
      const response = await getProjects(nextFilters, token)
      const nextProjects = normalizeProjects(response)
      setProjects(nextProjects)
      return nextProjects
    } catch (err) {
      setError(err?.message || 'Unable to load projects.')
      throw err
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadProjects(defaultFilters).catch(() => {})
  }, [loadProjects])

  const setFilters = useCallback((nextFilters) => {
    setFiltersState((current) => (
      typeof nextFilters === 'function' ? nextFilters(current) : { ...current, ...nextFilters }
    ))
  }, [])

  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters)
    return loadProjects(defaultFilters)
  }, [loadProjects])

  const createProject = useCallback(async (payload) => {
    const response = await createProjectRequest(payload, token)
    setSyncVersion((current) => current + 1)
    await loadProjects(defaultFilters)
    return response
  }, [loadProjects, token])

  const updateProject = useCallback(async (projectId, payload, activeFilters = filters) => {
    const response = await updateProjectRequest(projectId, payload, token)
    setSyncVersion((current) => current + 1)
    await loadProjects(activeFilters)
    return response
  }, [filters, loadProjects, token])

  const deleteProject = useCallback(async (projectId) => {
    const response = await deleteProjectRequest(projectId, token)
    setProjects((current) => current.filter((project) => project._id !== projectId))
    setSyncVersion((current) => current + 1)
    return response
  }, [token])

  const myProjects = useMemo(
    () => projects.filter((project) => project.userId?._id === user?._id),
    [projects, user?._id],
  )

  const value = useMemo(() => ({
    projects,
    myProjects,
    filters,
    loading,
    error,
    syncVersion,
    setFilters,
    resetFilters,
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
  }), [
    createProject,
    deleteProject,
    error,
    filters,
    loadProjects,
    loading,
    myProjects,
    projects,
    resetFilters,
    setFilters,
    syncVersion,
    updateProject,
  ])

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export default ProjectContext
