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
          <nav aria-label="Navegação principal" className="flex gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors ${focusRingClass} ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
              className={`flex min-h-11 shrink-0 items-center rounded-md px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 ${focusRingClass}`}
            >
              Sair
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
