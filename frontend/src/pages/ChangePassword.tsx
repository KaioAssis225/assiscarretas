import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { ApiError } from '@/api/client'
import { useAuth } from '@/auth/AuthContext'
import { FieldError, PasswordInput, primaryButtonClass } from '@/components/ui/form'
import { usePageTitle } from '@/lib/usePageTitle'

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Informe a senha atual'),
    newPassword: z.string().min(10, 'A nova senha precisa de pelo menos 10 caracteres'),
    confirm: z.string(),
  })
  .refine((data) => data.newPassword === data.confirm, {
    path: ['confirm'],
    message: 'A confirmação não confere com a nova senha',
  })

type ChangePasswordForm = z.infer<typeof schema>

export default function ChangePassword() {
  usePageTitle('Trocar senha')
  const { changePassword } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordForm>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: ChangePasswordForm) => {
    setServerError(null)
    try {
      await changePassword(data.currentPassword, data.newPassword)
      navigate('/login', {
        replace: true,
        state: { notice: 'Senha alterada com sucesso. Entre com a nova senha.' },
      })
    } catch (error) {
      setServerError(
        error instanceof ApiError ? error.message : 'Falha ao conectar com o servidor.',
      )
    }
  }

  return (
    <main className="flex min-h-screen items-start justify-center bg-slate-50 px-4 py-8 sm:items-center">
      <section className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold">Trocar senha</h1>
        <p className="mt-1 text-sm text-slate-600">
          Por segurança, defina uma nova senha antes de continuar. Depois da troca você fará
          login novamente.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium">
              Senha atual
            </label>
            <PasswordInput
              id="currentPassword"
              autoComplete="current-password"
              aria-invalid={errors.currentPassword ? 'true' : undefined}
              aria-describedby={errors.currentPassword ? 'currentPassword-error' : undefined}
              {...register('currentPassword')}
            />
            <FieldError id="currentPassword-error" message={errors.currentPassword?.message} />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium">
              Nova senha
            </label>
            <PasswordInput
              id="newPassword"
              autoComplete="new-password"
              aria-invalid={errors.newPassword ? 'true' : undefined}
              aria-describedby={
                errors.newPassword ? 'newPassword-hint newPassword-error' : 'newPassword-hint'
              }
              {...register('newPassword')}
            />
            <p id="newPassword-hint" className="mt-1 text-xs text-slate-600">
              Mínimo de 10 caracteres.
            </p>
            <FieldError id="newPassword-error" message={errors.newPassword?.message} />
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-medium">
              Confirmar nova senha
            </label>
            <PasswordInput
              id="confirm"
              autoComplete="new-password"
              aria-invalid={errors.confirm ? 'true' : undefined}
              aria-describedby={errors.confirm ? 'confirm-error' : undefined}
              {...register('confirm')}
            />
            <FieldError id="confirm-error" message={errors.confirm?.message} />
          </div>

          {serverError && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {serverError}
            </p>
          )}

          <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
            {isSubmitting ? 'Salvando…' : 'Salvar nova senha'}
          </button>
        </form>
      </section>
    </main>
  )
}
