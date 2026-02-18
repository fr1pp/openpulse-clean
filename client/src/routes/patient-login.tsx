import { createFileRoute, redirect, Link, useNavigate } from '@tanstack/react-router'
import { z } from 'zod/v4'
import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PatientCodeInput } from '@/components/auth/PatientCodeInput'
import { QrScanner } from '@/components/auth/QrScanner'
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

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode)
    }
  }, [initialCode])

  const [activeMethod, setActiveMethod] = useState<'code' | 'scan'>('code')
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
      const timer = setTimeout(() => {
        autoSubmitDone.current = true
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
      {/* Wordmark */}
      <div className="mb-8 flex items-center text-2xl font-semibold tracking-tight">
        <span className="text-foreground">open</span>
        <span className="text-red-500">pulse</span>
      </div>

      <div className="w-full max-w-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-foreground">Welcome</h1>
          <p className="mt-1 text-base text-muted-foreground">
            Use either option below to view your health information
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">
            {errorMessage}
          </div>
        )}

        {/* Two equal-prominence panels on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {/* Panel 1: Enter Access Code */}
          <Card
            className={`cursor-pointer shadow-sm transition-shadow hover:shadow-md ${
              activeMethod === 'code' ? 'ring-2 ring-ring' : ''
            }`}
            onClick={() => setActiveMethod('code')}
          >
            <CardContent className="flex flex-col items-center gap-5 p-6">
              <div className="text-center">
                <h2 className="text-base font-semibold text-foreground">Enter Access Code</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Type the 4-character code from your card
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex w-full flex-col items-center gap-4">
                <PatientCodeInput
                  value={code}
                  onChange={setCode}
                  disabled={patientLogin.isPending || activeMethod !== 'code'}
                  autoFocus={!initialCode && activeMethod === 'code'}
                />

                <Button
                  type="submit"
                  disabled={code.length !== 4 || patientLogin.isPending || activeMethod !== 'code'}
                  className="w-full min-h-[48px] text-base font-semibold"
                  onClick={(e) => {
                    if (activeMethod !== 'code') {
                      e.preventDefault()
                      setActiveMethod('code')
                    }
                  }}
                >
                  {patientLogin.isPending ? 'Checking code...' : 'Log In'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Mobile "or" divider */}
          <div className="relative flex items-center md:hidden">
            <div className="flex-1 border-t border-border" />
            <span className="mx-3 text-xs uppercase text-muted-foreground">or</span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* Panel 2: Scan QR Code */}
          <Card
            className={`cursor-pointer shadow-sm transition-shadow hover:shadow-md ${
              activeMethod === 'scan' ? 'ring-2 ring-ring' : ''
            }`}
            onClick={() => {
              if (activeMethod !== 'scan') setActiveMethod('scan')
            }}
          >
            <CardContent className="flex flex-col items-center gap-5 p-6">
              <div className="text-center">
                <h2 className="text-base font-semibold text-foreground">Scan QR Code</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Point your camera at the QR code on your card
                </p>
              </div>

              {activeMethod === 'scan' ? (
                <QrScanner
                  onScan={(decodedText) => {
                    let scannedCode = ''
                    try {
                      const url = new URL(decodedText)
                      const urlCode = url.searchParams.get('code')
                      if (urlCode) {
                        scannedCode = urlCode.toUpperCase()
                      }
                    } catch {
                      // Not a URL — treat as raw code if 4 chars alphanumeric
                      const cleaned = decodedText.toUpperCase().replace(/[^A-Z0-9]/g, '')
                      if (cleaned.length === 4) {
                        scannedCode = cleaned
                      }
                    }
                    if (scannedCode) {
                      setCode(scannedCode)
                      setActiveMethod('code')
                      handleLogin(scannedCode)
                    }
                  }}
                  onError={() => {
                    // QrScanner handles its own fallback UI
                  }}
                  onClose={() => setActiveMethod('code')}
                />
              ) : (
                <div className="flex w-full flex-col items-center gap-4">
                  {/* Placeholder camera icon area */}
                  <div className="flex h-[140px] w-full max-w-[200px] items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <svg
                        className="h-10 w-10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                        <rect width="10" height="10" x="7" y="7" rx="1" />
                      </svg>
                      <span className="text-xs">Tap to activate</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveMethod('scan')
                    }}
                    className="w-full min-h-[48px] text-base"
                  >
                    Open Camera
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Are you a healthcare professional?{' '}
          <Link
            to="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Log in here
          </Link>
        </div>
      </div>
    </div>
  )
}
