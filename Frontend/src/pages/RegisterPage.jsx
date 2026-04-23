import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { registerUser } from '../services/authApi'
import { useAuth } from '../context/useAuth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const passwordValue = watch('password')

  const onSubmit = async (values) => {
    setServerError('')

    try {
      const response = await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
      })

      if (response.token) {
        login(response)
        navigate('/userinfo')
        return
      }

      navigate('/login')
    } catch (error) {
      setServerError(error.message)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto flex min-h-[90vh] w-full max-w-6xl items-center justify-center rounded-3xl bg-linear-to-br from-rose-100 via-sky-100 to-lime-100 p-4 md:p-8">
        <section className="w-full max-w-md rounded-2xl border border-white/80 bg-white/85 p-7 shadow-2xl backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Minor Project</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-800">Create your account</h1>
          <p className="mt-1 text-sm text-slate-600">Start collaborating with your team in minutes.</p>

          <form className="mt-5 grid gap-2" onSubmit={handleSubmit(onSubmit)}>
            <label className="mt-1 text-sm font-semibold text-slate-700" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            type="text"
            placeholder="John Doe"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none ring-sky-300 transition focus:ring"
            {...register('name', {
              required: 'Name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters',
              },
            })}
          />
            {errors.name ? <p className="text-sm text-rose-600">{errors.name.message}</p> : null}

            <label className="mt-1 text-sm font-semibold text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none ring-sky-300 transition focus:ring"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address',
              },
            })}
          />
            {errors.email ? <p className="text-sm text-rose-600">{errors.email.message}</p> : null}

            <label className="mt-1 text-sm font-semibold text-slate-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Create a password"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none ring-sky-300 transition focus:ring"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            })}
          />
            {errors.password ? <p className="text-sm text-rose-600">{errors.password.message}</p> : null}

            <label className="mt-1 text-sm font-semibold text-slate-700" htmlFor="confirmPassword">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter password"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none ring-sky-300 transition focus:ring"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === passwordValue || 'Passwords do not match',
            })}
          />
            {errors.confirmPassword ? <p className="text-sm text-rose-600">{errors.confirmPassword.message}</p> : null}

            {serverError ? <p className="text-sm text-rose-600">{serverError}</p> : null}

            <button
              className="mt-3 rounded-xl bg-linear-to-r from-rose-500 via-amber-500 to-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={isSubmitting}
            >
            {isSubmitting ? 'Creating account...' : 'Register'}
          </button>
        </form>

          <p className="mt-4 text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-sky-700 hover:underline">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  )
}
