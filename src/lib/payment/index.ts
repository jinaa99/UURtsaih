import type { PaymentProvider, PaymentProviderId } from "./types";
import type { LocalizedText } from "@/lib/catalog/types";

/** Идэвхтэй provider-ууд. Одоогоор хоосон — бодит төлбөрийн код бичээгүй. */
export const paymentProviders: readonly PaymentProvider[] = [];

/** Checkout дээр "удахгүй" гэж харуулах төлөвлөсөн provider-ууд. */
export const plannedPaymentProviders: ReadonlyArray<{
  id: PaymentProviderId;
  displayName: LocalizedText;
}> = [
  { id: "qpay", displayName: { mn: "QPay", en: "QPay" } },
  { id: "card", displayName: { mn: "Олон улсын карт", en: "International card" } },
];

export const isPaymentAvailable = () => paymentProviders.length > 0;

export type * from "./types";
