import fs from "node:fs/promises";
import path from "node:path";
import { DATA_DIR, newId } from "@/lib/db";
import type { Attachment } from "@/lib/db/types";
import { ApiError } from "@/lib/http";

const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
const MAX_BYTES = 10 * 1024 * 1024;

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function safeExtension(filename: string): string {
  const ext = path.extname(path.basename(filename)).toLowerCase();
  return /^\.[a-z0-9]{1,8}$/.test(ext) ? ext : "";
}

export async function saveUpload(params: {
  userId: string;
  file: File;
}): Promise<Attachment> {
  const { file } = params;

  if (file.size === 0) throw ApiError.badRequest("That file is empty.");
  if (file.size > MAX_BYTES) {
    throw ApiError.badRequest("Files must be under 10 MB.");
  }
  if (!ALLOWED.has(file.type)) {
    throw ApiError.badRequest(`${file.type || "That file type"} isn't supported.`);
  }

  const id = newId("upl");
  const storedName = `${id}${safeExtension(file.name)}`;

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(
    path.join(UPLOAD_DIR, storedName),
    Buffer.from(await file.arrayBuffer()),
  );

  await fs.writeFile(
    path.join(UPLOAD_DIR, `${id}.meta.json`),
    JSON.stringify(
      {
        id,
        userId: params.userId,
        storedName,
        name: path.basename(file.name),
        mimeType: file.type,
        size: file.size,
      },
      null,
      2,
    ),
    "utf8",
  );

  return {
    id,
    kind: file.type.startsWith("image/") ? "image" : "file",
    name: path.basename(file.name),
    mimeType: file.type,
    size: file.size,
    url: `/api/uploads/${id}`,
  };
}

export interface StoredUpload {
  bytes: Buffer;
  mimeType: string;
  name: string;
}

export async function readUpload(params: {
  userId: string;
  fileId: string;
}): Promise<StoredUpload> {
  if (!/^upl_[a-z0-9]+$/.test(params.fileId)) {
    throw ApiError.notFound("File not found.");
  }

  let meta: { userId: string; storedName: string; mimeType: string; name: string };
  try {
    const raw = await fs.readFile(
      path.join(UPLOAD_DIR, `${params.fileId}.meta.json`),
      "utf8",
    );
    meta = JSON.parse(raw);
  } catch {
    throw ApiError.notFound("File not found.");
  }

  if (meta.userId !== params.userId) throw ApiError.forbidden();

  const bytes = await fs.readFile(path.join(UPLOAD_DIR, meta.storedName));
  return { bytes, mimeType: meta.mimeType, name: meta.name };
}
