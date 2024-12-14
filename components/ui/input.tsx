import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 rounded-md border border-gray-200 bg-white px-3 py-2",
          "text-sm text-gray-900 placeholder:text-gray-900",
          "hover:border-gray-300 focus:ring-0 focus:border-gray-300",
          "selection:bg-gray-200 selection:text-gray-900",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
