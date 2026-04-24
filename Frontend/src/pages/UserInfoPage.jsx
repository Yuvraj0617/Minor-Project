import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
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
    if (!user?._id) {
      toast.error('User not found. Please login again.')
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
      toast.success(response?.message || 'Profile info saved successfully.')
      navigate('/app')
    } catch (error) {
      toast.error(error?.message || 'Unable to save profile info.')
    }
  }

  return (
    <main className="auth-layout app-page">
      <section className="auth-card">
        <aside className="auth-brand-panel">
          <div>
            <span className="brand-tag">
              <span className="brand-mark">C</span>
              CraftBridge Onboarding
            </span>
            <h1 className="brand-headline">Tell teammates who you are and what you can build.</h1>
            <p className="brand-copy">
              Rich creator profiles improve matching quality and make project recruitment faster.
            </p>
          </div>

          <ul className="brand-list">
            <li>Clear role and skill tags increase match precision.</li>
            <li>Portfolio links help teammates verify fit quickly.</li>
            <li>A complete profile improves acceptance rates.</li>
          </ul>
        </aside>

        <section className="auth-form-panel">
          <div>
            <p className="kicker">Profile Setup</p>
            <h2 className="page-title">Complete your creator profile</h2>
            <p className="page-subtitle">Add your details once, then CraftBridge can recommend relevant projects and partners.</p>
          </div>

          <form className="field-grid" onSubmit={handleSubmit(onSubmit)}>
            <div className="field-group">
              <label className="field-label" htmlFor="Institution">Institution</label>
              <input
                id="Institution"
                type="text"
                className="field-input"
                placeholder="Your college or company"
                {...register('Institution', {
                  required: 'Institution is required',
                })}
              />
              {errors.Institution ? <p className="helper-error">{errors.Institution.message}</p> : null}
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="Bio">Bio</label>
              <textarea
                id="Bio"
                className="field-input field-textarea"
                placeholder="Tell collaborators about your strengths and interests"
                {...register('Bio')}
              />
            </div>

            <div className="field-grid two">
              <div className="field-group">
                <label className="field-label" htmlFor="Role">Roles</label>
                <input
                  id="Role"
                  type="text"
                  className="field-input"
                  placeholder="frontend developer, ui designer"
                  {...register('Role')}
                />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="Skills">Skills</label>
                <input
                  id="Skills"
                  type="text"
                  className="field-input"
                  placeholder="react, node, mongodb"
                  {...register('Skills')}
                />
              </div>
            </div>

            <div className="field-grid two">
              <div className="field-group">
                <label className="field-label" htmlFor="Github">Github URL</label>
                <input
                  id="Github"
                  type="url"
                  className="field-input"
                  placeholder="https://github.com/username"
                  {...register('Github')}
                />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="LinkedIn">LinkedIn URL</label>
                <input
                  id="LinkedIn"
                  type="url"
                  className="field-input"
                  placeholder="https://linkedin.com/in/username"
                  {...register('LinkedIn')}
                />
              </div>
            </div>
            <button className="btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving info...' : 'Continue to dashboard'}
            </button>
          </form>
        </section>
      </section>
    </main>
  )
}
