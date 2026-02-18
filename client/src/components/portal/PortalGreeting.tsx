interface PortalGreetingProps {
  firstName: string | undefined
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function getWellnessNote(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Here's how you're starting your day"
  if (hour < 18) return "Here's how you're doing today"
  return "Here's how you're doing this evening"
}

export function PortalGreeting({ firstName }: PortalGreetingProps) {
  const greeting = getGreeting()
  const wellnessNote = getWellnessNote()

  return (
    <div className="mb-8 bg-card rounded-2xl p-6 md:p-8 border border-border shadow-sm">
      {/* Time-aware greeting with patient name — large, warm, personal */}
      <h1 className="text-2xl md:text-3xl font-semibold text-foreground leading-tight">
        {greeting}
        {firstName && (
          <>
            ,{' '}
            <span className="text-primary">{firstName}</span>
          </>
        )}
      </h1>
      <p className="text-base text-muted-foreground mt-2">{wellnessNote}</p>
    </div>
  )
}
