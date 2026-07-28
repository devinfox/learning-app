"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  side?: "bottom" | "left";
  showClose?: boolean;
  className?: string;
}

export function Sheet({
  open,
  onClose,
  title,
  children,
  side = "bottom",
  showClose = true,
  className,
}: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className={cn(
        "m-0 max-h-dvh w-full bg-transparent p-0 text-ink backdrop:bg-cosmos/45",
        side === "bottom"
          ? "mt-auto max-w-none"
          : "mr-auto h-dvh max-w-[19rem]",
      )}
    >
      <div
        className={cn(
          "flex max-h-dvh flex-col bg-surface",
          side === "bottom"
            ? "rounded-t-[--radius-sheet] pb-safe"
            : "h-dvh rounded-r-[--radius-sheet] pt-safe pb-safe",
          className,
        )}
      >
        {side === "bottom" && (
          <div
            aria-hidden="true"
            className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-line-strong"
          />
        )}

        {(title || showClose) && (
          <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-2">
            {title && (
              <h2 className="font-display text-lg font-semibold">{title}</h2>
            )}
            {showClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-mr-1 ml-auto grid size-9 place-items-center rounded-full text-ink-muted hover:bg-surface-sunken"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">{children}</div>
      </div>
    </dialog>
  );
}
