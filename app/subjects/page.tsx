"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SubjectTile } from "@/components/domain";
import {
  AppShell,
  Button,
  EmptyState,
  Fab,
  MobileMasthead,
  Sheet,
  Skeleton,
  Text,
  ToastProvider,
  useToast,
} from "@/components/ui";
import { api, apiPost } from "@/lib/api";

interface EnrollmentView {
  id: string;
  subject: { id: string; name: string; icon: string };
  isNew: boolean;
  progress: { percent: number };
}

interface SubjectView {
  id: string;
  name: string;
  icon: string;
  blurb: string;
}

function SubjectsPage() {
  const router = useRouter();
  const toast = useToast();
  const [enrollments, setEnrollments] = useState<EnrollmentView[] | null>(null);
  const [catalog, setCatalog] = useState<SubjectView[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  const load = useCallback(async () => {
    const result = await api<{ enrollments: EnrollmentView[] }>("/api/me/subjects");
    setEnrollments(result.enrollments);
  }, []);

  useEffect(() => {
    load().catch(() => router.push("/login"));
    api<{ subjects: SubjectView[] }>("/api/subjects")
      .then((result) => setCatalog(result.subjects))
      .catch(() => undefined);
  }, [load, router]);

  const enrolledIds = new Set(enrollments?.map((row) => row.subject.id));
  const available = catalog.filter((subject) => !enrolledIds.has(subject.id));

  async function addSubject(subjectId: string) {
    try {
      await apiPost("/api/me/subjects", { subjectId });
      setSheetOpen(false);
      await load();
      toast.show("Added. Take the placement check when you're ready.", "success");
    } catch {
      toast.show("Couldn't add that subject.", "error");
    }
  }

  return (
    <AppShell>
      <MobileMasthead />

      <header className="px-5 pt-2 lg:pt-10">
        <Text variant="display">My subjects</Text>
        <Text variant="body" tone="muted" className="mt-2 max-w-[44ch]">
          Everything you&apos;re studying. Tap one to see its path.
        </Text>
      </header>

      <div className="mt-7 px-5">
        {!enrollments ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[0, 1, 2, 3].map((key) => (
              <Skeleton key={key} className="aspect-square rounded-[--radius-card]" />
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <EmptyState
            title="No subjects yet"
            description="Add a subject and we'll build a syllabus around what you already know."
            action={
              <Button size="md" onClick={() => setSheetOpen(true)}>
                Add a subject
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {enrollments.map((enrollment) => (
              <SubjectTile
                key={enrollment.id}
                name={enrollment.subject.name}
                icon={enrollment.subject.icon}
                isNew={enrollment.isNew}
                onClick={() => router.push(`/subjects/${enrollment.subject.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <Fab
        label="Add a subject"
        icon={<Plus size={24} />}
        onClick={() => setSheetOpen(true)}
      />

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Add a subject">
        {available.length === 0 ? (
          <Text variant="body" tone="muted" className="py-6 text-center">
            You&apos;re studying everything we have.
          </Text>
        ) : (
          <div className="grid grid-cols-2 gap-3 pt-2">
            {available.map((subject) => (
              <SubjectTile
                key={subject.id}
                name={subject.name}
                icon={subject.icon}
                onClick={() => addSubject(subject.id)}
              />
            ))}
          </div>
        )}
      </Sheet>
    </AppShell>
  );
}

export default function Page() {
  return (
    <ToastProvider>
      <SubjectsPage />
    </ToastProvider>
  );
}
