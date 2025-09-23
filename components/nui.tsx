"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const baseBg = "bg-[#f0f3fa]"
const shadowRest = "shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]"
const shadowHover = "hover:shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff]"
const shadowInset = "active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff]"

export function NCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(baseBg, "rounded-3xl p-6", shadowRest, className)} {...props} />
}

export function NButton({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        baseBg,
        "rounded-2xl px-5 py-3 transition-all duration-200 font-mono flex items-center justify-center gap-2",
        shadowRest,
        shadowHover,
        shadowInset,
        "text-[#e74c3c]", // brand red text for contrast on light bg
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export const NField = React.forwardRef<
  HTMLInputElement & HTMLSelectElement,
  React.InputHTMLAttributes<HTMLInputElement> &
    React.SelectHTMLAttributes<HTMLSelectElement> & {
      label?: string
      hint?: string
      as?: "input" | "select"
    }
>(function NField({ className, label, hint, as = "input", ...props }, ref) {
  const commonClass = cn(
    baseBg,
    "w-full rounded-2xl px-4 py-3 outline-none transition-all font-mono",
    shadowRest,
    "focus:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff]",
    className,
  )

  const Component = as
  return (
    <label className="block">
      {label ? <span className="mb-2 block text-sm text-gray-700">{label}</span> : null}
      <Component ref={ref} className={commonClass} {...props} />
      {hint ? <span className="mt-1 block text-xs text-gray-500">{hint}</span> : null}
    </label>
  )
})

export function NToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (val: boolean) => void
  label?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className={cn(
          baseBg,
          "relative w-14 h-8 rounded-full transition-all",
          shadowRest,
          checked ? "text-[#2ecc71]" : "text-gray-500",
        )}
        onClick={() => onChange(!checked)}
      >
        <span
          className={cn(
            "absolute top-1 left-1 w-6 h-6 rounded-full transition-all",
            baseBg,
            shadowRest,
            checked ? "translate-x-6" : "translate-x-0",
          )}
        />
      </button>
      {label ? <span className="text-sm text-gray-700">{label}</span> : null}
    </div>
  )
}

export function NModal({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <NCard className="relative z-10 w-full max-w-md">{children}</NCard>
    </div>
  )
}
