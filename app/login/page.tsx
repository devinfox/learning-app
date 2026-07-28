"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Input, Logo, PasswordInput, RayRule, Text } from "@/components/ui";
import { apiPost, ApiClientError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await apiPost("/api/auth/login", { email: identifier, password });
      router.push("/dashboard");
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof ApiClientError ? cause.message : "Something went wrong.",
      );
      setBusy(false);
    }
  }

  return (
    <div
      data-ground="cosmos"
      className="relative flex min-h-dvh flex-col justify-center bg-cosmos px-6 py-12"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 left-1/2 size-80 -translate-x-1/2 rounded-full bg-prism opacity-25 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-sm">
        <div className="flex flex-col items-center gap-5 text-center">
          <Logo size={40} ground="cosmos" />
          <Text variant="h1">The light that teaches.</Text>
          <Text variant="body" tone="muted" className="max-w-[30ch]">
            Sign in to pick up where you left off.
          </Text>
          <RayRule width="short" />
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Input
            label="Username or email"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            required
          />
          <PasswordInput
            label="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={error}
            required
          />
          <Button type="submit" fullWidth loading={busy}>
            Sign in
          </Button>
        </form>

        <Text variant="caption" tone="subtle" className="mt-6 text-center">
          Demo account — kid / test123
        </Text>
      </div>
    </div>
  );
}
