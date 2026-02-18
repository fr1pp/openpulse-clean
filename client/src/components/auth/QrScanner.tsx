import { useEffect, useRef, useState, useId } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Button } from '@/components/ui/button'

interface QrScannerProps {
  onScan: (decodedText: string) => void
  onError?: (error: string) => void
  onClose: () => void
}

export function QrScanner({ onScan, onError, onClose }: QrScannerProps) {
  const uniqueId = useId().replace(/:/g, '')
  const elementId = `qr-reader-${uniqueId}`
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [isStarting, setIsStarting] = useState(true)
  const [cameraError, setCameraError] = useState<string | null>(null)

  useEffect(() => {
    // Defer so strict mode's mount→cleanup→mount clears the first
    // timer before it fires — only the final mount starts the camera.
    const timer = setTimeout(() => {
      const startScanner = async () => {
        try {
          const scanner = new Html5Qrcode(elementId)
          scannerRef.current = scanner

          await scanner.start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              onScan(decodedText)
              try { scanner.stop().catch(() => {}) } catch { /* not running */ }
            },
            () => {
              // Ignore scan failures (no QR code in frame)
            },
          )
          setIsStarting(false)
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : 'Camera not available'
          setCameraError(errorMessage)
          setIsStarting(false)
          onError?.(errorMessage)
        }
      }

      startScanner()
    }, 0)

    return () => {
      clearTimeout(timer)
      const scanner = scannerRef.current
      if (scanner) {
        try { scanner.stop().catch(() => {}) } catch {}
        scannerRef.current = null
      }
    }
  }, [])

  if (cameraError) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-border bg-muted/20 p-8">
        <div className="text-center">
          <p className="text-base font-medium text-foreground">Camera not available</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Can't scan? Enter the code printed on your card instead.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={onClose}
          className="min-h-[48px] min-w-[44px]"
        >
          Enter code manually
        </Button>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {isStarting && (
        <p className="text-sm text-muted-foreground">Starting camera...</p>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Point your camera at the QR code on your card
      </p>

      <div
        id={elementId}
        className="w-full max-w-[280px] overflow-hidden rounded-xl border border-border bg-muted/20"
      />

      <Button
        variant="outline"
        onClick={() => {
          const scanner = scannerRef.current
          if (scanner) {
            try { scanner.stop().catch(() => {}) } catch { /* not running */ }
          }
          onClose()
        }}
        className="min-h-[48px] min-w-[44px]"
      >
        Cancel
      </Button>
    </div>
  )
}
