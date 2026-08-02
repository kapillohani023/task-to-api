"use client";

import { useId, useMemo, useRef } from "react";
import { AlertCircle, Check, WrapText } from "lucide-react";
import { cn } from "@/lib/cn";
import { focusRing, typeLabel } from "@/lib/ui";

interface T2AJsonEditorProps {
  value: string;
  onChange: (next: string) => void;
  label: string;
  name?: string;
  rows?: number;
  disabled?: boolean;
  /** Empty is valid by default — schemas are optional. */
  allowEmpty?: boolean;
  hint?: string;
  className?: string;
}

type Token = { text: string; className: string };

const TOKEN_RE =
  /("(?:\\.|[^"\\])*"\s*:)|("(?:\\.|[^"\\])*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(true|false)|(null)|([{}[\],:])/g;

/** Cheap JSON tokenizer — enough for the `--color-syn-*` palette, no parser needed. */
function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let lastIndex = 0;

  for (const match of source.matchAll(TOKEN_RE)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      tokens.push({ text: source.slice(lastIndex, index), className: "" });
    }

    const [text, key, string, number, bool, nul, punct] = match;
    const className = key
      ? "text-syn-key"
      : string
        ? "text-syn-string"
        : number
          ? "text-syn-number"
          : bool
            ? "text-syn-bool"
            : nul
              ? "text-syn-null"
              : punct
                ? "text-syn-punct"
                : "";
    tokens.push({ text, className });
    lastIndex = index + text.length;
  }

  if (lastIndex < source.length) {
    tokens.push({ text: source.slice(lastIndex), className: "" });
  }

  return tokens;
}

export function parseJsonError(value: string, allowEmpty = true): string | null {
  const trimmed = value.trim();
  if (trimmed === "") return allowEmpty ? null : "Required.";
  try {
    JSON.parse(trimmed);
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : "Invalid JSON.";
  }
}

/**
 * Editable JSON: a transparent `<textarea>` over a highlighted `<pre>`.
 * No editor dependency — keeps the bundle flat (MASTER §3).
 */
export function T2AJsonEditor({
  value,
  onChange,
  label,
  name,
  rows = 10,
  disabled,
  allowEmpty = true,
  hint,
  className,
}: T2AJsonEditorProps) {
  const id = useId();
  const preRef = useRef<HTMLPreElement>(null);
  const error = parseJsonError(value, allowEmpty);
  const isEmpty = value.trim() === "";
  const tokens = useMemo(() => tokenize(value), [value]);

  const format = () => {
    try {
      onChange(JSON.stringify(JSON.parse(value), null, 2));
    } catch {
      /* Format is a no-op while the document is invalid. */
    }
  };

  const shared =
    "m-0 h-full w-full whitespace-pre-wrap break-words px-3 py-2 font-mono text-[13px] leading-[1.6] tracking-tight";

  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className={typeLabel}>
          {label}
        </label>
        <div className="flex items-center gap-2">
          {!isEmpty &&
            (error ? (
              <span className="flex items-center gap-1 text-[11px] text-danger">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-danger" />
                invalid
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-accent">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
                valid
              </span>
            ))}
          <button
            type="button"
            onClick={format}
            disabled={disabled || Boolean(error) || isEmpty}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1 rounded-sm text-[11px] font-medium text-fg-muted",
              "transition-colors duration-[var(--dur-fast)] hover:text-fg disabled:cursor-not-allowed disabled:opacity-40",
              focusRing
            )}
          >
            <WrapText size={12} aria-hidden />
            Format
          </button>
        </div>
      </div>

      <div
        className={cn(
          "relative overflow-hidden rounded-sm border bg-inset transition-colors duration-[var(--dur-fast)]",
          error ? "border-danger" : "border-border focus-within:border-border-strong",
          "focus-within:ring-1 focus-within:ring-accent/40",
          disabled && "opacity-50"
        )}
      >
        <pre
          ref={preRef}
          aria-hidden
          className={cn(shared, "pointer-events-none absolute inset-0 overflow-hidden")}
        >
          {tokens.map((token, i) => (
            <span key={i} className={token.className}>
              {token.text}
            </span>
          ))}
          {/* Trailing newline keeps the last line visible while scrolling. */}
          {"\n"}
        </pre>
        <textarea
          id={id}
          name={name}
          rows={rows}
          value={value}
          disabled={disabled}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          onChange={(e) => onChange(e.target.value)}
          onScroll={(e) => {
            const pre = preRef.current;
            if (!pre) return;
            pre.scrollTop = e.currentTarget.scrollTop;
            pre.scrollLeft = e.currentTarget.scrollLeft;
          }}
          className={cn(
            shared,
            "relative resize-y bg-transparent text-transparent caret-fg outline-none",
            "placeholder:text-fg-subtle selection:bg-accent/20"
          )}
          placeholder="{}"
        />
      </div>

      {error ? (
        <p className="flex items-start gap-1.5 text-xs text-danger">
          <AlertCircle size={12} className="mt-0.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p className="flex items-start gap-1.5 text-xs text-fg-subtle">
          {!isEmpty && <Check size={12} className="mt-0.5 shrink-0 text-accent" aria-hidden />}
          {hint}
        </p>
      ) : null}
    </div>
  );
}
