import { requireVerified } from "@/lib/auth/session";
import { handler } from "@/lib/http";
import { readUpload } from "@/lib/services/uploads";

export const GET = handler(
  async (_request: Request, ctx: RouteContext<"/api/uploads/[fileId]">) => {
    const { user } = await requireVerified();
    const { fileId } = await ctx.params;

    const { bytes, mimeType, name } = await readUpload({ userId: user.id, fileId });

    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": mimeType,
        "Content-Length": String(bytes.byteLength),
        "Content-Disposition": `inline; filename="${encodeURIComponent(name)}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  },
);
