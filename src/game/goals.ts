import { DRINKS, type DrinkId } from './data';

export type Stats = {
  served: number;
  humans: number;
  cats: number;
  perfect: number;
  drinks: Record<DrinkId, number>;
  coinsEarned: number;
  collected: number;
  gifts: number;
  kind: number;
  teased: number;
  pets: number;
  chats: number;
  spills: number;
  art: number;
  songs: number;
  claw: number;
  days: number;
};
export type StatKey = Exclude<keyof Stats, 'drinks'>;

export const emptyStats = (): Stats => ({
  served: 0, humans: 0, cats: 0, perfect: 0, drinks: { latte: 0, matcha: 0, mocha: 0, strawberry: 0, boba: 0 },
  coinsEarned: 0, collected: 0, gifts: 0, kind: 0, teased: 0, pets: 0, chats: 0, spills: 0, art: 0, songs: 0, claw: 0, days: 0,
});

export type RewardAnim = 'dance' | 'fall' | 'spin' | 'flex' | 'sing' | 'cartwheel';
export const REWARD_ANIMS: RewardAnim[] = ['dance', 'fall', 'spin', 'flex', 'sing', 'cartwheel'];
export const ANIM_LABEL: Record<RewardAnim, string> = {
  dance: 'silly dance',
  fall: 'dramatic fall',
  spin: 'ballerina spin',
  flex: 'manly flex',
  sing: 'off-key serenade',
  cartwheel: 'surprise cartwheel',
};
export const ANIM_LINES: Record<RewardAnim, string[]> = {
  dance: ['My lady, we did it! Watch this move, ji!', 'Victory dance! Araam se, my hips are new at this.'],
  fall: ['Victory fall! Araam se— WHOA!', "I'm so happy my legs gave up, ba!"],
  spin: ['Ballerina mode, ji! Spin for my lady!', 'Look! Spinning! Not dizzy! ...very dizzy.'],
  flex: ['Manly flex for my lady! These arms carry lattes AND dreams.', 'Ji, look at these muscles. Not happening that they lose.'],
  sing: ['🎵 Myyy laaady~ you make the coffee sweeeet~', '🎵 I adore youuu, more than boba teaaa~'],
  cartwheel: ['Surprise cartwheel! Araam se, the tables!', "Ba! I didn't know I could do that either!"],
};

export type GoalType = StatKey | 'drink';
export type Goal = { id: string; type: GoalType; drink?: DrinkId; target: number; base: number; coins: number; hearts: number; item?: string; anim: RewardAnim };

const TEMPLATES: { type: GoalType; weight: number; target: (lvl: number) => number }[] = [
  { type: 'served', weight: 3, target: (l) => 4 + Math.min(12, l) },
  { type: 'drink', weight: 3, target: (l) => 2 + Math.floor(l / 3) },
  { type: 'perfect', weight: 2, target: (l) => 2 + Math.floor(l / 2) },
  { type: 'coinsEarned', weight: 2, target: (l) => 60 + l * 25 },
  { type: 'collected', weight: 2, target: (l) => 2 + Math.floor(l / 2) },
  { type: 'art', weight: 2, target: (l) => 1 + Math.floor(l / 3) },
  { type: 'pets', weight: 2, target: (l) => 2 + Math.floor(l / 3) },
  { type: 'chats', weight: 2, target: (l) => 2 + Math.floor(l / 3) },
  { type: 'humans', weight: 1, target: (l) => 2 + Math.floor(l / 3) },
  { type: 'cats', weight: 1, target: (l) => 2 + Math.floor(l / 3) },
  { type: 'spills', weight: 1, target: (l) => 1 + Math.floor(l / 4) },
  { type: 'gifts', weight: 1, target: (l) => 1 + Math.floor(l / 5) },
  { type: 'kind', weight: 1, target: (l) => 2 + Math.floor(l / 4) },
  { type: 'teased', weight: 1, target: (l) => 2 + Math.floor(l / 4) },
  { type: 'songs', weight: 1, target: (l) => 1 + Math.floor(l / 5) },
  { type: 'claw', weight: 1, target: () => 1 },
  { type: 'days', weight: 1, target: () => 1 },
];

const rnd = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export function statValue(stats: Stats, type: GoalType, drink?: DrinkId) {
  if (type === 'drink') return stats.drinks?.[drink || 'latte'] || 0;
  return stats[type] || 0;
}

export function goalProgress(g: Goal, stats: Stats) {
  return Math.max(0, statValue(stats, g.type, g.drink) - g.base);
}

/** Generates a fresh goal that does not duplicate the active ones. Targets scale with level. */
export function makeGoal(level: number, stats: Stats, existing: Goal[], locked: string[]): Goal {
  const used = new Set(existing.map((g) => g.type + (g.drink || '')));
  const pool = TEMPLATES.filter((t) => t.type === 'drink' || !used.has(t.type));
  const total = pool.reduce((a, t) => a + t.weight, 0);
  let roll = Math.random() * total;
  let tpl = pool[0];
  for (const t of pool) {
    roll -= t.weight;
    if (roll <= 0) {
      tpl = t;
      break;
    }
  }
  let drink: DrinkId | undefined;
  if (tpl.type === 'drink') {
    const free = DRINKS.map((d) => d.id).filter((id) => !used.has('drink' + id));
    drink = rnd(free.length ? free : DRINKS.map((d) => d.id));
  }
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    type: tpl.type,
    drink,
    target: tpl.target(level),
    base: statValue(stats, tpl.type, drink),
    coins: 20 + level * 6 + Math.round(Math.random() * 12),
    hearts: 2 + Math.floor(level / 3),
    item: locked.length && Math.random() < 0.35 ? rnd(locked) : undefined,
    anim: rnd(REWARD_ANIMS),
  };
}

export function goalText(g: Goal, drinkName: (id: DrinkId) => string): { title: string; detail: string } {
  const n = g.target;
  const s = n === 1 ? '' : 's';
  switch (g.type) {
    case 'served': return { title: 'Rush Hour', detail: `Serve ${n} visitors` };
    case 'drink': return { title: `${drinkName(g.drink || 'latte')} Fever`, detail: `Serve ${n} ${drinkName(g.drink || 'latte')}` };
    case 'perfect': return { title: 'Speedy Service', detail: `Serve ${n} visitors while they're still happy` };
    case 'coinsEarned': return { title: 'Tip Jar', detail: `Earn ${n} fish from orders` };
    case 'collected': return { title: 'Treasure Hunt', detail: `Find ${n} collectable${s}` };
    case 'art': return { title: 'Barista Artist', detail: `Pour ${n} perfect latte art cup${s}` };
    case 'pets': return { title: 'Head Pats', detail: `Pet ${n} cat visitor${s}` };
    case 'chats': return { title: 'Small Talk', detail: `Chat with ${n} human visitor${s}` };
    case 'humans': return { title: 'Regulars', detail: `Serve ${n} human visitor${s}` };
    case 'cats': return { title: 'Cat Café Classic', detail: `Serve ${n} cat visitor${s}` };
    case 'spills': return { title: 'Mop Duty', detail: n === 1 ? "Mop up one of Rohio's spills" : `Mop up ${n} of Rohio's spills` };
    case 'gifts': return { title: 'Sweet Gesture', detail: `Give Rohio ${n} gift${s}` };
    case 'kind': return { title: 'Be Nice To Him', detail: `Comfort, assure or hug Rohio ${n} time${s}` };
    case 'teased': return { title: 'Lovingly Bully Him', detail: `Taunt, tease or bonk Rohio ${n} time${s}` };
    case 'songs': return { title: 'DJ Goldfish', detail: `Play ${n} song${s} on the radio` };
    case 'claw': return { title: 'Lucky Paw', detail: `Win the claw machine ${n} time${s}` };
    case 'days': return { title: 'Night Shift', detail: "Finish today's shift" };
  }
}
