/**
 * bus.js - the app's single event bus.
 *
 * Engines (mastery, SRS, quests, achievements) never touch the UI directly;
 * they publish facts here and the UI decides what to show. That keeps the
 * learning algorithms testable in plain Node with no DOM.
 */

const listeners = new Map();

/** Subscribe. Returns an unsubscribe function. */
export function on(type, fn) {
  if (!listeners.has(type)) listeners.set(type, new Set());
  listeners.get(type).add(fn);
  return () => off(type, fn);
}

export function once(type, fn) {
  const un = on(type, (payload) => { un(); fn(payload); });
  return un;
}

export function off(type, fn) {
  listeners.get(type)?.delete(fn);
}

export function emit(type, payload) {
  const set = listeners.get(type);
  if (set) {
    for (const fn of [...set]) {
      try { fn(payload, type); } catch (err) { console.error(`[bus] "${type}" handler failed`, err); }
    }
  }
  const star = listeners.get('*');
  if (star) {
    for (const fn of [...star]) {
      try { fn(payload, type); } catch (err) { console.error('[bus] wildcard handler failed', err); }
    }
  }
}

/** Event names, centralised so typos surface as import errors. */
export const EV = {
  STATE: 'state:changed',
  XP: 'xp:gained',
  LEVEL_UP: 'level:up',
  COINS: 'coins:changed',
  STREAK: 'streak:changed',
  ANSWER: 'answer:graded',
  MASTERY: 'mastery:changed',
  TOPIC_DONE: 'topic:completed',
  CHAPTER_DONE: 'chapter:completed',
  GAME_SCORE: 'game:scored',
  ACHIEVEMENT: 'achievement:unlocked',
  QUEST: 'quest:progress',
  QUEST_DONE: 'quest:completed',
  BOSS_WIN: 'boss:defeated',
  ROUTE: 'route:changed',
  TOAST: 'ui:toast',
  SESSION_END: 'session:ended'
};
