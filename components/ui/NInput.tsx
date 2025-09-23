import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const NInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, ...props }, ref) => {
    const id = React.useId()
    return (
      <div>
        {label && (
          <label htmlFor={id} className="text-sm font-medium mb-1 block">
            {label}
          </label>
        )}
        <input
          id={id}
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-gray-200 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-[inset_6px_6px_12px_#bebebe,inset_-6px_-6px_12px_#ffffff]",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
NInput.displayName = "NInput"

export { NInput }
