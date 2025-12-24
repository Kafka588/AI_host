import * as React from "react"

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

const DialogContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>({
  open: false,
  onOpenChange: () => {},
});

export function Dialog({ open = false, onOpenChange, children }: DialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(open);
  const isControlled = onOpenChange !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  return (
    <DialogContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({ children, asChild, ...props }: any) {
  const { onOpenChange } = React.useContext(DialogContext);

  if (asChild) {
    return React.cloneElement(children, {
      onClick: () => onOpenChange(true),
      ...props,
    });
  }

  return (
    <button onClick={() => onOpenChange(true)} {...props}>
      {children}
    </button>
  );
}

export function DialogContent({ children, className = "" }: any) {
  const { open, onOpenChange } = React.useContext(DialogContext);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/80 z-40"
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-slate-900 border border-slate-700 rounded-lg shadow-lg z-50 p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>
        <div className={className}>{children}</div>
      </div>
    </>
  );
}

export function DialogHeader({ children, ...props }: any) {
  return (
    <div className="mb-4" {...props}>
      {children}
    </div>
  );
}

export function DialogTitle({ children, ...props }: any) {
  return (
    <h2 className="text-lg font-bold text-white" {...props}>
      {children}
    </h2>
  );
}

export function DialogDescription({ children, ...props }: any) {
  return (
    <p className="text-sm text-gray-400" {...props}>
      {children}
    </p>
  );
}
