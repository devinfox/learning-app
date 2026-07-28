"use client";

import { Globe, Lock, LogOut, Mail, Moon, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AppShell,
  Avatar,
  Button,
  Input,
  ListGroup,
  ListRow,
  MobileMasthead,
  Section,
  Select,
  Sheet,
  Skeleton,
  Text,
  ToastProvider,
  useToast,
} from "@/components/ui";
import { api, apiPatch, apiPost } from "@/lib/api";

interface Account {
  id: string;
  email: string;
  profile: {
    name: string;
    pronouns: string | null;
    birthYear: number | null;
    locale: string;
    theme: string;
  };
}

const LOCALES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "pt", label: "Português" },
  { value: "ar", label: "العربية" },
];

function ProfilePage() {
  const router = useRouter();
  const toast = useToast();
  const [account, setAccount] = useState<Account | null>(null);
  const [editing, setEditing] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  const [name, setName] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<{ account: Account }>("/api/profile")
      .then((result) => {
        setAccount(result.account);
        setName(result.account.profile.name);
        setPronouns(result.account.profile.pronouns ?? "");
        setBirthYear(String(result.account.profile.birthYear ?? ""));
      })
      .catch(() => router.push("/login"));
  }, [router]);

  async function saveBasics() {
    setSaving(true);
    try {
      const result = await apiPatch<{ account: Account }>("/api/profile", {
        name,
        pronouns: pronouns || null,
        birthYear: birthYear ? Number(birthYear) : null,
      });
      setAccount(result.account);
      setEditing(false);
      toast.show("Saved.", "success");
    } catch {
      toast.show("Couldn't save that.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function setLocale(locale: string) {
    const result = await apiPatch<{ account: Account }>("/api/profile", { locale });
    setAccount(result.account);
    setLanguageOpen(false);
    toast.show("Language updated.", "success");
  }

  async function signOut() {
    await apiPost("/api/auth/logout").catch(() => undefined);
    router.push("/login");
  }

  const localeLabel =
    LOCALES.find((row) => row.value === account?.profile.locale)?.label ?? "English";

  return (
    <AppShell>
      <MobileMasthead />

      <header className="flex flex-col items-center px-5 pt-4 text-center lg:pt-10">
        <Avatar name={account?.profile.name} size={84} />
        {account ? (
          <>
            <Text variant="h1" className="mt-4">
              {account.profile.name}
            </Text>
            <Text variant="caption" tone="muted" className="mt-1">
              {account.email}
            </Text>
          </>
        ) : (
          <Skeleton className="mt-4 h-8 w-40" />
        )}
      </header>

      <div className="mt-8 space-y-7 px-5">
        <Section
          title="Basic information"
          ruled
          action={
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label="Edit basic information"
              className="grid size-9 place-items-center rounded-full text-ink-muted transition hover:bg-surface-sunken hover:text-ink"
            >
              <Pencil size={16} />
            </button>
          }
        >
          {account ? (
            <ListGroup>
              <ListRow label={account.profile.name} showChevron={false} />
              <ListRow label={account.profile.pronouns ?? "Not set"} showChevron={false} />
              <ListRow
                label={account.profile.birthYear ? String(account.profile.birthYear) : "Not set"}
                showChevron={false}
              />
            </ListGroup>
          ) : (
            <Skeleton className="h-36 rounded-[--radius-card]" />
          )}
        </Section>

        <Section title="Account" ruled>
          <ListGroup>
            <ListRow
              icon={<Mail size={18} />}
              label="Email"
              value={account?.email}
              onClick={() => toast.show("Email change needs a verification code.")}
            />
            <ListRow
              icon={<Lock size={18} />}
              label="Password & security"
              onClick={() => toast.show("Password change needs a verification code.")}
            />
          </ListGroup>
        </Section>

        <Section title="Personalisation" ruled>
          <ListGroup>
            <ListRow
              icon={<Globe size={18} />}
              label="Language"
              value={localeLabel}
              onClick={() => setLanguageOpen(true)}
            />
            <ListRow
              icon={<Moon size={18} />}
              label="Theme"
              value="Light"
              onClick={() => toast.show("Only light is designed so far.")}
            />
          </ListGroup>
        </Section>

        <Button
          fullWidth
          variant="secondary"
          onClick={signOut}
          leadingIcon={<LogOut size={18} />}
        >
          Sign out
        </Button>
      </div>

      <Sheet open={editing} onClose={() => setEditing(false)} title="Your basic information">
        <div className="space-y-4 pt-2">
          <Input
            label="What is your name?"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Select
            label="Your pronouns (optional)"
            value={pronouns}
            onChange={(event) => setPronouns(event.target.value)}
            placeholder="Prefer not to say"
            options={[
              { value: "", label: "Prefer not to say" },
              { value: "he/him", label: "he/him" },
              { value: "she/her", label: "she/her" },
              { value: "they/them", label: "they/them" },
            ]}
          />
          <Input
            label="What is your birth year?"
            inputMode="numeric"
            value={birthYear}
            onChange={(event) => setBirthYear(event.target.value.replace(/\D/g, ""))}
          />
          <Button fullWidth onClick={saveBasics} loading={saving}>
            Save
          </Button>
        </div>
      </Sheet>

      <Sheet open={languageOpen} onClose={() => setLanguageOpen(false)} title="Select a language">
        <ListGroup className="mt-2">
          {LOCALES.map((locale) => (
            <ListRow
              key={locale.value}
              label={locale.label}
              selected={account?.profile.locale === locale.value}
              showChevron={false}
              onClick={() => setLocale(locale.value)}
            />
          ))}
        </ListGroup>
      </Sheet>
    </AppShell>
  );
}

export default function Page() {
  return (
    <ToastProvider>
      <ProfilePage />
    </ToastProvider>
  );
}
