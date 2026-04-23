import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { createUserInfo } from '../services/authApi'
import { useAuth } from '../context/useAuth'

function splitByComma(value) {
  if (!value.trim()) {
    return []
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export default function UserInfoPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const { token, user, saveProfileInfo } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      Institution: '',
      Bio: '',
      Role: '',
      Skills: '',
      Github: '',
      LinkedIn: '',
    },
  })

  const onSubmit = async (values) => {
    setServerError('')

    if (!user?._id) {
      setServerError('User not found. Please login again.')
      return
    }

    const payload = {
      Institution: values.Institution,
      Bio: values.Bio,
      Role: splitByComma(values.Role),
      Skills: splitByComma(values.Skills),
      Github: values.Github,
      LinkedIn: values.LinkedIn,
    }

    try {
      const response = await createUserInfo(payload, token)
      saveProfileInfo(response.data || payload)
      navigate('/app')
    } catch (error) {
      setServerError(error.message)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto flex min-h-[90vh] w-full max-w-6xl items-center justify-center rounded-3xl bg-linear-to-br from-amber-100 via-cyan-100 to-emerald-100 p-4 md:p-8">
        <section className="w-full max-w-2xl rounded-2xl border border-white/80 bg-white/85 p-7 shadow-2xl backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Complete Your Profile</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-800">User Info Form</h1>
          <p className="mt-1 text-sm text-slate-600">Add your details to continue to your profile.</p>

          <form className="mt-5 grid gap-2" onSubmit={handleSubmit(onSubmit)}>
            <label className="mt-1 text-sm font-semibold text-slate-700" htmlFor="Institution">
            Institution
          </label>
          <input
            id="Institution"
            type="text"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none ring-sky-300 transition focus:ring"
            placeholder="Your college or company"
            {...register('Institution', {
              required: 'Institution is required',
            })}
          />
            {errors.Institution ? <p className="text-sm text-rose-600">{errors.Institution.message}</p> : null}

            <label className="mt-1 text-sm font-semibold text-slate-700" htmlFor="Bio">
            Bio
          </label>
          <textarea
            id="Bio"
            className="min-h-28 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none ring-sky-300 transition focus:ring"
            placeholder="Tell us a little about yourself"
            {...register('Bio')}
          />

            <label className="mt-1 text-sm font-semibold text-slate-700" htmlFor="Role">
            Roles
          </label>
          <input
            id="Role"
            type="text"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none ring-sky-300 transition focus:ring"
            placeholder="frontend developer, ui designer"
            {...register('Role')}
          />

            <label className="mt-1 text-sm font-semibold text-slate-700" htmlFor="Skills">
            Skills
          </label>
          <input
            id="Skills"
            type="text"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none ring-sky-300 transition focus:ring"
            placeholder="react, node, mongodb"
            {...register('Skills')}
          />

            <label className="mt-1 text-sm font-semibold text-slate-700" htmlFor="Github">
            Github URL
          </label>
          <input
            id="Github"
            type="url"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none ring-sky-300 transition focus:ring"
            placeholder="https://github.com/username"
            {...register('Github')}
          />

            <label className="mt-1 text-sm font-semibold text-slate-700" htmlFor="LinkedIn">
            LinkedIn URL
          </label>
          <input
            id="LinkedIn"
            type="url"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none ring-sky-300 transition focus:ring"
            placeholder="https://linkedin.com/in/username"
            {...register('LinkedIn')}
          />

            {serverError ? <p className="text-sm text-rose-600">{serverError}</p> : null}

            <button
              className="mt-3 rounded-xl bg-linear-to-r from-amber-500 via-orange-500 to-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={isSubmitting}
            >
            {isSubmitting ? 'Saving info...' : 'Continue to Profile'}
          </button>
        </form>
        </section>
      </div>
    </main>
  )
}
