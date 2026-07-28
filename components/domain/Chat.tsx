"use client";

import { FileText, Mic, Paperclip, Send, Square } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/ui/cn";

export interface ChatAttachment {
  id: string;
  kind: "image" | "file";
  name: string;
  url: string;
}

export interface ChatBubbleProps {
  role: "user" | "assistant";
  children: ReactNode;
  timestamp?: string;
  attachments?: ChatAttachment[];
  className?: string;
}

export function ChatBubble({
  role,
  children,
  timestamp,
  attachments,
  className,
}: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={cn("space-y-1.5", isUser && "flex flex-col items-end", className)}>
      {timestamp && (
        <p className="px-1 text-xs text-ink-subtle">{timestamp}</p>
      )}

      {attachments && attachments.length > 0 && (
        <div className={cn("flex flex-wrap gap-2", isUser && "justify-end")}>
          {attachments.map((file) =>
            file.kind === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={file.id}
                src={file.url}
                alt={file.name}
                className="max-h-44 rounded-[--radius-field] object-cover"
              />
            ) : (
              <span
                key={file.id}
                className="flex items-center gap-2 rounded-[--radius-field] bg-surface-sunken px-3 py-2 text-sm text-ink-muted"
              >
                <FileText size={16} aria-hidden="true" />
                {file.name}
              </span>
            ),
          )}
        </div>
      )}

      <div
        className={cn(
          isUser
            ? "max-w-[85%] rounded-[--radius-card] bg-surface-sunken px-4 py-3 text-[0.9375rem] text-ink"
            : "text-[0.9375rem] leading-relaxed text-ink",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function TypingIndicator({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5 py-2", className)} aria-label="Tutor is typing">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="size-2 animate-bounce rounded-full bg-ink-subtle"
          style={{ animationDelay: `${index * 140}ms`, animationDuration: "1s" }}
        />
      ))}
    </div>
  );
}

export interface WaveformProps {
  levels?: number[];
  bars?: number;
  active?: boolean;
  className?: string;
}

export function Waveform({ levels, bars = 32, active = true, className }: WaveformProps) {
  const values =
    levels ??
    Array.from({ length: bars }, (_, index) =>
      0.25 + 0.6 * Math.abs(Math.sin(index * 1.7)),
    );

  return (
    <div
      aria-hidden="true"
      className={cn("flex h-8 items-center justify-center gap-[3px]", className)}
    >
      {values.map((level, index) => (
        <span
          key={index}
          className={cn(
            "w-[3px] rounded-full bg-ink transition-[height] duration-100",
            active && !levels && "animate-pulse",
          )}
          style={{
            height: `${Math.max(8, Math.min(100, level * 100))}%`,
            animationDelay: active && !levels ? `${index * 40}ms` : undefined,
          }}
        />
      ))}
    </div>
  );
}

export interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onAttach?: () => void;
  onStartVoice?: () => void;
  onStopVoice?: () => void;
  recording?: boolean;
  levels?: number[];
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatComposer({
  value,
  onChange,
  onSend,
  onAttach,
  onStartVoice,
  onStopVoice,
  recording = false,
  levels,
  disabled,
  placeholder = "Ask anything",
  className,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = "auto";
    const next = Math.min(node.scrollHeight, 120);
    node.style.height = `${next}px`;
    setHeight(next);
  }, [value]);

  if (recording) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-[--radius-card] bg-surface-sunken p-3",
          className,
        )}
      >
        <Waveform levels={levels} className="flex-1" />
        <IconButton
          label="Stop recording"
          variant="filled"
          icon={<Square size={18} fill="currentColor" />}
          onClick={onStopVoice}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-end gap-2 rounded-[--radius-card] bg-surface-sunken p-2",
        className,
      )}
    >
      {onAttach && (
        <IconButton
          label="Add photo or file"
          variant="filled"
          icon={<Paperclip size={18} />}
          onClick={onAttach}
          disabled={disabled}
        />
      )}

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (value.trim()) onSend();
          }
        }}
        rows={1}
        disabled={disabled}
        placeholder={placeholder}
        style={{ height: height || undefined }}
        className="min-h-11 flex-1 resize-none self-center bg-transparent px-1 py-2.5 text-[0.9375rem] text-ink outline-none placeholder:text-ink-subtle"
      />

      {value.trim() ? (
        <IconButton
          label="Send"
          variant="filled"
          icon={<Send size={18} />}
          onClick={onSend}
          disabled={disabled}
        />
      ) : (
        onStartVoice && (
          <IconButton
            label="Start voice input"
            variant="filled"
            icon={<Mic size={18} />}
            onClick={onStartVoice}
            disabled={disabled}
          />
        )
      )}
    </div>
  );
}
