import { createFileRoute, redirect, Link, useNavigate } from '@tanstack/react-router'
import { z } from 'zod/v4'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { LoginForm } from '@/components/auth/LoginForm'
import { useLogin } from '@/api/mutations/auth'

const loginSearchSchema = z.object({
  redirect: z.string().optional().default('/dashboard'),
})

export const Route = createFileRoute('/login')({
  validateSearch: loginSearchSchema,
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated && context.auth.user?.role === 'healthcare_pro') {
      throw redirect({ to: search.redirect || '/dashboard' })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const { redirect: redirectTo } = Route.useSearch()
  const navigate = useNavigate()
  const login = useLogin()

  const handleSubmit = (email: string, password: string) => {
    login.mutate(
      { email, password },
      {
        onSuccess: () => {
          navigate({ to: redirectTo || '/dashboard' })
        },
      },
    )
  }

  const errorMessage = login.error
    ? login.error.message.toLowerCase().includes('invalid') ||
      login.error.message.toLowerCase().includes('incorrect')
      ? 'Incorrect email or password. Please try again.'
      : 'Something went wrong. Please try again.'
    : null

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 px-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 text-3xl font-bold tracking-tight text-primary">
              OpenPulse
            </div>
            <CardTitle className="text-xl">Healthcare Professional Login</CardTitle>
            <CardDescription>
              Sign in to access the monitoring dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm
              onSubmit={handleSubmit}
              isPending={login.isPending}
              error={errorMessage}
            />

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Are you a patient?{' '}
              <Link
                to="/patient-login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Log in here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
