import { Link } from '@tanstack/react-router'

export function Logo() {
  return (
    <Link
      to="/dashboard"
      className="flex items-center font-semibold tracking-tight text-lg text-foreground hover:opacity-80 transition-opacity"
      aria-label="OpenPulse — go to dashboard"
    >
      <span>open</span>
      <span className="text-red-500">pulse</span>
    </Link>
  )
}
