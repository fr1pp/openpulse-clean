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
  const mountedRef = useRef(false)
  const [isStarting, setIsStarting] = useState(true)
  const [cameraError, setCameraError] = useState<string | null>(null)

  useEffect(() => {
    // Handle React strict mode double-mount
    if (mountedRef.current) return
    mountedRef.current = true

    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode(elementId)
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            onScan(decodedText)
            scanner.stop().catch(() => {})
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

    return () => {
      const scanner = scannerRef.current
      if (scanner) {
        scanner
          .stop()
          .catch(() => {})
          .finally(() => {
            scanner.clear()
          })
        scannerRef.current = null
      }
    }
  }, [])

  if (cameraError) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-muted-foreground/25 p-8">
        <div className="text-center">
          <p className="text-lg font-medium text-foreground">Camera not available</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Can't scan? Enter the code printed on your card instead.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={onClose}
          className="min-h-[44px] min-w-[44px]"
        >
          Enter code manually
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {isStarting && (
        <p className="text-sm text-muted-foreground">Starting camera...</p>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Point your camera at the QR code on your card
      </p>

      <div
        id={elementId}
        className="w-full max-w-[300px] overflow-hidden rounded-xl"
      />

      <Button
        variant="outline"
        onClick={() => {
          const scanner = scannerRef.current
          if (scanner) {
            scanner.stop().catch(() => {})
          }
          onClose()
        }}
        className="min-h-[44px] min-w-[44px]"
      >
        Cancel
      </Button>
    </div>
  )
}
