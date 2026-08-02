import { cn } from "@/lib/cn";
import React, { HTMLAttributes } from "react";

type Variant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "body"
  | "label"
  | "muted"
  | "caption"
  | "mono";

interface T2ATypographyProps extends HTMLAttributes<HTMLElement> {
  variant?: Variant;
  as?: keyof React.JSX.IntrinsicElements;
}

// MASTER §2 typography roles. 14px body — this is a dense tool, not a marketing page.
const variantClasses: Record<Variant, string> = {
  display: "text-2xl font-semibold leading-tight tracking-[-0.02em] text-fg",
  h1: "text-2xl font-semibold leading-tight tracking-[-0.02em] text-fg",
  h2: "text-lg font-semibold tracking-[-0.01em] text-fg",
  h3: "text-sm font-semibold text-fg",
  h4: "text-sm font-semibold text-fg",
  body: "text-sm text-fg",
  label: "text-xs font-medium uppercase tracking-[0.08em] text-fg-muted",
  muted: "text-sm text-fg-muted",
  caption: "text-xs text-fg-subtle",
  mono: "font-mono text-[13px] tracking-tight text-fg-muted",
};

const defaultTag: Record<Variant, keyof React.JSX.IntrinsicElements> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  body: "p",
  label: "span",
  muted: "p",
  caption: "span",
  mono: "span",
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
    <Tag {...props} className={cn(variantClasses[variant], className)}>
      {children}
    </Tag>
  );
}
