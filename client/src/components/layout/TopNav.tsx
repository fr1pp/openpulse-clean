import { Link, useRouterState } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { useScrollDirection } from '@/hooks/useScrollDirection'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from './UserMenu'
import { ConnectionIndicator } from '@/components/connection/ConnectionIndicator'
import { DevPanelTrigger } from '@/components/dev-panel/DevPanelTrigger'

interface TopNavProps {
  onDevPanelOpen: () => void
}

const navLinks = [
  { label: 'Dashboard', to: '/dashboard', matchPrefix: '/dashboard' },
  { label: 'Patients', to: '/management', matchPrefix: '/management' },
] as const

export function TopNav({ onDevPanelOpen }: TopNavProps) {
  const direction = useScrollDirection()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm transition-transform duration-300',
        direction === 'down' ? '-translate-y-full md:translate-y-0' : 'translate-y-0'
      )}
    >
      <div className="flex items-center justify-between h-14 px-4 md:px-6 mx-auto max-w-7xl">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Logo />
        </div>

        {/* Center/Right: Nav links (desktop only) */}
        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.matchPrefix)
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm transition-colors',
                  isActive
                    ? 'text-foreground font-medium bg-muted/60'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Far right: utility icons + user */}
        <div className="flex items-center gap-1">
          <ConnectionIndicator />
          <ThemeToggle />
          <DevPanelTrigger onClick={onDevPanelOpen} />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
