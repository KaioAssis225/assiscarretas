import { useAuth } from '@/auth/AuthContext'
import { usePageTitle } from '@/lib/usePageTitle'

export default function Dashboard() {
  usePageTitle('Painel')
  const { user } = useAuth()

  return (
    <section>
      <h1 className="text-2xl font-bold">Painel</h1>
      <p className="mt-2 max-w-prose text-slate-600">
        {user ? `Olá, ${user.name.split(' ')[0]}. ` : ''}
        Aqui você verá o resumo da operação: carretas disponíveis, locações do dia e
        devoluções previstas. Os cadastros de clientes e carretas são a próxima etapa a
        entrar no ar.
      </p>
    </section>
  )
}
