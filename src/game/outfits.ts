import type { Look, RohioLook } from './data';

export type Opt = { id: string; label: string; cost: number };
export type Who = 'g' | 'r';
export type GCat = 'hair' | 'hat' | 'topStyle' | 'bottom' | 'shoes' | 'eyewear' | 'accessory' | 'cheeks';
export type RCat = 'hair' | 'hat' | 'topStyle' | 'pants' | 'extra';

const o = (id: string, label: string, cost = 0): Opt => ({ id, label, cost });

export const G_OPTS: Record<GCat, Opt[]> = {
  hair: [o('braids', 'Braids'), o('bob', 'Bob'), o('pixie', 'Pixie', 40), o('ponytail', 'Ponytail', 50), o('buns', 'Space Buns', 60), o('long', 'Long Waves', 70)],
  hat: [
    o('none', 'None'), o('duck', 'Duckling'), o('bow', 'Bow'), o('beret', 'Beret'), o('santa', 'Santa Hat', 40), o('catears', 'Cat Ears', 50),
    o('froghat', 'Frog Hat', 60), o('strawberry', 'Strawberry', 80), o('flowers', 'Flower Crown', 90), o('headphones', 'Headphones', 110),
    o('bunny', 'Bunny Ears', 120), o('chef', 'Chef Hat', 140), o('crown', 'Tiny Crown', 260),
  ],
  topStyle: [o('raincoat', 'Raincoat'), o('sweater', 'Stripe Knit'), o('cardigan', 'Cardigan', 50), o('hoodie', 'Hoodie', 60), o('sailor', 'Sailor Top', 70), o('apron', 'Barista Apron', 80)],
  bottom: [o('skirt', 'Skirt'), o('shorts', 'Shorts'), o('pants', 'Trousers', 40), o('overalls', 'Overalls', 70), o('dress', 'Long Dress', 90)],
  shoes: [o('boots', 'Rain Boots'), o('sneakers', 'Sneakers', 30), o('maryjanes', 'Mary Janes', 40), o('slippers', 'Fluffy Slippers', 50)],
  eyewear: [o('none', 'None'), o('round', 'Round Glasses'), o('sunnies', 'Sunnies', 50), o('hearts', 'Heart Shades', 70), o('star', 'Star Shades', 90)],
  accessory: [o('none', 'None'), o('flower', 'Ear Flower', 30), o('scarf', 'Scarf', 40), o('necklace', 'Necklace', 60), o('frogbag', 'Frog Bag', 80)],
  cheeks: [o('blush', 'Blush'), o('freckles', 'Freckles'), o('none', 'Bare'), o('hearts', 'Heart Cheeks', 20)],
};

export const R_OPTS: Record<RCat, Opt[]> = {
  hair: [o('fluffy', 'Fluffy'), o('messy', 'Bedhead'), o('buzz', 'Buzz Cut', 40), o('curtain', 'Curtains', 50), o('wolf', 'Wolf Cut', 70)],
  hat: [
    o('none', 'None'), o('cap', 'Cap'), o('catears', 'Cat Ears'), o('santa', 'Santa Hat', 40), o('headband', 'Sweatband', 40), o('beanie', 'Beanie', 50),
    o('flowers', 'Flower Crown', 60), o('bucket', 'Bucket Hat', 70), o('chef', 'Chef Hat', 90),
  ],
  topStyle: [o('hoodie', 'Hoodie'), o('sweater', 'Knit Sweater'), o('shirt', 'Shirt & Tie', 60), o('tank', 'Gym Tank', 70), o('varsity', 'Varsity', 90)],
  pants: [o('shorts', 'Shorts'), o('jeans', 'Jeans', 40), o('trousers', 'Trousers', 50)],
  extra: [o('none', 'None'), o('bandaid', 'Band-aid'), o('glasses', 'Glasses', 50), o('scarf', 'Scarf', 50), o('sunnies', 'Sunnies', 60), o('earring', 'Earring', 70)],
};

export const G_COLORS = {
  hairColor: ['#3d2a22', '#1f1a1a', '#6b3f2a', '#c96f36', '#e8c27a', '#f3a6b8', '#9c8ad6', '#5a7fb8'],
  top: ['#ffd84d', '#f4917a', '#f6b8c8', '#a7d3f2', '#b9dc9a', '#fffaf2', '#c9a7e8', '#7a5a46', '#5e6b55', '#e5574f'],
  skirt: ['#8fbfe6', '#f4917a', '#7a5a46', '#f6d7a7', '#9cc47f', '#5a6fa8', '#f6b8c8', '#3e3533', '#fffaf2'],
  shoeColor: ['#e8925a', '#e5574f', '#fffaf2', '#5b3a29', '#f6b8c8', '#ffd84d', '#a7d3f2', '#9cc47f'],
};

export const R_COLORS = {
  hairColor: ['#c96f36', '#6b3f2a', '#1f1a1a', '#e8c27a', '#3d2a22', '#7a8fb8', '#e58aa0', '#fffaf2'],
  hoodie: ['#fffaf2', '#a7d3f2', '#b9dc9a', '#f6d7a7', '#7a7f8c', '#f4917a', '#3e3533', '#c9a7e8', '#5a6fa8'],
  apron: ['#8c6a4f', '#5e6b55', '#f4917a', '#5a6fa8', '#3e3533', 'none'],
  pantsColor: ['#e7a87c', '#5a6fa8', '#3e3533', '#7a5a46', '#b9dc9a', '#f6d7a7'],
};

export const DEFAULT_LOOK: Look = {
  hair: 'braids', hairColor: '#3d2a22', hat: 'duck', topStyle: 'raincoat', top: '#ffd84d', bottom: 'skirt', skirt: '#8fbfe6',
  shoes: 'boots', shoeColor: '#e8925a', eyewear: 'round', accessory: 'none', cheeks: 'blush',
};
export const DEFAULT_RLOOK: RohioLook = {
  hair: 'fluffy', hairColor: '#c96f36', hat: 'none', topStyle: 'hoodie', hoodie: '#fffaf2', apron: '#8c6a4f', pants: 'shorts', pantsColor: '#e7a87c', extra: 'bandaid',
};

export const itemKey = (who: Who, cat: string, id: string) => `${who}.${cat}.${id}`;

export function optFor(who: Who, cat: string, id: string): Opt | undefined {
  const list = who === 'g' ? G_OPTS[cat as GCat] : R_OPTS[cat as RCat];
  return list?.find((x) => x.id === id);
}

export function owns(owned: string[], who: Who, cat: string, id: string) {
  const opt = optFor(who, cat, id);
  return !opt || opt.cost === 0 || owned.includes(itemKey(who, cat, id));
}

export function lockedItemKeys(owned: string[]) {
  const out: string[] = [];
  (Object.keys(G_OPTS) as GCat[]).forEach((cat) => G_OPTS[cat].forEach((x) => x.cost > 0 && !owned.includes(itemKey('g', cat, x.id)) && out.push(itemKey('g', cat, x.id))));
  (Object.keys(R_OPTS) as RCat[]).forEach((cat) => R_OPTS[cat].forEach((x) => x.cost > 0 && !owned.includes(itemKey('r', cat, x.id)) && out.push(itemKey('r', cat, x.id))));
  return out;
}

export function itemLabel(key: string) {
  const [who, cat, id] = key.split('.');
  const opt = optFor(who as Who, cat, id);
  return `${who === 'g' ? 'Goldfish' : 'Rohio'} · ${opt?.label ?? id}`;
}

export const PRESETS: { name: string; look: Partial<Look>; rlook: Partial<RohioLook> }[] = [
  {
    name: 'Rainy Duckling',
    look: { hat: 'duck', topStyle: 'raincoat', top: '#ffd84d', bottom: 'skirt', skirt: '#8fbfe6', shoes: 'boots', shoeColor: '#e8925a', eyewear: 'round', hair: 'braids' },
    rlook: { hat: 'none', topStyle: 'hoodie', hoodie: '#fffaf2', apron: '#8c6a4f', extra: 'bandaid' },
  },
  {
    name: 'Cozy Knit Day',
    look: { hat: 'beret', topStyle: 'sweater', top: '#f4917a', bottom: 'skirt', skirt: '#7a5a46', shoes: 'boots', shoeColor: '#5b3a29', hair: 'bob' },
    rlook: { topStyle: 'sweater', hoodie: '#f6d7a7', hat: 'none', pantsColor: '#7a5a46' },
  },
  {
    name: 'Matcha Twins',
    look: { hat: 'bow', topStyle: 'sweater', top: '#b9dc9a', bottom: 'skirt', skirt: '#fffaf2', shoeColor: '#fffaf2' },
    rlook: { topStyle: 'hoodie', hoodie: '#b9dc9a', hat: 'cap', apron: '#5e6b55' },
  },
  {
    name: 'Strawberry Date',
    look: { hat: 'strawberry', topStyle: 'cardigan', top: '#f6b8c8', bottom: 'dress', skirt: '#fffaf2', shoes: 'maryjanes', shoeColor: '#e5574f', cheeks: 'hearts' },
    rlook: { topStyle: 'shirt', hoodie: '#fffaf2', hat: 'none', pants: 'trousers', pantsColor: '#3e3533', apron: 'none', extra: 'none' },
  },
  {
    name: 'K-pop Stage',
    look: { hat: 'headphones', topStyle: 'hoodie', top: '#c9a7e8', bottom: 'pants', skirt: '#3e3533', shoes: 'sneakers', shoeColor: '#fffaf2', eyewear: 'star' },
    rlook: { topStyle: 'varsity', hoodie: '#5a6fa8', hat: 'bucket', pants: 'jeans', pantsColor: '#3e3533', apron: 'none', extra: 'earring' },
  },
  {
    name: 'Frog Squad',
    look: { hat: 'froghat', topStyle: 'raincoat', top: '#9cc47f', accessory: 'frogbag', shoeColor: '#9cc47f' },
    rlook: { hat: 'catears', hoodie: '#b9dc9a', topStyle: 'hoodie' },
  },
];

const rnd = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

/** Builds a random outfit from items the player owns, plus free colours. */
export function randomOutfit(owned: string[]): { look: Look; rlook: RohioLook } {
  const g = (cat: GCat) => rnd(G_OPTS[cat].filter((x) => owns(owned, 'g', cat, x.id))).id;
  const r = (cat: RCat) => rnd(R_OPTS[cat].filter((x) => owns(owned, 'r', cat, x.id))).id;
  return {
    look: {
      hair: g('hair') as Look['hair'], hairColor: rnd(G_COLORS.hairColor), hat: g('hat') as Look['hat'], topStyle: g('topStyle') as Look['topStyle'], top: rnd(G_COLORS.top),
      bottom: g('bottom') as Look['bottom'], skirt: rnd(G_COLORS.skirt), shoes: g('shoes') as Look['shoes'], shoeColor: rnd(G_COLORS.shoeColor),
      eyewear: g('eyewear') as Look['eyewear'], accessory: g('accessory') as Look['accessory'], cheeks: g('cheeks') as Look['cheeks'],
    },
    rlook: {
      hair: r('hair') as RohioLook['hair'], hairColor: rnd(R_COLORS.hairColor), hat: r('hat') as RohioLook['hat'], topStyle: r('topStyle') as RohioLook['topStyle'],
      hoodie: rnd(R_COLORS.hoodie), apron: rnd(R_COLORS.apron), pants: r('pants') as RohioLook['pants'], pantsColor: rnd(R_COLORS.pantsColor), extra: r('extra') as RohioLook['extra'],
    },
  };
}
