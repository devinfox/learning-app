"use client";

import { Eye, EyeOff } from "lucide-react";
import {
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/ui/cn";

interface FieldShellProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  required?: boolean;
  htmlFor: string;
  describedBy: string;
  className?: string;
  children: ReactNode;
}

function FieldShell({
  label,
  hint,
  error,
  required,
  htmlFor,
  describedBy,
  className,
  children,
}: FieldShellProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
          {label}
          {required && <span className="ml-0.5 text-ember-ink">*</span>}
        </label>
      )}
      {children}
      {(error || hint) && (
        <p
          id={describedBy}
          className={cn("text-xs", error ? "text-ember-ink" : "text-ink-subtle")}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

const CONTROL_BASE =
  "w-full rounded-[--radius-field] border bg-surface px-4 text-ink placeholder:text-ink-subtle " +
  "transition-colors outline-none disabled:opacity-50 disabled:bg-surface-sunken";

function controlTone(error?: string | null) {
  return error
    ? "border-ember focus:border-ember"
    : "border-line-strong focus:border-brand";
}

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  leadingIcon?: ReactNode;
  trailingSlot?: ReactNode;
  containerClassName?: string;
}

export function Input({
  label,
  hint,
  error,
  leadingIcon,
  trailingSlot,
  containerClassName,
  className,
  id,
  required,
  ...props
}: InputProps) {
  const generated = useId();
  const inputId = id ?? generated;
  const describedBy = `${inputId}-desc`;

  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={inputId}
      describedBy={describedBy}
      className={containerClassName}
    >
      <div className="relative">
        {leadingIcon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle">
            {leadingIcon}
          </span>
        )}
        <input
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? describedBy : undefined}
          className={cn(
            CONTROL_BASE,
            controlTone(error),
            "h-14",
            leadingIcon && "pl-11",
            trailingSlot && "pr-12",
            className,
          )}
          {...props}
        />
        {trailingSlot && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {trailingSlot}
          </span>
        )}
      </div>
    </FieldShell>
  );
}

export type PasswordInputProps = Omit<InputProps, "type" | "trailingSlot">;

export function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      {...props}
      type={visible ? "text" : "password"}
      autoComplete={props.autoComplete ?? "current-password"}
      trailingSlot={
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="grid size-9 place-items-center rounded-full text-ink-subtle hover:bg-surface-sunken hover:text-ink"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      }
    />
  );
}

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  containerClassName?: string;
}

export function Textarea({
  label,
  hint,
  error,
  containerClassName,
  className,
  id,
  required,
  rows = 4,
  ...props
}: TextareaProps) {
  const generated = useId();
  const fieldId = id ?? generated;
  const describedBy = `${fieldId}-desc`;

  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={fieldId}
      describedBy={describedBy}
      className={containerClassName}
    >
      <textarea
        id={fieldId}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? describedBy : undefined}
        className={cn(CONTROL_BASE, controlTone(error), "resize-none py-3.5", className)}
        {...props}
      />
    </FieldShell>
  );
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  containerClassName?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export function Select({
  label,
  hint,
  error,
  containerClassName,
  className,
  id,
  required,
  options,
  placeholder,
  ...props
}: SelectProps) {
  const generated = useId();
  const fieldId = id ?? generated;
  const describedBy = `${fieldId}-desc`;

  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={fieldId}
      describedBy={describedBy}
      className={containerClassName}
    >
      <div className="relative">
        <select
          id={fieldId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? describedBy : undefined}
          className={cn(
            CONTROL_BASE,
            controlTone(error),
            "h-14 appearance-none pr-11",
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 12 8"
          className="pointer-events-none absolute right-4 top-1/2 size-3 -translate-y-1/2 fill-ink"
        >
          <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.8" fill="none" />
        </svg>
      </div>
    </FieldShell>
  );
}
