import { localProductRepository } from "./local-repository";
import type { ProductRepository } from "./repository";

// Эх үүсвэрийг солих цэг: Shopify/CMS implementation-ийг энд холбоно.
export const productRepository: ProductRepository = localProductRepository;

export * from "./types";
export type { ProductRepository } from "./repository";
