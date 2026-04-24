import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { loginUser } from '../services/authApi'
import { useAuth } from '../context/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values) => {
    try {
      const response = await loginUser(values)
      login(response)
      toast.success(response?.message || 'Login successful. Welcome back!')
      navigate('/app')
    } catch (error) {
      toast.error(error?.message || 'Unable to login. Please try again.')
    }
  }

  return (
    <main className="auth-layout app-page">
      <section className="auth-card">
        <aside className="auth-brand-panel">
          <div>
            <span className="brand-tag">
              <span className="brand-mark">C</span>
              CraftBridge
            </span>
            <h1 className="brand-headline">Meet your ideal team partner and build faster.</h1>
            <p className="brand-copy">
              CraftBridge helps creators find aligned collaborators through profile quality, skill matching, and project-intent signals.
            </p>
          </div>

          <ul className="brand-list">
            <li>Discover projects that fit your role and stack.</li>
            <li>Apply, get accepted, and move to chat in one flow.</li>
            <li>Track your collaboration pipeline in real time.</li>
          </ul>
        </aside>

        <section className="auth-form-panel">
          <div>
            <p className="kicker">Welcome Back</p>
            <h2 className="page-title">Sign in to your workspace</h2>
            <p className="page-subtitle">Continue your active applications, matches, and project conversations.</p>
          </div>

          <form className="field-grid" onSubmit={handleSubmit(onSubmit)}>
            <div className="field-group">
              <label className="field-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="field-input"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address',
                  },
                })}
              />
              {errors.email ? <p className="helper-error">{errors.email.message}</p> : null}
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Your password"
                className="field-input"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />
              {errors.password ? <p className="helper-error">{errors.password.message}</p> : null}
            </div>
            <button className="btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <p className="page-subtitle">
            New to CraftBridge?{' '}
            <Link to="/register" className="text-cyan-300 hover:text-cyan-200">
              Create your account
            </Link>
          </p>
        </section>
      </section>
    </main>
  )
}
