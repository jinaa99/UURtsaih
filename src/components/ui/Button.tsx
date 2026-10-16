import Link from "next/link";
import type { ComponentProps } from "react";

export type ButtonVariant = "primary" | "secondary" | "quiet";
export type ButtonSize = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-3 text-eyebrow transition-colors duration-(--duration-slow) ease-silk disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-cream hover:bg-ink-soft",
  secondary: "border border-ink text-ink hover:bg-ink hover:text-cream",
  quiet:
    "text-ink underline decoration-mist-light underline-offset-8 hover:decoration-ink px-0! h-auto!",
};

const sizes: Record<ButtonSize, string> = {
  md: "h-11 px-6",
  lg: "h-14 px-10",
};

export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className = "",
) {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`;
}

type Common = { variant?: ButtonVariant; size?: ButtonSize };

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: Common & ComponentProps<"button">) {
  return <button type={type} className={buttonClasses(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: Common & ComponentProps<typeof Link>) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}
