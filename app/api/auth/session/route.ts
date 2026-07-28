import { isAiEnabled } from "@/lib/ai/client";
import { getAuth } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { handler, json } from "@/lib/http";
import { toAccountView } from "@/lib/services/accounts";

export const GET = handler(async () => {
  const auth = await getAuth();
  if (!auth) {
    return json({ authenticated: false, account: null, nextStep: "welcome" as const });
  }

  const { user, profile } = auth;

  if (!user.emailVerified) {
    return json({
      authenticated: true,
      account: toAccountView(user, profile),
      nextStep: "verify_email" as const,
      aiEnabled: isAiEnabled(),
    });
  }

  if (!profile.name || profile.birthYear === null) {
    return json({
      authenticated: true,
      account: toAccountView(user, profile),
      nextStep: "basic_info" as const,
      aiEnabled: isAiEnabled(),
    });
  }

  const enrollments = await db.enrollments.find((row) => row.userId === user.id);

  if (enrollments.length === 0) {
    return json({
      authenticated: true,
      account: toAccountView(user, profile),
      nextStep: "select_subjects" as const,
      aiEnabled: isAiEnabled(),
    });
  }

  const awaitingPlacement = enrollments.find((row) => row.placementStatus === "pending");

  return json({
    authenticated: true,
    account: toAccountView(user, profile),
    nextStep: awaitingPlacement ? ("placement" as const) : ("dashboard" as const),
    placementSubjectId: awaitingPlacement?.subjectId ?? null,
    aiEnabled: isAiEnabled(),
  });
});
