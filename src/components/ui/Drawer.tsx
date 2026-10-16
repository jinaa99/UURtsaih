"use client";

import { useEffect, useRef } from "react";

/**
 * Native <dialog> дээр суурилсан drawer: focus trap, Escape, backdrop-ийг
 * browser өөрөө зохицуулна. Гулсах хөдөлгөөн нь globals.css-ийн `.drawer`.
 */
export function Drawer({
  open,
  onClose,
  side = "right",
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right";
  label: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      data-side={side}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="drawer"
    >
      <div className="flex h-full flex-col">{children}</div>
    </dialog>
  );
}

export function DrawerHeader({
  title,
  closeLabel,
  onClose,
}: {
  title: React.ReactNode;
  closeLabel: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-mist-light px-6 py-5">
      <h2 className="text-eyebrow">{title}</h2>
      <button
        type="button"
        onClick={onClose}
        className="-mr-2 cursor-pointer p-2 text-eyebrow text-ink-soft hover:text-ink"
      >
        {closeLabel}
      </button>
    </div>
  );
}
