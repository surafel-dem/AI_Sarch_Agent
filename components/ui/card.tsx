import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn(
      "rounded-[20px] bg-gradient-to-b from-[#0A0F1C] to-[#141B2D]",
      "backdrop-blur-lg shadow-lg",
      "border border-white/5",
      "relative overflow-hidden",
      "before:absolute before:inset-0 before:bg-blue-500/5 before:backdrop-blur-xl",
      "after:absolute after:inset-0 after:bg-gradient-to-t after:from-blue-500/10 after:to-transparent after:opacity-20",
      className
    )}>
      {children}
    </div>
  );
}
