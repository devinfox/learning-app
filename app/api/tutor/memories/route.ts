import { requireVerified } from "@/lib/auth/session";
import { handler, json } from "@/lib/http";
import { listMemories } from "@/lib/tutor";

export const GET = handler(async () => {
  const { user } = await requireVerified();
  const memories = await listMemories(user.id);

  return json({
    memories: memories
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
      .map((memory) => ({
        id: memory.id,
        kind: memory.kind,
        content: memory.content,
        concept: memory.concept,
        subjectId: memory.subjectId,
        confidence: memory.confidence,
        reinforcedCount: memory.reinforcedCount,
        horizon: memory.horizon,
        expiresAt: memory.expiresAt,
        sensitive: memory.sensitive,
        updatedAt: memory.updatedAt,
      })),
  });
});
