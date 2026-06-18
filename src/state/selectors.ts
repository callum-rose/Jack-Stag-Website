import { trailDistanceM } from '../lib/geo';
import { challenges, travelChallenges } from '../config/data';
import type { GameState, Visit } from '../types';

/** Set of pub ids the team has fully searched (completed a challenge at). */
export function visitedPubIds(state: GameState): Set<string> {
  const ids = new Set<string>();
  for (const v of state.visits) {
    if (v.completedAt !== null) ids.add(v.pubId);
  }
  return ids;
}

/** Completed visits in arrival order — the team's route. */
export function completedVisits(state: GameState): Visit[] {
  return state.visits.filter((v) => v.completedAt !== null);
}

/** Number of distinct pubs searched. */
export function pubsVisitedCount(state: GameState): number {
  return visitedPubIds(state).size;
}

/** Whether an index points at a real (non-exhausted) entry in a list of `len`. */
function inRange(index: number | null | undefined, len: number): index is number {
  return index !== null && index !== undefined && index >= 0 && index < len;
}

/** Whether a challenge index points at a real (non-exhausted) pub challenge. */
function isRealChallenge(index: number | null | undefined): index is number {
  return inRange(index, challenges.length);
}

/**
 * Challenge completion progress across both lists: pub challenges and travel
 * challenges share one unified "done of total" count.
 */
export function challengeProgress(state: GameState): {
  done: number;
  total: number;
  remaining: number;
} {
  const total = challenges.length + travelChallenges.length;

  let pubDone = 0;
  for (const v of completedVisits(state)) {
    if (isRealChallenge(v.challengeIndex)) pubDone += 1;
  }
  // Clamp each list independently in case data shrinks under an older save.
  pubDone = Math.min(pubDone, challenges.length);

  let travelDone = 0;
  for (const t of state.travelVisits) {
    if (t.completedAt !== null && inRange(t.challengeIndex, travelChallenges.length)) {
      travelDone += 1;
    }
  }
  travelDone = Math.min(travelDone, travelChallenges.length);

  const done = pubDone + travelDone;
  return { done, total, remaining: Math.max(0, total - done) };
}

/** A single stop on the unified progress timeline. */
export interface ProgressStop {
  /** Which list this stop's challenge index refers to / how to label it. */
  kind: 'pub' | 'travel';
  /** Null for travel stops, which have no pub. */
  pubId: string | null;
  /** Null when this stop handed out no challenge (list exhausted). */
  challengeIndex: number | null;
  arrivedAt: number | null;
  completedAt: number | null;
}

/**
 * The team's route as an ordered timeline, interleaving travel and pub stops by
 * time: travel → pub → travel → pub → … . Out-of-range challenge indices
 * become null so callers can render the stop without a challenge.
 */
export function progressTimeline(state: GameState): ProgressStop[] {
  const stops: ProgressStop[] = [];
  for (const v of completedVisits(state)) {
    stops.push({
      kind: 'pub',
      pubId: v.pubId,
      challengeIndex: isRealChallenge(v.challengeIndex) ? v.challengeIndex : null,
      arrivedAt: v.arrivedAt,
      completedAt: v.completedAt,
    });
  }
  for (const t of state.travelVisits) {
    if (t.completedAt === null) continue;
    stops.push({
      kind: 'travel',
      pubId: null,
      challengeIndex: inRange(t.challengeIndex, travelChallenges.length)
        ? t.challengeIndex
        : null,
      arrivedAt: t.departedAt,
      completedAt: t.completedAt,
    });
  }
  // Order by departure/arrival time; on a tie (a travel challenge confirmed at
  // the moment of arrival) the travel stop sorts before the pub it preceded.
  const startOf = (s: ProgressStop) => s.arrivedAt ?? s.completedAt ?? 0;
  const rankOf = (k: ProgressStop['kind']) => (k === 'travel' ? 0 : 1);
  stops.sort(
    (a, b) => startOf(a) - startOf(b) || rankOf(a.kind) - rankOf(b.kind),
  );
  return stops;
}

/** Dwell time at a single visit, in ms (0 if still open). */
export function dwellMs(visit: Visit): number {
  if (visit.completedAt === null) return 0;
  return visit.completedAt - visit.arrivedAt;
}

/** Total elapsed game time in ms (live until finished). */
export function totalTimeMs(state: GameState, now: number): number {
  if (state.startedAt === null) return 0;
  const end = state.finishedAt ?? now;
  return end - state.startedAt;
}

/** Approximate distance walked, summed from breadcrumbs (metres). */
export function approxDistanceM(state: GameState): number {
  return trailDistanceM(state.breadcrumbs);
}
