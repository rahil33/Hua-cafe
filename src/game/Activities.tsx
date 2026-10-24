import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DRINKS, type DrinkId, type GExpr, type Look, type RExpr, type RohioLook } from './data';
import type { Save } from './save';
import { Goldfish, Rohio } from './characters';
import { ItemIcon, OL } from './sprites';
import { Lights } from './furniture';
import { Modal } from './Panels';
import { PixelIcon } from './icons';
import { ANIM_LABEL, goalProgress, goalText } from './goals';
import { itemLabel } from './outfits';
import type { Choice, Scene, SceneLine } from './story';

/* ============================ Latte art pour ============================ */
export type PourResult = 'perfect' | 'good' | 'weak' | 'spill';
const MAX = 1.12;

export function PourGame({ drink, name, easy, onDone, onCancel }: { drink: DrinkId; name: string; easy: boolean; onDone: (r: PourResult) => void; onCancel: () => void }) {
  const d = DRINKS.find((x) => x.id === drink)!;
  const [level, setLevel] = useState(0);
  const [result, setResult] = useState<PourResult | null>(null);
  const zone = useMemo(() => ({ c: 0.6 + Math.random() * 0.22, half: easy ? 0.12 : 0.09 }), [easy]);
  const levelRef = useRef(0);
  const doneRef = useRef(false);

  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      if (doneRef.current) return;
      const t = (now - t0) / 1000;
      const v = ((1 - Math.cos(t * (easy ? 1.7 : 2.2))) / 2) * MAX;
      levelRef.current = v;
      setLevel(v);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [easy]);

  const pour = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    const v = levelRef.current;
    const dist = Math.abs(v - zone.c);
    const r: PourResult = v > 1 ? 'spill' : dist <= zone.half * 0.38 ? 'perfect' : dist <= zone.half ? 'good' : 'weak';
    setResult(r);
    window.setTimeout(() => onDone(r), 950);
  }, [zone, onDone]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        pour();
      }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [pour]);

  const fill = Math.min(level, 1);
  const surfaceY = 108 - fill * 76;
  const meterY = (v: number) => 104 - (v / MAX) * 100;
  const label = result === 'perfect' ? 'PERFECT LATTE ART!' : result === 'good' ? 'Nice pour!' : result === 'weak' ? 'A little off…' : result === 'spill' ? 'Overflow! Oops…' : `Pour the ${name}!`;

  return (
    <div className="pop fixed left-1/2 top-1/2 z-[60] w-[min(94vw,380px)] -translate-x-1/2 -translate-y-1/2 rounded-md border-4 border-[#5b3a29] bg-[#fdf8ef] p-3 shadow-[4px_4px_0_rgba(91,58,41,.4)]" onPointerDown={(e) => e.stopPropagation()}>
      <div className="mb-1 flex items-center gap-2">
        <PixelIcon name="brew" size={22} />
        <span className={`text-[13px] ${result === 'perfect' ? 'text-[#c0392b]' : ''}`}>{label}</span>
        {!result && <button onClick={onCancel} className="tap-min ml-auto grid h-9 w-9 place-items-center rounded-full border-[3px] border-[#5b3a29] bg-[#f08a3c] text-sm text-white">✕</button>}
      </div>
      <div className="flex items-end justify-center gap-4">
        <svg viewBox="0 0 26 110" width={26} height={110}>
          <rect x="3" y="4" width="20" height="100" fill="#fffaf2" stroke={OL} strokeWidth={2} />
          <rect x="4" y={meterY(MAX)} width="18" height={meterY(1) - meterY(MAX)} fill="#f4a3a3" />
          <rect x="4" y={meterY(zone.c + zone.half)} width="18" height={meterY(zone.c - zone.half) - meterY(zone.c + zone.half)} fill="#b9dc9a" />
          <rect x="4" y={meterY(zone.c + zone.half * 0.38)} width="18" height={meterY(zone.c - zone.half * 0.38) - meterY(zone.c + zone.half * 0.38)} fill="#ffd84d" />
          <path d={`M0 ${meterY(level) - 4} L8 ${meterY(level)} L0 ${meterY(level) + 4} Z`} fill={OL} />
          <rect x="3" y={meterY(level) - 1} width="20" height="2" fill={OL} />
        </svg>
        <svg viewBox="0 0 130 124" width={150} height={142} style={{ overflow: 'visible' }}>
          <defs>
            <clipPath id="cup-in">
              <path d="M24 32 h70 l-6 72 q-2 8 -10 8 h-38 q-8 0 -10 -8 z" />
            </clipPath>
          </defs>
          {!result && (
            <g>
              <path d="M70 -6 v34" stroke={d.color} strokeWidth={4} />
              <rect x="56" y="-18" width="28" height="12" rx="2" fill="#a7a7a7" stroke={OL} strokeWidth={2} />
            </g>
          )}
          <path d="M94 46 q24 0 20 22 q-3 14 -22 12" fill="none" stroke={OL} strokeWidth={3} />
          <path d="M22 30 h74 l-6 74 q-2 10 -12 10 h-38 q-10 0 -12 -10 z" fill="#fffaf2" stroke={OL} strokeWidth={3} />
          <g clipPath="url(#cup-in)">
            <rect x="0" y={surfaceY} width="130" height="130" fill={d.color} />
            <rect x="0" y={surfaceY} width="130" height="5" fill={d.foam} />
          </g>
          {result === 'perfect' && <path d={`M59 ${surfaceY + 16} l-9 -9 a5.5 5.5 0 0 1 9 -6.5 a5.5 5.5 0 0 1 9 6.5 z`} fill={d.foam} stroke="#e6c8a8" strokeWidth={1.5} />}
          {result === 'good' && <ellipse cx="59" cy={surfaceY + 8} rx="10" ry="3.5" fill={d.foam} />}
          {(result === 'spill' || level > 1) && (
            <g fill={d.color} stroke={OL} strokeWidth={1.5}>
              <path d="M24 30 q-4 12 -2 22 q3 3 4 -2 l1 -18 z" />
              <path d="M92 30 q4 16 2 26 q-3 3 -4 -2 l-1 -22 z" />
            </g>
          )}
        </svg>
      </div>
      {!result ? (
        <>
          <button onClick={pour} className="btn mt-2 min-h-[52px] w-full bg-[#f4917a] py-2 text-xl text-white">POUR!</button>
          <div className="mt-1 text-center text-[10px] opacity-70">Stop in the green zone · yellow = perfect latte art · tap, space or pinch</div>
        </>
      ) : (
        <div className="mt-2 text-center text-xs">{result === 'perfect' ? '+35% tip & a bonus heart when served' : result === 'weak' ? 'Still drinkable, slightly smaller tip' : result === 'spill' ? 'Mop it up and try again!' : 'Ready on the counter'}</div>
      )}
    </div>
  );
}

/* ================================ Jukebox ================================ */
export const DEFAULT_TRACK = 'HUA CAFE Lo-fi';

export function JukeboxPanel({ albums, nowPlaying, sound, onPlay, onStop, onClose }: { albums: string[]; nowPlaying: string | null; sound: boolean; onPlay: (t: string) => void; onStop: () => void; onClose: () => void }) {
  const tracks = [DEFAULT_TRACK, ...albums];
  return (
    <Modal onClose={onClose} title="Café Radio">
      <div className="scroll-soft flex flex-col gap-2 overflow-y-auto p-5 pb-10">
        <p className="text-sm opacity-75">Music keeps visitors patient for 60 seconds, and Rohio can't help dancing. Find more K-pop albums on the café floor to unlock new tracks!</p>
        {!sound && <div className="rounded-xl bg-[#fde7df] p-2 text-xs">Sound is off in Settings. The café still vibes, just silently.</div>}
        {nowPlaying && (
          <div className="flex items-center gap-2 rounded-2xl border-[3px] border-[#9cc47f] bg-[#eef7e4] p-2 text-sm">
            <span className="bob"><PixelIcon name="music" size={22} /></span> Now playing: <b className="truncate">{nowPlaying}</b>
            <button onClick={onStop} className="btn ml-auto bg-[#fffaf2] px-2 text-xs">Stop</button>
          </div>
        )}
        {tracks.map((t) => (
          <div key={t} className="flex items-center gap-2 rounded-2xl border-[3px] border-[#e8dccb] bg-[#f8f2e8] p-2">
            {t === DEFAULT_TRACK ? <PixelIcon name="radio" size={28} /> : <ItemIcon id="album" size={28} />}
            <span className="min-w-0 flex-1 truncate text-sm">{t}</span>
            <button onClick={() => onPlay(t)} className={`btn px-3 py-0.5 text-sm ${nowPlaying === t ? 'bg-[#9cc47f] text-white' : 'bg-[#ffd567]'}`}>{nowPlaying === t ? 'Playing' : 'Play'}</button>
          </div>
        ))}
        {!albums.length && <div className="text-center text-xs opacity-60">No K-pop albums yet. They sparkle on the floor sometimes!</div>}
      </div>
    </Modal>
  );
}

/* ================================= Goals ================================= */
export function GoalsPanel({ save, onReroll, onClose }: { save: Save; onReroll: (id: string) => void; onClose: () => void }) {
  const drinkName = (id: DrinkId) => save.menu[id]?.name || id;
  return (
    <Modal onClose={onClose} title="HUA CAFE Goals">
      <div className="scroll-soft flex flex-col gap-3 overflow-y-auto p-5 pb-10">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="nameplate bg-[#a7d3f2] px-2 py-0.5 text-[11px]">GOAL LV {save.goalLevel + 1}</span>
          <span className="opacity-75">{save.goalsDone} goals completed · a brand-new goal appears every time you finish one</span>
        </div>
        {save.goals.map((g) => {
          const { title, detail } = goalText(g, drinkName);
          const p = Math.min(goalProgress(g, save.stats), g.target);
          return (
            <div key={g.id} className="border-[3px] border-[#e8dccb] bg-[#f8f2e8] p-3">
              <div className="flex items-center gap-2">
                <PixelIcon name="goals" size={25} />
                <div className="min-w-0 flex-1">
                  <div className="text-lg leading-tight">{title}</div>
                  <div className="text-sm opacity-75">{detail}</div>
                </div>
                <div className="text-sm">{p}/{g.target}</div>
              </div>
              <div className="mt-2 h-3 overflow-hidden border-2 border-[#5b3a29] bg-white">
                <div className="h-full bg-[#f4917a] transition-all" style={{ width: `${(p / g.target) * 100}%` }} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                <span className="flex items-center gap-1"><PixelIcon name="fish" size={15} />{g.coins}</span>
                <span className="flex items-center gap-1"><PixelIcon name="heart" size={15} />{g.hearts}</span>
                {g.item && <span className="flex items-center gap-1"><PixelIcon name="wardrobe" size={15} />{itemLabel(g.item)}</span>}
                <span className="flex items-center gap-1"><PixelIcon name="support" size={15} />Rohio's {ANIM_LABEL[g.anim]}</span>
                <button onClick={() => onReroll(g.id)} disabled={save.hearts < 2} className="btn ml-auto flex items-center gap-1 bg-[#fffaf2] px-2 py-0.5 disabled:opacity-40">
                  <PixelIcon name="dice" size={14} /> New goal · 2<PixelIcon name="heart" size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

/* ============================== Day summary ============================== */
export type DayReport = { day: number; event: string; served: number; missed: number; coins: number; perfect: number; spills: number; art: number; stars: number; bonus: number; diary: string };

export function DaySummary({ report, rlook, onContinue }: { report: DayReport; rlook: RohioLook; onContinue: () => void }) {
  const stats = [
    ['Visitors served', report.served],
    ['Visitors missed', report.missed],
    ['Fish earned', report.coins],
    ['Happy serves', report.perfect],
    ['Latte art', report.art],
    ['Spills mopped', report.spills],
  ] as const;
  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center bg-[#2c2140]/60 p-3">
      <div className="pop panel flex max-h-[88dvh] w-full max-w-[520px] flex-col overflow-hidden">
        <div className="bg-[#ffd567] px-4 py-2 text-center">
          <div className="text-xs opacity-75">{report.event}</div>
          <div className="text-2xl">Day {report.day} complete!</div>
          <div className="mt-1 flex justify-center gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} style={{ opacity: i < report.stars ? 1 : 0.25 }}><PixelIcon name="star" size={28} /></span>
            ))}
          </div>
        </div>
        <div className="scroll-soft overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {stats.map(([k, v]) => (
              <div key={k} className="rounded-xl border-[3px] border-[#e8dccb] bg-[#f8f2e8] p-2 text-center">
                <div className="text-xl">{v}</div>
                <div className="text-[11px] opacity-70">{k}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 text-sm">
            Rating bonus: <PixelIcon name="fish" size={18} /> +{report.bonus}
          </div>
          <div className="relative mt-3 flex gap-3 rounded-2xl border-[3px] border-dashed border-[#f4917a] bg-[#fffaf2] p-3" style={{ backgroundImage: 'repeating-linear-gradient(transparent 0 23px, #f6dccf 23px 24px)' }}>
            <div className="h-[64px] w-[48px] shrink-0 overflow-hidden">
              <div style={{ transform: 'scale(.68)', transformOrigin: 'top left' }}><Rohio look={rlook} expr="flustered" /></div>
            </div>
            <div className="text-sm leading-6">
              <div className="text-xs opacity-70">Rohio's diary</div>
              {report.diary}
            </div>
          </div>
        </div>
        <button onClick={onContinue} className="btn m-4 mt-1 bg-[#f4917a] py-2 text-lg text-white">Walk home with Rohio ▸</button>
      </div>
    </div>
  );
}

/* ============================== Memory scene ============================== */
const BG: Record<Scene['bg'], string> = {
  rain: 'linear-gradient(#27304f 0%, #46557f 62%, #3b3f55 62%)',
  stars: 'linear-gradient(#171c3a 0%, #3a3768 62%, #4a3f4f 62%)',
  cafe: 'linear-gradient(#6b4a3a 0%, #8a5f48 62%, #a8744a 62%)',
  sunrise: 'linear-gradient(#ffd9a8 0%, #f6a99a 62%, #e9b48e 62%)',
  street: 'linear-gradient(#5a4a7a 0%, #8a6a8a 62%, #5f5463 62%)',
};

export function MemoryScene({
  scene, look, rlook, onClose, onChoice,
}: { scene: Scene; look: Look; rlook: RohioLook; onClose: () => void; onChoice?: (aff: number, choice: Choice) => void }) {
  const [i, setI] = useState(0);
  const [extra, setExtra] = useState<SceneLine[]>([]);
  const [chosen, setChosen] = useState(false);
  const lines = useMemo(() => [...scene.lines, ...extra], [scene.lines, extra]);
  const line = lines[Math.min(i, lines.length - 1)];
  const last = i >= lines.length - 1;
  const pickReply = !!scene.choices?.length && !chosen && i >= scene.lines.length - 1;
  const gExpr: GExpr = [...lines.slice(0, i + 1)].reverse().find((l) => l.g)?.g || 'normal';
  const rExpr: RExpr = [...lines.slice(0, i + 1)].reverse().find((l) => l.r)?.r || 'normal';
  const next = () => (last ? onClose() : setI(i + 1));
  const choose = (c: Choice) => {
    setChosen(true);
    setExtra([
      { who: 'g', text: c.gLine, g: c.g },
      { who: 'r', text: c.reply, r: c.r, anim: c.anim },
    ]);
    onChoice?.(c.aff, c);
  };
  const name = line.who === 'g' ? 'GOLDFISH' : line.who === 'r' ? 'ROHIO' : '';

  return (
    <div className="fixed inset-0 z-[70] flex flex-col" style={{ background: BG[scene.bg] }} onClick={next}>
      {scene.bg === 'rain' && <div className="rain-overlay pointer-events-none absolute inset-0" />}
      {(scene.bg === 'stars' || scene.bg === 'street') && <div className="stars-overlay pointer-events-none absolute inset-x-0 top-0 h-[60%]" />}
      {scene.bg === 'cafe' && <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2"><Lights /></div>}
      {scene.bg === 'street' && (
        <svg className="pointer-events-none absolute bottom-[38%] left-[12%]" width="40" height="190" viewBox="0 0 40 190">
          <rect x="17" y="30" width="6" height="160" fill="#3e3533" />
          <rect x="6" y="14" width="28" height="20" fill="#fff3bd" stroke={OL} strokeWidth={3} />
          <circle cx="20" cy="24" r="40" fill="rgba(255,243,189,.15)" />
        </svg>
      )}
      <div className="relative z-10 flex items-center justify-between p-3" onClick={(e) => e.stopPropagation()}>
        <div className="nameplate bg-[#f6b8c8] px-2 py-1 text-[11px]">{scene.id ? `MEMORY · ${scene.title.toUpperCase()}` : scene.title.toUpperCase()}</div>
        <button onClick={onClose} className="btn bg-[#fffaf2] px-3 py-0.5 text-sm">Skip ▸▸</button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-end justify-center gap-4 overflow-hidden px-4 pb-1 sm:gap-6">
        <div className="relative flex items-end gap-4 sm:gap-6">
          {scene.umbrella && (
            <svg className="scene-umbrella absolute" width="230" height="110" viewBox="0 0 230 110">
              <path d="M10 70 Q115 -30 220 70 Q195 56 170 70 Q142 56 115 70 Q88 56 60 70 Q35 56 10 70 Z" fill="#f4917a" stroke={OL} strokeWidth={4} />
              <path d="M115 18 V108" stroke={OL} strokeWidth={4} />
            </svg>
          )}
          <div className={`scene-g ${line.who === 'g' ? '' : 'opacity-90'}`}>
            <Goldfish look={look} expr={gExpr} />
          </div>
          <div className="scene-r">
            <div className={line.anim ? `anim-${line.anim}` : ''}>
              <Rohio look={rlook} expr={rExpr} pose={line.flex ? 'flex' : 'normal'} />
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-10 mx-3 mb-3 shrink-0 rounded-md border-4 border-[#5b3a29] bg-[#fdf8ef] p-4 shadow-[4px_4px_0_rgba(0,0,0,.35)]">
        {name && <div className={`nameplate absolute -top-4 left-4 px-2 py-0.5 text-[11px] ${line.who === 'g' ? 'nameplate-goldfish' : 'nameplate-rohio'}`}>{name}</div>}
        <div className={`min-h-[52px] text-[17px] leading-snug ${line.who === 'n' ? 'italic opacity-80' : ''}`}>{line.text}</div>
        {pickReply && (
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3" onClick={(e) => e.stopPropagation()}>
            {scene.choices!.map((c) => (
              <button key={c.label} onClick={() => choose(c)} className="btn tap-min bg-[#fde7df] px-3 py-2 text-left text-sm leading-tight">
                {c.label}
              </button>
            ))}
          </div>
        )}
        <div className="mt-1 flex items-center justify-between text-xs opacity-70">
          <span>{Math.min(i + 1, lines.length)}/{lines.length}</span>
          <span className="bob">{pickReply ? 'pick a reply ▸' : last ? 'tap to finish ♥' : 'tap to continue ▸'}</span>
        </div>
      </div>
    </div>
  );
}
