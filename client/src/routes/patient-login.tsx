import { createFileRoute, redirect, Link, useNavigate } from '@tanstack/react-router'
import { z } from 'zod/v4'
import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PatientCodeInput } from '@/components/auth/PatientCodeInput'
import { usePatientLogin } from '@/api/mutations/auth'

const patientLoginSearchSchema = z.object({
  code: z.string().optional().default(''),
  redirect: z.string().optional().default('/portal/vitals'),
})

export const Route = createFileRoute('/patient-login')({
  validateSearch: patientLoginSearchSchema,
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated && context.auth.user?.role === 'patient') {
      throw redirect({ to: search.redirect || '/portal/vitals' })
    }
  },
  component: PatientLoginPage,
})

function PatientLoginPage() {
  const { code: initialCode, redirect: redirectTo } = Route.useSearch()
  const navigate = useNavigate()
  const patientLogin = usePatientLogin()

  const [code, setCode] = useState(initialCode || '')
  const [showScanner, setShowScanner] = useState(false)
  const autoSubmitDone = useRef(false)

  const handleLogin = (codeToSubmit?: string) => {
    const submitCode = codeToSubmit || code
    if (submitCode.length !== 4) return

    patientLogin.mutate(
      { code: submitCode },
      {
        onSuccess: () => {
          navigate({ to: redirectTo || '/portal/vitals' })
        },
      },
    )
  }

  // Auto-submit when code comes from URL search param
  useEffect(() => {
    if (initialCode && initialCode.length === 4 && !autoSubmitDone.current) {
      autoSubmitDone.current = true
      const timer = setTimeout(() => {
        handleLogin(initialCode)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [initialCode])

  const errorMessage = patientLogin.error
    ? patientLogin.error.message.toLowerCase().includes('invalid') ||
      patientLogin.error.message.toLowerCase().includes('access code') ||
      patientLogin.error.message.toLowerCase().includes('not found')
      ? "We didn't recognise that code. Please check the code on your card and try again."
      : 'Something went wrong. Please try again.'
    : null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleLogin()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-teal-50 to-emerald-50 px-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 text-3xl font-bold tracking-tight text-primary">
              OpenPulse
            </div>
            <CardTitle className="text-xl">Welcome</CardTitle>
            <CardDescription className="text-base">
              Enter your access code to view your health information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showScanner ? (
              <div className="flex flex-col items-center gap-4">
                {/* QR scanner will be integrated in Task 2 */}
                <p className="text-center text-sm text-muted-foreground">
                  QR scanner loading...
                </p>
                <Button
                  variant="outline"
                  onClick={() => setShowScanner(false)}
                  className="min-h-[44px]"
                >
                  Back to code entry
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {errorMessage && (
                  <div className="rounded-lg bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">
                    {errorMessage}
                  </div>
                )}

                <div className="flex flex-col items-center gap-3">
                  <label className="text-sm font-medium text-muted-foreground">
                    Your access code
                  </label>
                  <PatientCodeInput
                    value={code}
                    onChange={setCode}
                    disabled={patientLogin.isPending}
                    autoFocus={!initialCode}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={code.length !== 4 || patientLogin.isPending}
                  className="min-h-[48px] text-base font-semibold"
                >
                  {patientLogin.isPending ? 'Checking code...' : 'Log In'}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">or</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowScanner(true)}
                  className="min-h-[48px] text-base"
                >
                  Scan QR Code
                </Button>
              </form>
            )}

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Are you a healthcare professional?{' '}
              <Link
                to="/login"
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
