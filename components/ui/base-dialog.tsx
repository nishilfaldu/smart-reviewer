"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";

import { BaseDialogProvider } from "@/components/ui/base-dialog-context";
import { useModalBehavior } from "@/lib/use-modal-behavior";

interface BaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function BaseDialog({
  open,
  onOpenChange,
  children,
}: BaseDialogProps) {
  useModalBehavior(open, () => onOpenChange(false));

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <BaseDialogProvider value={{ open, onOpenChange }}>
      {children}
    </BaseDialogProvider>,
    document.body,
  );
}
