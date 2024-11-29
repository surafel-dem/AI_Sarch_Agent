import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const glassPanelVariants = cva(
  "backdrop-blur-md transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-[rgba(0,0,0,0.05)]",
        dark: "bg-[rgba(0,0,0,0.2)]",
        light: "bg-[rgba(255,255,255,0.05)]",
      },
      hover: {
        default: "",
        lift: "hover:translate-y-[-2px] hover:shadow-lg",
        glow: "hover:bg-opacity-10",
      },
      rounded: {
        default: "rounded-lg",
        full: "rounded-full",
        none: "",
      }
    },
    defaultVariants: {
      variant: "default",
      hover: "default",
      rounded: "default",
    },
  }
)

export interface GlassPanelProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassPanelVariants> {}

export function GlassPanel({ 
  className, 
  variant, 
  hover,
  rounded,
  ...props 
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        glassPanelVariants({ variant, hover, rounded }),
        className
      )}
      {...props}
    />
  )
}
