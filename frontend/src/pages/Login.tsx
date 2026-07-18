import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { ApiError } from '@/api/client'
import { useAuth } from '@/auth/AuthContext'
import {
  FieldError,
  inputClass,
  PasswordInput,
  primaryButtonClass,
} from '@/components/ui/form'
import { usePageTitle } from '@/lib/usePageTitle'

const loginSchema = z.object({
  email: z.string().email('Informe um e-mail válido'),
  password: z.string().min(1, 'Informe a senha'),
})

type LoginForm = z.infer<typeof loginSchema>

interface LoginLocationState {
  from?: string
  notice?: string
}

export default function Login() {
  usePageTitle('Entrar')
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState<string | null>(null)

  const state = (location.state as LoginLocationState | null) ?? {}

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginForm) => {
    setServerError(null)
    try {
      const user = await login(data.email, data.password)
      if (user.must_change_password) {
        navigate('/trocar-senha', { replace: true })
        return
      }
      navigate(state.from ?? '/', { replace: true })
    } catch (error) {
      setServerError(
        error instanceof ApiError ? error.message : 'Falha ao conectar com o servidor.',
      )
    }
  }

  return (
    <main className="flex min-h-screen items-start justify-center bg-slate-50 px-4 py-8 sm:items-center">
      <section className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-primary">AssisCarretas</h1>
        <p className="mt-1 text-sm text-slate-600">Entre com a sua conta</p>

        {state.notice && (
          <p
            role="status"
            className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
          >
            {state.notice}
          </p>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              autoFocus
              className={inputClass}
              aria-invalid={errors.email ? 'true' : undefined}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
            />
            <FieldError id="email-error" message={errors.email?.message} />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Senha
            </label>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              aria-invalid={errors.password ? 'true' : undefined}
              aria-describedby={errors.password ? 'password-error' : undefined}
              {...register('password')}
            />
            <FieldError id="password-error" message={errors.password?.message} />
          </div>

          {serverError && (
            <div role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              <p>{serverError}</p>
              <p className="mt-1 text-red-900/70">
                Esqueceu a senha? Peça ao gestor para redefinir o seu acesso.
              </p>
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  )
}
