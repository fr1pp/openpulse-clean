import { useNavigate } from '@tanstack/react-router'
import { ChevronsUpDown, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useLogout } from '@/api/mutations/auth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

export function SidebarUserMenu() {
  const { user } = useAuth()
  const logout = useLogout()
  const navigate = useNavigate()
  const { isMobile } = useSidebar()

  const initials =
    (user?.firstName?.charAt(0) ?? '') + (user?.lastName?.charAt(0) ?? '')

  const fullName = user
    ? `${user.firstName} ${user.lastName}`
    : 'User'

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{fullName}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuItem
              onClick={() => {
                logout.mutate(undefined, {
                  onSuccess: () => {
                    navigate({ to: '/login' })
                  },
                })
              }}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
