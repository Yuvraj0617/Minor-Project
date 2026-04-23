import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { loginUser } from '../services/authApi'
import { useAuth } from '../context/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
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
    setServerError('')

    try {
      const response = await loginUser(values)
      login(response)
      navigate('/app')
    } catch (error) {
      setServerError(error.message)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto flex min-h-[90vh] w-full max-w-6xl items-center justify-center rounded-3xl bg-linear-to-br from-orange-100 via-sky-100 to-emerald-100 p-4 md:p-8">
        <section className="w-full max-w-md rounded-2xl border border-white/80 bg-white/80 p-7 shadow-2xl backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Minor Project</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-800">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-600">Login to continue to your project space.</p>

          <form className="mt-5 grid gap-2" onSubmit={handleSubmit(onSubmit)}>
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
            placeholder="Your password"
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

            {serverError ? <p className="text-sm text-rose-600">{serverError}</p> : null}

            <button
              className="mt-3 rounded-xl bg-linear-to-r from-orange-500 via-amber-500 to-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={isSubmitting}
            >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

          <p className="mt-4 text-sm text-slate-600">
            New here?{' '}
            <Link to="/register" className="font-semibold text-sky-700 hover:underline">
              Create an account
            </Link>
          </p>
        </section>
      </div>
    </main>
  )
}
