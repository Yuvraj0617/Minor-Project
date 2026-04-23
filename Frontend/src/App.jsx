import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UserInfoPage from './pages/UserInfoPage'
import UserProfilePage from './pages/UserProfilePage'
import AppShell from './layouts/AppShell'
import OverviewPage from './pages/app/OverviewPage'
import ProjectsPage from './pages/app/ProjectsPage'
import PostProjectPage from './pages/app/PostProjectPage'
import MatchingPage from './pages/app/MatchingPage'
import NotificationsPage from './pages/app/NotificationsPage'
import ChatSectionPage from './pages/app/ChatSectionPage'
import ProfileSectionPage from './pages/app/ProfileSectionPage'
import { useAuth } from './context/useAuth'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/app"
        element={(
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        )}
      >
        <Route index element={<Navigate to="/app/overview" replace />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="post-project" element={<PostProjectPage />} />
        <Route path="matching" element={<MatchingPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="chat" element={<ChatSectionPage />} />
        <Route path="profile" element={<ProfileSectionPage />} />
      </Route>
      <Route
        path="/userinfo"
        element={(
          <ProtectedRoute>
            <UserInfoPage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/user-profile"
        element={(
          <ProtectedRoute>
            <UserProfilePage />
          </ProtectedRoute>
        )}
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
