import { useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { LayoutDashboard, Users, User, LogOut } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useLogout } from '@/api/mutations/auth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const navTabs = [
  {
    label: 'Dashboard',
    to: '/dashboard' as const,
    matchPrefix: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Patients',
    to: '/management' as const,
    matchPrefix: '/management',
    icon: Users,
  },
] as const

export function MobileTabBar() {
  const [profileOpen, setProfileOpen] = useState(false)
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { user } = useAuth()
  const logout = useLogout()
  const navigate = useNavigate()

  const initials =
    (user?.firstName?.charAt(0) ?? '') + (user?.lastName?.charAt(0) ?? '')
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'User'
  const email = user?.email ?? ''

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => {
        navigate({ to: '/login' })
        setProfileOpen(false)
      },
    })
  }

  return (
    <>
      <nav
        className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-border bg-background"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-stretch h-16">
          {navTabs.map((tab) => {
            const isActive = pathname.startsWith(tab.matchPrefix)
            const Icon = tab.icon

            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={cn(
                  'flex flex-1 flex-col items-center justify-center gap-1 min-h-[44px] min-w-[44px] text-xs font-medium transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </Link>
            )
          })}

          {/* Profile tab — opens bottom sheet */}
          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 min-h-[44px] min-w-[44px] text-xs font-medium transition-colors',
              profileOpen
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
            aria-label="Open profile menu"
          >
            <User className="h-5 w-5" />
            <span>Profile</span>
          </button>
        </div>
      </nav>

      {/* Profile bottom sheet */}
      <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-safe">
          <SheetHeader className="text-left mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100 text-sm font-semibold">
                  {initials || <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0.5">
                <SheetTitle className="text-base font-semibold leading-snug">
                  {fullName}
                </SheetTitle>
                {email && (
                  <SheetDescription className="text-sm text-muted-foreground truncate">
                    {email}
                  </SheetDescription>
                )}
              </div>
            </div>
          </SheetHeader>

          <Separator className="mb-4" />

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
