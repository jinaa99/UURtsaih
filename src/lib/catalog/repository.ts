import type { Product } from "./types";

/**
 * Бүтээгдэхүүн унших цорын ганц зам. Page, component-ууд энэ interface-ийг
 * л мэднэ — Shopify/CMS руу шилжихэд зөвхөн implementation-ийг солино.
 */
export interface ProductRepository {
  list(): Promise<readonly Product[]>;
  getBySlug(slug: string): Promise<Product | null>;
}
