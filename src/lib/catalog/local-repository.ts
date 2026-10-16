import { products } from "@/content/products";
import type { ProductRepository } from "./repository";

export const localProductRepository: ProductRepository = {
  async list() {
    return products;
  },
  async getBySlug(slug) {
    return products.find((p) => p.slug === slug) ?? null;
  },
};
