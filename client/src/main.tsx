import { StrictMode, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { routeTree } from './routeTree.gen'
import { queryClient } from './lib/queryClient'
import { useAuth } from './hooks/useAuth'

import './styles/globals.css'

// Create router with context
const router = createRouter({
  routeTree,
  context: {
    auth: undefined!,
    queryClient,
  },
})

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function AuthedRouterProvider() {
  const auth = useAuth()

  // Invalidate router when auth state changes so beforeLoad guards re-evaluate
  useEffect(() => {
    router.invalidate()
  }, [auth.user])

  return <RouterProvider router={router} context={{ auth, queryClient }} />
}

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <AuthedRouterProvider />
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>,
  )
}
