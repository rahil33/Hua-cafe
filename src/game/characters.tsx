import type { DrinkId, GExpr, Look, RExpr, RohioLook } from './data';
import { DrinkIcon, OL } from './sprites';

const SW = 2.2;
const SKIN = '#fff1e3';
const BLUSH = '#f7a49a';
const s = { stroke: OL, strokeWidth: SW, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const thin = { stroke: OL, strokeWidth: 1.4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
export type CupQuality = 'perfect' | 'good' | 'weak';

function starPath(cx: number, cy: number, r: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(2)} ${(cy + Math.sin(a) * rr).toFixed(2)}`);
  }
  return `M${pts.join(' L')} Z`;
}
const heartPath = (cx: number, cy: number, k = 1) =>
  `M${cx} ${cy + 4 * k} l${-4.5 * k} ${-4.5 * k} a${2.6 * k} ${2.6 * k} 0 0 1 ${4.5 * k} ${-3 * k} a${2.6 * k} ${2.6 * k} 0 0 1 ${4.5 * k} ${3 * k} z`;

function FlowerCrown({ x0, x1, y, dip = 4 }: { x0: number; x1: number; y: number; dip?: number }) {
  const cols = ['#f6b8c8', '#ffd84d', '#a7d3f2', '#f4917a', '#c9a7e8', '#f6b8c8'];
  return (
    <g>
      {cols.map((c, i) => {
        const t = i / (cols.length - 1);
        const x = x0 + (x1 - x0) * t;
        const yy = y - Math.sin(t * Math.PI) * dip;
        return (
          <g key={i}>
            <circle cx={x} cy={yy} r={3.1} fill={c} {...thin} />
            <circle cx={x} cy={yy} r={1} fill="#fffaf2" />
          </g>
        );
      })}
    </g>
  );
}

function Carry({ drink, x, y, quality }: { drink: DrinkId; x: number; y: number; quality?: CupQuality }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <foreignObject x="0" y="0" width="26" height="30">
        <DrinkIcon id={drink} size={22} />
      </foreignObject>
      {quality === 'perfect' && <path d={starPath(22, 2, 4)} fill="#ffd84d" {...thin} />}
      <circle cx="7" cy="16" r="3.4" fill={SKIN} {...s} />
    </g>
  );
}

/* =============================== GOLDFISH =============================== */
export function Goldfish({ look, expr = 'normal', carrying, quality, step = 0 }: { look: Look; expr?: GExpr; carrying?: DrinkId | null; quality?: CupQuality; step?: number }) {
  const hair = look.hairColor || '#3d2a22';
  const legL = Math.sin(step) * 2;
  const legR = -legL;
  const legColor = look.bottom === 'pants' ? look.skirt : look.bottom === 'shorts' ? SKIN : '#fffaf2';
  const legTop = look.bottom === 'pants' ? 63 : 68;

  return (
    <svg viewBox="0 0 64 90" width={64} height={90} style={{ overflow: 'visible' }}>
      <ellipse cx="32" cy="86" rx="15" ry="3.5" fill="rgba(91,58,41,.18)" />

      {/* back hair */}
      {look.hair === 'long' && (
        <path d="M13 26 Q9 50 13 64 Q17.5 68 22 64 Q27 68 32 64 Q37 68 42 64 Q46.5 68 51 64 Q55 50 51 26 Z" fill={hair} {...s} />
      )}
      {look.hair === 'ponytail' && (
        <g>
          <path d="M43 13 Q61 15 59 37 Q58 50 50 55 Q55 40 47 25 Z" fill={hair} {...s} />
          <rect x="43.5" y="12" width="5" height="5" rx="1" fill="#f4917a" {...thin} />
        </g>
      )}
      {look.hair === 'braids' &&
        [0, 1].map((side) => {
          const x = side ? 50 : 14;
          const dir = side ? 1 : -1;
          return (
            <g key={side}>
              <path d={`M${x} 36 q${dir * 4} 6 ${dir * 3} 14`} stroke={OL} strokeWidth={8} fill="none" strokeLinecap="round" />
              <path d={`M${x} 36 q${dir * 4} 6 ${dir * 3} 14`} stroke={hair} strokeWidth={4.5} fill="none" strokeLinecap="round" />
              <circle cx={x + dir * 3} cy={52} r={2.4} fill="#f4917a" {...s} strokeWidth={1.6} />
            </g>
          );
        })}

      {/* legs + shoes */}
      <rect x="24.5" y={legTop + legL} width="6" height={79 - legTop} rx="1" fill={legColor} {...s} />
      <rect x="33.5" y={legTop + legR} width="6" height={79 - legTop} rx="1" fill={legColor} {...s} />
      <Shoe style={look.shoes} color={look.shoeColor} cx={27} dy={legL} />
      <Shoe style={look.shoes} color={look.shoeColor} cx={37} dy={legR} />

      {/* bottoms */}
      {look.bottom === 'skirt' && <path d="M21 71 L43 71 L39.5 57 L24.5 57 Z" fill={look.skirt} {...s} />}
      {look.bottom === 'dress' && (
        <g>
          <path d="M18.5 75 L45.5 75 L40 56 L24 56 Z" fill={look.skirt} {...s} />
          <path d="M20 72.3 q2.5 2 5 0 q2.5 2 5 0 q2.5 2 5 0 q2.5 2 5 0 q2.2 1.8 4 0" fill="none" stroke="#fffaf2" strokeWidth={1.5} />
        </g>
      )}
      {(look.bottom === 'shorts' || look.bottom === 'overalls') && <path d="M23 57 h18 l1.5 9 h-8.5 l-1.5 -3 l-1.5 3 h-8.5 z" fill={look.skirt} {...s} />}
      {look.bottom === 'pants' && <path d="M23.5 57 h17 l0.8 8 h-18.6 z" fill={look.skirt} {...s} />}

      {/* top */}
      {look.topStyle === 'hoodie' && <path d="M22 51 Q32 43 42 51 L40 53 Q32 48 24 53 Z" fill={look.top} {...s} />}
      <path d="M20 62 Q19 48 32 48 Q45 48 44 62 Q32 65 20 62 Z" fill={look.top} {...s} />
      <TopDetail look={look} />
      {look.bottom === 'overalls' && (
        <g>
          <path d="M25 51 L22.5 48.5 M39 51 L41.5 48.5" stroke={OL} strokeWidth={2.6} />
          <path d="M25 51 L22.5 48.5 M39 51 L41.5 48.5" stroke={look.skirt} strokeWidth={1.3} />
          <rect x="25" y="51" width="14" height="10" rx="1.5" fill={look.skirt} {...thin} />
          <circle cx="27.3" cy="53" r="1" fill="#ffd84d" />
          <circle cx="36.7" cy="53" r="1" fill="#ffd84d" />
        </g>
      )}

      {/* neck accessories */}
      {look.accessory === 'scarf' && (
        <g>
          <path d="M21 49 Q32 54.5 43 49 L43.3 52.6 Q32 58 20.7 52.6 Z" fill="#e5574f" {...thin} />
          <path d="M37 53 l4 8 l-4.5 0.5 l-2 -7.5 z" fill="#e5574f" {...thin} />
        </g>
      )}
      {look.accessory === 'necklace' && (
        <g>
          <path d="M25.5 49 Q32 55 38.5 49" fill="none" stroke="#e8b830" strokeWidth={1.3} />
          <circle cx="32" cy="53.4" r="1.8" fill="#f6b8c8" {...thin} strokeWidth={1} />
        </g>
      )}
      {look.accessory === 'frogbag' && (
        <g>
          <path d="M22 49.5 L44 64" stroke={OL} strokeWidth={2.8} />
          <path d="M22 49.5 L44 64" stroke="#9cc47f" strokeWidth={1.4} />
          <circle cx="45" cy="66" r="5.4" fill="#9cc47f" {...thin} />
          <circle cx="42.6" cy="61.6" r="1.8" fill="#fffaf2" {...thin} strokeWidth={1} />
          <circle cx="47.4" cy="61.6" r="1.8" fill="#fffaf2" {...thin} strokeWidth={1} />
          <circle cx="42.6" cy="61.8" r="0.7" fill={OL} />
          <circle cx="47.4" cy="61.8" r="0.7" fill={OL} />
          <path d="M43.4 67 q1.6 1.4 3.2 0" fill="none" {...thin} strokeWidth={1} />
        </g>
      )}

      {/* hands */}
      <circle cx="19" cy="60" r="3.4" fill={SKIN} {...s} />
      {!carrying && <circle cx="45" cy="60" r="3.4" fill={SKIN} {...s} />}

      {/* buns sit behind the head */}
      {look.hair === 'buns' && (
        <g>
          <circle cx="15.5" cy="12.5" r="7.2" fill={hair} {...s} />
          <circle cx="48.5" cy="12.5" r="7.2" fill={hair} {...s} />
        </g>
      )}
      {look.hair === 'bob' && <path d="M12 28 Q10 47 20 46 L20 30 Z M52 28 Q54 47 44 46 L44 30 Z" fill={hair} {...s} />}
      {look.hair === 'long' && <path d="M12.5 28 Q11 50 19 52 L20 30 Z M51.5 28 Q53 50 45 52 L44 30 Z" fill={hair} {...s} />}

      {/* head */}
      <circle cx="32" cy="28" r={look.hair === 'pixie' ? 18.6 : 19.5} fill={hair} {...s} />
      <ellipse cx="32" cy="32" rx="15.5" ry="14" fill={SKIN} {...s} />
      {look.hair === 'pixie' ? (
        <path d="M15.5 31 Q14 12 32 11 Q50 12 48.5 30 Q44 20 34 24 Q26 27 15.5 31 Z" fill={hair} {...s} />
      ) : look.hair === 'long' ? (
        <path d="M15.5 32 Q14 12 32 11 Q50 12 48.5 32 Q46 21 33 17 L32 19 L31 17 Q18 21 15.5 32 Z" fill={hair} {...s} />
      ) : (
        <path d="M15.5 31 Q14 12 32 11 Q50 12 48.5 31 Q45 22 39 21 Q36 26 31 22.5 Q24 26 15.5 31 Z" fill={hair} {...s} />
      )}

      {/* face */}
      <GEyes expr={expr} />
      {look.cheeks === 'blush' && (
        <g>
          <ellipse cx="21" cy="38" rx="3.2" ry="1.9" fill={BLUSH} opacity={0.85} />
          <ellipse cx="43" cy="38" rx="3.2" ry="1.9" fill={BLUSH} opacity={0.85} />
        </g>
      )}
      {look.cheeks === 'freckles' && (
        <g fill="#c98a5a">
          {[[19.5, 37.5], [21.8, 38.6], [21.2, 36.3], [42.2, 37.5], [44.5, 38.6], [43.8, 36.3]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={0.75} />
          ))}
        </g>
      )}
      {look.cheeks === 'hearts' && (
        <g fill="#f4917a">
          <path d={heartPath(21, 36.2, 0.45)} />
          <path d={heartPath(43, 36.2, 0.45)} />
        </g>
      )}
      <GMouth expr={expr} />
      <Eyewear kind={look.eyewear} />
      {look.accessory === 'flower' && (
        <g transform="translate(47.5 23.5)">
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 2.6} cy={Math.sin((a * Math.PI) / 180) * 2.6} r={2.1} fill="#f6b8c8" {...thin} strokeWidth={1} />
          ))}
          <circle cx="0" cy="0" r="1.5" fill="#ffd84d" />
        </g>
      )}
      <GHat hat={look.hat} />
      {carrying && <Carry drink={carrying} x={38} y={46} quality={quality} />}
    </svg>
  );
}

function Shoe({ style, color, cx, dy }: { style: Look['shoes']; color: string; cx: number; dy: number }) {
  switch (style) {
    case 'sneakers':
      return (
        <g>
          <ellipse cx={cx} cy={80 + dy} rx={5.4} ry={3.2} fill={color} {...s} />
          <path d={`M${cx - 4.6} ${81.6 + dy} h9.2`} stroke="#fffaf2" strokeWidth={1.5} />
        </g>
      );
    case 'maryjanes':
      return (
        <g>
          <ellipse cx={cx} cy={80.4 + dy} rx={4.8} ry={2.8} fill={color} {...s} />
          <path d={`M${cx - 3} ${78.1 + dy} h6`} stroke={OL} strokeWidth={1.4} />
        </g>
      );
    case 'slippers':
      return (
        <g>
          <ellipse cx={cx} cy={80.4 + dy} rx={6} ry={3.4} fill={color} {...s} />
          <circle cx={cx + 2} cy={78.4 + dy} r={2} fill="#fffaf2" {...thin} strokeWidth={1.2} />
        </g>
      );
    default:
      return (
        <g>
          <rect x={cx - 4.4} y={74 + dy} width={8.8} height={6.5} rx={1.5} fill={color} {...s} />
          <ellipse cx={cx + 0.4} cy={80.5 + dy} rx={5.2} ry={3} fill={color} {...s} />
        </g>
      );
  }
}

function TopDetail({ look }: { look: Look }) {
  switch (look.topStyle) {
    case 'sweater':
      return (
        <g>
          <path d="M21.2 53.5 h21.6 M20.6 58 h22.8" stroke="rgba(255,255,255,.62)" strokeWidth={2.2} />
          <path d="M27 49 q5 3 10 0" fill="none" {...thin} />
        </g>
      );
    case 'cardigan':
      return (
        <g>
          <path d="M28 48.6 L32 56 L36 48.6 Z" fill="#fffaf2" {...thin} />
          <path d="M32 56 V63.5" {...thin} />
          <circle cx="30" cy="58.5" r="0.9" fill={OL} />
          <circle cx="30" cy="61.5" r="0.9" fill={OL} />
        </g>
      );
    case 'sailor':
      return (
        <g>
          <path d="M23 49.5 L32 56 L41 49.5 L39 48 L32 52.5 L25 48 Z" fill="#fffaf2" {...thin} />
          <path d="M29 55.5 l3 1.5 l3 -1.5 v3.5 l-3 -1.5 l-3 1.5 z" fill="#e5574f" {...thin} strokeWidth={1.1} />
        </g>
      );
    case 'hoodie':
      return (
        <g>
          <rect x="26" y="56" width="12" height="5" rx="2" fill="rgba(91,58,41,.1)" {...thin} strokeWidth={1.1} />
          <path d="M29.5 49.5 v4.5 M34.5 49.5 v4.5" stroke="#fffaf2" strokeWidth={1.4} />
        </g>
      );
    case 'apron':
      return (
        <g>
          <path d="M25 51 L23 48.5 M39 51 L41 48.5" {...thin} />
          <path d="M25 50.5 h14 v12 h-14 z" fill="#fffaf2" {...thin} />
          <path d={heartPath(32, 54.5, 0.38)} fill="#f4917a" />
        </g>
      );
    default:
      return (
        <g>
          <circle cx="32" cy="54" r="1.6" fill="#f4917a" />
          <circle cx="32" cy="59" r="1.6" fill="#f4917a" />
        </g>
      );
  }
}

function Eyewear({ kind }: { kind: Look['eyewear'] }) {
  switch (kind) {
    case 'round':
      return (
        <g fill="rgba(255,255,255,.25)" stroke={OL} strokeWidth={1.8}>
          <circle cx="25" cy="33" r="5.3" />
          <circle cx="39" cy="33" r="5.3" />
          <path d="M30.3 33 h3.4" />
        </g>
      );
    case 'sunnies':
      return (
        <g>
          <rect x="19.5" y="29.5" width="11" height="7" rx="2.5" fill="#3e3533" {...thin} />
          <rect x="33.5" y="29.5" width="11" height="7" rx="2.5" fill="#3e3533" {...thin} />
          <path d="M30.5 32 h3" {...thin} />
          <path d="M21.5 31.5 l2 -1 M35.5 31.5 l2 -1" stroke="#fffaf2" strokeWidth={1} />
        </g>
      );
    case 'hearts':
      return (
        <g>
          <path d={heartPath(25, 32, 1.05)} fill="rgba(244,145,122,.8)" {...thin} />
          <path d={heartPath(39, 32, 1.05)} fill="rgba(244,145,122,.8)" {...thin} />
          <path d="M29.8 31.5 h4.4" {...thin} />
        </g>
      );
    case 'star':
      return (
        <g>
          <path d={starPath(25, 33, 6)} fill="rgba(255,216,77,.85)" {...thin} />
          <path d={starPath(39, 33, 6)} fill="rgba(255,216,77,.85)" {...thin} />
          <path d="M30 33 h4" {...thin} />
        </g>
      );
    default:
      return null;
  }
}

function GEyes({ expr }: { expr: GExpr }) {
  if (expr === 'happy')
    return (
      <g fill="none" {...s}>
        <path d="M22.5 34 q2.5 -3.5 5 0" />
        <path d="M36.5 34 q2.5 -3.5 5 0" />
      </g>
    );
  if (expr === 'soft')
    return (
      <g fill="none" {...s}>
        <path d="M22.5 32.5 q2.5 3 5 0" />
        <path d="M36.5 32.5 q2.5 3 5 0" />
      </g>
    );
  if (expr === 'smug')
    return (
      <g {...s} fill="none">
        <path d="M22 33 h6" />
        <path d="M36 33 h6" />
        <ellipse cx="25" cy="34.5" rx="1.4" ry="1.2" fill={OL} />
        <ellipse cx="39" cy="34.5" rx="1.4" ry="1.2" fill={OL} />
      </g>
    );
  if (expr === 'angry')
    return (
      <g {...s}>
        <path d="M22 29.5 l5 2" fill="none" />
        <path d="M42 29.5 l-5 2" fill="none" />
        <ellipse cx="25" cy="34" rx="1.7" ry="2.3" fill={OL} />
        <ellipse cx="39" cy="34" rx="1.7" ry="2.3" fill={OL} />
      </g>
    );
  return (
    <g fill={OL}>
      <ellipse cx="25" cy="33.5" rx="1.9" ry="2.7" />
      <ellipse cx="39" cy="33.5" rx="1.9" ry="2.7" />
    </g>
  );
}

function GMouth({ expr }: { expr: GExpr }) {
  if (expr === 'happy' || expr === 'soft') return <path d="M30 39.5 q2 2 4 0" fill="none" {...s} strokeWidth={1.6} />;
  if (expr === 'angry') return <path d="M30 40.5 q2 -1.6 4 0" fill="none" {...s} strokeWidth={1.6} />;
  if (expr === 'smug') return <path d="M29.5 39.5 q3 1.5 5 -1" fill="none" {...s} strokeWidth={1.6} />;
  return <path d="M31 39.5 h2" {...s} strokeWidth={1.6} />;
}

function GHat({ hat }: { hat: Look['hat'] }) {
  switch (hat) {
    case 'duck':
      return (
        <g>
          <ellipse cx="32" cy="9" rx="11" ry="8.5" fill="#ffd84d" {...s} />
          <path d="M24 12 q8 7 16 0 q-8 3 -16 0 z" fill="#f08a3c" {...s} />
          <circle cx="27.5" cy="7" r="1.3" fill={OL} />
          <circle cx="36.5" cy="7" r="1.3" fill={OL} />
        </g>
      );
    case 'santa':
      return (
        <g>
          <path d="M18 14 Q30 -6 46 8 L44 14 Z" fill="#e5574f" {...s} />
          <rect x="16" y="11" width="30" height="6" rx="3" fill="#fff" {...s} />
          <circle cx="47" cy="7" r="4" fill="#fff" {...s} />
        </g>
      );
    case 'beret':
      return (
        <g>
          <ellipse cx="30" cy="11" rx="16" ry="6" fill="#e5574f" {...s} />
          <path d="M30 5 v-3" {...s} />
        </g>
      );
    case 'catears':
      return (
        <g>
          <path d="M16 16 L17 2 L27 10 Z" fill="#3d2a22" {...s} />
          <path d="M48 16 L47 2 L37 10 Z" fill="#3d2a22" {...s} />
          <path d="M18.5 12 L19 6 L23.5 10 Z M45.5 12 L45 6 L40.5 10 Z" fill="#f6b8c8" />
        </g>
      );
    case 'bow':
      return (
        <g transform="translate(44 12)">
          <path d="M0 0 L-9 -6 L-9 6 Z M0 0 L9 -6 L9 6 Z" fill="#f4917a" {...s} />
          <circle cx="0" cy="0" r="2.6" fill="#f4917a" {...s} />
        </g>
      );
    case 'froghat':
      return (
        <g>
          <ellipse cx="32" cy="10" rx="14" ry="8" fill="#9cc47f" {...s} />
          <circle cx="24" cy="4" r="4.5" fill="#fff" {...s} />
          <circle cx="40" cy="4" r="4.5" fill="#fff" {...s} />
          <circle cx="24" cy="4" r="1.8" fill={OL} />
          <circle cx="40" cy="4" r="1.8" fill={OL} />
          <path d="M28 12 q4 3 8 0" fill="none" {...s} strokeWidth={1.6} />
        </g>
      );
    case 'strawberry':
      return (
        <g>
          <path d="M17 16 Q17 0 32 0 Q47 0 47 16 Z" fill="#e5574f" {...s} />
          {[[24, 6], [30, 4], [37, 6.5], [27, 11], [34, 10.5], [41, 12], [21, 12]].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width={1.7} height={1.7} fill="#fff3b0" />
          ))}
          <path d="M26.5 1.5 l5.5 -5 l5.5 5 l-5.5 2.2 z" fill="#9cc47f" {...thin} />
        </g>
      );
    case 'flowers':
      return <FlowerCrown x0={15} x1={49} y={14} />;
    case 'headphones':
      return (
        <g>
          <path d="M12.5 30 Q11 5 32 5 Q53 5 51.5 30" fill="none" stroke={OL} strokeWidth={5.5} />
          <path d="M12.5 30 Q11 5 32 5 Q53 5 51.5 30" fill="none" stroke="#f4917a" strokeWidth={3} />
          <rect x="8" y="24" width="8" height="13" rx="3" fill="#f4917a" {...s} />
          <rect x="48" y="24" width="8" height="13" rx="3" fill="#f4917a" {...s} />
        </g>
      );
    case 'bunny':
      return (
        <g>
          <ellipse cx="24" cy="-1" rx="4.5" ry="11" fill="#fffaf2" {...s} />
          <ellipse cx="40" cy="-1" rx="4.5" ry="11" fill="#fffaf2" {...s} />
          <ellipse cx="24" cy="0" rx="2" ry="7" fill="#f6b8c8" />
          <ellipse cx="40" cy="0" rx="2" ry="7" fill="#f6b8c8" />
        </g>
      );
    case 'chef':
      return (
        <g>
          <path d="M20 16 L20 8 Q14 6 17 0 Q20 -5 26 -2 Q30 -7 36 -3 Q42 -6 45 -1 Q49 4 44 8 L44 16 Z" fill="#fffaf2" {...s} />
          <rect x="19" y="11" width="26" height="6" rx="1" fill="#fffaf2" {...s} />
        </g>
      );
    case 'crown':
      return (
        <g>
          <path d="M20 15 L21 3 L26.5 9 L32 1 L37.5 9 L43 3 L44 15 Z" fill="#ffd84d" {...s} />
          <circle cx="26.5" cy="12" r="1.5" fill="#e5574f" />
          <circle cx="32" cy="11" r="1.6" fill="#a7d3f2" />
          <circle cx="37.5" cy="12" r="1.5" fill="#9cc47f" />
        </g>
      );
    default:
      return null;
  }
}

/* ================================ ROHIO ================================ */
export type RPose = 'normal' | 'flex';

export function Rohio({
  look, expr = 'normal', carrying, quality, step = 0, tripped = false, pose = 'normal',
}: { look: RohioLook; expr?: RExpr; carrying?: DrinkId | null; quality?: CupQuality; step?: number; tripped?: boolean; pose?: RPose }) {
  const hair = look.hairColor || '#c96f36';
  const legL = Math.sin(step) * 2.2;
  const longPants = look.pants !== 'shorts';
  const legFill = longPants ? look.pantsColor : SKIN;
  const tank = look.topStyle === 'tank';
  const armFill = tank ? SKIN : look.hoodie;
  return (
    <svg
      viewBox="0 0 70 100"
      width={70}
      height={100}
      style={{ overflow: 'visible', transform: tripped ? 'rotate(-75deg) translate(-20px,10px)' : undefined, transformOrigin: '35px 95px', transition: 'transform .2s' }}
    >
      <ellipse cx="35" cy="96" rx="16" ry="3.5" fill="rgba(91,58,41,.18)" />
      {/* legs */}
      <rect x="27" y={(longPants ? 72 : 76) + legL} width="6" height={longPants ? 17 : 13} rx="1" fill={legFill} {...s} />
      <rect x="37" y={(longPants ? 72 : 76) - legL} width="6" height={longPants ? 17 : 13} rx="1" fill={legFill} {...s} />
      {look.pants === 'jeans' && <path d={`M30 ${75 + legL} v12 M40 ${75 - legL} v12`} stroke="rgba(255,255,255,.4)" strokeWidth={1} />}
      <path d={`M24 ${88 + legL} h10 v3.5 h-11 z`} fill="#fff" {...s} />
      <path d={`M36 ${88 - legL} h10 v3.5 h-10 z`} fill="#fff" {...s} />
      {/* pants top */}
      {longPants ? (
        <path d="M25 70 h20 l0.6 6 h-21.2 z" fill={look.pantsColor} {...s} />
      ) : (
        <path d="M25 70 h20 l1 9 h-9 l-2 -3 l-2 3 h-9 z" fill={look.pantsColor} {...s} />
      )}

      {/* body */}
      {tank ? <path d="M24 72 Q23 54 35 54 Q47 54 46 72 Z" fill={look.hoodie} {...s} /> : <path d="M21 72 Q19 52 35 52 Q51 52 49 72 Z" fill={look.hoodie} {...s} />}
      {tank && pose !== 'flex' && (
        <g>
          <path d="M25 57 L20 69 M45 57 L50 69" stroke={OL} strokeWidth={8.2} strokeLinecap="round" />
          <path d="M25 57 L20 69 M45 57 L50 69" stroke={SKIN} strokeWidth={5.4} strokeLinecap="round" />
        </g>
      )}
      <RTopDetail look={look} />
      {look.apron !== 'none' && (
        <g>
          <path d="M27 58 h16 v15 h-16 z" fill={look.apron} {...s} />
          <path d="M29 58 L27 53 M41 58 L43 53" {...s} />
          <circle cx="35" cy="64" r="2" fill="#f6d7a7" />
        </g>
      )}
      {look.extra === 'scarf' && (
        <g>
          <path d="M21.5 52 Q35 58.5 48.5 52 L48.8 55.6 Q35 62 21.2 55.6 Z" fill="#9cc47f" {...thin} />
          <path d="M41 56.5 l3.5 8 l-4.5 0.4 l-1.8 -7.6 z" fill="#9cc47f" {...thin} />
        </g>
      )}

      {/* arms / hands */}
      {pose === 'flex' ? (
        <g>
          <path d="M24 57 L14 61 L13 50.5 M46 57 L56 61 L57 50.5" fill="none" stroke={OL} strokeWidth={8.4} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M24 57 L14 61 L13 50.5 M46 57 L56 61 L57 50.5" fill="none" stroke={armFill} strokeWidth={5.6} strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="15.5" cy="56.5" r="3.2" fill={armFill} {...thin} />
          <circle cx="54.5" cy="56.5" r="3.2" fill={armFill} {...thin} />
          <circle cx="13" cy="49" r="3.6" fill={SKIN} {...s} />
          <circle cx="57" cy="49" r="3.6" fill={SKIN} {...s} />
        </g>
      ) : (
        <g>
          <circle cx="19.5" cy="69" r="3.6" fill={SKIN} {...s} />
          {!carrying && <circle cx="50.5" cy="69" r="3.6" fill={SKIN} {...s} />}
        </g>
      )}

      {/* head */}
      {look.hair === 'wolf' && <path d="M18 34 Q15 47 23 51 L47 51 Q55 47 52 34 Z" fill={hair} {...s} />}
      {look.hat === 'catears' && (
        <g>
          <path d="M16 20 L16 5 L27 12 Z" fill="#fff" {...s} />
          <path d="M54 20 L54 5 L43 12 Z" fill="#fff" {...s} />
          <path d="M18 15 L18.5 9 L23 12 Z M52 15 L51.5 9 L47 12 Z" fill="#f6b8c8" />
        </g>
      )}
      <ellipse cx="35" cy="34" rx="17" ry="16" fill={SKIN} {...s} />
      <RHair style={look.hair} color={hair} />
      <REyes expr={expr} />
      <ellipse cx="22.5" cy="40" rx="3.4" ry="2" fill={BLUSH} opacity={expr === 'flustered' || expr === 'love' ? 1 : 0.75} />
      <ellipse cx="47.5" cy="40" rx="3.4" ry="2" fill={BLUSH} opacity={expr === 'flustered' || expr === 'love' ? 1 : 0.75} />
      {(expr === 'flustered' || expr === 'love') && (
        <g stroke="#e5574f" strokeWidth={1.3}>
          <path d="M20 38.5 l2 3 M23 38.5 l2 3 M46 38.5 l2 3 M49 38.5 l2 3" />
        </g>
      )}
      <RMouth expr={expr} />
      {look.extra === 'bandaid' && (
        <g transform="rotate(-22 46 37)">
          <rect x="42" y="35.2" width="8.5" height="3.8" rx="1.6" fill="#f6d7a7" {...thin} strokeWidth={1.1} />
          <circle cx="45.2" cy="37.1" r="0.45" fill={OL} />
          <circle cx="47.3" cy="37.1" r="0.45" fill={OL} />
        </g>
      )}
      {look.extra === 'glasses' && (
        <g fill="rgba(255,255,255,.2)" stroke={OL} strokeWidth={1.8}>
          <circle cx="27" cy="35" r="5.4" />
          <circle cx="43" cy="35" r="5.4" />
          <path d="M32.4 35 h5.2" />
        </g>
      )}
      {look.extra === 'sunnies' && (
        <g>
          <rect x="21" y="31.5" width="12" height="7" rx="2.4" fill="#3e3533" {...thin} />
          <rect x="37" y="31.5" width="12" height="7" rx="2.4" fill="#3e3533" {...thin} />
          <path d="M33 34 h4" {...thin} />
          <path d="M23 33.5 l2 -1 M39 33.5 l2 -1" stroke="#fffaf2" strokeWidth={1} />
        </g>
      )}
      {look.extra === 'earring' && <circle cx="18.3" cy="41" r="1.7" fill="#ffd84d" {...thin} strokeWidth={1} />}
      <RHat hat={look.hat} />
      {carrying && pose !== 'flex' && <Carry drink={carrying} x={42} y={54} quality={quality} />}
    </svg>
  );
}

function RTopDetail({ look }: { look: RohioLook }) {
  switch (look.topStyle) {
    case 'sweater':
      return (
        <g>
          <path d="M23.5 60 h23 M22.6 65.5 h24.8" stroke="rgba(255,255,255,.58)" strokeWidth={2.2} />
          <path d="M30 52.6 q5 3 10 0" fill="none" {...thin} />
        </g>
      );
    case 'shirt':
      return (
        <g>
          <path d="M29.5 52.3 L35 57.5 L32.5 52.3 Z M40.5 52.3 L35 57.5 L37.5 52.3 Z" fill="#fffaf2" {...thin} />
          <path d="M34 57 h2 l1.4 9 l-2.4 2 l-2.4 -2 z" fill="#e5574f" {...thin} strokeWidth={1.1} />
        </g>
      );
    case 'varsity':
      return (
        <g>
          <path d="M21.7 69.6 h26.6" stroke="#fffaf2" strokeWidth={3} />
          <path d="M28 52.8 q7 4 14 0" fill="none" stroke="#fffaf2" strokeWidth={2} />
          <rect x="37.5" y="58.5" width="6.5" height="7" rx="1" fill="#fffaf2" {...thin} strokeWidth={1} />
          <path d="M39.2 64 v-4.2 h2 a1.2 1.2 0 0 1 0 2.4 h-2 l2.6 1.8" fill="none" stroke="#e5574f" strokeWidth={1.1} />
        </g>
      );
    case 'tank':
      return <path d="M29 54.5 q6 5 12 0" fill="none" {...thin} />;
    default:
      return <path d="M32 54 v5 M38 54 v5" stroke="#fffaf2" strokeWidth={1.5} />;
  }
}

function RHair({ style, color }: { style: RohioLook['hair']; color: string }) {
  switch (style) {
    case 'messy':
      return <path d="M17 33 L15 20 L21 18 L19 9 L27 12 L30 3 L36 9 L42 2 L45 10 L53 8 L51 17 L57 21 L53 33 Q49 25 44 23 Q41 28 36 24 Q31 28 27 24 Q22 27 17 33 Z" fill={color} {...s} />;
    case 'curtain':
      return (
        <g>
          <path d="M17 34 Q14 13 35 10 Q56 13 53 34 Q52 22 45 19 Q40 20 36.5 15 L35 18 L33.5 15 Q30 20 25 19 Q18 22 17 34 Z" fill={color} {...s} />
        </g>
      );
    case 'buzz':
      return <path d="M18.5 31 Q18 16 35 16 Q52 16 51.5 31 Q47 23 35 22 Q23 23 18.5 31 Z" fill={color} {...s} />;
    default:
      return (
        <g>
          <path
            d="M17 33 Q14 20 20 14 Q19 8 26 9 Q29 3 35 6 Q41 2 44 8 Q52 7 51 14 Q57 20 53 33 Q50 24 45 22 Q44 27 39 24 Q36 28 32 24 Q27 28 24 23 Q20 26 17 33 Z"
            fill={color}
            {...s}
          />
          <path d="M33 6 q2 -6 7 -5" fill="none" {...s} />
        </g>
      );
  }
}

function RHat({ hat }: { hat: RohioLook['hat'] }) {
  switch (hat) {
    case 'santa':
      return (
        <g>
          <path d="M19 16 Q33 -8 51 10 L49 16 Z" fill="#e5574f" {...s} />
          <rect x="17" y="13" width="35" height="6" rx="3" fill="#fff" {...s} />
          <circle cx="52" cy="9" r="4" fill="#fff" {...s} />
        </g>
      );
    case 'cap':
      return (
        <g>
          <path d="M19 18 Q20 4 35 4 Q50 4 51 18 Z" fill="#8fbfe6" {...s} />
          <path d="M45 16 q10 0 13 4 h-14 z" fill="#8fbfe6" {...s} />
        </g>
      );
    case 'beanie':
      return (
        <g>
          <path d="M18 23 Q17 4 35 4 Q53 4 52 23 Z" fill="#f4917a" {...s} />
          <rect x="17" y="18" width="36" height="6.5" rx="2" fill="#f4917a" {...s} />
          <path d="M23 18.5 v5.5 M29 18.5 v5.5 M35 18.5 v5.5 M41 18.5 v5.5 M47 18.5 v5.5" stroke="rgba(91,58,41,.35)" strokeWidth={1} />
          <circle cx="35" cy="3" r="4" fill="#fffaf2" {...s} />
        </g>
      );
    case 'headband':
      return (
        <g>
          <path d="M17.5 24 Q35 14 52.5 24" fill="none" stroke={OL} strokeWidth={5.6} />
          <path d="M17.5 24 Q35 14 52.5 24" fill="none" stroke="#e5574f" strokeWidth={3.4} />
          <path d="M20 23 Q35 15.2 50 23" fill="none" stroke="#fffaf2" strokeWidth={0.9} />
        </g>
      );
    case 'bucket':
      return (
        <g>
          <path d="M21 20 Q22 6 35 6 Q48 6 49 20 Z" fill="#f6d7a7" {...s} />
          <ellipse cx="35" cy="20" rx="21" ry="4.2" fill="#f6d7a7" {...s} />
          <path d="M22 16 h26" stroke="#c98a5a" strokeWidth={1.4} />
        </g>
      );
    case 'flowers':
      return <FlowerCrown x0={18} x1={52} y={16} dip={5} />;
    case 'chef':
      return (
        <g>
          <path d="M21 18 L21 10 Q14 8 18 1 Q22 -4 28 -1 Q32 -6 38 -2 Q44 -5 48 0 Q53 6 47 10 L47 18 Z" fill="#fffaf2" {...s} />
          <rect x="20" y="13" width="28" height="6" rx="1" fill="#fffaf2" {...s} />
        </g>
      );
    default:
      return null;
  }
}

function REyes({ expr }: { expr: RExpr }) {
  switch (expr) {
    case 'happy':
      return (
        <g fill="none" {...s}>
          <path d="M24 36 q3 -4 6 0" />
          <path d="M40 36 q3 -4 6 0" />
        </g>
      );
    case 'pout':
      return (
        <g {...s} fill="none">
          <path d="M24 35 h6" />
          <path d="M40 35 h6" />
          <path d="M23 30 l6 1.5 M47 30 l-6 1.5" />
        </g>
      );
    case 'hurt':
      return (
        <g fill="none" {...s}>
          <path d="M24 32 l5 3 l-5 3" />
          <path d="M46 32 l-5 3 l5 3" />
        </g>
      );
    case 'love':
      return (
        <g fill="#e5574f" stroke={OL} strokeWidth={1.2}>
          <path d="M27 38 l-3.5 -3.5 a2 2 0 0 1 3.5 -2.4 a2 2 0 0 1 3.5 2.4 z" />
          <path d="M43 38 l-3.5 -3.5 a2 2 0 0 1 3.5 -2.4 a2 2 0 0 1 3.5 2.4 z" />
        </g>
      );
    case 'shocked':
      return (
        <g fill="#fff" {...s}>
          <circle cx="27" cy="35" r="3.2" />
          <circle cx="43" cy="35" r="3.2" />
          <circle cx="27" cy="35" r="1.2" fill={OL} />
          <circle cx="43" cy="35" r="1.2" fill={OL} />
        </g>
      );
    case 'flustered':
      return (
        <g fill="none" {...s}>
          <path d="M24 33 l5 2 l-5 2" />
          <path d="M46 33 l-5 2 l5 2" />
        </g>
      );
    default:
      return (
        <g>
          <ellipse cx="27" cy="35" rx="2.3" ry="3.6" fill="#f08a3c" stroke={OL} strokeWidth={1.4} />
          <ellipse cx="43" cy="35" rx="2.3" ry="3.6" fill="#f08a3c" stroke={OL} strokeWidth={1.4} />
          <path d="M27 32 v4 M43 32 v4" stroke={OL} strokeWidth={1.2} />
        </g>
      );
  }
}

function RMouth({ expr }: { expr: RExpr }) {
  if (expr === 'happy' || expr === 'love') return <path d="M32 42 q3 3 6 0" fill="none" {...s} strokeWidth={1.7} />;
  if (expr === 'shocked') return <ellipse cx="35" cy="43" rx="2" ry="2.5" fill={OL} />;
  if (expr === 'pout') return <path d="M33 43 q2 -2 4 0" fill="none" {...s} strokeWidth={1.7} />;
  if (expr === 'hurt') return <path d="M32 43 q1.5 -2 3 0 q1.5 2 3 0" fill="none" {...s} strokeWidth={1.7} />;
  if (expr === 'flustered') return <path d="M32 43 q1.5 -1.5 3 0 q1.5 1.5 3 0" fill="none" {...s} strokeWidth={1.7} />;
  return <path d="M33.5 42.5 h3" {...s} strokeWidth={1.7} />;
}
