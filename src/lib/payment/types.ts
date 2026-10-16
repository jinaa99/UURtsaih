import type { Currency } from "@/lib/currency";
import type { LocalizedText } from "@/lib/catalog/types";

/**
 * Төлбөрийн үйлчилгээ үзүүлэгчийн гэрээ.
 *
 * Одоогоор ямар ч implementation байхгүй — checkout "Төлбөр удахгүй"
 * гэж харуулна. Дараа нь QPay (гол), магадгүй олон улсын карт нэмнэ.
 * Implementation нь server талд ажиллах ёстой (нууц түлхүүр client-д гарахгүй).
 */
export interface PaymentProvider {
  readonly id: PaymentProviderId;
  readonly displayName: LocalizedText;
  /** Энэ валютыг дэмжих эсэх (жишээ нь QPay → MNT). */
  supports(currency: Currency): boolean;
  /** Төлбөрийн session үүсгэнэ (QPay invoice, карт checkout г.м.). */
  createPayment(order: PaymentOrder): Promise<PaymentSession>;
  /** Webhook эсвэл polling-оор төлбөрийн төлөвийг шалгана. */
  getStatus(sessionId: string): Promise<PaymentStatus>;
}

export type PaymentProviderId = "qpay" | "card";

export type PaymentOrder = {
  orderId: string;
  currency: Currency;
  /** Бүхэл тоо, валютын үндсэн нэгжээр (₮ эсвэл $). */
  amount: number;
  customer: { email: string; phone?: string; name: string };
  lines: ReadonlyArray<{ productId: string; quantity: number; unitAmount: number }>;
};

export type PaymentSession =
  | { kind: "redirect"; sessionId: string; url: string }
  /** QPay: QR код + банкны апп-ын deeplink-ууд. */
  | {
      kind: "qr";
      sessionId: string;
      qrImage: string;
      deeplinks: ReadonlyArray<{ name: string; url: string }>;
    };

export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled" | "expired";
