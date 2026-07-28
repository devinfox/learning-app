import { createHash, randomInt } from "node:crypto";
import { db, newId, now } from "@/lib/db";
import type { OtpCode, OtpPurpose } from "@/lib/db/types";
import { ApiError } from "@/lib/http";

const CODE_TTL_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS = 5;

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

function generateCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export interface IssuedOtp {
  id: string;
  expiresAt: string;
  resendableAt: string;
  devCode?: string;
}

export async function issueOtp(params: {
  userId: string;
  email: string;
  purpose: OtpPurpose;
  payload?: Record<string, string>;
}): Promise<IssuedOtp> {
  const outstanding = await db.otps.find(
    (otp) =>
      otp.userId === params.userId &&
      otp.purpose === params.purpose &&
      otp.consumedAt === null,
  );

  const blocking = outstanding.find(
    (otp) => new Date(otp.resendableAt).getTime() > Date.now(),
  );
  if (blocking) {
    const retryAfter = Math.ceil(
      (new Date(blocking.resendableAt).getTime() - Date.now()) / 1000,
    );
    throw ApiError.tooManyRequests(
      `Wait ${retryAfter}s before requesting another code.`,
      { retryAfterSeconds: retryAfter },
    );
  }

  await db.otps.removeWhere(
    (otp) =>
      otp.userId === params.userId &&
      otp.purpose === params.purpose &&
      otp.consumedAt === null,
  );

  const code = generateCode();
  const record: OtpCode = {
    id: newId("otp"),
    userId: params.userId,
    email: params.email,
    purpose: params.purpose,
    codeHash: hashCode(code),
    expiresAt: new Date(Date.now() + CODE_TTL_MINUTES * 60_000).toISOString(),
    resendableAt: new Date(Date.now() + RESEND_COOLDOWN_SECONDS * 1000).toISOString(),
    attempts: 0,
    consumedAt: null,
    createdAt: now(),
    payload: params.payload ?? null,
  };
  await db.otps.insert(record);

  console.info(`[otp] ${params.purpose} code for ${params.email}: ${code}`);

  return {
    id: record.id,
    expiresAt: record.expiresAt,
    resendableAt: record.resendableAt,
    ...(process.env.NODE_ENV === "production" ? {} : { devCode: code }),
  };
}

export async function verifyOtp(params: {
  userId: string;
  purpose: OtpPurpose;
  code: string;
}): Promise<OtpCode> {
  const record = await db.otps.findOne(
    (otp) =>
      otp.userId === params.userId &&
      otp.purpose === params.purpose &&
      otp.consumedAt === null,
  );

  if (!record) {
    throw ApiError.badRequest("That code has expired. Request a new one.");
  }

  if (new Date(record.expiresAt).getTime() <= Date.now()) {
    await db.otps.remove(record.id);
    throw ApiError.badRequest("That code has expired. Request a new one.");
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await db.otps.remove(record.id);
    throw ApiError.tooManyRequests("Too many incorrect attempts. Request a new code.");
  }

  if (hashCode(params.code) !== record.codeHash) {
    const updated = await db.otps.mutate(record.id, (row) => ({
      ...row,
      attempts: row.attempts + 1,
    }));
    const remaining = MAX_ATTEMPTS - (updated?.attempts ?? MAX_ATTEMPTS);
    throw ApiError.badRequest(
      remaining > 0
        ? `That code isn't right. ${remaining} attempt${remaining === 1 ? "" : "s"} left.`
        : "That code isn't right. Request a new code.",
    );
  }

  const consumed = await db.otps.update(record.id, { consumedAt: now() });
  return consumed ?? record;
}
