import { requireVerified } from "@/lib/auth/session";
import { handler, json } from "@/lib/http";
import { isVoiceEnabled, listVoices } from "@/lib/tutor/voice";

export const GET = handler(async () => {
  await requireVerified();
  if (!isVoiceEnabled()) return json({ enabled: false, voices: [] });
  return json({ enabled: true, voices: await listVoices() });
});
