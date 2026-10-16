"use client";

import { createContext, use, useMemo, useState, useSyncExternalStore } from "react";
import * as store from "@/lib/cart/store";
import type { CartLine } from "@/lib/cart/store";

type CartValue = {
  lines: readonly CartLine[];
  count: number;
  add: typeof store.addLine;
  setQuantity: typeof store.setQuantity;
  remove: typeof store.removeLine;
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const [isOpen, setOpen] = useState(false);

  const value = useMemo<CartValue>(
    () => ({
      lines,
      count: store.countItems(lines),
      add: store.addLine,
      setQuantity: store.setQuantity,
      remove: store.removeLine,
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
    }),
    [lines, isOpen],
  );

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart(): CartValue {
  const ctx = use(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
