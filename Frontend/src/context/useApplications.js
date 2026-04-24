import { useContext } from 'react'
import ApplicationContext from './ApplicationContext'

export function useApplications() {
  const context = useContext(ApplicationContext)

  if (!context) {
    throw new Error('useApplications must be used within ApplicationProvider')
  }

  return context
}
