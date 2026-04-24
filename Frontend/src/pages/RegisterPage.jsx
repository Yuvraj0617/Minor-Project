import { Link, useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'react-toastify'
import { registerUser } from '../services/authApi'
import { useAuth } from '../context/useAuth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const passwordValue = useWatch({ control, name: 'password' })

  const onSubmit = async (values) => {
    try {
      const response = await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
      })

      if (response.token) {
        login(response)
        toast.success(response?.message || 'Account created successfully.')
        navigate('/userinfo')
        return
      }

      toast.success(response?.message || 'Account created. Please sign in.')
      navigate('/login')
    } catch (error) {
      toast.error(error?.message || 'Unable to register. Please try again.')
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
            <h1 className="brand-headline">Create your creator profile in under two minutes.</h1>
            <p className="brand-copy">
              Build trust with teammates using profile clarity, role intent, and skill visibility from day one.
            </p>
          </div>

          <ul className="brand-list">
            <li>Post projects and recruit contributors quickly.</li>
            <li>Receive recommendation-based matches automatically.</li>
            <li>Grow a professional collaboration portfolio over time.</li>
          </ul>
        </aside>

        <section className="auth-form-panel">
          <div>
            <p className="kicker">Get Started</p>
            <h2 className="page-title">Create your CraftBridge account</h2>
            <p className="page-subtitle">Sign up, complete your profile, and start finding your ideal team partner.</p>
          </div>

          <form className="field-grid" onSubmit={handleSubmit(onSubmit)}>
            <div className="field-group">
              <label className="field-label" htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                className="field-input"
                {...register('name', {
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                })}
              />
              {errors.name ? <p className="helper-error">{errors.name.message}</p> : null}
            </div>

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

            <div className="field-grid two">
              <div className="field-group">
                <label className="field-label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Create a password"
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

              <div className="field-group">
                <label className="field-label" htmlFor="confirmPassword">Confirm password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  className="field-input"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === passwordValue || 'Passwords do not match',
                  })}
                />
                {errors.confirmPassword ? <p className="helper-error">{errors.confirmPassword.message}</p> : null}
              </div>
            </div>
            <button className="btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <p className="page-subtitle">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-300 hover:text-cyan-200">
              Sign in
            </Link>
          </p>
        </section>
      </section>
    </main>
  )
}
