"use client";

import type { ReactNode } from "react";

import { useBaseDialogContext } from "@/components/ui/base-dialog-context";

interface BaseDialogContentProps {
  children: ReactNode;
  className?: string;
}

export function BaseDialogContent({
  children,
  className = "",
}: BaseDialogContentProps) {
  const { onOpenChange } = useBaseDialogContext();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 px-4 py-6 backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-[0_30px_120px_rgba(15,23,42,0.32)] ${className}`}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
