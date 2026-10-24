import type { CollectId, DayEventId, DecorId, DrinkId, Look, PetId, RohioLook } from './data';
import { emptyStats, makeGoal, type Goal, type Stats } from './goals';
import { DEFAULT_LOOK, DEFAULT_RLOOK, lockedItemKeys } from './outfits';

export type MoveMode = 'tap' | 'glide' | 'hand';
export type Outfit = { look: Look; rlook: RohioLook } | null;

export type Save = {
  coins: number;
  hearts: number;
  affection: number;
  served: number;
  inv: Record<CollectId, number>;
  found: Record<CollectId, string[]>;
  letters: number[];
  pets: PetId[];
  activePets: PetId[];
  decor: DecorId[];
  look: Look;
  rlook: RohioLook;
  menu: Record<DrinkId, { name: string; price: number; shown: boolean }>;
  stats: Stats;
  goals: Goal[];
  goalLevel: number;
  goalsDone: number;
  owned: string[];
  outfits: Outfit[];
  day: number;
  dayEvent: DayEventId;
  memories: string[];
  settings: { mode: MoveMode; sens: number; sound: boolean };
};

const emptyInv = (): Record<CollectId, number> => ({ frog: 0, letter: 0, sketch: 0, painting: 0, crochet: 0, kdrama: 0, cdrama: 0, album: 0 });
const emptyFound = (): Record<CollectId, string[]> => ({ frog: [], letter: [], sketch: [], painting: [], crochet: [], kdrama: [], cdrama: [], album: [] });
const defaultMenu = (): Save['menu'] => ({
  latte: { name: 'Latte', price: 12, shown: true },
  matcha: { name: 'Matcha', price: 15, shown: true },
  mocha: { name: 'Mocha', price: 14, shown: true },
  strawberry: { name: 'Berry Milk', price: 13, shown: true },
  boba: { name: 'Boba Tea', price: 18, shown: true },
});

export function freshGoals(stats: Stats, level: number, owned: string[]) {
  const goals: Goal[] = [];
  for (let i = 0; i < 3; i++) goals.push(makeGoal(level, stats, goals, lockedItemKeys(owned)));
  return goals;
}

export const defaultSave = (): Save => ({
  coins: 60,
  hearts: 10,
  affection: 40,
  served: 0,
  inv: emptyInv(),
  found: emptyFound(),
  letters: [],
  pets: [],
  activePets: [],
  decor: [],
  look: { ...DEFAULT_LOOK },
  rlook: { ...DEFAULT_RLOOK },
  menu: defaultMenu(),
  stats: emptyStats(),
  goals: freshGoals(emptyStats(), 0, []),
  goalLevel: 0,
  goalsDone: 0,
  owned: [],
  outfits: [null, null, null],
  day: 1,
  dayEvent: 'normal',
  memories: [],
  settings: { mode: 'tap', sens: 1, sound: true },
});

const KEY = 'goldfish-cafe-save-v1';

export function loadSave(): Save {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSave();
    const d = defaultSave();
    const p = JSON.parse(raw);
    const look: Look = { ...d.look, ...p.look };
    // Older saves stored glasses as a boolean.
    if (p.look && !p.look.eyewear && typeof p.look.glasses === 'boolean') look.eyewear = p.look.glasses ? 'round' : 'none';
    const stats: Stats = { ...d.stats, ...p.stats, drinks: { ...d.stats.drinks, ...(p.stats?.drinks || {}) } };
    if (!p.stats && p.served) stats.served = p.served;
    const owned: string[] = Array.isArray(p.owned) ? p.owned : [];
    return {
      ...d,
      ...p,
      inv: { ...d.inv, ...p.inv },
      found: { ...d.found, ...p.found },
      look,
      rlook: { ...d.rlook, ...p.rlook },
      menu: { ...d.menu, ...p.menu },
      stats,
      owned,
      goals: Array.isArray(p.goals) && p.goals.length ? p.goals : freshGoals(stats, p.goalLevel || 0, owned),
      outfits: Array.isArray(p.outfits) ? [0, 1, 2].map((i) => p.outfits[i] || null) : [null, null, null],
      memories: Array.isArray(p.memories) ? p.memories : [],
      settings: { ...d.settings, ...p.settings },
    };
  } catch {
    return defaultSave();
  }
}

export function storeSave(s: Save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}
