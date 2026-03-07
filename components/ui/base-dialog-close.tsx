"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { useBaseDialogContext } from "@/components/ui/base-dialog-context";

interface BaseDialogCloseProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children?: ReactNode;
}

export function BaseDialogClose({
  children = "Close",
  className = "",
  type = "button",
  ...props
}: BaseDialogCloseProps) {
  const { onOpenChange } = useBaseDialogContext();

  return (
    <button
      type={type}
      onClick={() => onOpenChange(false)}
      className={`absolute right-4 top-4 z-10 rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 transition hover:border-slate-300 hover:text-slate-950 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
