import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
}

const ConfirmContext = createContext<((opts: ConfirmOptions) => Promise<boolean>) | undefined>(undefined)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const resolver = useRef<(value: boolean) => void>(() => {})

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts)
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  function close(result: boolean) {
    resolver.current(result)
    setOptions(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4" onClick={() => close(false)}>
          <div
            className="w-full max-w-sm rounded-xl bg-surface p-5 shadow-xl"
            role="alertdialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold">{options.title}</h2>
            <p className="mt-1.5 text-sm text-ink-secondary">{options.message}</p>
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => close(false)}>
                Keep it
              </button>
              <button className={options.danger ? 'btn-danger' : 'btn'} onClick={() => close(true)} autoFocus>
                {options.confirmLabel ?? 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider')
  return ctx
}
