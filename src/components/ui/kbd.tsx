import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export interface KbdProps extends HTMLAttributes<HTMLElement> {}

export function Kbd({ className, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        "pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100",
        className
      )}
      {...props}
    />
  );
}