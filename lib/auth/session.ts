import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { db, now } from "@/lib/db";
import { ensureSeeded } from "@/lib/db/seed";
import type { Profile, Session, User } from "@/lib/db/types";
import { ApiError } from "@/lib/http";

export const SESSION_COOKIE = "uvbrain_session";
const SESSION_TTL_DAYS = 30;

export interface AuthContext {
  user: User;
  profile: Profile;
  session: Session;
}

function expiry(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

export async function createSession(userId: string): Promise<Session> {
  const session: Session & { id: string } = {
    id: randomBytes(32).toString("base64url"),
    token: "",
    userId,
    createdAt: now(),
    expiresAt: expiry(SESSION_TTL_DAYS),
  };
  session.token = session.id;
  await db.sessions.insert(session);
  return session;
}

export async function setSessionCookie(session: Session): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, session.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(session.expiresAt),
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getAuth(): Promise<AuthContext | null> {
  await ensureSeeded();
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.sessions.get(token);
  if (!session) return null;

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    await db.sessions.remove(session.id);
    return null;
  }

  const user = await db.users.get(session.userId);
  if (!user) return null;

  const profile = await db.profiles.get(session.userId);
  if (!profile) return null;

  return { user, profile, session };
}

export async function requireAuth(): Promise<AuthContext> {
  const auth = await getAuth();
  if (!auth) throw ApiError.unauthorized();
  return auth;
}

export async function requireVerified(): Promise<AuthContext> {
  const auth = await requireAuth();
  if (!auth.user.emailVerified) {
    throw new ApiError(403, "email_unverified", "Verify your email address to continue.");
  }
  return auth;
}

export async function revokeAllSessions(userId: string, keepToken?: string): Promise<void> {
  await db.sessions.removeWhere(
    (session) => session.userId === userId && session.id !== keepToken,
  );
}
