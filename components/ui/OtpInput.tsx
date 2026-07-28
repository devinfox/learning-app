"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/ui/cn";

export interface OtpInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: string | null;
  disabled?: boolean;
  autoFocus?: boolean;
  label?: string;
  className?: string;
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  error,
  disabled,
  autoFocus,
  label = "Verification code",
  className,
}: OtpInputProps) {
  const [internal, setInternal] = useState("");
  const digits = (value ?? internal).slice(0, length);
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const completedFor = useRef<string | null>(null);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (digits.length === length && completedFor.current !== digits) {
      completedFor.current = digits;
      onComplete?.(digits);
    }
    if (digits.length < length) completedFor.current = null;
  }, [digits, length, onComplete]);

  function commit(next: string) {
    const clean = next.replace(/\D/g, "").slice(0, length);
    if (value === undefined) setInternal(clean);
    onChange?.(clean);
    const target = Math.min(clean.length, length - 1);
    refs.current[target]?.focus();
  }

  function handleChange(index: number, raw: string) {
    const typed = raw.replace(/\D/g, "");
    if (!typed) return;
    const chars = digits.split("");
    for (let offset = 0; offset < typed.length && index + offset < length; offset += 1) {
      chars[index + offset] = typed[offset];
    }
    commit(chars.join("").slice(0, length));
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace") {
      event.preventDefault();
      const chars = digits.split("");
      if (chars[index]) {
        chars[index] = "";
        commit(chars.join(""));
        refs.current[index]?.focus();
      } else if (index > 0) {
        chars[index - 1] = "";
        commit(chars.join(""));
        refs.current[index - 1]?.focus();
      }
    } else if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      refs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < length - 1) {
      event.preventDefault();
      refs.current[index + 1]?.focus();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    commit(event.clipboardData.getData("text"));
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        role="group"
        aria-label={label}
        aria-invalid={error ? true : undefined}
        className="flex justify-center gap-2.5"
      >
        {Array.from({ length }).map((_, index) => {
          const char = digits[index] ?? "";
          return (
            <input
              key={index}
              ref={(node) => {
                refs.current[index] = node;
              }}
              value={char}
              onChange={(event) => handleChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              onPaste={handlePaste}
              onFocus={(event) => event.target.select()}
              disabled={disabled}
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              aria-label={`Digit ${index + 1} of ${length}`}
              maxLength={length}
              className={cn(
                "size-13 rounded-[--radius-field] border bg-surface text-center",
                "font-display text-2xl font-semibold text-ink tabular-nums",
                "outline-none transition-colors disabled:opacity-50",
                error
                  ? "border-ember"
                  : char
                    ? "border-brand"
                    : "border-line-strong focus:border-brand",
              )}
            />
          );
        })}
      </div>
      {error && <p className="text-center text-xs text-ember-ink">{error}</p>}
    </div>
  );
}
