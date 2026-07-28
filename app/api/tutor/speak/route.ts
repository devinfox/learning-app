import { requireVerified } from "@/lib/auth/session";
import { ApiError, handler, json, readJson } from "@/lib/http";
import { speakSchema } from "@/lib/schemas";
import { bandForBirthYear } from "@/lib/tutor/bands";
import { isVoiceEnabled, speak } from "@/lib/tutor/voice";

export const POST = handler(async (request: Request) => {
  if (!isVoiceEnabled()) {
    throw new ApiError(503, "voice_unavailable", "Voice is not configured.");
  }

  const { profile } = await requireVerified();
  const body = await readJson(request, speakSchema);

  const result = await speak({
    text: body.text,
    band: body.band ?? bandForBirthYear(profile.birthYear),
    voiceId: body.voiceId,
  });

  return json(result);
});
