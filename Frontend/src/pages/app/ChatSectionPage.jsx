import { useEffect, useState } from 'react'
import { createConversation, getChatToken, getMyChats } from '../../services/authApi'
import { useAuth } from '../../context/useAuth'

export default function ChatSectionPage() {
  const { token } = useAuth()
  const [chatToken, setChatToken] = useState(null)
  const [conversations, setConversations] = useState([])
  const [targetUserId, setTargetUserId] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadChatData() {
    try {
      const [tokenResponse, chatsResponse] = await Promise.all([getChatToken(token), getMyChats(token)])
      setChatToken(tokenResponse)
      setConversations(Array.isArray(chatsResponse) ? chatsResponse : chatsResponse.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadChatData()
  }, [token])

  async function handleCreateConversation(event) {
    event.preventDefault()
    setMessage('')
    setError('')
    try {
      await createConversation(targetUserId, token)
      setTargetUserId('')
      setMessage('Conversation created successfully.')
      await loadChatData()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section>
      <div className="cb-feed-head">
        <div>
          <h2 className="cb-title">Chat Workspace</h2>
          <p className="cb-sub">Create and manage teammate conversations</p>
        </div>
      </div>

      {loading ? <p className="cb-sub">Loading chat data...</p> : null}
      {message ? <p className="cb-sub" style={{ color: '#1f8f46' }}>{message}</p> : null}
      {error ? <p className="cb-sub" style={{ color: '#d64c58' }}>{error}</p> : null}

      <div className="cb-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <article className="cb-card">
          <h3>Chat Credentials</h3>
          <div className="cb-application">
            <strong>SDK App ID</strong>
            <p>{chatToken?.sdkAppId || 'N/A'}</p>
          </div>
          <div className="cb-application">
            <strong>User ID</strong>
            <p>{chatToken?.userId || 'N/A'}</p>
          </div>
          <div className="cb-application">
            <strong>User Sig</strong>
            <p>{chatToken?.userSig || 'N/A'}</p>
          </div>
        </article>

        <article className="cb-card">
          <h3>New Conversation</h3>
          <form className="field-grid" onSubmit={handleCreateConversation} style={{ marginTop: '0.65rem' }}>
            <input className="field-input" placeholder="Target user id" value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)} />
            <button className="cb-mini-btn primary" type="submit">Start conversation</button>
          </form>

          <div style={{ marginTop: '0.8rem' }}>
            <h3>My conversations</h3>
            {conversations.length === 0 ? <div className="cb-application">No conversations available yet.</div> : conversations.map((conversation) => (
              <div key={conversation._id} className="cb-application">
                <div className="cb-card-kicker"><span>{conversation.type}</span></div>
                <p>Members: {(conversation.members || []).map((member) => member.name || member.email || member._id).join(', ')}</p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}
