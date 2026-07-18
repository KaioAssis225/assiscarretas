import { useEffect } from 'react'

/** Define o título da aba por rota (leitores de tela e alt-tab). */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · AssisCarretas`
    return () => {
      document.title = 'AssisCarretas'
    }
  }, [title])
}
