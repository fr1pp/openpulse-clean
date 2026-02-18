import { createFileRoute, redirect, Link, useNavigate } from '@tanstack/react-router'
import { z } from 'zod/v4'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-md">
          <CardHeader className="pb-4 pt-8 text-center">
            {/* Wordmark */}
            <div className="mb-6 flex items-center justify-center text-2xl font-semibold tracking-tight">
              <span className="text-foreground">open</span>
              <span className="text-red-500">pulse</span>
            </div>
            <h1 className="text-xl font-semibold text-foreground">Sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Healthcare professional access
            </p>
          </CardHeader>
          <CardContent className="pb-8">
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
