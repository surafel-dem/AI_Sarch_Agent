import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl px-4 py-3",
          "bg-[#141B2D]/60 backdrop-blur-md",
          "text-gray-100 placeholder:text-gray-400",
          "border-0 ring-0 focus:ring-1 ring-blue-500/20",
          "transition-all duration-200",
          "hover:bg-[#141B2D]/80",
          "focus:outline-none focus:ring-blue-500/30",
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
