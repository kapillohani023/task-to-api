"use client";

import { cn } from "@/lib/cn";
import { focusRing } from "@/lib/ui";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface T2ACodeProps {
  code: string;
  /** Shown as an eyebrow in the header strip, e.g. "bash", "json". */
  language?: string;
  lineNumbers?: boolean;
  copyable?: boolean;
  /** Tailwind max-height class for the scroll box, e.g. "max-h-64". */
  maxHeight?: string;
  className?: string;
}

/** Read-only code surface. Long output scrolls inside its own box (MASTER §9). */
export function T2ACode({
  code,
  language,
  lineNumbers,
  copyable = true,
  maxHeight = "max-h-72",
  className,
}: T2ACodeProps) {
  const [copied, setCopied] = useState(false);
  const lines = code.split("\n");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-border bg-inset",
        className
      )}
    >
      {(language || copyable) && (
        <div className="flex items-center justify-between border-b border-border-subtle px-3 py-1.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-fg-subtle">
            {language}
          </span>
          {copyable && (
            <button
              type="button"
              onClick={handleCopy}
              aria-label={copied ? "Copied" : "Copy code"}
              className={cn(
                "cursor-pointer rounded-sm p-1 text-fg-subtle transition-colors duration-[var(--dur-fast)] hover:bg-elevated hover:text-fg",
                focusRing
              )}
            >
              {copied ? (
                <Check size={13} className="text-accent" />
              ) : (
                <Copy size={13} />
              )}
            </button>
          )}
        </div>
      )}
      <div className={cn("overflow-auto", maxHeight)}>
        <pre className="w-max min-w-full px-3 py-2 font-mono text-[13px] leading-[1.6] text-fg">
          {lineNumbers ? (
            <code className="grid grid-cols-[auto_1fr] gap-x-3">
              {lines.map((line, i) => (
                <span key={i} className="contents">
                  <span className="select-none text-right text-syn-null">
                    {i + 1}
                  </span>
                  <span>{line || " "}</span>
                </span>
              ))}
            </code>
          ) : (
            <code>{code}</code>
          )}
        </pre>
      </div>
    </div>
  );
}
