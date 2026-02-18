interface PortalGreetingProps {
  firstName: string | undefined
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function PortalGreeting({ firstName }: PortalGreetingProps) {
  const greeting = getGreeting()

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-slate-800">
        {greeting}, {firstName}
      </h1>
      <p className="text-base text-slate-500">Here's how you're doing today</p>
    </div>
  )
}
