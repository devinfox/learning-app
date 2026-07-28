import { requireVerified } from "@/lib/auth/session";
import { ApiError, handler, json } from "@/lib/http";
import { saveUpload } from "@/lib/services/uploads";

export const POST = handler(async (request: Request) => {
  const { user } = await requireVerified();

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");

  if (!(file instanceof File)) {
    throw ApiError.badRequest("Attach a file under the 'file' field.");
  }

  const attachment = await saveUpload({ userId: user.id, file });
  return json({ attachment }, { status: 201 });
});
