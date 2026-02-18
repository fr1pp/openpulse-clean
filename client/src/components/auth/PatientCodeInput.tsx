import { useRef, useEffect, type KeyboardEvent, type ChangeEvent } from 'react'

interface PatientCodeInputProps {
  value: string
  onChange: (code: string) => void
  disabled?: boolean
  autoFocus?: boolean
}

const CODE_LENGTH = 4

export function PatientCodeInput({
  value,
  onChange,
  disabled = false,
  autoFocus = false,
}: PatientCodeInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const upper = value.toUpperCase()
  const chars = Array.from({ length: CODE_LENGTH }, (_, i) => upper[i] || '')

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus])

  const focusInput = (index: number) => {
    if (index >= 0 && index < CODE_LENGTH) {
      inputRefs.current[index]?.focus()
      inputRefs.current[index]?.select()
    }
  }

  const updateCode = (index: number, char: string) => {
    const newChars = [...chars]
    newChars[index] = char
    onChange(newChars.join(''))
  }

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase()
    // Take only the last typed character (handles paste into single field)
    const char = raw.slice(-1)

    if (char && !/^[A-Z0-9]$/.test(char)) return

    updateCode(index, char)

    if (char && index < CODE_LENGTH - 1) {
      focusInput(index + 1)
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (chars[index]) {
        updateCode(index, '')
      } else if (index > 0) {
        focusInput(index - 1)
        updateCode(index - 1, '')
      }
      e.preventDefault()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1)
      e.preventDefault()
    } else if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      focusInput(index + 1)
      e.preventDefault()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (!pasted) return

    const newChars = [...chars]
    for (let i = 0; i < Math.min(pasted.length, CODE_LENGTH); i++) {
      newChars[i] = pasted[i]
    }
    onChange(newChars.join(''))

    // Focus last filled input or the one after the pasted content
    const focusIdx = Math.min(pasted.length, CODE_LENGTH) - 1
    setTimeout(() => focusInput(focusIdx), 0)
  }

  return (
    <div className="flex items-center justify-center gap-3" role="group" aria-label="Access code">
      {chars.map((char, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          type="text"
          inputMode="text"
          maxLength={1}
          autoComplete="off"
          aria-label={`Code digit ${index + 1} of ${CODE_LENGTH}`}
          value={char}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          className="h-16 w-14 rounded-xl border-2 border-input bg-muted/50 text-center text-2xl font-bold uppercase text-foreground shadow-sm transition-colors focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-50 sm:h-[4.5rem] sm:w-16 sm:text-3xl"
        />
      ))}
    </div>
  )
}
