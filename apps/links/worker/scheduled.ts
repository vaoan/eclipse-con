import { runWeeklyExport } from "./backup";
import type { Env } from "./env";
import { runRollup } from "./rollup";
import type { Fetcher } from "./sheet";
import { runNightlySummary } from "./summary";
import { runSync } from "./sync";

/** Rollup cadence in minutes (incremental, so frequency does not add reads). */
const ROLLUP_EVERY_MINUTES = 5;

/** Which jobs a given cron minute runs. */
export interface DueJobs {
  readonly sync: boolean;
  readonly rollup: boolean;
  readonly summary: boolean;
  readonly weeklyExport: boolean;
}

/**
 * The single `* * * * *` trigger fans out by time (UTC), so the Worker needs
 * one cron slot: sync every minute; rollup every 5 minutes (at :02, :07, …);
 * the Sheet summary at 06:30 (01:30 Bogotá, after the day's last rollup);
 * the R2 export Mondays at 07:00.
 *
 * @param scheduledTime - `controller.scheduledTime`, ms.
 * @returns The jobs due at that minute.
 */
export function dueJobs(scheduledTime: number): DueJobs {
  const date = new Date(scheduledTime);
  const minute = date.getUTCMinutes();
  const hour = date.getUTCHours();
  return {
    sync: true,
    rollup: minute % ROLLUP_EVERY_MINUTES === 2,
    summary: hour === 6 && minute === 30,
    weeklyExport: date.getUTCDay() === 1 && hour === 7 && minute === 0,
  };
}

/** Run a job, logging instead of throwing so one failure skips no others. */
async function attempt(
  name: string,
  job: () => Promise<unknown>
): Promise<void> {
  try {
    await job();
  } catch (error) {
    console.error(`scheduled job ${name} failed`, error);
  }
}

/**
 * Cron entry point.
 *
 * @param scheduledTime - When the trigger fired, ms.
 * @param env - Worker env.
 * @param cache - `caches.default`.
 * @param fetcher - `fetch`.
 * @returns Resolves when every due job has finished.
 */
export async function handleScheduled(
  scheduledTime: number,
  env: Env,
  cache: Cache | undefined,
  fetcher: Fetcher
): Promise<void> {
  const due = dueJobs(scheduledTime);
  if (due.sync) {
    await attempt("sync", () =>
      runSync(env, { now: scheduledTime, fetcher, cache })
    );
  }
  if (due.rollup) {
    await attempt("rollup", () => runRollup(env.DB, scheduledTime));
  }
  if (due.summary) {
    await attempt("summary", () =>
      runNightlySummary(env, scheduledTime, fetcher)
    );
  }
  if (due.weeklyExport) {
    await attempt("weekly-export", () => runWeeklyExport(env, scheduledTime));
  }
}
