import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";

const MIGRATIONS_DIR = join(import.meta.dirname, "..", "..", "migrations");

/** A prepared statement with its bound values, mirroring D1's statement. */
class Statement {
  constructor(
    private readonly database: DatabaseSync,
    readonly sql: string,
    private readonly values: SQLInputValue[] = []
  ) {}

  bind(...values: unknown[]): Statement {
    return new Statement(this.database, this.sql, values as SQLInputValue[]);
  }

  first(column?: string): Promise<unknown> {
    const row = this.database.prepare(this.sql).get(...this.values) as
      | Record<string, unknown>
      | undefined;
    if (row === undefined) {
      return Promise.resolve(null);
    }
    return Promise.resolve(column === undefined ? row : row[column]);
  }

  all(): Promise<{ results: unknown[]; success: true }> {
    const results = this.database.prepare(this.sql).all(...this.values);
    return Promise.resolve({ results, success: true });
  }

  run(): Promise<{
    success: true;
    meta: { changes: number; last_row_id: number };
  }> {
    return Promise.resolve(this.execute());
  }

  execute(): { success: true; meta: { changes: number; last_row_id: number } } {
    const result = this.database.prepare(this.sql).run(...this.values);
    return {
      success: true,
      meta: {
        changes: Number(result.changes),
        last_row_id: Number(result.lastInsertRowid),
      },
    };
  }
}

/**
 * The subset of D1 the Worker uses, backed by an in-memory `node:sqlite`
 * database with every migration applied. Real SQL, so the tests exercise the
 * actual queries; `batch` runs in one transaction like D1's.
 *
 * @returns A D1-shaped database plus the raw handle for assertions.
 */
export function createTestDatabase(): {
  database: D1Database;
  raw: DatabaseSync;
} {
  const raw = new DatabaseSync(":memory:");
  for (const file of readdirSync(MIGRATIONS_DIR).sort((a, b) =>
    a.localeCompare(b)
  )) {
    raw.exec(readFileSync(join(MIGRATIONS_DIR, file), "utf8"));
  }
  const database = {
    prepare: (sql: string) => new Statement(raw, sql),
    batch: (statements: Statement[]) => {
      raw.exec("BEGIN");
      try {
        const results = statements.map((statement) => statement.execute());
        raw.exec("COMMIT");
        return Promise.resolve(results);
      } catch (error) {
        raw.exec("ROLLBACK");
        throw error;
      }
    },
  };
  return { database: database as unknown as D1Database, raw };
}

/**
 * A database whose every call rejects, standing in for D1 past its daily cap.
 *
 * @returns A D1-shaped database that always errors.
 */
export function createFailingDatabase(): D1Database {
  const fail = (): Promise<never> =>
    Promise.reject(new Error("D1_ERROR: daily limit exceeded"));
  const statement = {
    bind: () => statement,
    first: fail,
    all: fail,
    run: fail,
  };
  return {
    prepare: () => statement,
    batch: fail,
  } as unknown as D1Database;
}
