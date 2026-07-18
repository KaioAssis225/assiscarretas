import { Link } from 'react-router-dom'
import { focusRingClass } from '@/components/ui/form'
import { usePageTitle } from '@/lib/usePageTitle'

export default function NotFound() {
  usePageTitle('Página não encontrada')
  return (
    <section className="py-16 text-center">
      <h1 className="text-3xl font-bold">Página não encontrada</h1>
      <p className="mt-2 text-slate-600">O endereço acessado não existe.</p>
      <Link
        to="/"
        className={`mt-6 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 ${focusRingClass}`}
      >
        Voltar ao início
      </Link>
    </section>
  )
}
