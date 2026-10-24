import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type PointerEvent as RPointerEvent } from 'react';
import {
  ACTIONS, CAT_KINDS, CAT_NAMES, CAT_PET_LINES, COLLECTABLES, DAY_EVENTS, DECOR, DIALOGUE, DRINKS, GIFT_LINES, HUMAN_CUSTOMERS, HUMAN_LINES,
  ROHIO_AMBIENT, ROHIO_CLUMSY, ROHIO_LETTERS, pick, pickWeighted,
  type Action, type CatKind, type CollectId, type DayEventId, type DecorId, type DrinkId, type GExpr, type RExpr,
} from './game/data';
import { loadSave, storeSave, defaultSave, type Save } from './game/save';
import { Cat, DrinkIcon, HumanCustomer, ItemIcon, PetSprite } from './game/sprites';
import { Goldfish, Rohio, type CupQuality, type RPose } from './game/characters';
import {
  Bookshelf, CakeDisplay, CatTower, Counter, Door, GhostCharm, Lights, Machine, MenuBoard, Plant, Puddle, Radio, Rug, Shelf, Stool, Table, WindowArt, type SkyPhase,
} from './game/furniture';
import { ClawPanel, JournalPanel, LetterModal, MenuPanel, Modal, SettingsPanel, ShopPanel } from './game/Panels';
import { WardrobePanel } from './game/Wardrobe';
import { DaySummary, GoalsPanel, JukeboxPanel, MemoryScene, PourGame, type DayReport, type PourResult } from './game/Activities';
import { MEMORIES, diaryLine, endOfDayScene, type DayTally, type Scene } from './game/story';
import { ANIM_LINES, goalProgress, goalText, makeGoal, type RewardAnim, type StatKey } from './game/goals';
import { itemLabel, lockedItemKeys } from './game/outfits';
import { playSong, sfx, stopSong, type Sfx } from './game/audio';
import HandTracker from './game/HandTracker';
import { ActionIcon, PixelIcon, type IconName } from './game/icons';

const W = 760;
const H = 540;
const B = { x0: 26, x1: 734, y0: 245, y1: 528 };
const COUNTER_PICK = { x: 235, y: 255 };
const MACHINE_SPOT = { x: 90, y: 255 };
const BREW_SPOT = { x: 305, y: 255 };
const DOOR = { x: 690, y: 250 };
const SLOT_X = [185, 225, 265];
const DAY_LEN = 240;
const MAX_VISITORS = 5;

type Bubble = { text: string; t: number } | null;
type Ent = { x: number; y: number; tx: number; ty: number; face: number; moving: boolean; path?: { x: number; y: number }[]; pathGoal?: { x: number; y: number } };
type Cup = { drink: DrinkId; q: CupQuality };
type RState = 'idle' | 'wander' | 'toBrew' | 'brewing' | 'deliver' | 'tripped' | 'talk' | 'celebrate';
type Cust = Ent & {
  id: number; species: 'cat' | 'human'; kind?: CatKind; human?: (typeof HUMAN_CUSTOMERS)[number]; name: string; seat: number;
  state: 'enter' | 'sit' | 'leave'; order: DrinkId; patience: number; max: number; happyT: number; sad: boolean; claimed: boolean; greeted: boolean; bubble: Bubble;
};
type Spill = { id: number; x: number; y: number; color: string; clean: number };

type World = {
  time: number;
  gf: Ent & { carrying: Cup | null; expr: GExpr; exprT: number; bubble: Bubble; mopping: boolean };
  ro: Ent & {
    state: RState; timer: number; carrying: DrinkId | null; target: number | null; brewDrink: DrinkId | null; brewTotal: number;
    expr: RExpr; exprT: number; bubble: Bubble; shakeT: number; help: number; ambientT: number; anim: RewardAnim | null; pose: RPose;
  };
  custs: Cust[];
  counter: (Cup | null)[];
  items: { id: number; type: CollectId; x: number; y: number }[];
  spills: Spill[];
  pets: Record<string, Ent>;
  floaters: { id: number; text: string; x: number; y: number; t: number }[];
  nextCust: number;
  nextItem: number;
  pendingTalk: boolean;
  pendingGreet: number | null;
  pout: number;
  hand: { x: number; y: number } | null;
  nid: number;
  day: { t: number; lastOrders: boolean; closing: boolean; ended: boolean; tally: DayTally };
  music: { title: string; until: number } | null;
  talkT: number;
};

const EVENT_ICON: Record<DayEventId, IconName> = { normal: 'sun', rainy: 'rain', catfest: 'paw', kpop: 'music', rush: 'fish', clumsy: 'mop' };
const EVENT_POOL: DayEventId[] = ['normal', 'normal', 'rainy', 'catfest', 'kpop', 'rush', 'clumsy'];

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const emptyTally = (): DayTally => ({ served: 0, missed: 0, coins: 0, perfect: 0, spills: 0, gifts: 0, kind: 0, teased: 0, art: 0 });

function tablesFor(decor: DecorId[]) {
  const t = [
    { x: 155, y: 355 },
    { x: 565, y: 355 },
    { x: 260, y: 475 },
    { x: 510, y: 475 },
  ];
  if (decor.includes('table4')) t.push({ x: 105, y: 470 });
  if (decor.includes('table5')) t.push({ x: 655, y: 470 });
  return t;
}
function seatsFor(decor: DecorId[]) {
  return tablesFor(decor).flatMap((t) => [
    { x: t.x - 66, y: t.y - 9, side: -1 },
    { x: t.x + 66, y: t.y - 9, side: 1 },
  ]);
}

const NAV = 18;
function tableBlocked(x: number, y: number, decor: DecorId[]) {
  return tablesFor(decor).some((t) => x > t.x - 52 && x < t.x + 52 && y > t.y - 70 && y < t.y + 14);
}
function openFloorSpot(decor: DecorId[]) {
  for (let i = 0; i < 18; i++) {
    const point = { x: rand(B.x0 + 24, B.x1 - 24), y: rand(B.y0 + 20, B.y1 - 16) };
    if (!tableBlocked(point.x, point.y, decor)) return point;
  }
  return { x: 380, y: 430 };
}
function createPath(from: { x: number; y: number }, to: { x: number; y: number }, decor: DecorId[]) {
  const cols = Math.floor((B.x1 - B.x0) / NAV) + 1;
  const rows = Math.floor((B.y1 - B.y0) / NAV) + 1;
  const clampCell = (x: number, y: number) => ({ x: clamp(Math.round((x - B.x0) / NAV), 0, cols - 1), y: clamp(Math.round((y - B.y0) / NAV), 0, rows - 1) });
  const start = clampCell(from.x, from.y);
  const end = clampCell(to.x, to.y);
  const key = (p: { x: number; y: number }) => `${p.x},${p.y}`;
  const open = [start];
  const came = new Map<string, { x: number; y: number }>();
  const seen = new Set([key(start)]);
  const passable = (p: { x: number; y: number }) => key(p) === key(end) || !tableBlocked(B.x0 + p.x * NAV, B.y0 + p.y * NAV, decor);
  while (open.length) {
    const cur = open.shift()!;
    if (key(cur) === key(end)) break;
    for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n = { x: cur.x + d[0], y: cur.y + d[1] };
      const nk = key(n);
      if (n.x < 0 || n.y < 0 || n.x >= cols || n.y >= rows || seen.has(nk) || !passable(n)) continue;
      seen.add(nk);
      came.set(nk, cur);
      open.push(n);
    }
  }
  if (!seen.has(key(end))) return [{ x: to.x, y: to.y }];
  const cells = [end];
  let cur = end;
  while (key(cur) !== key(start)) {
    const prev = came.get(key(cur));
    if (!prev) break;
    cells.push(prev);
    cur = prev;
  }
  cells.reverse();
  return cells.slice(1).map((p) => ({ x: B.x0 + p.x * NAV, y: B.y0 + p.y * NAV })).concat({ x: to.x, y: to.y });
}
function moveEnt(e: Ent, speed: number, dt: number, decor: DecorId[]) {
  if (!e.pathGoal || dist(e.pathGoal, { x: e.tx, y: e.ty }) > NAV * 1.2 || !e.path) {
    e.path = createPath(e, { x: e.tx, y: e.ty }, decor);
    e.pathGoal = { x: e.tx, y: e.ty };
  }
  const next = e.path[0] || { x: e.tx, y: e.ty };
  const dx = next.x - e.x;
  const dy = next.y - e.y;
  const d = Math.hypot(dx, dy);
  if (d < 2) {
    if (e.path.length) e.path.shift();
    e.moving = !!e.path.length;
    return !e.path.length;
  }
  const st = Math.min(d, speed * dt);
  e.x += (dx / d) * st;
  e.y += (dy / d) * st;
  if (Math.abs(dx) > 1) e.face = dx > 0 ? 1 : -1;
  e.moving = true;
  if (d - st < 2 && e.path.length) e.path.shift();
  return !e.path.length;
}

function newWorld(): World {
  return {
    time: 0,
    gf: { x: 380, y: 300, tx: 380, ty: 300, face: 1, moving: false, carrying: null, expr: 'happy', exprT: 2, bubble: { text: "Let's open HUA CAFE!", t: 3 }, mopping: false },
    ro: {
      x: 260, y: 270, tx: 260, ty: 270, face: -1, moving: false, state: 'idle', timer: 3, carrying: null, target: null, brewDrink: null, brewTotal: 5,
      expr: 'happy', exprT: 3, bubble: { text: 'Good morning, my lady! Ji, I already wiped the tables!', t: 4 }, shakeT: 0, help: 0, ambientT: 22, anim: null, pose: 'normal',
    },
    custs: [],
    counter: [null, null, null],
    items: [],
    spills: [],
    pets: {},
    floaters: [],
    nextCust: 2.5,
    nextItem: 4,
    pendingTalk: false,
    pendingGreet: null,
    pout: 0,
    hand: null,
    nid: 1,
    day: { t: 0, lastOrders: false, closing: false, ended: false, tally: emptyTally() },
    music: null,
    talkT: 0,
  };
}

type UI = null | 'shop' | 'journal' | 'wardrobe' | 'settings' | 'claw' | 'intro' | 'menu' | 'goals' | 'radio' | 'brew';

export default function App() {
  const [save, setSaveState] = useState<Save>(() => loadSave());
  const saveRef = useRef(save);
  saveRef.current = save;
  const setSave = useCallback((f: (s: Save) => Save) => setSaveState((s) => f(s)), []);
  useEffect(() => storeSave(save), [save]);

  const world = useRef<World>(newWorld());
  const [, setFrame] = useState(0);
  const [ui, setUi] = useState<UI>(() => (localStorage.getItem('goldfish-cafe-save-v1') ? null : 'intro'));
  const [letter, setLetter] = useState<number | null>(null);
  const [talkOpen, setTalkOpen] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [pour, setPour] = useState<DrinkId | null>(null);
  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([]);
  const [banner, setBanner] = useState<string | null>(null);
  const [handStatus, setHandStatus] = useState('');
  const [hovered, setHovered] = useState<number | null>(null);
  const [summary, setSummary] = useState<DayReport | null>(null);
  const [scene, setScene] = useState<{ scene: Scene; memoryId?: string; nextDay: boolean } | null>(null);
  const [nowPlaying, setNowPlaying] = useState<string | null>(null);
  const [portraitOk, setPortraitOk] = useState(false);
  const [narrowPortrait, setNarrowPortrait] = useState(() => {
    const mq = typeof window !== 'undefined' ? window.matchMedia?.('(orientation: portrait) and (max-width: 700px)') : undefined;
    return !!mq?.matches;
  });
  const [scale, setScale] = useState(1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const keys = useRef<Record<string, boolean>>({});
  const dragging = useRef(false);
  const bannerTimer = useRef<number | undefined>(undefined);
  const gateUp = !portraitOk && narrowPortrait;
  const paused = ui !== null || letter !== null || !!summary || !!scene || gateUp;

  const toast = useCallback((text: string) => {
    const id = Math.random();
    setToasts((t) => [...t.slice(-2), { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);
  const showBanner = useCallback((text: string) => {
    setBanner(text);
    window.clearTimeout(bannerTimer.current);
    bannerTimer.current = window.setTimeout(() => setBanner(null), 4600);
  }, []);
  const play = (k: Sfx) => {
    if (saveRef.current.settings.sound) sfx(k);
  };
  const bump = useCallback(
    (patch: Partial<Record<StatKey, number>>, drink?: DrinkId) =>
      setSave((s) => {
        const stats = { ...s.stats, drinks: { ...s.stats.drinks } };
        (Object.keys(patch) as StatKey[]).forEach((k) => (stats[k] = (stats[k] || 0) + (patch[k] || 0)));
        if (drink) stats.drinks[drink] = (stats.drinks[drink] || 0) + 1;
        return { ...s, stats };
      }),
    [setSave],
  );
  const floater = (text: string, x: number, y: number) => {
    const w = world.current;
    w.floaters.push({ id: w.nid++, text, x, y, t: 0 });
  };

  /* ---------- Rohio celebrations ---------- */
  const celebrate = (anim: RewardAnim) => {
    const w = world.current;
    const r = w.ro;
    if (r.carrying) {
      const slot = w.counter.indexOf(null);
      if (slot >= 0) w.counter[slot] = { drink: r.carrying, q: 'good' };
      r.carrying = null;
    }
    const c = w.custs.find((x) => x.id === r.target);
    if (c) c.claimed = false;
    r.target = null;
    r.state = 'celebrate';
    r.timer = 3.8;
    r.anim = anim;
    r.pose = anim === 'flex' ? 'flex' : 'normal';
    r.moving = false;
    r.expr = anim === 'fall' ? 'shocked' : anim === 'sing' ? 'love' : 'happy';
    r.exprT = 3.8;
    r.bubble = { text: pick(ANIM_LINES[anim]), t: 3.8 };
  };

  /* ---------- endless goals ---------- */
  useEffect(() => {
    const done = save.goals.find((g) => goalProgress(g, save.stats) >= g.target);
    if (!done) return;
    const level = save.goalLevel + 1;
    setSave((s) => {
      if (!s.goals.some((g) => g.id === done.id)) return s;
      const owned = done.item && !s.owned.includes(done.item) ? [...s.owned, done.item] : s.owned;
      const fresh = makeGoal(level, s.stats, s.goals, lockedItemKeys(owned));
      return {
        ...s, coins: s.coins + done.coins, hearts: s.hearts + done.hearts, owned,
        goals: s.goals.map((g) => (g.id === done.id ? fresh : g)), goalLevel: level, goalsDone: s.goalsDone + 1,
      };
    });
    celebrate(done.anim);
    const { title } = goalText(done, (id) => save.menu[id]?.name || id);
    showBanner(`Goal complete: ${title}! +${done.coins} fish · +${done.hearts} hearts${done.item ? ` · unlocked ${itemLabel(done.item)}` : ''}`);
    play('fanfare');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [save.stats, save.goals]);

  const rerollGoal = (id: string) =>
    setSave((s) => {
      if (s.hearts < 2) return s;
      const fresh = makeGoal(s.goalLevel, s.stats, s.goals, lockedItemKeys(s.owned));
      return { ...s, hearts: s.hearts - 2, goals: s.goals.map((g) => (g.id === id ? fresh : g)) };
    });

  /* ---------- sizing & keyboard ---------- */
  useLayoutEffect(() => {
    const el = wrapRef.current!;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setScale(Math.min(r.width / (W + 8), r.height / (H + 8)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    const mq = window.matchMedia?.('(orientation: portrait) and (max-width: 700px)');
    if (!mq) return;
    const on = () => setNarrowPortrait(mq.matches);
    if (mq.addEventListener) mq.addEventListener('change', on);
    else (mq as unknown as { addListener: (f: () => void) => void }).addListener(on);
    setNarrowPortrait(mq.matches);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', on);
      else (mq as unknown as { removeListener: (f: () => void) => void }).removeListener(on);
    };
  }, []);
  useEffect(() => {
    const d = (e: KeyboardEvent) => (keys.current[e.key.toLowerCase()] = true);
    const u = (e: KeyboardEvent) => (keys.current[e.key.toLowerCase()] = false);
    window.addEventListener('keydown', d);
    window.addEventListener('keyup', u);
    return () => {
      window.removeEventListener('keydown', d);
      window.removeEventListener('keyup', u);
    };
  }, []);
  useEffect(() => {
    if (ui !== 'intro') showBanner(`Day ${save.day} · ${DAY_EVENTS[save.dayEvent].name}: ${DAY_EVENTS[save.dayEvent].desc}`);
    return () => stopSong();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- collecting ---------- */
  const collect = useCallback(
    (type: CollectId) => {
      const sv = saveRef.current;
      bump({ collected: 1 });
      if (type === 'letter') {
        const unread = ROHIO_LETTERS.map((_, i) => i).filter((i) => !sv.letters.includes(i));
        const idx = unread.length ? unread[0] : Math.floor(Math.random() * ROHIO_LETTERS.length);
        setSave((s) => ({ ...s, inv: { ...s.inv, letter: s.inv.letter + 1 }, letters: s.letters.includes(idx) ? s.letters : [...s.letters, idx] }));
        setLetter(idx);
        world.current.ro.bubble = { text: pick(["W-wait, my lady, don't read that in front of me!", "Ba... that one's embarrassing.", 'Araam se, read it slowly, ji.']), t: 3.5 };
        world.current.ro.expr = 'flustered';
        world.current.ro.exprT = 3.5;
        return;
      }
      const info = COLLECTABLES.find((c) => c.id === type)!;
      const unfound = info.entries.filter((e) => !sv.found[type].includes(e));
      const name = pick(unfound.length ? unfound : info.entries);
      setSave((s) => ({
        ...s,
        inv: { ...s.inv, [type]: s.inv[type] + 1 },
        found: { ...s.found, [type]: s.found[type].includes(name) ? s.found[type] : [...s.found[type], name] },
      }));
      toast(`Found ${info.name}: “${name}”`);
    },
    [setSave, toast, bump],
  );

  const addSpill = (x: number, y: number, drink: DrinkId) => {
    const w = world.current;
    if (w.spills.length >= 3) return;
    w.spills.push({ id: w.nid++, x: clamp(x, B.x0 + 24, B.x1 - 24), y: clamp(y, B.y0 + 6, B.y1 - 6), color: DRINKS.find((d) => d.id === drink)?.color || '#c99a6b', clean: 0 });
    play('splash');
  };

  const serve = (c: Cust, by: 'gf' | 'rohio', q: CupQuality) => {
    const w = world.current;
    const sv = saveRef.current;
    const d = DRINKS.find((x) => x.id === c.order)!;
    const ratio = c.patience / c.max;
    const tip = DECOR.filter((x) => sv.decor.includes(x.id)).reduce((a, x) => a + x.tip, 0);
    let mult = (1 + tip) * (0.8 + 0.6 * ratio) * (by === 'rohio' ? 0.85 : 1);
    if (q === 'perfect') mult *= 1.35;
    if (q === 'weak') mult *= 0.85;
    if (sv.dayEvent === 'rush') mult *= 1.2;
    if (w.music && sv.dayEvent === 'kpop') mult *= 1.15;
    const coins = Math.round((sv.menu[c.order]?.price ?? d.price) * mult);
    let hearts = ratio > 0.55 ? 2 : 1;
    if (q === 'perfect') hearts += 1;
    if (sv.dayEvent === 'catfest' && c.species === 'cat') hearts += 1;
    const happy = ratio > 0.6;
    setSave((s) => ({ ...s, coins: s.coins + coins, hearts: s.hearts + hearts, served: s.served + 1 }));
    bump({ served: 1, coinsEarned: coins, perfect: happy ? 1 : 0, humans: c.species === 'human' ? 1 : 0, cats: c.species === 'cat' ? 1 : 0 }, c.order);
    w.day.tally.served++;
    w.day.tally.coins += coins;
    if (happy) w.day.tally.perfect++;
    c.state = 'leave';
    c.happyT = 99;
    c.tx = DOOR.x;
    c.ty = DOOR.y;
    floater(`+${coins} fish`, c.x, c.y - 70);
    floater(`+${hearts} hearts`, c.x + 20, c.y - 50);
    if (q === 'perfect') floater('LATTE ART!', c.x, c.y - 92);
    play('coin');
    if (by === 'gf') {
      w.gf.carrying = null;
      w.gf.expr = 'happy';
      w.gf.exprT = 1.2;
    }
    if (Math.random() < 0.18) {
      w.items.push({ id: w.nid++, type: pickWeighted(), ...openFloorSpot(sv.decor) });
      floater('left a gift!', c.x, c.y - 90);
    }
  };

  const greet = (c: Cust) => {
    const w = world.current;
    c.greeted = true;
    c.happyT = 2.6;
    c.patience = Math.min(c.max, c.patience + c.max * 0.25);
    setSave((s) => ({ ...s, hearts: s.hearts + 1 }));
    if (c.species === 'cat') {
      floater(pick(CAT_PET_LINES), c.x, c.y - 74);
      bump({ pets: 1 });
      w.gf.bubble = { text: pick(["Who's a good kitty?", 'Head pats for you~', 'So fluffy!', 'Your coffee is coming, little bean.']), t: 2.2 };
    } else {
      w.custs.forEach((o) => (o.bubble = null));
      c.bubble = { text: pick(HUMAN_LINES[c.name] || HUMAN_LINES.default), t: 3.8 };
      bump({ chats: 1 });
      if (c.name === 'Noor' && Math.random() < 0.4) {
        w.items.push({ id: w.nid++, type: pickWeighted(), ...openFloorSpot(saveRef.current.decor) });
        floater('Noor left a gift!', c.x, c.y - 96);
      }
    }
    w.gf.expr = 'happy';
    w.gf.exprT = 1.6;
    floater('+1 heart', c.x + 18, c.y - 54);
    play('pop');
  };

  /* ---------- day cycle ---------- */
  const stopMusic = () => {
    world.current.music = null;
    setNowPlaying(null);
    stopSong();
  };
  const playMusic = (title: string) => {
    const w = world.current;
    w.music = { title, until: performance.now() / 1000 + 60 };
    setNowPlaying(title);
    if (saveRef.current.settings.sound) playSong(title, 60);
    bump({ songs: 1 });
    if (w.ro.state !== 'celebrate') w.ro.bubble = { text: pick(['Ji! This is our song, my lady!', 'Araam se, my feet are dancing on their own!', "Not happening that I don't dance to this."]), t: 3 };
    setUi(null);
  };

  const endDay = () => {
    const w = world.current;
    const sv = saveRef.current;
    const T = w.day.tally;
    const rate = T.served / Math.max(1, T.served + T.missed);
    const stars = clamp(Math.round(1 + rate * 3 + (T.perfect >= 3 ? 1 : 0)), 1, 5);
    const bonus = stars * 12;
    setSave((s) => ({ ...s, coins: s.coins + bonus }));
    stopMusic();
    setTalkOpen(false);
    setPour(null);
    setSummary({ day: sv.day, event: DAY_EVENTS[sv.dayEvent].name, served: T.served, missed: T.missed, coins: T.coins, perfect: T.perfect, spills: T.spills, art: T.art, stars, bonus, diary: diaryLine(T, sv.affection) });
  };

  const walkHome = () => {
    const sv = saveRef.current;
    const mem = MEMORIES.find((m) => !sv.memories.includes(m.id) && sv.affection >= m.need && sv.day >= m.day);
    const T = world.current.day.tally;
    const rep = summary;
    // Closing chat reacts to the shift you just had: busy, messy, sweet, teasing, event...
    const tally: DayTally = rep
      ? { served: rep.served, missed: rep.missed, coins: rep.coins, perfect: rep.perfect, spills: rep.spills, art: rep.art, gifts: T.gifts, kind: T.kind, teased: T.teased }
      : T;
    setSummary(null);
    setScene({
      scene: mem || endOfDayScene({ day: sv.day, event: sv.dayEvent, tally, affection: sv.affection }),
      memoryId: mem?.id,
      nextDay: true,
    });
  };

  const startNextDay = () => {
    const ev = pick(EVENT_POOL);
    const nextDay = saveRef.current.day + 1;
    setSave((s) => ({ ...s, day: s.day + 1, dayEvent: ev, stats: { ...s.stats, days: s.stats.days + 1 } }));
    const w = world.current;
    w.day = { t: 0, lastOrders: false, closing: false, ended: false, tally: emptyTally() };
    w.custs = [];
    w.counter = [null, null, null];
    w.spills = [];
    w.items = w.items.slice(0, 1);
    w.nextCust = 2.5;
    w.pendingGreet = null;
    Object.assign(w.gf, { x: 380, y: 300, tx: 380, ty: 300, carrying: null, path: undefined, bubble: { text: `Day ${nextDay}! Let's go, Rohio!`, t: 3 } });
    Object.assign(w.ro, { x: 260, y: 270, tx: 260, ty: 270, state: 'idle', timer: 3, carrying: null, target: null, path: undefined, anim: null, pose: 'normal', bubble: { text: 'Ji! Ready when you are, my lady.', t: 3 } });
    showBanner(`Day ${nextDay} · ${DAY_EVENTS[ev].name}: ${DAY_EVENTS[ev].desc}`);
  };

  const closeScene = () => {
    const sc = scene;
    setScene(null);
    if (sc?.memoryId) {
      const id = sc.memoryId;
      setSave((s) => ({ ...s, memories: s.memories.includes(id) ? s.memories : [...s.memories, id], affection: clamp(s.affection + 3, 0, 100) }));
      toast('New memory saved in your Journal ♥');
    }
    if (sc?.nextDay) startNextDay();
  };

  /* ---------- game loop ---------- */
  const stepRef = useRef<(dt: number) => void>(() => {});
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      stepRef.current(dt);
      setFrame((f) => (f + 1) % 1e6);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const step = (dt: number) => {
    const w = world.current;
    const sv = saveRef.current;
    const { gf, ro } = w;
    for (const f of w.floaters) f.t += dt;
    w.floaters = w.floaters.filter((f) => f.t < 1.4);
    if (paused) return;
    w.time += dt;
    const ev = sv.dayEvent;

    if (w.music && performance.now() / 1000 > w.music.until) stopMusic();

    /* day clock */
    const D = w.day;
    if (!D.ended) D.t += dt;
    if (!D.lastOrders && D.t > DAY_LEN * 0.9) {
      D.lastOrders = true;
      toast('Last orders! HUA CAFE closes soon.');
    }
    if (!D.closing && D.t >= DAY_LEN) {
      D.closing = true;
      w.custs.forEach((c) => {
        if (c.state === 'leave') return;
        c.state = 'leave';
        c.happyT = 99;
        c.tx = DOOR.x;
        c.ty = DOOR.y;
        if (c.species === 'human') c.bubble = { text: 'See you tomorrow!', t: 2.5 };
      });
      ro.bubble = { text: "Closing time, my lady! Ji, I'll flip the sign.", t: 3.5 };
    }
    if (D.closing && !D.ended && (w.custs.length === 0 || D.t > DAY_LEN + 8)) {
      D.ended = true;
      endDay();
    }

    /* keyboard */
    const k = keys.current;
    const kx = (k['arrowright'] || k['d'] ? 1 : 0) - (k['arrowleft'] || k['a'] ? 1 : 0);
    const ky = (k['arrowdown'] || k['s'] ? 1 : 0) - (k['arrowup'] || k['w'] ? 1 : 0);
    if (kx || ky) {
      gf.tx = clamp(gf.x + kx * 30, B.x0, B.x1);
      gf.ty = clamp(gf.y + ky * 30, B.y0, B.y1);
    }
    moveEnt(gf, 190 * sv.settings.sens, dt, sv.decor);

    /* timers */
    for (const e of [gf, ro]) {
      if (e.exprT > 0) e.exprT -= dt;
      if (e.bubble) {
        e.bubble.t -= dt;
        if (e.bubble.t <= 0) e.bubble = null;
      }
    }
    for (const c of w.custs) {
      if (c.happyT > 0) c.happyT -= dt;
      if (c.bubble) {
        c.bubble.t -= dt;
        if (c.bubble.t <= 0) c.bubble = null;
      }
    }
    if (ro.shakeT > 0) ro.shakeT -= dt;
    w.pout = Math.max(0, w.pout - dt * 0.12);

    /* collectables */
    for (const it of [...w.items]) {
      if (dist(gf, it) < 36) {
        w.items = w.items.filter((x) => x !== it);
        floater('FOUND', it.x, it.y - 30);
        play('pop');
        collect(it.type);
      }
    }
    w.nextItem -= dt;
    if (w.nextItem <= 0) {
      w.nextItem = rand(9, 15);
      if (w.items.length < 2) w.items.push({ id: w.nid++, type: pickWeighted(), ...openFloorSpot(sv.decor) });
    }

    /* mopping */
    const sp = w.spills.find((s) => dist(gf, s) < 30);
    gf.mopping = !!sp;
    if (sp) {
      sp.clean += dt / 1.1;
      if (sp.clean >= 1) {
        w.spills = w.spills.filter((x) => x !== sp);
        const hearts = ev === 'clumsy' ? 2 : 1;
        setSave((s) => ({ ...s, hearts: s.hearts + hearts }));
        bump({ spills: 1 });
        D.tally.spills++;
        floater('SPARKLING!', sp.x, sp.y - 40);
        play('sparkle');
        if (Math.random() < 0.6 && ro.state !== 'celebrate') {
          ro.bubble = { text: pick(['My lady... you cleaned up after me? I adore you.', 'Ba, I owe you one mop. And my heart.', 'Not happening that I spill again! ...probably.']), t: 3 };
          ro.expr = 'flustered';
          ro.exprT = 2.5;
          setSave((s) => ({ ...s, affection: clamp(s.affection + 1, 0, 100) }));
        }
      }
    }

    /* counter pickup & serving */
    if (!gf.carrying && dist(gf, COUNTER_PICK) < 75) {
      const wanted = w.custs.filter((c) => c.state === 'sit').map((c) => c.order);
      let idx = w.counter.findIndex((cup) => cup && wanted.includes(cup.drink));
      if (idx < 0) idx = w.counter.findIndex((cup) => cup);
      if (idx >= 0) {
        gf.carrying = w.counter[idx];
        w.counter[idx] = null;
      }
    }
    if (gf.carrying) {
      const cup = gf.carrying;
      const c = w.custs.find((x) => x.state === 'sit' && x.order === cup.drink && dist(gf, x) < 62);
      if (c) serve(c, 'gf', cup.q);
    }
    if (w.pendingGreet !== null) {
      const c = w.custs.find((x) => x.id === w.pendingGreet);
      if (!c || c.state !== 'sit') w.pendingGreet = null;
      else if (dist(gf, c) < 72) {
        if (!c.greeted) greet(c);
        w.pendingGreet = null;
      }
    }

    /* customers */
    const seats = seatsFor(sv.decor);
    w.nextCust -= dt;
    if (w.nextCust <= 0 && !D.lastOrders) {
      const bonus = sv.decor.length * 0.18 + (sv.decor.includes('cattower') ? 0.8 : 0);
      w.nextCust = Math.max(3.2, (rand(6, 8.5) - bonus) * (ev === 'rush' ? 0.7 : 1));
      const used = new Set(w.custs.filter((c) => c.state !== 'leave').map((c) => c.seat));
      const free = seats.map((_, i) => i).filter((i) => !used.has(i));
      const active = w.custs.filter((c) => c.state !== 'leave').length;
      if (free.length && active < MAX_VISITORS) {
        const seat = pick(free);
        const max = rand(42, 57) * (ev === 'rainy' ? 1.25 : ev === 'rush' ? 0.9 : 1);
        const humanChance = ev === 'catfest' ? 0.1 : ev === 'kpop' ? 0.65 : ev === 'rainy' ? 0.5 : 0.38;
        const visitor = Math.random() < humanChance ? pick(HUMAN_CUSTOMERS) : null;
        const menu = DRINKS.filter((d) => sv.menu[d.id]?.shown);
        w.custs.push({
          id: w.nid++, species: visitor ? 'human' : 'cat', kind: visitor ? undefined : pick(CAT_KINDS), human: visitor || undefined, name: visitor?.name || pick(CAT_NAMES),
          seat, state: 'enter', order: pick(menu.length ? menu : DRINKS).id, patience: max, max, happyT: 0, sad: false, claimed: false, greeted: false, bubble: null,
          x: DOOR.x, y: DOOR.y, tx: seats[seat].x, ty: seats[seat].y, face: -1, moving: true,
        });
      }
    }
    const musicOn = !!w.music;
    for (const c of [...w.custs]) {
      if (c.state === 'enter') {
        if (moveEnt(c, 95, dt, sv.decor)) {
          c.state = 'sit';
          c.face = seats[c.seat]?.side === -1 ? 1 : -1;
        }
      } else if (c.state === 'sit') {
        let drain = 1;
        if (musicOn) drain *= ev === 'kpop' ? 0.5 : 0.65;
        if (w.spills.some((s) => dist(s, c) < 95)) drain *= 1.5;
        c.patience -= dt * drain;
        if (c.patience <= 0) {
          c.state = 'leave';
          c.sad = true;
          c.tx = DOOR.x;
          c.ty = DOOR.y;
          D.tally.missed++;
          floater('too slow', c.x, c.y - 70);
          if (Math.random() < 0.5 && ro.state !== 'celebrate')
            ro.bubble = { text: c.species === 'cat' ? 'Araam se, kitty, come back! ...ba, we lost one.' : `${c.name}, wait! ...Not happening again, my lady.`, t: 3 };
        }
      } else if (moveEnt(c, 110, dt, sv.decor)) w.custs = w.custs.filter((x) => x !== c);
    }

    /* Rohio AI */
    const clumsy = ev === 'clumsy' ? 2 : 1;
    const trained = sv.decor.includes('training');
    const roSpeed = 105 * (ro.help > 0 ? 1.45 : 1);
    if (ro.help > 0) ro.help -= dt;
    ro.ambientT -= dt;
    const findCust = (id: number | null) => w.custs.find((c) => c.id === id);
    const release = () => {
      const c = findCust(ro.target);
      if (c) c.claimed = false;
      ro.target = null;
    };
    switch (ro.state) {
      case 'talk':
        ro.face = gf.x > ro.x ? 1 : -1;
        if (!talkOpen) {
          ro.timer -= dt;
          if (ro.timer <= 0) ro.state = 'idle';
        }
        break;
      case 'idle': {
        ro.timer -= dt;
        if (ro.timer <= 0 && !D.closing) {
          const job = w.custs.find(
            (c) => c.state === 'sit' && !c.claimed && !w.counter.some((cup) => cup?.drink === c.order) && gf.carrying?.drink !== c.order && pour !== c.order && c.max - c.patience > 4,
          );
          if (job) {
            job.claimed = true;
            ro.target = job.id;
            ro.brewDrink = job.order;
            ro.state = 'toBrew';
            ro.tx = BREW_SPOT.x;
            ro.ty = BREW_SPOT.y;
          } else {
            ro.state = 'wander';
            ro.tx = rand(B.x0 + 40, B.x1 - 60);
            ro.ty = rand(B.y0, B.y1 - 20);
          }
        }
        if (ro.ambientT <= 0 && !ro.bubble) {
          ro.ambientT = rand(18, 30);
          ro.bubble = { text: pick(ROHIO_AMBIENT), t: 3.5 };
        }
        break;
      }
      case 'wander':
        if (moveEnt(ro, roSpeed * 0.7, dt, sv.decor)) {
          ro.state = 'idle';
          ro.timer = rand(1.5, 3.5);
        }
        break;
      case 'toBrew':
        if (moveEnt(ro, roSpeed, dt, sv.decor)) {
          ro.state = 'brewing';
          ro.face = -1;
          ro.brewTotal = ro.help > 0 ? 2.5 : sv.decor.includes('turbo') ? 4 : 5.5;
          ro.timer = ro.brewTotal;
        }
        break;
      case 'brewing':
        ro.timer -= dt;
        if (ro.timer <= 0) {
          const spill = Math.min(0.5, (trained ? 0.07 : 0.17) * clumsy);
          if (Math.random() < spill) {
            ro.bubble = { text: pick(ROHIO_CLUMSY), t: 3 };
            ro.expr = 'shocked';
            ro.exprT = 2.5;
            floater('spilled!', ro.x, ro.y - 100);
            addSpill(ro.x + 10, ro.y + 10, ro.brewDrink || 'latte');
            release();
            ro.state = 'idle';
            ro.timer = 1.5;
          } else {
            ro.carrying = ro.brewDrink;
            ro.state = 'deliver';
          }
        }
        break;
      case 'deliver': {
        const c = findCust(ro.target);
        if (!c || c.state !== 'sit') {
          const slot = w.counter.indexOf(null);
          if (slot >= 0 && ro.carrying) w.counter[slot] = { drink: ro.carrying, q: 'good' };
          ro.carrying = null;
          ro.target = null;
          ro.state = 'idle';
          ro.timer = 1;
          break;
        }
        const side = seats[c.seat]?.side ?? 1;
        ro.tx = c.x + side * 34;
        ro.ty = c.y + 4;
        if (Math.random() < dt * (trained ? 0.02 : 0.045) * clumsy) {
          ro.state = 'tripped';
          ro.timer = 1.6;
          if (ro.carrying) addSpill(ro.x, ro.y + 6, ro.carrying);
          ro.carrying = null;
          release();
          ro.bubble = { text: pick(ROHIO_CLUMSY), t: 3 };
          ro.expr = 'hurt';
          ro.exprT = 2.5;
          floater('OOPS', ro.x, ro.y - 60);
          break;
        }
        if (moveEnt(ro, roSpeed, dt, sv.decor) || dist(ro, { x: ro.tx, y: ro.ty }) < 8) {
          ro.carrying = null;
          ro.target = null;
          serve(c, 'rohio', 'good');
          ro.state = 'idle';
          ro.timer = rand(2, 3.5);
          if (Math.random() < 0.3) ro.bubble = { text: pick(['Ji, enjoy! Made with love (and a little spill).', 'Served! Did you see that, my lady?', 'Not happening that I drop this one!']), t: 2.5 };
        }
        break;
      }
      case 'tripped':
        ro.timer -= dt;
        if (ro.timer <= 0) {
          ro.state = 'idle';
          ro.timer = 1;
        }
        break;
      case 'celebrate':
        ro.timer -= dt;
        if (ro.timer <= 0) {
          ro.anim = null;
          ro.pose = 'normal';
          ro.state = 'idle';
          ro.timer = 1;
        }
        break;
    }
    if (ro.state !== 'wander' && ro.state !== 'toBrew' && ro.state !== 'deliver') ro.moving = false;

    if (w.pendingTalk && dist(gf, ro) < 85) {
      w.pendingTalk = false;
      openTalk();
    }
    if (talkOpen) {
      w.talkT += dt;
      if (dist(gf, ro) > 160 || w.talkT > 14) {
        setTalkOpen(false);
        setGiftOpen(false);
      }
    }

    /* pets follow */
    let lead: { x: number; y: number } = gf;
    sv.activePets.forEach((id, i) => {
      let p = w.pets[id];
      if (!p) p = w.pets[id] = { x: gf.x - 30 * (i + 1), y: gf.y + 10, tx: gf.x, ty: gf.y, face: 1, moving: false };
      const gap = id === 'maximus' ? 62 : 44;
      if (dist(p, lead) > gap) {
        p.tx = lead.x - (lead.x > p.x ? gap * 0.7 : -gap * 0.7);
        p.ty = clamp(lead.y + 8, B.y0, B.y1);
        moveEnt(p, 200 * sv.settings.sens, dt, sv.decor);
      } else p.moving = false;
      lead = p;
    });
  };
  stepRef.current = step;

  /* ---------- talking & gifts ---------- */
  const openTalk = () => {
    const w = world.current;
    if (w.ro.state === 'celebrate') return;
    if (w.ro.state === 'deliver' || w.ro.state === 'brewing') {
      const slot = w.counter.indexOf(null);
      if (w.ro.carrying && slot >= 0) w.counter[slot] = { drink: w.ro.carrying, q: 'good' };
      w.ro.carrying = null;
      const c = w.custs.find((x) => x.id === w.ro.target);
      if (c) c.claimed = false;
      w.ro.target = null;
    }
    if (w.ro.state !== 'tripped') w.ro.state = 'talk';
    w.ro.timer = 2;
    w.talkT = 0;
    setTalkOpen(true);
    setGiftOpen(false);
    if (!w.ro.bubble) w.ro.bubble = { text: pick(['Ji, my lady?', 'Yes, my lady? *nervous*', 'Ba? You need something?']), t: 2.5 };
  };

  const doAction = (a: Action) => {
    const w = world.current;
    const sv = saveRef.current;
    const L = DIALOGUE[a];
    const mood = w.pout >= 3 ? 'pouty' : sv.affection >= 75 ? 'smitten' : 'normal';
    w.talkT = 0;
    w.gf.bubble = { text: pick(L.g), t: 2.6 };
    w.gf.expr = L.gExpr;
    w.gf.exprT = 2.6;
    if (a === 'hit') {
      w.ro.shakeT = 0.5;
      play('bonk');
    }
    if (a === 'comfort' || a === 'assure' || a === 'hug') {
      bump({ kind: 1 });
      w.day.tally.kind++;
    }
    if (a === 'taunt' || a === 'makefun' || a === 'hit') {
      bump({ teased: 1 });
      w.day.tally.teased++;
    }
    w.ro.bubble = null;
    setTimeout(() => {
      const r = world.current.ro;
      r.bubble = { text: pick(L.r[mood]), t: 3.8 };
      r.expr = mood === 'pouty' && (a === 'taunt' || a === 'makefun' || a === 'hit') ? 'pout' : L.rExpr;
      r.exprT = 3.8;
      if (a === 'hug' || a === 'comfort' || a === 'assure') {
        floater('care', r.x - 10, r.y - 110);
        floater('love', r.x + 14, r.y - 96);
        play('pop');
      }
      if (a === 'help') {
        r.help = 25;
        floater('Rohio boosted!', r.x, r.y - 110);
      }
      if (a === 'hit') floater('bonk', r.x, r.y - 100);
    }, 650);
    w.pout = clamp(w.pout + L.pout, 0, 10);
    setSave((s) => ({ ...s, affection: clamp(s.affection + L.aff, 0, 100) }));
  };

  const giveGift = (item: Exclude<CollectId, 'letter'>) => {
    const w = world.current;
    if ((saveRef.current.inv[item] || 0) <= 0) return;
    const aff = item === 'crochet' || item === 'painting' ? 8 : 6;
    w.talkT = 0;
    setSave((s) => ({ ...s, inv: { ...s.inv, [item]: s.inv[item] - 1 }, affection: clamp(s.affection + aff, 0, 100) }));
    bump({ gifts: 1 });
    w.day.tally.gifts++;
    w.pout = Math.max(0, w.pout - 4);
    w.gf.bubble = { text: pick(['Here. For you, dummy.', 'I saw this and thought of you.', "Don't make it weird. ...It's a gift."]), t: 2.4 };
    w.gf.expr = 'soft';
    w.gf.exprT = 2.4;
    w.ro.bubble = null;
    setGiftOpen(false);
    window.setTimeout(() => {
      const r = world.current.ro;
      r.bubble = { text: pick(GIFT_LINES[item]), t: 4 };
      r.expr = 'love';
      r.exprT = 4;
      floater('+affection', r.x, r.y - 110);
      play('sparkle');
    }, 650);
  };

  /* ---------- pointer controls ---------- */
  const toStage = (cx: number, cy: number) => {
    const r = stageRef.current!.getBoundingClientRect();
    return { x: ((cx - r.left) * W) / r.width, y: ((cy - r.top) * H) / r.height };
  };
  const setTarget = (x: number, y: number) => {
    const g = world.current.gf;
    g.tx = clamp(x, B.x0, B.x1);
    g.ty = clamp(y, B.y0, B.y1);
  };
  const onDown = (e: RPointerEvent) => {
    if (save.settings.mode === 'hand') return;
    world.current.pendingTalk = false;
    world.current.pendingGreet = null;
    const p = toStage(e.clientX, e.clientY);
    setTarget(p.x, p.y);
    dragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: RPointerEvent) => {
    const m = save.settings.mode;
    if (m === 'hand') return;
    if (m === 'glide' || dragging.current) {
      const p = toStage(e.clientX, e.clientY);
      if (m === 'glide' && p.y < B.y0 - 60) return;
      setTarget(p.x, p.y);
    }
  };
  const onUp = () => (dragging.current = false);
  const stop = (e: RPointerEvent) => e.stopPropagation();
  const walkTo = (x: number, y: number) => setTarget(x, y);

  const startBrew = (d: DrinkId) => {
    const w = world.current;
    if (pour) return;
    if (!w.counter.includes(null)) return toast('Counter is full — deliver some drinks first!');
    setUi(null);
    setPour(d);
    walkTo(MACHINE_SPOT.x, MACHINE_SPOT.y);
  };
  const finishPour = (d: DrinkId, r: PourResult) => {
    const w = world.current;
    setPour(null);
    if (r === 'spill') {
      addSpill(125, 270, d);
      floater('Overflow!', 120, 210);
      return;
    }
    const slot = w.counter.indexOf(null);
    if (slot < 0) return toast('Counter is full!');
    w.counter[slot] = { drink: d, q: r === 'perfect' ? 'perfect' : r === 'weak' ? 'weak' : 'good' };
    if (r === 'perfect') {
      bump({ art: 1 });
      w.day.tally.art++;
      floater('LATTE ART!', SLOT_X[slot], 118);
      play('sparkle');
    } else play('pour');
  };

  const playClaw = (): CollectId | null => {
    if (saveRef.current.hearts < 5) return null;
    setSave((s) => ({ ...s, hearts: s.hearts - 5 }));
    const t = pickWeighted();
    collect(t);
    bump({ claw: 1 });
    return t;
  };

  /* ---------- hand mode ---------- */
  const onHandMove = useCallback((nx: number, ny: number) => {
    const x = nx * W;
    const y = ny * H;
    world.current.hand = { x, y };
    const g = world.current.gf;
    g.tx = clamp(x, B.x0, B.x1);
    g.ty = clamp(y, B.y0, B.y1);
  }, []);
  const onPinch = useCallback(() => {
    const h = world.current.hand;
    const st = stageRef.current;
    if (!h || !st) return;
    const r = st.getBoundingClientRect();
    const cx = r.left + (h.x / W) * r.width;
    const cy = r.top + (h.y / H) * r.height;
    const el = document.elementFromPoint(cx, cy);
    el?.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: cx, clientY: cy }));
    const w = world.current;
    w.floaters.push({ id: w.nid++, text: 'tap', x: h.x, y: h.y - 20, t: 0 });
  }, []);

  /* ---------- render ---------- */
  const w = world.current;
  const { gf, ro } = w;
  const decor = save.decor;
  const tables = tablesFor(decor);
  const seats = seatsFor(decor);
  const t = w.time;
  const dayFrac = Math.min(1, w.day.t / DAY_LEN);
  const mins = 9 * 60 + Math.floor((dayFrac * 12 * 60) / 10) * 10;
  const hh = Math.floor(mins / 60);
  const clock = `${((hh + 11) % 12) + 1}:${String(mins % 60).padStart(2, '0')} ${hh >= 12 ? 'PM' : 'AM'}`;
  const phase: SkyPhase = dayFrac < 0.62 ? 'day' : dayFrac < 0.85 ? 'evening' : 'night';
  // Text and cards inside the play field are counter-scaled so names stay readable on phones.
  const uiK = clamp(1 / (scale || 1), 0.8, 2.05);
  const uiStyle = (origin: string): CSSProperties => ({ transform: `scale(${uiK})`, transformOrigin: origin });
  const uiCenter = (origin: string): CSSProperties => ({ transform: `translateX(-50%) scale(${uiK})`, transformOrigin: origin });
  const tint = phase === 'evening' ? `rgba(255,170,90,${(((dayFrac - 0.62) / 0.23) * 0.16).toFixed(3)})` : phase === 'night' ? `rgba(70,60,140,${(0.12 + ((dayFrac - 0.85) / 0.15) * 0.1).toFixed(3)})` : '';

  const rExpr: RExpr = ro.exprT > 0 ? ro.expr : ro.state === 'tripped' ? 'hurt' : w.pout >= 3 ? 'pout' : save.affection >= 80 ? 'happy' : 'normal';
  const gExpr: GExpr = gf.exprT > 0 ? gf.expr : 'normal';
  const roAnimClass = ro.anim ? `anim-${ro.anim}` : w.music && (ro.state === 'idle' || ro.state === 'talk') ? 'groove' : '';

  const ents: { k: string; z: number; node: ReactNode }[] = [];
  tables.forEach((tb, i) => ents.push({ k: 'tb' + i, z: tb.y, node: <div className="absolute" style={{ left: tb.x - 48, top: tb.y - 62 }}><Table /></div> }));
  seats.forEach((st, i) => ents.push({ k: 'st' + i, z: st.y - 8, node: <div className="absolute" style={{ left: st.x - 20, top: st.y - 30 }}><Stool /></div> }));
  if (decor.includes('plants')) {
    ents.push({ k: 'pl1', z: 520, node: <div className="absolute" style={{ left: decor.includes('table5') ? 705 : 700, top: 455 }}><Plant /></div> });
    ents.push({ k: 'pl2', z: 300, node: <div className="absolute" style={{ left: 2, top: 232 }}><Plant variant={1} /></div> });
  }
  if (decor.includes('cattower')) ents.push({ k: 'ct', z: 330, node: <div className="absolute" style={{ left: 680, top: 200 }}><CatTower /></div> });

  w.spills.forEach((sp) =>
    ents.push({
      k: 'sp' + sp.id,
      z: Math.max(236, sp.y - 40),
      node: (
        <div className="absolute cursor-pointer" style={{ left: sp.x - 35, top: sp.y - 15 }} onPointerDown={stop} onClick={() => walkTo(sp.x, sp.y)} title="Mop this up">
          <Puddle color={sp.color} progress={sp.clean} />
        </div>
      ),
    }),
  );

  w.items.forEach((it) =>
    ents.push({
      k: 'it' + it.id,
      z: it.y - 5,
      node: (
        <div className="absolute" style={{ left: it.x - 16, top: it.y - 32 + Math.sin(t * 3 + it.id) * 3 }} onPointerDown={stop} onClick={() => walkTo(it.x, it.y)}>
          <div className="sparkle cursor-pointer" style={{ filter: 'drop-shadow(0 0 6px #fff6b0)' }}>
            <ItemIcon id={it.type} />
          </div>
        </div>
      ),
    }),
  );

  w.custs.forEach((c) => {
    const sitting = c.state === 'sit';
    const mood = c.state === 'leave' ? (c.sad ? 'sad' : 'happy') : c.happyT > 0 ? 'happy' : 'normal';
    ents.push({
      k: 'c' + c.id,
      z: c.y + 1,
      node: (
        <div
          className="absolute cursor-pointer"
          title={`${c.name} · ${save.menu[c.order]?.name || c.order}`}
          style={{ left: c.x - 29, top: c.y - (c.species === 'human' ? 82 : 54) - (sitting ? 10 : 0) }}
          onPointerDown={stop}
          onPointerEnter={() => setHovered(c.id)}
          onPointerLeave={() => setHovered(null)}
          onClick={() => {
            if (!sitting) return;
            setHovered(c.id);
            if (dist(gf, c) < 85) {
              if (!c.greeted) greet(c);
            } else {
              w.pendingGreet = c.greeted ? null : c.id;
              walkTo(c.x + (seats[c.seat]?.side ?? 1) * 34, c.y + 4);
            }
          }}
        >
          <div className="customer-nameplate absolute top-[-19px] z-10 whitespace-nowrap px-1.5 py-0.5 text-[10px]" style={uiCenter('bottom center')}>{c.name}</div>
          <div style={{ transform: `scaleX(${c.face})` }}>
            {c.species === 'human' && c.human ? (
              <HumanCustomer skin={c.human.skin} hair={c.human.hair} top={c.human.top} mood={mood} sitting={sitting} step={c.moving ? t * 12 : 0} />
            ) : (
              <Cat kind={c.kind || 'tabby'} mood={mood} sitting={sitting} step={c.moving ? t * 12 : 0} />
            )}
          </div>
        </div>
      ),
    });
  });

  for (const id of save.activePets) {
    const p = w.pets[id];
    if (!p) continue;
    ents.push({
      k: 'p' + id,
      z: p.y,
      node: (
        <div className="absolute" style={{ left: p.x - 30, top: p.y - 64, width: 60, height: 64, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ transform: `scaleX(${-p.face})` }} className={w.music ? 'groove' : ''}>
            <PetSprite id={id} step={p.moving ? t * 12 : 0} />
          </div>
        </div>
      ),
    });
  }

  ents.push({
    k: 'gf',
    z: gf.y + 0.5,
    node: (
      <div className="absolute" style={{ left: gf.x - 32, top: gf.y - 86 + (gf.moving ? -Math.abs(Math.sin(t * 12)) * 3 : 0) }}>
        <div style={{ transform: `scaleX(${gf.face})` }}>
          <Goldfish look={save.look} expr={gExpr} carrying={gf.carrying?.drink} quality={gf.carrying?.q} step={gf.moving ? t * 12 : 0} />
        </div>
        {gf.mopping && <div className="mop absolute -right-5 top-10"><PixelIcon name="mop" size={28} /></div>}
        <div className="nameplate nameplate-goldfish absolute -bottom-[25px] left-1/2 whitespace-nowrap px-2 py-0.5 text-[12px] leading-4" style={uiCenter('top center')}>GOLDFISH</div>
      </div>
    ),
  });
  ents.push({
    k: 'ro',
    z: ro.y + 0.4,
    node: (
      <div
        className={`absolute cursor-pointer ${ro.shakeT > 0 ? 'shake' : ''}`}
        style={{ left: ro.x - 35, top: ro.y - 96 + (ro.moving ? -Math.abs(Math.sin(t * 10)) * 3 : 0) }}
        onPointerDown={stop}
        onClick={() => {
          if (dist(gf, ro) < 85) openTalk();
          else {
            w.pendingTalk = true;
            walkTo(ro.x + (gf.x < ro.x ? -55 : 55), ro.y + 4);
          }
        }}
      >
        <div className={roAnimClass}>
          <div style={{ transform: `scaleX(${ro.face})` }}>
            <Rohio look={save.rlook} expr={rExpr} carrying={ro.carrying} step={ro.moving ? t * 10 : 0} tripped={ro.state === 'tripped'} pose={ro.pose} />
          </div>
        </div>
        {ro.anim === 'sing' && (
          <>
            <span className="note" style={{ left: 50, top: 6 }}><PixelIcon name="music" size={16} /></span>
            <span className="note" style={{ left: 8, top: 0, animationDelay: '.7s' }}><PixelIcon name="music" size={14} /></span>
          </>
        )}
        {ro.state === 'brewing' && (
          <div className="absolute -top-3 left-1/2 h-2.5 w-14 -translate-x-1/2 overflow-hidden rounded-full border-2 border-[#5b3a29] bg-white">
            <div className="h-full bg-[#f4917a]" style={{ width: `${(1 - ro.timer / ro.brewTotal) * 100}%` }} />
          </div>
        )}
        {ro.help > 0 && <div className="absolute -right-2 top-2"><PixelIcon name="sparkle" size={20} /></div>}
        <div className="nameplate nameplate-rohio absolute -bottom-[25px] left-1/2 whitespace-nowrap px-2 py-0.5 text-[12px] leading-4" style={uiCenter('top center')}>ROHIO</div>
      </div>
    ),
  });
  ents.sort((a, b) => a.z - b.z);

  const orders = new Set(w.custs.filter((c) => c.state === 'sit').map((c) => c.order));
  const hoveredVisitor = w.custs.find((c) => c.id === hovered && c.state === 'sit');
  const drinkName = (id: DrinkId) => save.menu[id]?.name || id;
  const topGoal = [...save.goals].sort((a, b) => goalProgress(b, save.stats) / b.target - goalProgress(a, save.stats) / a.target)[0];
  const giftable = COLLECTABLES.filter((c) => c.id !== 'letter' && save.inv[c.id] > 0);
  const scenePlaying = scene;

  return (
    <div className="game-shell h-full w-full items-stretch overflow-hidden bg-[#efe1cc]" style={{ backgroundImage: 'radial-gradient(rgba(214,184,140,.35) 1.5px, transparent 2px)', backgroundSize: '14px 14px' }}>
      {/* top HUD */}
      <div className="hud-scroll rail-hud safe-t flex items-center gap-2 overflow-x-auto px-3">
        <div className="pill flex shrink-0 items-center gap-1.5 py-0.5 pl-1.5 pr-3 text-lg">
          <PixelIcon name="fish" size={22} />
          {save.coins.toLocaleString()}
        </div>
        <div className="pill flex shrink-0 items-center gap-1.5 py-0.5 pl-1.5 pr-3 text-lg">
          <PixelIcon name="heart" size={22} />
          {save.hearts}
        </div>
        <div className="pill flex shrink-0 items-center gap-2 py-0.5 pl-2 pr-3 text-sm">
          <span>Rohio</span>
          <div className="h-3 w-16 overflow-hidden rounded-full border-2 border-[#5b3a29] bg-[#fbe0d8] sm:w-24">
            <div className="h-full bg-[#f4917a] transition-all" style={{ width: `${save.affection}%` }} />
          </div>
          <PixelIcon name={w.pout >= 3 ? 'taunt' : save.affection >= 75 ? 'heart' : 'support'} size={18} />
        </div>
        <div className="pill flex shrink-0 items-center gap-1.5 py-0.5 pl-2 pr-3 text-sm" title={DAY_EVENTS[save.dayEvent].desc}>
          <PixelIcon name={phase === 'night' ? 'moon' : 'sun'} size={18} />
          Day {save.day} · {clock}
          <span className="hud-event flex items-center gap-1 opacity-80">· <PixelIcon name={EVENT_ICON[save.dayEvent]} size={16} />{DAY_EVENTS[save.dayEvent].name}</span>
        </div>
        {topGoal && (
          <button onClick={() => setUi('goals')} className="pill flex min-w-0 shrink-0 items-center gap-1.5 py-0.5 pl-2 pr-3 text-sm">
            <PixelIcon name="goals" size={18} />
            <span className="max-w-[170px] truncate">{goalText(topGoal, drinkName).detail}</span>
            <span className="opacity-70">{Math.min(goalProgress(topGoal, save.stats), topGoal.target)}/{topGoal.target}</span>
          </button>
        )}
        <button onClick={() => setUi('intro')} className="icon-btn hud-help ml-auto grid h-9 w-9 shrink-0 place-items-center" title="How to play">
          <PixelIcon name="help" size={22} />
        </button>
      </div>

      {/* stage */}
      <div
        ref={wrapRef}
        className="relative min-h-0 min-w-0 flex-1 overflow-hidden"
        style={{ background: 'linear-gradient(180deg,#f7ecd9 0%, #f2e2c6 42%, #efc3a2 42%, #e9b795 100%)' }}
      >
        <div
          ref={stageRef}
          className="pixel-stage absolute left-1/2 top-1/2 overflow-hidden border-4 border-[#5b3a29]"
          style={{ width: W, height: H, transform: `translate(-50%,-50%) scale(${scale})`, cursor: save.settings.mode === 'glide' ? 'none' : 'pointer' }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          {/* wall & floor */}
          <div className="wall absolute inset-x-0 top-0" style={{ height: 160 }} />
          <div className="absolute inset-x-0" style={{ top: 150, height: 12, background: '#e3c19a', borderTop: '3px solid #5b3a29', borderBottom: '3px solid #5b3a29' }} />
          <div className="floor absolute inset-x-0 bottom-0" style={{ top: 162 }} />
          <div className="absolute" style={{ left: 190, top: 28 }}><WindowArt phase={phase} rain={save.dayEvent === 'rainy'} /></div>
          <button className="absolute cursor-pointer border-0 bg-transparent p-0" style={{ left: 350, top: 38 }} onPointerDown={stop} onClick={() => setUi('menu')} title="Edit HUA CAFE menu">
            <MenuBoard entries={DRINKS.filter((d) => save.menu[d.id]?.shown).map((d) => ({ name: save.menu[d.id]?.name || d.name, price: save.menu[d.id]?.price || d.price }))} />
          </button>
          {decor.includes('bookshelf') ? (
            <div className="absolute" style={{ left: 495, top: 36 }}><Bookshelf /></div>
          ) : (
            <div className="absolute" style={{ left: 485, top: 70 }}><Shelf /></div>
          )}
          <div className="absolute" style={{ left: 615, top: 40 }}><GhostCharm /></div>
          <div className="absolute" style={{ left: 650, top: 40 }}><Door /></div>
          <div className="nameplate absolute bg-[#a7d3f2] px-2 py-1 text-[11px]" style={{ left: 24, top: 16, ...uiStyle('top left') }}>HUA CAFE</div>
          <button className="absolute cursor-pointer border-0 bg-transparent p-0" style={{ left: 114, top: 26 }} onPointerDown={stop} onClick={() => setUi('radio')} title="Café radio">
            <Radio playing={!!nowPlaying} />
          </button>
          {nowPlaying && (
            <div className="pointer-events-none absolute" style={{ left: 150, top: 26 }}>
              <span className="note" style={{ left: 0, top: 0 }}><PixelIcon name="music" size={14} /></span>
              <span className="note" style={{ left: 16, top: 6, animationDelay: '.8s' }}><PixelIcon name="music" size={12} /></span>
              <span className="note" style={{ left: -12, top: 4, animationDelay: '1.4s' }}><PixelIcon name="music" size={12} /></span>
            </div>
          )}
          {decor.includes('lights') && <div className="pointer-events-none absolute left-0 top-0"><Lights /></div>}
          {decor.includes('rug') && <div className="absolute" style={{ left: 250, top: 320 }}><Rug /></div>}

          {/* counter */}
          <div className="absolute" style={{ left: 20, top: 150, zIndex: 232 }}><Counter /></div>
          <div className="absolute cursor-pointer" style={{ left: 38, top: 94, zIndex: 234 }} onPointerDown={stop} onClick={() => { setUi('brew'); walkTo(MACHINE_SPOT.x, MACHINE_SPOT.y); }}>
            <Machine busy={!!pour} progress={-1} />
            {!pour && (
            <div className="absolute -top-7 left-1/2" style={uiCenter('bottom center')}>
              <div className="bob whitespace-nowrap rounded-full border-2 border-[#5b3a29] bg-white px-2 text-xs">tap to brew</div>
            </div>
          )}
          </div>
          {decor.includes('cake') && <div className="absolute" style={{ left: 300, top: 112, zIndex: 233 }}><CakeDisplay /></div>}
          {w.counter.map((cup, i) =>
            cup ? (
              <div key={i} className="absolute cursor-pointer" style={{ left: SLOT_X[i] - 13, top: 128, zIndex: 235 }} onPointerDown={stop} onClick={() => walkTo(COUNTER_PICK.x, COUNTER_PICK.y)}>
                <div className="bob relative">
                  <DrinkIcon id={cup.drink} size={28} />
                  {cup.q === 'perfect' && <span className="absolute -right-2 -top-2"><PixelIcon name="star" size={14} /></span>}
                </div>
              </div>
            ) : null,
          )}

          {/* entities */}
          {ents.map((e) => (
            <div key={e.k} className="pointer-events-none absolute inset-0" style={{ zIndex: Math.round(e.z) }}>
              <div className="pointer-events-auto">{e.node}</div>
            </div>
          ))}

          {/* inspect card */}
          {hoveredVisitor && (() => {
            const r = hoveredVisitor.patience / hoveredVisitor.max;
            const x = clamp(hoveredVisitor.x + 34, 86, W - 130);
            const y = hoveredVisitor.y - (hoveredVisitor.species === 'human' ? 125 : 96);
            return (
              <div className="pop pointer-events-none absolute" style={{ left: x, top: y, zIndex: 900, ...uiStyle(x > W - 220 ? 'top right' : 'top left') }}>
                <div className={`flex min-w-[120px] items-center gap-2 border-[3px] border-[#5b3a29] bg-white px-2 py-1.5 ${gf.carrying?.drink === hoveredVisitor.order ? 'ring-4 ring-[#9cc47f]' : ''}`}>
                  <DrinkIcon id={hoveredVisitor.order} size={24} />
                  <div className="min-w-0">
                    <div className="text-[9px]">{drinkName(hoveredVisitor.order)}</div>
                    <div className="mt-1 h-1.5 w-14 overflow-hidden border border-[#5b3a29] bg-white"><div className="h-full" style={{ width: `${r * 100}%`, background: r > 0.5 ? '#9cc47f' : r > 0.25 ? '#ffd84d' : '#e5574f' }} /></div>
                    {!hoveredVisitor.greeted && <div className="mt-1 text-[8px] opacity-70">tap to {hoveredVisitor.species === 'cat' ? 'pet' : 'chat'}</div>}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* speech */}
          {w.custs.filter((c) => c.bubble).map((c) => (
            <Speech key={'cb' + c.id} x={c.x} y={c.y - (c.species === 'human' ? 100 : 72)} text={c.bubble!.text} color="#eef7ff" k={uiK} />
          ))}
          {gf.bubble && <Speech x={gf.x} y={gf.y - 96} text={gf.bubble.text} color="#fff8d6" k={uiK} />}
          {ro.bubble && <Speech x={ro.x} y={ro.y - 108} text={ro.bubble.text} color="#ffffff" k={uiK} />}

          {/* floaters */}
          {w.floaters.map((f) => (
            <div key={f.id} className="pointer-events-none absolute whitespace-nowrap text-lg font-bold" style={{ left: f.x, top: f.y - f.t * 36, opacity: 1 - f.t / 1.4, zIndex: 1500, textShadow: '0 2px 0 #fff, 0 -1px 0 #fff, 2px 0 0 #fff, -2px 0 0 #fff', color: '#5b3a29', ...uiCenter('bottom center') }}>
              {f.text}
            </div>
          ))}

          {/* time-of-day tint */}
          {tint && <div className="pointer-events-none absolute inset-0" style={{ background: tint, mixBlendMode: 'multiply', zIndex: 2500 }} />}


          {/* cursors */}
          {save.settings.mode === 'glide' && <div className="pointer-events-none absolute" style={{ left: gf.tx - 12, top: gf.ty - 14, zIndex: 4000 }}><PixelIcon name="pointer" size={24} /></div>}
          {save.settings.mode === 'hand' && w.hand && <div className="pointer-events-none absolute" style={{ left: w.hand.x - 16, top: w.hand.y - 16, zIndex: 4000 }}><PixelIcon name="hand" size={32} /></div>}
        </div>

        {gf.carrying && !talkOpen && (
          <button onClick={() => (world.current.gf.carrying = null)} className="btn absolute bottom-2 left-3 z-40 flex items-center gap-1 bg-[#fffaf2] px-2 py-1 text-sm">
            <DrinkIcon id={gf.carrying.drink} size={20} /> Discard
          </button>
        )}

        {/* talk menu */}
        {talkOpen && (
          <div className="pop absolute bottom-2 left-1/2 z-40 w-[min(96%,680px)] -translate-x-1/2 rounded-3xl border-4 border-[#5b3a29] bg-[#fdf8ef] p-3 shadow-lg" onPointerDown={stop}>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-lg">With Rohio</span>
              <span className="truncate text-sm opacity-70">{w.pout >= 3 ? "(he's sulking…)" : save.affection >= 75 ? '(totally smitten)' : '(waiting for you, my lady)'}</span>
              <button onClick={() => { setTalkOpen(false); setGiftOpen(false); }} className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-full border-[3px] border-[#5b3a29] bg-[#f08a3c] text-white">✕</button>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
              {ACTIONS.map((a) => (
                <button key={a.id} onClick={() => doAction(a.id)} className="btn flex flex-col items-center bg-[#fde7df] px-1 py-1.5 text-sm">
                  <ActionIcon action={a.id} size={25} />
                  {a.label}
                </button>
              ))}
              <button onClick={() => { world.current.talkT = 0; setGiftOpen((g) => !g); }} className={`btn flex flex-col items-center px-1 py-1.5 text-sm ${giftOpen ? 'bg-[#ffd567]' : 'bg-[#fff3bd]'}`}>
                <PixelIcon name="gift" size={25} />
                Gift
              </button>
            </div>
            {giftOpen && (
              <div className="mt-2 rounded-2xl bg-[#f4ece0] p-2">
                {giftable.length ? (
                  <div className="flex flex-wrap gap-2">
                    {giftable.map((c) => (
                      <button key={c.id} onClick={() => giveGift(c.id as Exclude<CollectId, 'letter'>)} className="btn flex items-center gap-1 bg-[#fffaf2] px-2 py-1 text-xs">
                        <ItemIcon id={c.id} size={22} /> {c.name} ×{save.inv[c.id]}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-xs opacity-70">No gifts yet. Find frogs, sketches, crochets and more on the café floor!</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* toasts & banners */}
        <div className="pointer-events-none absolute left-1/2 top-2 z-40 flex w-[min(94%,560px)] -translate-x-1/2 flex-col items-center gap-1">
          {banner && <div className="pop flex items-center gap-2 border-[3px] border-[#5b3a29] bg-[#fff3bd] px-4 py-2 text-center text-sm shadow-[3px_3px_0_rgba(91,58,41,.35)]"><PixelIcon name="star" size={20} /> {banner}</div>}
          {toasts.map((x) => (
            <div key={x.id} className="pop rounded-full border-[3px] border-[#5b3a29] bg-[#fffaf2] px-4 py-1 text-sm shadow">{x.text}</div>
          ))}
        </div>
      </div>

      {/* bottom bar */}
      <div className="rail-btn safe-b grid grid-cols-7 items-end gap-1 px-1 pt-1 sm:gap-2 sm:px-2">
        <BarBtn icon={<PixelIcon name="journal" size={27} />} label="Journal" onClick={() => setUi('journal')} />
        <BarBtn icon={<PixelIcon name="shop" size={27} />} label="Shop" onClick={() => setUi('shop')} dot={save.coins >= 90} />
        <BarBtn icon={<PixelIcon name="wardrobe" size={27} />} label="Wardrobe" onClick={() => setUi('wardrobe')} />
        <BarBtn icon={<PixelIcon name="goals" size={27} />} label="Goals" onClick={() => setUi('goals')} />
        <BarBtn icon={<PixelIcon name="radio" size={27} />} label="Radio" onClick={() => setUi('radio')} dot={!!nowPlaying} />
        <BarBtn icon={<PixelIcon name="claw" size={27} />} label="Claw" onClick={() => setUi('claw')} dot={save.hearts >= 5} />
        <BarBtn icon={<PixelIcon name="settings" size={27} />} label="Settings" onClick={() => setUi('settings')} />
      </div>

      {gateUp && (
        <div className="rotate-gate fixed inset-0 z-[95] flex-col items-center justify-center gap-5 bg-[#efe1cc] p-6 text-center">
          <svg className="rotate-phone" width="120" height="120" viewBox="0 0 120 120">
            <rect x="38" y="14" width="44" height="80" rx="8" fill="#fdf8ef" stroke="#5b3a29" strokeWidth="5" />
            <rect x="44" y="26" width="32" height="56" rx="3" fill="#a7d3f2" stroke="#5b3a29" strokeWidth="3" />
            <circle cx="60" cy="91" r="3.4" fill="#f4917a" stroke="#5b3a29" strokeWidth="2" />
            <path d="M12 60 q12 -18 26 -22" fill="none" stroke="#f08a3c" strokeWidth="5" strokeLinecap="round" />
            <path d="M12 60 l-2 -11 M12 60 l11 -2" fill="none" stroke="#f08a3c" strokeWidth="5" strokeLinecap="round" />
          </svg>
          <div>
            <div className="text-2xl">Turn your phone sideways</div>
            <p className="mx-auto mt-2 max-w-[420px] text-[15px] opacity-80">
              HUA CAFE is built to be played in landscape. Rotate your device, then serve some cats with Goldfish and Rohio.
            </p>
          </div>
          <button onClick={() => setPortraitOk(true)} className="btn bg-[#f4917a] px-6 py-2 text-white">
            Play in portrait anyway
          </button>
        </div>
      )}
      {ui === 'shop' && <ShopPanel save={save} setSave={setSave} onClose={() => setUi(null)} toast={toast} />}
      {ui === 'journal' && (
        <JournalPanel
          save={save}
          onClose={() => setUi(null)}
          openLetter={(i) => setLetter(i)}
          onMemory={(id) => {
            const m = MEMORIES.find((x) => x.id === id);
            if (!m) return;
            setUi(null);
            setScene({ scene: m, nextDay: false });
          }}
        />
      )}
      {ui === 'wardrobe' && <WardrobePanel save={save} setSave={setSave} onClose={() => setUi(null)} />}
      {ui === 'claw' && <ClawPanel save={save} onPlay={playClaw} onClose={() => setUi(null)} />}
      {ui === 'menu' && <MenuPanel save={save} setSave={setSave} onClose={() => setUi(null)} />}
      {ui === 'goals' && <GoalsPanel save={save} onReroll={rerollGoal} onClose={() => setUi(null)} />}
      {ui === 'brew' && (
        <Modal onClose={() => setUi(null)} title="Brew a drink">
          <div className="scroll-soft overflow-y-auto p-4 pb-10">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {DRINKS.map((d) => (
                <button key={d.id} onClick={() => startBrew(d.id)} className={`btn tap-min flex flex-col items-center gap-1 px-2 py-3 ${orders.has(d.id) ? 'bg-[#eef7e4]' : 'bg-[#fffaf2]'}`}>
                  <DrinkIcon id={d.id} size={38} />
                  <span className="text-sm">{drinkName(d.id)}</span>
                  <span className="flex items-center gap-1 text-xs opacity-75"><PixelIcon name="fish" size={14} />{save.menu[d.id]?.price}</span>
                  {orders.has(d.id) && <span className="rounded-full bg-[#9cc47f] px-2 text-[10px] text-white">ordered!</span>}
                </button>
              ))}
            </div>
            <div className="mt-3 text-center text-xs opacity-70">Then stop the pour in the green zone for perfect latte art.</div>
          </div>
        </Modal>
      )}
      {pour && <PourGame key={pour + w.nid} drink={pour} name={drinkName(pour)} easy={decor.includes('turbo')} onDone={(r) => finishPour(pour, r)} onCancel={() => setPour(null)} />}
      {ui === 'radio' && <JukeboxPanel albums={save.found.album} nowPlaying={nowPlaying} sound={save.settings.sound} onPlay={playMusic} onStop={stopMusic} onClose={() => setUi(null)} />}
      {ui === 'settings' && (
        <SettingsPanel
          save={save}
          setSave={setSave}
          handStatus={handStatus}
          onClose={() => setUi(null)}
          onReset={() => {
            stopMusic();
            setSaveState(defaultSave());
            world.current = newWorld();
            setUi(null);
          }}
        />
      )}
      {ui === 'intro' && <Intro save={save} onClose={() => setUi(null)} />}
      {letter !== null && <LetterModal index={letter} onClose={() => setLetter(null)} />}
      {summary && <DaySummary report={summary} rlook={save.rlook} onContinue={walkHome} />}
      {scenePlaying && (
        <MemoryScene
          key={`${scenePlaying.scene.title}-${save.day}-${scenePlaying.memoryId || 'night'}`}
          scene={scenePlaying.scene}
          look={save.look}
          rlook={save.rlook}
          onClose={closeScene}
          onChoice={(aff) => setSave((s) => ({ ...s, affection: clamp(s.affection + aff, 0, 100) }))}
        />
      )}
      {save.settings.mode === 'hand' && (
        <HandTracker
          onMove={onHandMove}
          onPinch={onPinch}
          onStatus={(s) => {
            setHandStatus(s);
            toast(s);
          }}
          sensitivity={save.settings.sens}
        />
      )}
    </div>
  );
}

function Speech({ x, y, text, color, k = 1 }: { x: number; y: number; text: string; color: string; k?: number }) {
  const left = clamp(x, 110, W - 110);
  return (
    <div className="pop pointer-events-none absolute" style={{ left, top: y, zIndex: 2000, transform: `translate(-50%,-100%) scale(${k})`, transformOrigin: 'bottom center' }}>
      <div className="relative max-w-[220px] rounded-2xl border-[3px] border-[#5b3a29] px-3 py-1.5 text-center text-[13px] leading-snug" style={{ background: color, width: 'max-content' }}>
        {text}
        <div className="absolute -bottom-[9px] h-3.5 w-3.5 rotate-45 border-b-[3px] border-r-[3px] border-[#5b3a29]" style={{ background: color, left: `calc(50% + ${x - left}px - 7px)` }} />
      </div>
    </div>
  );
}

function BarBtn({ icon, label, onClick, dot }: { icon: ReactNode; label: string; onClick: () => void; dot?: boolean }) {
  return (
    <button onClick={onClick} className="icon-btn relative flex min-w-0 flex-col items-center py-1">
      <span className="grid h-7 place-items-center sm:h-8">{icon}</span>
      <span className="bar-label whitespace-nowrap text-[9px] leading-tight sm:text-sm">{label}</span>
      {dot && <span className="absolute -right-1.5 -top-1.5 h-4 w-4 rounded-full border-2 border-white bg-[#e5574f]" />}
    </button>
  );
}

function Intro({ save, onClose }: { save: Save; onClose: () => void }) {
  return (
    <Modal onClose={onClose} title="Welcome to HUA CAFE!">
      <div className="scroll-soft overflow-y-auto p-5 pb-10">
        <div className="mb-3 flex items-end justify-center gap-4 rounded-2xl pt-3" style={{ backgroundImage: 'linear-gradient(#fde9c9 0 60%, #f2c6a4 60%)' }}>
          <Goldfish look={save.look} expr="happy" />
          <Rohio look={save.rlook} expr="love" />
          <div style={{ transform: 'scale(.8)', transformOrigin: 'bottom' }}><Cat kind="tabby" mood="happy" sitting /></div>
        </div>
        <p className="mb-2 text-lg">Hi <b>Goldfish</b>! Run HUA CAFE with <b>Rohio</b>, your clumsy, manly and very supportive coworker.</p>
        <ul className="space-y-1.5 text-[15px]">
          <li><b>Move:</b> tap or drag on the trackpad/touchscreen, or use Trackpad Glide / Hand Gestures in Settings. WASD works too.</li>
          <li><b>Brew & pour:</b> tap the espresso machine, pick a drink and stop the pour in the green zone. Hit yellow for latte art and bigger tips!</li>
          <li><b>Visitors:</b> cats and humans like Ayman, Misbah and Hamza. Tap a seated cat to pet it, or a human to chat. They get patient and give hearts.</li>
          <li><b>Rohio's spills:</b> stand on puddles to mop them. Messy floors make visitors impatient.</li>
          <li><b>Radio:</b> play K-pop albums you find. Music calms visitors and makes Rohio dance.</li>
          <li><b>Shifts:</b> each day runs 9 AM to 9 PM with a random event. After closing, walk home with Rohio and unlock memories.</li>
          <li><b>Rohio:</b> tap him to taunt, hit, tease, comfort, assure, hug, or give him gifts. He remembers everything, my lady.</li>
          <li><b>Goals:</b> they never run out. Finishing one rewards fish, hearts, sometimes wardrobe items, and a special Rohio performance.</li>
        </ul>
      </div>
    </Modal>
  );
}
