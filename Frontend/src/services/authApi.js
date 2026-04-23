const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

async function parseApiResponse(response) {
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.message || 'Request failed. Please try again.')
  }

  return payload
}

export async function registerUser(values) {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(values),
  })

  return parseApiResponse(response)
}

export async function loginUser(values) {
  const response = await fetch(`${API_BASE_URL}/api/login/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(values),
  })

  return parseApiResponse(response)
}

function authHeaders(token) {
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {}
}

function jsonHeaders(token) {
  return {
    'Content-Type': 'application/json',
    ...authHeaders(token),
  }
}

export async function createUserInfo(values, token) {
  const response = await fetch(`${API_BASE_URL}/api/profile`, {
    method: 'POST',
    headers: jsonHeaders(token),
    body: JSON.stringify(values),
  })

  return parseApiResponse(response)
}

export async function updateUserInfo(values, token) {
  const response = await fetch(`${API_BASE_URL}/api/profile`, {
    method: 'PATCH',
    headers: jsonHeaders(token),
    body: JSON.stringify(values),
  })

  return parseApiResponse(response)
}

export async function getMyUserInfo(token) {
  const response = await fetch(`${API_BASE_URL}/api/profile/me`, {
    method: 'GET',
    headers: {
      ...authHeaders(token),
    },
  })

  return parseApiResponse(response)
}

export async function getProjects(params = {}, token) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.set(key, value)
    }
  })

  const suffix = query.toString() ? `?${query.toString()}` : ''
  const response = await fetch(`${API_BASE_URL}/api/projects${suffix}`, {
    headers: {
      ...authHeaders(token),
    },
  })

  return parseApiResponse(response)
}

export async function createProject(values, token) {
  const response = await fetch(`${API_BASE_URL}/api/projects`, {
    method: 'POST',
    headers: jsonHeaders(token),
    body: JSON.stringify(values),
  })

  return parseApiResponse(response)
}

export async function getMatchedProjects(token) {
  const response = await fetch(`${API_BASE_URL}/api/projects/matches/me`, {
    headers: {
      ...authHeaders(token),
    },
  })

  return parseApiResponse(response)
}

export async function getMatchedUsersForProject(projectId, token) {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/matches/users`, {
    headers: {
      ...authHeaders(token),
    },
  })

  return parseApiResponse(response)
}

export async function applyToProject(projectId, token) {
  const response = await fetch(`${API_BASE_URL}/api/applications/${projectId}`, {
    method: 'POST',
    headers: {
      ...authHeaders(token),
    },
  })

  return parseApiResponse(response)
}

export async function getApplicants(projectId, token) {
  const response = await fetch(`${API_BASE_URL}/api/applications/${projectId}`, {
    headers: {
      ...authHeaders(token),
    },
  })

  return parseApiResponse(response)
}

export async function acceptApplicant(applicationId, token) {
  const response = await fetch(`${API_BASE_URL}/api/applications/accept/${applicationId}`, {
    method: 'PATCH',
    headers: {
      ...authHeaders(token),
    },
  })

  return parseApiResponse(response)
}

export async function rejectApplicant(applicationId, token) {
  const response = await fetch(`${API_BASE_URL}/api/applications/reject/${applicationId}`, {
    method: 'PATCH',
    headers: {
      ...authHeaders(token),
    },
  })

  return parseApiResponse(response)
}

export async function getNotifications(token) {
  const response = await fetch(`${API_BASE_URL}/api/notifications`, {
    headers: {
      ...authHeaders(token),
    },
  })

  return parseApiResponse(response)
}

export async function getChatToken(token) {
  const response = await fetch(`${API_BASE_URL}/api/chat/token`, {
    headers: {
      ...authHeaders(token),
    },
  })

  return parseApiResponse(response)
}

export async function getMyChats(token) {
  const response = await fetch(`${API_BASE_URL}/api/chat/my-chats`, {
    headers: {
      ...authHeaders(token),
    },
  })

  return parseApiResponse(response)
}

export async function createConversation(targetUserId, token) {
  const response = await fetch(`${API_BASE_URL}/api/chat/conversation/${targetUserId}`, {
    method: 'POST',
    headers: {
      ...authHeaders(token),
    },
  })

  return parseApiResponse(response)
}
