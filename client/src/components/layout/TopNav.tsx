import { useState } from 'react'
import { Link, useRouterState, useNavigate } from '@tanstack/react-router'
import { Menu, LogOut, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useScrollDirection } from '@/hooks/useScrollDirection'
import { useAuth } from '@/hooks/useAuth'
import { useLogout } from '@/api/mutations/auth'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from './UserMenu'
import { ConnectionIndicator } from '@/components/connection/ConnectionIndicator'
import { DevPanelTrigger } from '@/components/dev-panel/DevPanelTrigger'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const { user } = useAuth()
  const logout = useLogout()
  const navigate = useNavigate()

  const initials = (user?.firstName?.charAt(0) ?? '') + (user?.lastName?.charAt(0) ?? '')
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'User'
  const email = user?.email ?? ''

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => {
        navigate({ to: '/login' })
        setMobileMenuOpen(false)
      },
    })
  }

  return (
    <>
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

          {/* Center: Nav links (desktop only) */}
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
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-72 pt-safe">
          <SheetHeader className="text-left mb-4">
            <SheetTitle className="text-base font-semibold">Menu</SheetTitle>
          </SheetHeader>

          {/* Nav links */}
          <nav className="flex flex-col gap-1 mb-6">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.matchPrefix)
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'text-foreground bg-muted/60'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <Separator className="mb-4" />

          {/* User info */}
          <div className="flex items-center gap-3 px-3 mb-4">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100 text-xs font-semibold">
                {initials || <User className="h-3.5 w-3.5" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm font-medium leading-snug truncate">{fullName}</span>
              {email && <span className="text-xs text-muted-foreground truncate">{email}</span>}
            </div>
          </div>

          {/* Logout */}
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground gap-2"
            onClick={handleLogout}
            disabled={logout.isPending}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </SheetContent>
      </Sheet>
    </>
  )
}
