import { cn } from '@/lib/utils'
import { useScrollDirection } from '@/hooks/useScrollDirection'

interface SmartHeaderProps {
  children: React.ReactNode
}

export function SmartHeader({ children }: SmartHeaderProps) {
  const direction = useScrollDirection()

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur transition-transform duration-300',
        direction === 'down' ? '-translate-y-full md:translate-y-0' : 'translate-y-0'
      )}
    >
      {children}
    </header>
  )
}
