import { cn } from "@/lib/cn";
import React, { HTMLAttributes } from "react";

type Variant = "h1" | "h2" | "h3" | "h4" | "body" | "label" | "muted" | "caption";

interface T2ATypographyProps extends HTMLAttributes<HTMLElement> {
  variant?: Variant;
  as?: keyof React.JSX.IntrinsicElements;
}

const variantClasses: Record<Variant, string> = {
  h1:      "text-4xl font-bold tracking-tight text-black",
  h2:      "text-3xl font-semibold tracking-tight text-black",
  h3:      "text-2xl font-semibold text-black",
  h4:      "text-xl font-semibold text-black",
  body:    "text-base text-black",
  label:   "text-sm font-medium text-zinc-700",
  muted:   "text-sm text-zinc-600",
  caption: "text-xs text-zinc-500",
};

const defaultTag: Record<Variant, keyof React.JSX.IntrinsicElements> = {
  h1: "h1", h2: "h2", h3: "h3", h4: "h4",
  body: "p", label: "span", muted: "p", caption: "span",
};

export function T2ATypography({
  variant = "body",
  as,
  className,
  children,
  ...props
}: T2ATypographyProps) {
  const Tag = (as ?? defaultTag[variant]) as keyof React.JSX.IntrinsicElements;
  return (
    // @ts-expect-error dynamic tag
    <Tag {...props} className={cn("leading-relaxed", variantClasses[variant], className)}>
      {children}
    </Tag>
  );
}
