import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { focusRingClass } from '@/components/ui/form'

const navItems = [
  { to: '/', label: 'Painel' },
  // Próximos blocos: /carretas, /clientes, /locacoes, /manutencao
]

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:gap-6">
          <span className="text-lg font-bold text-primary">AssisCarretas</span>
          {/* No mobile a nav é uma barra fixa inferior (zona do polegar);
              no desktop (md+) volta a ser a fileira do topo. z-20 = camada
              de navegação fixa (única camada elevada do app até aqui). */}
          <nav
            aria-label="Navegação principal"
            className="fixed inset-x-0 bottom-0 z-20 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:static md:inset-auto md:z-auto md:gap-1 md:border-0 md:bg-transparent md:pb-0"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex min-h-12 flex-1 items-center justify-center text-sm font-medium transition-colors md:min-h-11 md:flex-none md:justify-start md:rounded-md md:px-3 ${focusRingClass} ${
                    isActive
                      ? 'text-primary md:bg-primary/10'
                      : 'text-slate-600 hover:text-slate-900 active:bg-slate-100 md:hover:bg-slate-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex min-w-0 items-center gap-3">
            {user && (
              <span className="hidden max-w-[12rem] truncate text-sm text-slate-600 sm:inline">
                {user.name}
              </span>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className={`flex min-h-11 shrink-0 items-center rounded-md px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 ${focusRingClass}`}
            >
              Sair
            </button>
          </div>
        </div>
      </header>
      {/* pb extra no mobile para o conteúdo não ficar atrás da barra inferior */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 md:pb-6">
        <Outlet />
      </main>
    </div>
  )
}
