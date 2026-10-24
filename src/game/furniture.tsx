import { OL } from './sprites';

const s = { stroke: OL, strokeWidth: 2.4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const WOOD = '#c9945f';
const WOOD_D = '#a8744a';

export function Counter() {
  return (
    <svg viewBox="0 0 310 84" width={310} height={84}>
      <rect x="4" y="18" width="302" height="62" rx="6" fill={WOOD} {...s} />
      <rect x="2" y="8" width="306" height="16" rx="6" fill="#fbe3c4" {...s} />
      {[40, 110, 180, 250].map((x) => (
        <rect key={x} x={x - 22} y="32" width="44" height="36" rx="4" fill={WOOD_D} {...s} strokeWidth={2} />
      ))}
      {[40, 110, 180, 250].map((x) => (
        <circle key={'k' + x} cx={x} cy="50" r="2.5" fill="#f6d7a7" stroke={OL} strokeWidth={1.4} />
      ))}
    </svg>
  );
}

export function Machine({ busy, progress }: { busy: boolean; progress: number }) {
  return (
    <svg viewBox="0 0 70 72" width={70} height={72} style={{ overflow: 'visible' }}>
      {busy && (
        <g opacity={0.7}>
          <path d="M28 6 q-4 -6 0 -10 M38 4 q-4 -6 0 -10" fill="none" stroke="#c9b8a8" strokeWidth={2.5} strokeLinecap="round">
            <animateTransform attributeName="transform" type="translate" values="0 4;0 -2;0 4" dur="1.2s" repeatCount="indefinite" />
          </path>
        </g>
      )}
      <rect x="6" y="8" width="58" height="56" rx="8" fill="#e5574f" {...s} />
      <rect x="6" y="8" width="58" height="14" rx="7" fill="#f4917a" {...s} />
      <rect x="18" y="28" width="34" height="8" rx="3" fill="#5b3a29" />
      <rect x="31" y="36" width="8" height="8" fill="#a7a7a7" {...s} strokeWidth={1.8} />
      <rect x="22" y="48" width="26" height="6" rx="2" fill="#7a7f8c" {...s} strokeWidth={1.8} />
      <circle cx="16" cy="15" r="3" fill="#ffd84d" stroke={OL} strokeWidth={1.5} />
      <circle cx="54" cy="15" r="3" fill="#9cc47f" stroke={OL} strokeWidth={1.5} />
      {busy && progress >= 0 && (
        <g>
          <rect x="10" y="66" width="50" height="6" rx="3" fill="#fffaf2" {...s} strokeWidth={1.8} />
          <rect x="11" y="67" width={48 * progress} height="4" rx="2" fill="#9cc47f" />
        </g>
      )}
    </svg>
  );
}

export function Table() {
  return (
    <svg viewBox="0 0 96 70" width={96} height={70}>
      <ellipse cx="48" cy="64" rx="34" ry="5" fill="rgba(91,58,41,.15)" />
      <path d="M30 34 L24 62 M66 34 L72 62 M48 36 v26" {...s} strokeWidth={4} />
      <path d="M30 34 L24 62 M66 34 L72 62 M48 36 v26" stroke={WOOD} strokeWidth={1.6} strokeLinecap="round" />
      <ellipse cx="48" cy="28" rx="42" ry="14" fill={WOOD} {...s} />
      <path d="M14 22 Q48 4 82 22 Q74 36 48 38 Q22 36 14 22 Z" fill="#cfe6f5" {...s} strokeWidth={2} />
      <path d="M28 16 L58 34 M44 12 L72 30 M20 24 L42 37 M50 12 L28 31 M66 15 L42 36 M76 20 L58 36" stroke="#8fbfe6" strokeWidth={1.4} />
    </svg>
  );
}

export function Stool() {
  return (
    <svg viewBox="0 0 40 34" width={40} height={34}>
      <path d="M10 14 v18 M30 14 v18" {...s} strokeWidth={3.5} />
      <rect x="3" y="6" width="34" height="12" rx="4" fill="#a7d3f2" {...s} />
      <path d="M10 11 q10 3 20 0" fill="none" stroke="#fff" strokeWidth={1.6} />
    </svg>
  );
}

export function Plant({ variant = 0 }: { variant?: number }) {
  return (
    <svg viewBox="0 0 50 70" width={50} height={70}>
      {variant === 0 ? (
        <g>
          <path d="M25 40 Q10 30 8 14 Q20 18 25 36 Q26 14 38 6 Q40 24 27 40 Q36 26 46 28 Q40 40 27 42" fill="#9cc47f" {...s} />
        </g>
      ) : (
        <g>
          <path d="M25 42 V12" {...s} />
          <circle cx="25" cy="18" r="12" fill="#b9dc9a" {...s} />
          <circle cx="15" cy="30" r="9" fill="#9cc47f" {...s} />
          <circle cx="35" cy="30" r="9" fill="#9cc47f" {...s} />
        </g>
      )}
      <path d="M12 42 h26 l-4 24 h-18 z" fill="#f4917a" {...s} />
      <rect x="10" y="40" width="30" height="6" rx="2" fill="#f7a98f" {...s} />
    </svg>
  );
}

export function Rug() {
  return (
    <svg viewBox="0 0 300 150" width={300} height={150}>
      <ellipse cx="150" cy="75" rx="145" ry="70" fill="#f6b8a8" {...s} />
      <ellipse cx="150" cy="75" rx="120" ry="54" fill="none" stroke="#fff3e6" strokeWidth={4} strokeDasharray="10 8" />
      <ellipse cx="150" cy="75" rx="90" ry="38" fill="#f9cbbd" />
    </svg>
  );
}

export function Lights() {
  const cols = ['#ffd84d', '#f4917a', '#9cc47f', '#a7d3f2', '#f6b8c8'];
  return (
    <svg viewBox="0 0 760 40" width={760} height={40}>
      <path d="M0 6 Q95 34 190 6 Q285 34 380 6 Q475 34 570 6 Q665 34 760 6" fill="none" stroke={OL} strokeWidth={1.8} />
      {Array.from({ length: 24 }).map((_, i) => {
        const x = 16 + i * 31;
        const seg = (x % 190) / 190;
        const y = 6 + Math.sin(seg * Math.PI) * 20 + 4;
        return (
          <g key={i}>
            <circle cx={x} cy={y + 4} r="6" fill={cols[i % 5]} opacity={0.35}>
              <animate attributeName="opacity" values="0.15;0.5;0.15" dur={`${1.5 + (i % 4) * 0.4}s`} repeatCount="indefinite" />
            </circle>
            <ellipse cx={x} cy={y + 4} rx="3" ry="4" fill={cols[i % 5]} stroke={OL} strokeWidth={1.3} />
          </g>
        );
      })}
    </svg>
  );
}

export function Bookshelf() {
  const books = ['#f4917a', '#a7d3f2', '#ffd84d', '#9cc47f', '#c9a7e8', '#f6b8c8', '#d9a877'];
  return (
    <svg viewBox="0 0 100 120" width={100} height={120}>
      <rect x="4" y="4" width="92" height="112" rx="4" fill={WOOD} {...s} />
      {[10, 46, 82].map((y, r) => (
        <g key={y}>
          <rect x="10" y={y} width="80" height="30" fill="#8c6a4f" stroke={OL} strokeWidth={1.6} />
          {Array.from({ length: 6 }).map((_, i) => (
            <rect key={i} x={13 + i * 12} y={y + 6 - ((i + r) % 3) * 2} width="9" height={24 + ((i + r) % 3) * 2} fill={books[(i + r * 2) % 7]} stroke={OL} strokeWidth={1.4} />
          ))}
        </g>
      ))}
    </svg>
  );
}

export function CakeDisplay() {
  return (
    <svg viewBox="0 0 70 56" width={70} height={56}>
      <path d="M6 50 V22 Q6 6 35 6 Q64 6 64 22 V50 Z" fill="rgba(207,230,245,.55)" {...s} />
      <rect x="2" y="48" width="66" height="7" rx="3" fill={WOOD} {...s} />
      <path d="M14 46 v-12 h16 v12 z" fill="#fff3e6" {...s} strokeWidth={1.8} />
      <path d="M14 38 h16" stroke="#f6b8c8" strokeWidth={3} />
      <circle cx="22" cy="31" r="3" fill="#e5574f" stroke={OL} strokeWidth={1.3} />
      <path d="M38 46 l8 -14 l8 14 z" fill="#f6d7a7" {...s} strokeWidth={1.8} />
      <path d="M41 41 h10" stroke="#7a4b33" strokeWidth={2.5} />
    </svg>
  );
}

export function CatTower() {
  return (
    <svg viewBox="0 0 80 130" width={80} height={130}>
      <rect x="34" y="20" width="12" height="100" fill="#e9d6a8" {...s} />
      <path d="M36 30 h8 M36 40 h8 M36 50 h8 M36 60 h8 M36 70 h8 M36 80 h8 M36 90 h8" stroke="#c9a888" strokeWidth={1.4} />
      <rect x="8" y="10" width="64" height="12" rx="5" fill="#f6b8c8" {...s} />
      <rect x="4" y="62" width="40" height="11" rx="5" fill="#a7d3f2" {...s} />
      <rect x="2" y="116" width="76" height="12" rx="5" fill="#f6b8c8" {...s} />
      <circle cx="62" cy="34" r="6" fill="#ffd84d" {...s} />
      <path d="M62 22 v6" {...s} strokeWidth={1.5} />
    </svg>
  );
}

export type SkyPhase = 'day' | 'evening' | 'night';
export function WindowArt({ phase = 'day', rain = false }: { phase?: SkyPhase; rain?: boolean }) {
  const sky = rain ? (phase === 'night' ? '#3a4566' : '#9fb3c4') : phase === 'day' ? '#cfe6f5' : phase === 'evening' ? '#f9c89b' : '#3d4a7a';
  return (
    <svg viewBox="0 0 160 100" width={160} height={100}>
      <defs>
        <clipPath id="win-clip">
          <rect x="4" y="4" width="152" height="92" rx="8" />
        </clipPath>
      </defs>
      <rect x="4" y="4" width="152" height="92" rx="8" fill={sky} {...s} />
      <g clipPath="url(#win-clip)">
        {phase === 'night' ? (
          <g>
            <circle cx="42" cy="28" r="9" fill="#fff6c7" />
            <circle cx="46" cy="25" r="8" fill={sky} />
            {[[100, 18], [124, 30], [70, 40], [140, 14], [110, 44]].map(([x, y], i) => (
              <rect key={i} x={x} y={y} width="3" height="3" fill="#fff6c7" />
            ))}
          </g>
        ) : !rain && <circle cx="40" cy="30" r="9" fill={phase === 'evening' ? '#ffb46b' : '#fff6c7'} />}
        <path d="M100 80 q10 -14 20 0 q10 -10 18 2 v14 h-38 z" fill={phase === 'night' ? '#4f6b55' : '#b9dc9a'} />
        {rain && (
          <g stroke="#e9f3fb" strokeWidth={2} opacity={0.8}>
            <animateTransform attributeName="transform" type="translate" values="0 -24; -8 0" dur="0.5s" repeatCount="indefinite" />
            {Array.from({ length: 16 }).map((_, i) => (
              <path key={i} d={`M${10 + i * 10} ${(i % 3) * 14} l-4 10 M${14 + i * 10} ${46 + (i % 4) * 9} l-4 10`} />
            ))}
          </g>
        )}
      </g>
      <path d="M80 4 v92 M4 50 h152" {...s} />
      <path d="M0 4 Q16 40 8 96 L0 96 Z M160 4 Q144 40 152 96 L160 96 Z" fill="#ffe7a8" {...s} />
    </svg>
  );
}

export function Radio({ playing }: { playing: boolean }) {
  return (
    <svg viewBox="0 0 70 62" width={70} height={62} style={{ overflow: 'visible' }}>
      <path d="M46 14 L56 2" {...s} strokeWidth={2} />
      <circle cx="56" cy="2" r="2.4" fill="#e5574f" stroke={OL} strokeWidth={1.4} />
      <rect x="4" y="14" width="62" height="44" rx="6" fill="#f4917a" {...s} />
      <rect x="4" y="14" width="62" height="9" rx="4" fill="#f7a98f" {...s} strokeWidth={1.8} />
      <circle cx="22" cy="40" r="11" fill="#5b3a29" />
      <circle cx="22" cy="40" r="6.5" fill="#7a5a46" />
      <circle cx="22" cy="40" r="2.2" fill={playing ? '#ffd84d' : '#c9a888'}>
        {playing && <animate attributeName="r" values="2.2;3.6;2.2" dur="0.45s" repeatCount="indefinite" />}
      </circle>
      <rect x="38" y="30" width="22" height="9" rx="2" fill={playing ? '#d9f2c4' : '#fffaf2'} stroke={OL} strokeWidth={1.6} />
      <path d={playing ? 'M41 36 l3 -3 l3 3 l3 -3 l3 3 l3 -3' : 'M41 34.5 h16'} fill="none" stroke="#5e6b55" strokeWidth={1.4} />
      <circle cx="43" cy="49" r="3" fill="#ffd84d" stroke={OL} strokeWidth={1.4} />
      <circle cx="54" cy="49" r="3" fill="#a7d3f2" stroke={OL} strokeWidth={1.4} />
    </svg>
  );
}

export function Puddle({ color, progress = 0 }: { color: string; progress?: number }) {
  return (
    <svg viewBox="0 0 70 30" width={70} height={30} style={{ overflow: 'visible' }}>
      <path d="M8 16 Q6 6 22 7 Q30 2 42 6 Q62 5 62 15 Q66 24 48 24 Q36 29 24 25 Q6 26 8 16 Z" fill={color} opacity={0.85 * (1 - progress * 0.8)} stroke={OL} strokeWidth={2} />
      <path d="M20 12 q6 -3 12 0" fill="none" stroke="#fffaf2" strokeWidth={2} opacity={0.8} />
      <rect x="44" y="11" width="4" height="3" fill="#fffaf2" opacity={0.7} />
      {progress > 0 && (
        <g>
          <rect x="15" y="-8" width="40" height="6" fill="#fffaf2" stroke={OL} strokeWidth={1.5} />
          <rect x="16" y="-7" width={38 * progress} height="4" fill="#9cc47f" />
        </g>
      )}
    </svg>
  );
}

export function MenuBoard({ entries = [] }: { entries?: { name: string; price: number }[] }) {
  return (
    <svg viewBox="0 0 128 108" width={128} height={108}>
      <path d="M64 2 L28 20 M64 2 L100 20" {...s} strokeWidth={1.6} />
      <rect x="4" y="18" width="120" height="86" rx="2" fill="#5e6b55" {...s} />
      <text x="64" y="34" textAnchor="middle" fontFamily="Silkscreen" fontSize="10" fill="#fff6e0">HUA CAFE</text>
      {entries.slice(0, 5).map((entry, i) => (
        <g key={entry.name}>
          <text x="12" y={48 + i * 11} fontFamily="Silkscreen" fontSize="7" fill="#fff6e0">{entry.name.slice(0, 12).toUpperCase()}</text>
          <text x="112" y={48 + i * 11} textAnchor="end" fontFamily="Silkscreen" fontSize="7" fill="#ffd567">{entry.price}</text>
        </g>
      ))}
    </svg>
  );
}

export function Door() {
  return (
    <svg viewBox="0 0 80 120" width={80} height={120}>
      <path d="M4 120 V40 Q4 4 40 4 Q76 4 76 40 V120 Z" fill="#f3c9a8" {...s} />
      <path d="M14 120 V44 Q14 16 40 16 Q66 16 66 44 V120" fill="#e9b48e" {...s} strokeWidth={2} />
      <circle cx="58" cy="76" r="3" fill="#ffd84d" stroke={OL} strokeWidth={1.4} />
      <rect x="24" y="30" width="32" height="14" rx="3" fill="#fffaf2" stroke={OL} strokeWidth={1.6} />
      <text x="40" y="41" textAnchor="middle" fontFamily="Itim" fontSize="9" fill={OL}>OPEN</text>
    </svg>
  );
}

export function Shelf() {
  return (
    <svg viewBox="0 0 120 50" width={120} height={50}>
      <rect x="4" y="36" width="112" height="8" rx="3" fill={WOOD} {...s} />
      <path d="M20 36 v-14 h14 v14 z" fill="#fffaf2" {...s} strokeWidth={1.8} />
      <path d="M40 36 q-2 -20 10 -20 q12 0 10 20 z" fill="#9cc47f" {...s} strokeWidth={1.8} />
      <rect x="68" y="14" width="10" height="22" fill="#f4917a" {...s} strokeWidth={1.6} />
      <rect x="79" y="18" width="10" height="18" fill="#a7d3f2" {...s} strokeWidth={1.6} />
      <circle cx="102" cy="28" r="8" fill="#ffd84d" {...s} strokeWidth={1.8} />
    </svg>
  );
}

export function GhostCharm() {
  return (
    <svg viewBox="0 0 30 50" width={30} height={50}>
      <path d="M15 0 v14" stroke={OL} strokeWidth={1.4} />
      <path d="M5 30 Q5 14 15 14 Q25 14 25 30 L22 34 L19 31 L15 35 L11 31 L8 34 Z" fill="#fff" {...s} strokeWidth={1.8} />
      <circle cx="12" cy="24" r="1.2" fill={OL} />
      <circle cx="18" cy="24" r="1.2" fill={OL} />
    </svg>
  );
}
