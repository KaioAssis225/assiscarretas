import { forwardRef, useState, type InputHTMLAttributes } from 'react'

/** Vocabulário único de formulário — usado por todas as telas. */

export const inputClass =
  'mt-1 block min-h-11 w-full rounded-md border border-slate-300 px-3 text-sm ' +
  'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ' +
  'aria-[invalid=true]:border-red-600'

export const primaryButtonClass =
  'min-h-11 w-full rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground ' +
  'transition-colors hover:bg-primary/90 disabled:opacity-60 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'

export const focusRingClass =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="mt-1 text-sm text-red-600">
      {message}
    </p>
  )
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
      {off && <line x1="3" y1="21" x2="21" y2="3" />}
    </svg>
  )
}

/** Campo de senha com alternância mostrar/ocultar (alvo de toque ≥44px). */
export const PasswordInput = forwardRef<
  HTMLInputElement,
  Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'>
>(function PasswordInput(props, ref) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <input ref={ref} {...props} type={visible ? 'text' : 'password'} className={`${inputClass} pr-12`} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        className={`absolute inset-y-0 right-0 flex min-h-11 w-11 items-center justify-center rounded-md text-slate-500 transition-colors hover:text-slate-800 ${focusRingClass}`}
      >
        <EyeIcon off={visible} />
      </button>
    </div>
  )
})
