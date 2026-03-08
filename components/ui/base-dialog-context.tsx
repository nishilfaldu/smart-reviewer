
import { createContext, useContext } from "react";

interface BaseDialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BaseDialogContext = createContext<BaseDialogContextValue | null>(null);

export function BaseDialogProvider({
  value,
  children,
}: {
  value: BaseDialogContextValue;
  children: React.ReactNode;
}) {
  return (
    <BaseDialogContext.Provider value={value}>
      {children}
    </BaseDialogContext.Provider>
  );
}

export function useBaseDialogContext(): BaseDialogContextValue {
  const context = useContext(BaseDialogContext);

  if (!context) {
    throw new Error("BaseDialog components must be used inside BaseDialog.");
  }

  return context;
}
