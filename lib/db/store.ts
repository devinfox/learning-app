import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const DATA_DIR = path.join(process.cwd(), "data");

export function newId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
}

export function now(): string {
  return new Date().toISOString();
}

interface Entity {
  id: string;
}

function supabaseConfig(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

export function isSupabaseEnabled(): boolean {
  return supabaseConfig() !== null;
}

let sharedClient: SupabaseClient | null = null;

function client(): SupabaseClient {
  const config = supabaseConfig();
  if (!config) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must both be set to use the Supabase store.",
    );
  }
  sharedClient ??= createClient(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return sharedClient;
}

interface Backend<T extends Entity> {
  list(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  insertRows(rows: T[]): Promise<void>;
  replace(id: string, row: T): Promise<void>;
  deleteIds(ids: string[]): Promise<void>;
  deleteAll(): Promise<void>;
}

class JsonBackend<T extends Entity> implements Backend<T> {
  private readonly file: string;
  private cache: T[] | null = null;

  constructor(name: string) {
    this.file = path.join(DATA_DIR, `${name}.json`);
  }

  private async load(): Promise<T[]> {
    if (this.cache) return this.cache;
    try {
      const raw = await fs.readFile(this.file, "utf8");
      this.cache = JSON.parse(raw) as T[];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      this.cache = [];
    }
    return this.cache;
  }

  private async flush(rows: T[]): Promise<void> {
    this.cache = rows;
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = `${this.file}.${process.pid}.tmp`;
    await fs.writeFile(tmp, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
    await fs.rename(tmp, this.file);
  }

  async list(): Promise<T[]> {
    return [...(await this.load())];
  }

  async getById(id: string): Promise<T | null> {
    return (await this.load()).find((row) => row.id === id) ?? null;
  }

  async insertRows(rows: T[]): Promise<void> {
    await this.flush([...(await this.load()), ...rows]);
  }

  async replace(id: string, row: T): Promise<void> {
    const rows = await this.load();
    const index = rows.findIndex((candidate) => candidate.id === id);
    if (index === -1) return;
    const copy = [...rows];
    copy[index] = row;
    await this.flush(copy);
  }

  async deleteIds(ids: string[]): Promise<void> {
    const drop = new Set(ids);
    await this.flush((await this.load()).filter((row) => !drop.has(row.id)));
  }

  async deleteAll(): Promise<void> {
    await this.flush([]);
  }
}

const PAGE_SIZE = 1000;

class SupabaseBackend<T extends Entity> implements Backend<T> {
  private readonly table: string;

  constructor(name: string) {
    this.table = name.replace(/-/g, "_");
  }

  private fail(action: string, message: string): never {
    throw new Error(`[db] ${action} on ${this.table} failed: ${message}`);
  }

  async list(): Promise<T[]> {
    const rows: T[] = [];

    for (let page = 0; ; page += 1) {
      const from = page * PAGE_SIZE;
      const { data, error } = await client()
        .from(this.table)
        .select("data")
        .order("seq", { ascending: true })
        .range(from, from + PAGE_SIZE - 1);

      if (error) this.fail("select", error.message);

      rows.push(...(data ?? []).map((entry) => entry.data as T));
      if (!data || data.length < PAGE_SIZE) return rows;
    }
  }

  async getById(id: string): Promise<T | null> {
    const { data, error } = await client()
      .from(this.table)
      .select("data")
      .eq("id", id)
      .maybeSingle();

    if (error) this.fail("select by id", error.message);
    return (data?.data as T | undefined) ?? null;
  }

  async insertRows(rows: T[]): Promise<void> {
    if (rows.length === 0) return;

    const { error } = await client()
      .from(this.table)
      .insert(rows.map((row) => ({ id: row.id, data: row })));

    if (error) this.fail("insert", error.message);
  }

  async replace(id: string, row: T): Promise<void> {
    const { error } = await client()
      .from(this.table)
      .update({ data: row, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) this.fail("update", error.message);
  }

  async deleteIds(ids: string[]): Promise<void> {
    if (ids.length === 0) return;

    for (let start = 0; start < ids.length; start += PAGE_SIZE) {
      const { error } = await client()
        .from(this.table)
        .delete()
        .in("id", ids.slice(start, start + PAGE_SIZE));

      if (error) this.fail("delete", error.message);
    }
  }

  async deleteAll(): Promise<void> {
    const { error } = await client().from(this.table).delete().neq("id", "");
    if (error) this.fail("truncate", error.message);
  }
}

export class Collection<T extends Entity> {
  readonly name: string;
  private backend: Backend<T> | null = null;
  private queue: Promise<unknown> = Promise.resolve();

  constructor(name: string) {
    this.name = name;
  }

  private store(): Backend<T> {
    this.backend ??= isSupabaseEnabled()
      ? new SupabaseBackend<T>(this.name)
      : new JsonBackend<T>(this.name);
    return this.backend;
  }

  private lock<R>(fn: () => Promise<R>): Promise<R> {
    const run = this.queue.then(fn, fn);
    this.queue = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  async all(): Promise<T[]> {
    return this.lock(() => this.store().list());
  }

  async find(predicate: (row: T) => boolean): Promise<T[]> {
    return this.lock(async () => (await this.store().list()).filter(predicate));
  }

  async findOne(predicate: (row: T) => boolean): Promise<T | null> {
    return this.lock(async () => (await this.store().list()).find(predicate) ?? null);
  }

  async get(id: string): Promise<T | null> {
    return this.lock(() => this.store().getById(id));
  }

  async insert(row: T): Promise<T> {
    return this.lock(async () => {
      await this.store().insertRows([row]);
      return row;
    });
  }

  async insertMany(newRows: T[]): Promise<T[]> {
    return this.lock(async () => {
      await this.store().insertRows(newRows);
      return newRows;
    });
  }

  async update(id: string, patch: Partial<T>): Promise<T | null> {
    return this.lock(async () => {
      const existing = await this.store().getById(id);
      if (!existing) return null;
      const next = { ...existing, ...patch };
      await this.store().replace(id, next);
      return next;
    });
  }

  async mutate(id: string, mutator: (row: T) => T): Promise<T | null> {
    return this.lock(async () => {
      const existing = await this.store().getById(id);
      if (!existing) return null;
      const next = mutator(existing);
      await this.store().replace(id, next);
      return next;
    });
  }

  async remove(id: string): Promise<boolean> {
    return this.lock(async () => {
      const existing = await this.store().getById(id);
      if (!existing) return false;
      await this.store().deleteIds([id]);
      return true;
    });
  }

  async removeWhere(predicate: (row: T) => boolean): Promise<number> {
    return this.lock(async () => {
      const doomed = (await this.store().list()).filter(predicate);
      if (doomed.length === 0) return 0;
      await this.store().deleteIds(doomed.map((row) => row.id));
      return doomed.length;
    });
  }

  async truncate(): Promise<void> {
    return this.lock(() => this.store().deleteAll());
  }
}
