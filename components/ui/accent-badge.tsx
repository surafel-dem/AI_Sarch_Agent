import * as React from "react"
import { cn } from "@/lib/utils"

export interface AccentBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  icon?: React.ReactNode
}

export function AccentBadge({ 
  children, 
  icon,
  className, 
  ...props 
}: AccentBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-4 py-1 text-sm font-medium",
        "bg-blue-100 text-blue-900",
        "border border-blue-200",
        "shadow-sm",
        className
      )}
      {...props}
    >
      {icon && (
        <span className="mr-2 flex-shrink-0">{icon}</span>
      )}
      {children}
    </div>
  )
}
