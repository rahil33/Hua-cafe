import type { CatKind, CollectId, DrinkId, PetId } from './data';
import { DRINKS } from './data';

export const OL = '#5b3a29';
const SW = 2.2;
const BLUSH = '#f7a49a';
const s = { stroke: OL, strokeWidth: SW, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

/* ---------------- Drinks ---------------- */
export function DrinkIcon({ id, size = 26 }: { id: DrinkId; size?: number }) {
  const d = DRINKS.find((x) => x.id === id)!;
  if (id === 'boba') {
    return (
      <svg viewBox="0 0 30 34" width={size} height={size * 1.13}>
        <path d="M17 1 L15 9" {...s} fill="none" />
        <path d="M7 9 h16 l-2 22 h-12 z" fill={d.color} {...s} />
        <path d="M6 9 h18" {...s} />
        {[[11, 27], [15, 28], [19, 27], [13, 24], [17, 24]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={1.8} fill={OL} />
        ))}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 30 30" width={size} height={size}>
      <path d="M22 13 q6 0 5 5 q-1 4 -6 3" fill="none" {...s} />
      <path d="M5 10 h18 l-2 15 q-1 3 -4 3 h-6 q-3 0 -4 -3 z" fill="#fffaf2" {...s} />
      <ellipse cx="14" cy="10.5" rx="8.5" ry="2.6" fill={d.color} {...s} />
      <path d="M11 10.3 q3 -2 6 0 q-3 2 -6 0" fill={d.foam} />
      {id === 'strawberry' && <circle cx="18" cy="9" r="1.5" fill="#e0505c" />}
      <path d="M7 16 h14" stroke={d.color} strokeWidth={3} />
    </svg>
  );
}

/* ---------------- Cats ---------------- */
const CAT_COLORS: Record<CatKind, { base: string; patch?: string; patch2?: string; ear?: string; stripes?: string }> = {
  white: { base: '#fffaf2' },
  calico: { base: '#fffaf2', patch: '#f0a35e', patch2: '#5a4a42' },
  tabby: { base: '#b8aca0', stripes: '#7a6c62' },
  orange: { base: '#f4b066', stripes: '#de8a3e' },
  tuxedo: { base: '#4a3f3b', patch: '#fffaf2' },
  siamese: { base: '#f6ead2', ear: '#7a5a46' },
  black: { base: '#3e3533' },
};

export function Cat({ kind, mood = 'normal', sitting = false, step = 0, oddEyes = false }: { kind: CatKind; mood?: 'normal' | 'happy' | 'sad'; sitting?: boolean; step?: number; oddEyes?: boolean }) {
  const c = CAT_COLORS[kind];
  const dark = kind === 'black' || kind === 'tuxedo';
  const eye = dark ? '#ffe28a' : OL;
  const leg = Math.sin(step) * 2;
  return (
    <svg viewBox="0 0 56 54" width={56} height={54} style={{ overflow: 'visible' }}>
      <ellipse cx="28" cy="51" rx="15" ry="3" fill="rgba(91,58,41,.18)" />
      {/* tail */}
      <path d="M42 42 q12 -2 9 -14" fill="none" stroke={OL} strokeWidth={7} strokeLinecap="round" />
      <path d="M42 42 q12 -2 9 -14" fill="none" stroke={c.base} strokeWidth={3.6} strokeLinecap="round" />
      {/* body */}
      <path d={sitting ? 'M15 50 Q12 30 28 30 Q44 30 41 50 Z' : 'M14 48 Q12 33 28 33 Q44 33 42 48 Z'} fill={c.base} {...s} />
      {kind === 'tuxedo' && <path d="M23 36 q5 6 10 0 v12 h-10 z" fill={c.patch} />}
      {!sitting && (
        <g>
          <rect x="17" y={45 + leg} width="6" height="5" rx="2.5" fill={c.base} {...s} />
          <rect x="33" y={45 - leg} width="6" height="5" rx="2.5" fill={c.base} {...s} />
        </g>
      )}
      {sitting && (
        <g>
          <ellipse cx="22" cy="49" rx="3.5" ry="2.5" fill={kind === 'tuxedo' ? '#fffaf2' : c.base} {...s} />
          <ellipse cx="34" cy="49" rx="3.5" ry="2.5" fill={kind === 'tuxedo' ? '#fffaf2' : c.base} {...s} />
        </g>
      )}
      {/* head */}
      <path d="M10 13 L12 1 L21 8 Z" fill={c.ear || c.base} {...s} />
      <path d="M46 13 L44 1 L35 8 Z" fill={c.ear || c.base} {...s} />
      <path d="M12.5 9 L13.5 4.5 L17 8 Z M43.5 9 L42.5 4.5 L39 8 Z" fill="#f6b8c8" />
      <ellipse cx="28" cy="20" rx="19" ry="15" fill={c.base} {...s} />
      {c.patch && kind === 'calico' && (
        <g>
          <path d="M11 15 Q14 6 24 7 Q20 14 12 20 Z" fill={c.patch} />
          <path d="M38 8 Q46 10 46 18 Q40 16 36 10 Z" fill={c.patch2} />
        </g>
      )}
      {c.stripes && (
        <g stroke={c.stripes} strokeWidth={2} strokeLinecap="round">
          <path d="M25 7 v4 M28 6.5 v5 M31 7 v4" />
          <path d="M10.5 19 h4 M41.5 19 h4" />
        </g>
      )}
      {kind === 'tuxedo' && <ellipse cx="28" cy="26" rx="9" ry="6.5" fill={c.patch} />}
      {kind === 'siamese' && <ellipse cx="28" cy="24" rx="8" ry="7" fill="#c9a888" opacity={0.7} />}
      {/* face */}
      {mood === 'happy' ? (
        <g fill="none" stroke={eye} strokeWidth={2} strokeLinecap="round">
          <path d="M18 20 q3 -3.5 6 0" />
          <path d="M32 20 q3 -3.5 6 0" />
        </g>
      ) : mood === 'sad' ? (
        <g fill="none" stroke={eye} strokeWidth={2} strokeLinecap="round">
          <path d="M18 18 l5 2" />
          <path d="M38 18 l-5 2" />
          <path d="M21 23 v3" stroke="#8fbfe6" />
        </g>
      ) : (
        <g>
          <ellipse cx="21" cy="20" rx="2" ry="2.6" fill={oddEyes ? '#8fbfe6' : eye} stroke={oddEyes ? OL : 'none'} strokeWidth={1} />
          <ellipse cx="35" cy="20" rx="2" ry="2.6" fill={oddEyes ? '#f2c94c' : eye} stroke={oddEyes ? OL : 'none'} strokeWidth={1} />
        </g>
      )}
      <ellipse cx="15" cy="25" rx="2.6" ry="1.5" fill={BLUSH} opacity={0.8} />
      <ellipse cx="41" cy="25" rx="2.6" ry="1.5" fill={BLUSH} opacity={0.8} />
      <path d="M25 24.5 q1.5 2 3 0 q1.5 2 3 0" fill="none" stroke={dark && kind === 'black' ? '#ffe28a' : OL} strokeWidth={1.5} strokeLinecap="round" />
      <path d="M27 22.5 h2" stroke="#f08a6c" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

/* ---------------- Human café visitors ---------------- */
export function HumanCustomer({ skin, hair, top, mood = 'normal', sitting = false, step = 0 }: { skin: string; hair: string; top: string; mood?: 'normal' | 'happy' | 'sad'; sitting?: boolean; step?: number }) {
  const leg = Math.sin(step) * 2;
  return (
    <svg viewBox="0 0 58 82" width={58} height={82} style={{ overflow: 'visible' }}>
      <ellipse cx="29" cy="78" rx="14" ry="3" fill="rgba(91,58,41,.18)" />
      {!sitting && (
        <g>
          <rect x="21" y={62 + leg} width="6" height="12" fill={skin} {...s} />
          <rect x="32" y={62 - leg} width="6" height="12" fill={skin} {...s} />
          <rect x="19" y={72 + leg} width="10" height="4" fill="#fffaf2" {...s} />
          <rect x="31" y={72 - leg} width="10" height="4" fill="#fffaf2" {...s} />
        </g>
      )}
      {sitting && (
        <g>
          <rect x="17" y="66" width="11" height="6" fill={skin} {...s} />
          <rect x="30" y="66" width="11" height="6" fill={skin} {...s} />
          <rect x="15" y="70" width="13" height="4" fill="#fffaf2" {...s} />
          <rect x="30" y="70" width="13" height="4" fill="#fffaf2" {...s} />
        </g>
      )}
      <path d="M16 63 Q15 45 29 45 Q43 45 42 63 Z" fill={top} {...s} />
      <path d="M16 57 L11 63 M42 57 L47 63" stroke={skin} strokeWidth={5} strokeLinecap="square" />
      <ellipse cx="29" cy="29" rx="16" ry="17" fill={skin} {...s} />
      <path d="M13 29 Q12 10 28 9 Q46 9 45 29 Q40 21 35 19 L35 13 Q30 20 20 19 Q18 25 13 29 Z" fill={hair} {...s} />
      <path d="M17 17 q8 -9 20 -3" fill="none" stroke="#6a4432" strokeWidth={2} strokeLinecap="square" />
      {mood === 'happy' ? (
        <g fill="none" {...s}><path d="M20 34 q3 -3 6 0" /><path d="M32 34 q3 -3 6 0" /><path d="M26 40 q3 3 6 0" /></g>
      ) : mood === 'sad' ? (
        <g fill="none" {...s}><path d="M20 31 l6 2" /><path d="M38 31 l-6 2" /><path d="M26 42 q3 -2 6 0" /></g>
      ) : (
        <g><rect x="21" y="32" width="3" height="4" fill={OL} /><rect x="34" y="32" width="3" height="4" fill={OL} /><path d="M27 41 h4" {...s} strokeWidth={1.6} /></g>
      )}
      <rect x="17" y="39" width="7" height="3" fill={BLUSH} opacity={0.7} /><rect x="34" y="39" width="7" height="3" fill={BLUSH} opacity={0.7} />
      <path d="M25 47 h8" stroke="#fffaf2" strokeWidth={2} />
    </svg>
  );
}

/* ---------------- Pets ---------------- */
export function Gecko({ step = 0 }: { step?: number }) {
  const g = '#8fcf6b';
  return (
    <svg viewBox="0 0 54 40" width={46} height={34} style={{ overflow: 'visible' }}>
      <ellipse cx="26" cy="37" rx="14" ry="2.5" fill="rgba(91,58,41,.18)" />
      <path d="M38 28 q12 0 10 -9 q-1 -5 -6 -3 q-3 2 0 5" fill="none" stroke={OL} strokeWidth={6.5} strokeLinecap="round" />
      <path d="M38 28 q12 0 10 -9 q-1 -5 -6 -3 q-3 2 0 5" fill="none" stroke={g} strokeWidth={3.2} strokeLinecap="round" />
      <ellipse cx="28" cy="27" rx="12" ry="7" fill={g} {...s} />
      <path d="M22 26 q6 4 12 0" fill="none" stroke="#f6d7a7" strokeWidth={2} />
      <rect x="19" y={31 + Math.sin(step) * 1.5} width="4" height="5" rx="2" fill={g} {...s} />
      <rect x="32" y={31 - Math.sin(step) * 1.5} width="4" height="5" rx="2" fill={g} {...s} />
      <path d="M4 20 Q4 8 16 8 Q26 8 25 20 Q24 28 14 28 Q4 28 4 20 Z" fill={g} {...s} />
      <circle cx="10" cy="16" r="4.6" fill="#fff" {...s} />
      <circle cx="19" cy="16" r="4.6" fill="#fff" {...s} />
      <circle cx="10.5" cy="16.5" r="2" fill={OL} />
      <circle cx="18.5" cy="16.5" r="2" fill={OL} />
      <path d="M11 23 q3 2 6 0" fill="none" {...s} strokeWidth={1.6} />
      <ellipse cx="7" cy="22" rx="2" ry="1.2" fill={BLUSH} />
      <ellipse cx="22" cy="22" rx="2" ry="1.2" fill={BLUSH} />
    </svg>
  );
}

export function Olaf({ step = 0 }: { step?: number }) {
  return (
    <svg viewBox="0 0 50 70" width={44} height={62} style={{ overflow: 'visible' }}>
      <ellipse cx="25" cy="67" rx="14" ry="3" fill="rgba(91,58,41,.18)" />
      <path d={`M10 40 L1 ${32 + Math.sin(step) * 3} M3 34 l-2 -4 M40 40 L49 ${32 - Math.sin(step) * 3} M47 34 l2 -4`} stroke="#7a5a46" strokeWidth={2.4} strokeLinecap="round" fill="none" />
      <ellipse cx="25" cy="56" rx="14" ry="11" fill="#fff" {...s} />
      <ellipse cx="25" cy="40" rx="10" ry="8" fill="#fff" {...s} />
      <circle cx="25" cy="38" r="1.6" fill={OL} />
      <circle cx="25" cy="44" r="1.6" fill={OL} />
      <path d="M13 22 Q12 6 25 5 Q38 6 37 22 Q36 32 25 32 Q14 32 13 22 Z" fill="#fff" {...s} />
      <path d="M25 5 l-1 -5 M25 5 l3 -4 M25 5 l-4 -3" stroke="#7a5a46" strokeWidth={1.8} strokeLinecap="round" />
      <ellipse cx="20" cy="17" rx="2" ry="2.8" fill={OL} />
      <ellipse cx="30" cy="17" rx="2" ry="2.8" fill={OL} />
      <path d="M18 12.5 q2 -2 4 0 M28 12.5 q2 -2 4 0" fill="none" {...s} strokeWidth={1.8} />
      <path d="M24 20 L33 22 L24 23 Z" fill="#f08a3c" stroke={OL} strokeWidth={1.4} strokeLinejoin="round" />
      <path d="M18 25 Q25 31 32 25 Z" fill="#fff" {...s} strokeWidth={1.6} />
      <rect x="23.5" y="25" width="3" height="3" fill="#fff" stroke={OL} strokeWidth={1} />
      <ellipse cx="16" cy="22" rx="2" ry="1.2" fill={BLUSH} />
      <ellipse cx="34" cy="22" rx="2" ry="1.2" fill={BLUSH} />
    </svg>
  );
}

export function Horse({ step = 0 }: { step?: number }) {
  const b = '#fffaf2';
  const mane = '#e9d6a8';
  const l = Math.sin(step) * 2;
  return (
    <svg viewBox="0 0 80 72" width={78} height={70} style={{ overflow: 'visible' }}>
      <ellipse cx="40" cy="69" rx="24" ry="3.5" fill="rgba(91,58,41,.18)" />
      <path d="M62 38 q12 4 8 20" fill="none" stroke={OL} strokeWidth={8} strokeLinecap="round" />
      <path d="M62 38 q12 4 8 20" fill="none" stroke={mane} strokeWidth={4.5} strokeLinecap="round" />
      {[22, 32, 48, 58].map((x, i) => (
        <g key={x}>
          <rect x={x} y={54 + (i % 2 ? l : -l)} width="7" height="12" rx="2" fill={b} {...s} />
          <rect x={x} y={62 + (i % 2 ? l : -l)} width="7" height="4" fill="#c9a888" {...s} />
        </g>
      ))}
      <ellipse cx="42" cy="46" rx="24" ry="13" fill={b} {...s} />
      <path d="M30 40 h24 v6 h-24 z" fill="#5a6fa8" {...s} />
      <path d="M38 40 v6 M46 40 v6" stroke="#f2c94c" strokeWidth={2} />
      <path d="M18 40 Q14 28 18 20 L30 26 Q32 36 28 44 Z" fill={b} {...s} />
      <path d="M8 22 Q6 6 20 5 Q32 5 32 18 Q32 30 20 31 Q8 31 8 22 Z" fill={b} {...s} />
      <path d="M14 6 L14 -2 L20 4 Z M26 6 L28 -2 L22 4 Z" fill={b} {...s} />
      <path d="M18 5 Q26 0 32 10 Q34 22 30 30 Q28 18 22 12 Z" fill={mane} {...s} />
      <ellipse cx="15" cy="16" rx="2" ry="3" fill={OL} />
      <path d="M11 11 l6 2" {...s} strokeWidth={1.8} />
      <ellipse cx="13" cy="26" rx="5" ry="3.5" fill="#f3d9c6" {...s} strokeWidth={1.6} />
      <circle cx="11.5" cy="26" r="0.9" fill={OL} />
      <circle cx="15" cy="26" r="0.9" fill={OL} />
      <ellipse cx="22" cy="21" rx="2.4" ry="1.4" fill={BLUSH} />
    </svg>
  );
}

export function Chipmunks({ step = 0 }: { step?: number }) {
  const one = (x: number, red: boolean, ph: number) => (
    <g transform={`translate(${x} ${Math.abs(Math.sin(step + ph)) * -3})`}>
      <path d="M20 26 q10 -4 6 -16" fill="none" stroke={OL} strokeWidth={7} strokeLinecap="round" />
      <path d="M20 26 q10 -4 6 -16" fill="none" stroke="#a8724a" strokeWidth={3.6} strokeLinecap="round" />
      <ellipse cx="13" cy="27" rx="8" ry="7" fill="#c98a5a" {...s} />
      <ellipse cx="13" cy="28" rx="4.5" ry="4.5" fill="#f6d7a7" />
      <path d="M5 4 L6 0 L9 3 Z M21 4 L20 0 L17 3 Z" fill="#c98a5a" {...s} strokeWidth={1.6} />
      <ellipse cx="13" cy="12" rx="9" ry="8" fill="#c98a5a" {...s} />
      <path d="M13 4 v5" stroke="#7a4b33" strokeWidth={2} />
      <ellipse cx="13" cy="15" rx="5" ry="3.5" fill="#f6d7a7" />
      <circle cx="9.5" cy="11" r="1.3" fill={OL} />
      <circle cx="16.5" cy="11" r="1.3" fill={OL} />
      <circle cx="13" cy="14" r={red ? 1.8 : 1.1} fill={red ? '#e5574f' : OL} />
      <rect x="12" y="16" width="2" height="2.2" fill="#fff" stroke={OL} strokeWidth={0.6} />
    </g>
  );
  return (
    <svg viewBox="0 0 60 40" width={56} height={38} style={{ overflow: 'visible' }}>
      <ellipse cx="30" cy="37" rx="22" ry="2.5" fill="rgba(91,58,41,.18)" />
      {one(2, false, 0)}
      {one(30, true, 1.3)}
    </svg>
  );
}

export function PetSprite({ id, step = 0 }: { id: PetId; step?: number }) {
  switch (id) {
    case 'mochi': return <div style={{ transform: 'scale(.8)' }}><Cat kind="tabby" step={step} /></div>;
    case 'biscuit': return <div style={{ transform: 'scale(.8)' }}><Cat kind="calico" step={step} /></div>;
    case 'oreo': return <div style={{ transform: 'scale(.8)' }}><Cat kind="tuxedo" step={step} /></div>;
    case 'ginger': return <div style={{ transform: 'scale(.8)' }}><Cat kind="orange" step={step} /></div>;
    case 'snowpuff': return <div style={{ transform: 'scale(.8)' }}><Cat kind="white" step={step} oddEyes /></div>;
    case 'pascal': return <Gecko step={step} />;
    case 'olaf': return <Olaf step={step} />;
    case 'maximus': return <Horse step={step} />;
    case 'chipdale': return <Chipmunks step={step} />;
  }
}

/* ---------------- Collectable icons ---------------- */
export function ItemIcon({ id, size = 32 }: { id: CollectId; size?: number }) {
  const inner = (() => {
    switch (id) {
      case 'frog':
        return (
          <g>
            <ellipse cx="16" cy="21" rx="11" ry="8" fill="#9cc47f" {...s} />
            <circle cx="10" cy="12" r="4.5" fill="#9cc47f" {...s} />
            <circle cx="22" cy="12" r="4.5" fill="#9cc47f" {...s} />
            <circle cx="10" cy="12" r="1.7" fill={OL} />
            <circle cx="22" cy="12" r="1.7" fill={OL} />
            <path d="M12 21 q4 3 8 0" fill="none" {...s} strokeWidth={1.6} />
            <ellipse cx="8.5" cy="19" rx="2" ry="1.2" fill={BLUSH} />
            <ellipse cx="23.5" cy="19" rx="2" ry="1.2" fill={BLUSH} />
          </g>
        );
      case 'letter':
        return (
          <g>
            <rect x="4" y="8" width="24" height="17" rx="2" fill="#fffaf2" {...s} />
            <path d="M4 9 L16 18 L28 9" fill="none" {...s} />
            <path d="M16 22 l-3 -3 a1.8 1.8 0 0 1 3 -2 a1.8 1.8 0 0 1 3 2 z" fill="#e5574f" stroke={OL} strokeWidth={1} />
          </g>
        );
      case 'sketch':
        return (
          <g>
            <rect x="5" y="4" width="20" height="24" rx="2" fill="#fffaf2" {...s} />
            <path d="M9 12 q3 -4 6 0 t6 0 M9 18 h10 M9 22 h7" fill="none" stroke="#9a8576" strokeWidth={1.4} strokeLinecap="round" />
            <path d="M22 26 L29 12 L31 13 L24 27 Z" fill="#ffd84d" {...s} strokeWidth={1.6} />
          </g>
        );
      case 'painting':
        return (
          <g>
            <rect x="3" y="5" width="26" height="22" rx="2" fill="#d9a877" {...s} />
            <rect x="7" y="9" width="18" height="14" fill="#a7d3f2" stroke={OL} strokeWidth={1.4} />
            <path d="M7 23 L13 15 L17 19 L20 16 L25 23 Z" fill="#9cc47f" stroke={OL} strokeWidth={1.2} strokeLinejoin="round" />
            <circle cx="21" cy="12.5" r="2" fill="#ffd84d" />
          </g>
        );
      case 'crochet':
        return (
          <g>
            <circle cx="14" cy="18" r="10" fill="#f6b8c8" {...s} />
            <path d="M6 14 q8 4 16 -2 M5 20 q9 3 18 -4 M8 25 q8 1 14 -7" fill="none" stroke="#e58aa0" strokeWidth={1.4} />
            <path d="M22 6 L30 28" {...s} strokeWidth={2.4} />
            <path d="M22 6 q-2 -2 1 -3" fill="none" {...s} />
          </g>
        );
      case 'kdrama':
      case 'cdrama': {
        const col = id === 'kdrama' ? '#a7d3f2' : '#f4917a';
        return (
          <g>
            <rect x="5" y="5" width="22" height="24" rx="3" fill={col} {...s} />
            <rect x="8" y="9" width="16" height="17" rx="1" fill="#fffaf2" stroke={OL} strokeWidth={1.3} />
            <rect x="11" y="3" width="10" height="5" rx="1.5" fill="#d9a877" {...s} strokeWidth={1.5} />
            <text x="16" y="21" textAnchor="middle" fontSize="11" fontFamily="Itim" fill={OL} fontWeight="bold">{id === 'kdrama' ? 'K' : 'C'}</text>
          </g>
        );
      }
      case 'album':
        return (
          <g>
            <rect x="3" y="6" width="20" height="20" rx="2" fill="#c9a7e8" {...s} />
            <circle cx="22" cy="16" r="8.5" fill="#3e3533" {...s} />
            <circle cx="22" cy="16" r="2.5" fill="#f6b8c8" />
            <path d="M8 13 l3 -3 l3 3 l-3 6 z" fill="#fffaf2" stroke={OL} strokeWidth={1.1} />
          </g>
        );
    }
  })();
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} style={{ overflow: 'visible' }}>
      {inner}
    </svg>
  );
}
