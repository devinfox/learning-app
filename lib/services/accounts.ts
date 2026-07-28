import { issueOtp, verifyOtp, type IssuedOtp } from "@/lib/auth/otp";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { revokeAllSessions } from "@/lib/auth/session";
import { db, newId, now } from "@/lib/db";
import { ensureSeeded } from "@/lib/db/seed";
import type { AuthProvider, Locale, Profile, Theme, User } from "@/lib/db/types";
import { ApiError } from "@/lib/http";

const DEMO_DOMAIN = "uvbrain.local";

function normaliseEmail(email: string): string {
  const value = email.trim().toLowerCase();
  return value.includes("@") ? value : `${value}@${DEMO_DOMAIN}`;
}

export interface AccountView {
  id: string;
  email: string;
  provider: AuthProvider;
  emailVerified: boolean;
  profile: {
    name: string;
    pronouns: string | null;
    birthYear: number | null;
    avatarUrl: string | null;
    locale: Locale;
    theme: Theme;
    onboardedAt: string | null;
  };
}

export function toAccountView(user: User, profile: Profile): AccountView {
  return {
    id: user.id,
    email: user.email,
    provider: user.provider,
    emailVerified: user.emailVerified,
    profile: {
      name: profile.name,
      pronouns: profile.pronouns,
      birthYear: profile.birthYear,
      avatarUrl: profile.avatarUrl,
      locale: profile.locale,
      theme: profile.theme,
      onboardedAt: profile.onboardedAt,
    },
  };
}

export async function findUserByEmail(email: string): Promise<User | null> {
  await ensureSeeded();
  return db.users.findOne((user) => user.email === normaliseEmail(email));
}

async function createProfile(userId: string, name: string): Promise<Profile> {
  const profile: Profile & { id: string } = {
    id: userId,
    userId,
    name,
    pronouns: null,
    birthYear: null,
    avatarUrl: null,
    locale: "en",
    theme: "light",
    onboardedAt: null,
  };
  await db.profiles.insert(profile);
  return profile;
}

export interface RegisterResult {
  user: User;
  profile: Profile;
  verification: IssuedOtp;
}

export async function register(params: {
  email: string;
  password: string;
  name?: string;
}): Promise<RegisterResult> {
  await ensureSeeded();
  const email = normaliseEmail(params.email);

  if (await findUserByEmail(email)) {
    throw ApiError.conflict("An account with that email already exists.");
  }

  const user: User = {
    id: newId("usr"),
    email,
    passwordHash: await hashPassword(params.password),
    provider: "password",
    emailVerified: false,
    createdAt: now(),
    updatedAt: now(),
  };
  await db.users.insert(user);

  const profile = await createProfile(user.id, params.name?.trim() || "");
  const verification = await issueOtp({
    userId: user.id,
    email: user.email,
    purpose: "verify_email",
  });

  return { user, profile, verification };
}

export async function login(params: {
  email: string;
  password: string;
}): Promise<{ user: User; profile: Profile }> {
  const user = await findUserByEmail(params.email);
  if (!user || !(await verifyPassword(params.password, user.passwordHash))) {
    throw ApiError.unauthorized("That email or password isn't right.");
  }

  const profile = await db.profiles.get(user.id);
  if (!profile) throw ApiError.unauthorized("That email or password isn't right.");

  return { user, profile };
}

export async function socialSignIn(params: {
  provider: Exclude<AuthProvider, "password">;
  email: string;
  name?: string;
}): Promise<{ user: User; profile: Profile; verification: IssuedOtp | null; created: boolean }> {
  await ensureSeeded();
  const email = normaliseEmail(params.email);
  const existing = await findUserByEmail(email);

  if (existing) {
    const profile = (await db.profiles.get(existing.id)) ?? (await createProfile(existing.id, ""));
    const verification = existing.emailVerified
      ? null
      : await issueOtp({ userId: existing.id, email, purpose: "verify_email" });
    return { user: existing, profile, verification, created: false };
  }

  const user: User = {
    id: newId("usr"),
    email,
    passwordHash: null,
    provider: params.provider,
    emailVerified: false,
    createdAt: now(),
    updatedAt: now(),
  };
  await db.users.insert(user);

  const profile = await createProfile(user.id, params.name?.trim() || "");
  const verification = await issueOtp({ userId: user.id, email, purpose: "verify_email" });

  return { user, profile, verification, created: true };
}

export async function verifyEmail(userId: string, code: string): Promise<User> {
  await verifyOtp({ userId, purpose: "verify_email", code });
  const user = await db.users.update(userId, { emailVerified: true, updatedAt: now() });
  if (!user) throw ApiError.notFound("Account not found.");
  return user;
}

export async function resendVerification(user: User): Promise<IssuedOtp> {
  if (user.emailVerified) throw ApiError.conflict("This email is already verified.");
  return issueOtp({ userId: user.id, email: user.email, purpose: "verify_email" });
}

export async function requestPasswordReset(email: string): Promise<IssuedOtp | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  return issueOtp({ userId: user.id, email: user.email, purpose: "reset_password" });
}

export async function resetPassword(params: {
  email: string;
  code: string;
  password: string;
}): Promise<User> {
  const user = await findUserByEmail(params.email);
  if (!user) throw ApiError.badRequest("That code has expired. Request a new one.");

  await verifyOtp({ userId: user.id, purpose: "reset_password", code: params.code });

  const updated = await db.users.update(user.id, {
    passwordHash: await hashPassword(params.password),
    emailVerified: true,
    updatedAt: now(),
  });
  if (!updated) throw ApiError.notFound("Account not found.");

  await revokeAllSessions(user.id);
  return updated;
}

export async function updateProfile(
  userId: string,
  patch: Partial<Pick<Profile, "name" | "pronouns" | "birthYear" | "avatarUrl" | "locale" | "theme">>,
): Promise<Profile> {
  const updated = await db.profiles.update(userId, patch);
  if (!updated) throw ApiError.notFound("Profile not found.");
  return updated;
}

export async function completeOnboarding(userId: string): Promise<Profile> {
  const profile = await db.profiles.get(userId);
  if (!profile) throw ApiError.notFound("Profile not found.");
  if (profile.onboardedAt) return profile;

  const updated = await db.profiles.update(userId, { onboardedAt: now() });
  return updated ?? profile;
}

export async function requestEmailChange(user: User, newEmail: string): Promise<IssuedOtp> {
  const email = normaliseEmail(newEmail);
  if (email === user.email) {
    throw ApiError.badRequest("That's already your email address.");
  }
  if (await findUserByEmail(email)) {
    throw ApiError.conflict("An account with that email already exists.");
  }

  return issueOtp({
    userId: user.id,
    email,
    purpose: "change_email",
    payload: { newEmail: email },
  });
}

export async function confirmEmailChange(user: User, code: string): Promise<User> {
  const record = await verifyOtp({ userId: user.id, purpose: "change_email", code });
  const newEmail = record.payload?.newEmail;
  if (!newEmail) throw ApiError.badRequest("That request expired. Start again.");

  if (await findUserByEmail(newEmail)) {
    throw ApiError.conflict("An account with that email already exists.");
  }

  const updated = await db.users.update(user.id, {
    email: newEmail,
    emailVerified: true,
    updatedAt: now(),
  });
  if (!updated) throw ApiError.notFound("Account not found.");
  return updated;
}

export async function requestPasswordChange(
  user: User,
  currentPassword: string,
): Promise<IssuedOtp> {
  if (user.passwordHash && !(await verifyPassword(currentPassword, user.passwordHash))) {
    throw ApiError.badRequest("That current password isn't right.");
  }
  return issueOtp({ userId: user.id, email: user.email, purpose: "change_password" });
}

export async function confirmPasswordChange(params: {
  user: User;
  code: string;
  password: string;
  keepSessionToken: string;
}): Promise<User> {
  await verifyOtp({ userId: params.user.id, purpose: "change_password", code: params.code });

  const updated = await db.users.update(params.user.id, {
    passwordHash: await hashPassword(params.password),
    provider: "password",
    updatedAt: now(),
  });
  if (!updated) throw ApiError.notFound("Account not found.");

  await revokeAllSessions(params.user.id, params.keepSessionToken);
  return updated;
}
