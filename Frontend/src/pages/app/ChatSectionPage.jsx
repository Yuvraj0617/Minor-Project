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
    <div className="grid gap-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-2xl backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">Chat</p>
        <h2 className="mt-3 text-3xl font-bold text-white">Collaboration setup</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">Your backend currently supports chat token generation and conversation setup. This section exposes those capabilities cleanly for the MVP.</p>
        {loading ? <p className="mt-6 text-sm text-slate-300">Loading chat data...</p> : null}
        {message ? <p className="mt-6 text-sm font-medium text-emerald-300">{message}</p> : null}
        {error ? <p className="mt-6 text-sm font-medium text-rose-300">{error}</p> : null}

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-[1.5rem] border border-white/10 bg-slate-950/30 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Chat token</p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-400">SDK App ID</p>
                <p className="mt-1 break-all text-sm text-white">{chatToken?.sdkAppId || 'N/A'}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-400">User ID</p>
                <p className="mt-1 break-all text-sm text-white">{chatToken?.userId || 'N/A'}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-400">User Sig</p>
                <p className="mt-1 break-all text-sm text-white">{chatToken?.userSig || 'N/A'}</p>
              </div>
            </div>
          </article>

          <article className="rounded-[1.5rem] border border-white/10 bg-slate-950/30 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Create conversation</p>
            <form className="mt-4 grid gap-3" onSubmit={handleCreateConversation}>
              <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none ring-sky-400/40 focus:ring" placeholder="Target user id" value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)} />
              <button className="rounded-2xl bg-linear-to-r from-sky-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white" type="submit">Start conversation</button>
            </form>

            <div className="mt-6 grid gap-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">My conversations</p>
              {conversations.length === 0 ? <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-300">No conversations available yet.</div> : conversations.map((conversation) => (
                <div key={conversation._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{conversation.type}</p>
                  <p className="mt-2 text-sm text-slate-200">Members: {(conversation.members || []).map((member) => member.name || member.email || member._id).join(', ')}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}
