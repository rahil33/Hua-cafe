import { useState, type ReactNode } from 'react';
import type { Look, RohioLook } from './data';
import type { Save } from './save';
import { Goldfish, Rohio } from './characters';
import { Modal } from './Panels';
import { PixelIcon, type IconName } from './icons';
import { G_COLORS, G_OPTS, PRESETS, R_COLORS, R_OPTS, itemKey, owns, randomOutfit, type GCat, type Opt, type RCat, type Who } from './outfits';

type CatDef = { cat: string; label: string; crop: [number, number] };
type Tab = { id: string; label: string; icon: IconName; cats: CatDef[]; colors: { field: string; label: string; list: string[] }[] };

const G_TABS: Tab[] = [
  { id: 'hair', label: 'Hair', icon: 'hair', cats: [{ cat: 'hair', label: 'Hairstyle', crop: [-8, 70] }], colors: [{ field: 'hairColor', label: 'Hair colour', list: G_COLORS.hairColor }] },
  { id: 'hat', label: 'Hats', icon: 'hat', cats: [{ cat: 'hat', label: 'Hats & headwear', crop: [-12, 50] }], colors: [] },
  { id: 'top', label: 'Tops', icon: 'shirt', cats: [{ cat: 'topStyle', label: 'Top style', crop: [40, 36] }], colors: [{ field: 'top', label: 'Top colour', list: G_COLORS.top }] },
  { id: 'bottom', label: 'Bottoms', icon: 'pants', cats: [{ cat: 'bottom', label: 'Bottom style', crop: [48, 40] }], colors: [{ field: 'skirt', label: 'Bottom colour', list: G_COLORS.skirt }] },
  { id: 'shoes', label: 'Shoes', icon: 'shoe', cats: [{ cat: 'shoes', label: 'Shoes', crop: [62, 28] }], colors: [{ field: 'shoeColor', label: 'Shoe colour', list: G_COLORS.shoeColor }] },
  {
    id: 'extra', label: 'Extras', icon: 'glasses',
    cats: [
      { cat: 'eyewear', label: 'Eyewear', crop: [16, 32] },
      { cat: 'accessory', label: 'Accessories', crop: [12, 62] },
      { cat: 'cheeks', label: 'Cheeks', crop: [20, 28] },
    ],
    colors: [],
  },
];

const R_TABS: Tab[] = [
  { id: 'hair', label: 'Hair', icon: 'hair', cats: [{ cat: 'hair', label: 'Hairstyle', crop: [0, 56] }], colors: [{ field: 'hairColor', label: 'Hair colour', list: R_COLORS.hairColor }] },
  { id: 'hat', label: 'Hats', icon: 'hat', cats: [{ cat: 'hat', label: 'Hats & headwear', crop: [-10, 50] }], colors: [] },
  {
    id: 'top', label: 'Tops', icon: 'shirt', cats: [{ cat: 'topStyle', label: 'Top style', crop: [44, 40] }],
    colors: [{ field: 'hoodie', label: 'Top colour', list: R_COLORS.hoodie }, { field: 'apron', label: 'Apron', list: R_COLORS.apron }],
  },
  { id: 'pants', label: 'Pants', icon: 'pants', cats: [{ cat: 'pants', label: 'Pants style', crop: [64, 36] }], colors: [{ field: 'pantsColor', label: 'Pants colour', list: R_COLORS.pantsColor }] },
  { id: 'extra', label: 'Extras', icon: 'glasses', cats: [{ cat: 'extra', label: 'Face & neck', crop: [14, 50] }], colors: [] },
];

type Trial = { who: Who; cat: string; id: string; cost: number; label: string };

export function WardrobePanel({ save, setSave, onClose }: { save: Save; setSave: (f: (s: Save) => Save) => void; onClose: () => void }) {
  const [who, setWho] = useState<Who>('g');
  const [tab, setTab] = useState('hair');
  const [trial, setTrial] = useState<Trial | null>(null);
  const [msg, setMsg] = useState('');
  const tabs = who === 'g' ? G_TABS : R_TABS;
  const current = tabs.find((t) => t.id === tab) || tabs[0];

  const previewLook: Look = trial?.who === 'g' ? ({ ...save.look, [trial.cat]: trial.id } as Look) : save.look;
  const previewR: RohioLook = trial?.who === 'r' ? ({ ...save.rlook, [trial.cat]: trial.id } as RohioLook) : save.rlook;

  const flash = (t: string) => {
    setMsg(t);
    window.setTimeout(() => setMsg((m) => (m === t ? '' : m)), 2200);
  };
  const setField = (w: Who, field: string, value: string) =>
    setSave((s) => (w === 'g' ? { ...s, look: { ...s.look, [field]: value } as Look } : { ...s, rlook: { ...s.rlook, [field]: value } as RohioLook }));

  const choose = (cat: string, opt: Opt) => {
    if (owns(save.owned, who, cat, opt.id)) {
      setField(who, cat, opt.id);
      setTrial(null);
    } else setTrial({ who, cat, id: opt.id, cost: opt.cost, label: opt.label });
  };

  const buy = () => {
    if (!trial) return;
    if (save.coins < trial.cost) return flash(`You need ${trial.cost - save.coins} more fish.`);
    const tr = trial;
    setSave((s) => {
      const next = { ...s, coins: s.coins - tr.cost, owned: [...s.owned, itemKey(tr.who, tr.cat, tr.id)] };
      return tr.who === 'g' ? { ...next, look: { ...next.look, [tr.cat]: tr.id } as Look } : { ...next, rlook: { ...next.rlook, [tr.cat]: tr.id } as RohioLook };
    });
    setTrial(null);
    flash(`${tr.label} unlocked and equipped!`);
  };

  const applyPreset = (p: (typeof PRESETS)[number]) => {
    let skipped = 0;
    const look = { ...save.look } as Record<string, string>;
    const rlook = { ...save.rlook } as Record<string, string>;
    Object.entries(p.look).forEach(([k, v]) => (k in G_OPTS && !owns(save.owned, 'g', k, v as string) ? skipped++ : (look[k] = v as string)));
    Object.entries(p.rlook).forEach(([k, v]) => (k in R_OPTS && !owns(save.owned, 'r', k, v as string) ? skipped++ : (rlook[k] = v as string)));
    setSave((s) => ({ ...s, look: look as unknown as Look, rlook: rlook as unknown as RohioLook }));
    setTrial(null);
    flash(skipped ? `Applied! ${skipped} locked item${skipped > 1 ? 's were' : ' was'} skipped.` : `${p.name} applied!`);
  };

  return (
    <Modal onClose={onClose} title="Wardrobe">
      {/* who + wallet strip */}
      <div className="flex shrink-0 items-center gap-1.5 border-b-[3px] border-[#5b3a29] bg-[#fdf8ef] px-3 py-2">
        <span className="mr-1 text-sm opacity-70">Dressing:</span>
        {(['g', 'r'] as Who[]).map((w) => (
          <button key={w} onClick={() => { setWho(w); setTab('hair'); setTrial(null); }} className={`nameplate px-2 py-0.5 text-[11px] ${who === w ? (w === 'g' ? 'nameplate-goldfish' : 'nameplate-rohio') : 'bg-[#fffaf2] opacity-70'}`}>
            {w === 'g' ? 'GOLDFISH' : 'ROHIO'}
          </button>
        ))}
        <div className="pill ml-auto flex items-center gap-1 px-2 text-sm"><PixelIcon name="fish" size={18} />{save.coins}</div>
      </div>

      {/* preview stage */}
      <div className="wardrobe-preview relative flex shrink-0 items-end justify-center pb-5" style={{ backgroundImage: 'linear-gradient(#fde9c9 0 60%, #f2c6a4 60%)' }}>
        <div className="absolute bottom-3 left-1/2 h-7 w-64 -translate-x-1/2 rounded-[50%] border-[3px] border-[#e08f7a] bg-[#f6a99a]" />
        <button onClick={() => { setWho('g'); setTab('hair'); setTrial(null); }} className="prev-g relative" style={{ opacity: who === 'g' ? 1 : 0.55 }}>
          <Goldfish look={previewLook} expr="happy" />
        </button>
        <button onClick={() => { setWho('r'); setTab('hair'); setTrial(null); }} className="prev-r relative" style={{ opacity: who === 'r' ? 1 : 0.55 }}>
          <Rohio look={previewR} expr="flustered" />
        </button>
      </div>

      {/* try-on bar */}
      {(trial || msg) && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-y-[3px] border-[#5b3a29] bg-[#fff3bd] px-3 py-2 text-sm">
          {trial ? (
            <>
              <PixelIcon name="lock" size={18} />
              <span>Trying on <b>{trial.label}</b></span>
              <button onClick={buy} disabled={save.coins < trial.cost} className="btn ml-auto flex items-center gap-1 bg-[#9cc47f] px-3 py-0.5 text-white disabled:opacity-50">
                Buy & wear · <PixelIcon name="fish" size={16} />{trial.cost}
              </button>
              <button onClick={() => setTrial(null)} className="btn bg-[#fffaf2] px-2 py-0.5">Cancel</button>
              {save.coins < trial.cost && <span className="w-full text-xs opacity-75">Need {trial.cost - save.coins} more fish. Serve visitors or complete goals!</span>}
            </>
          ) : (
            <span>{msg}</span>
          )}
        </div>
      )}

      {/* tabs */}
      <div className="flex shrink-0 gap-1 overflow-x-auto px-3 pt-3">
        {[...tabs.map((t) => ({ id: t.id, label: t.label, icon: t.icon })), { id: 'outfits', label: 'Outfits', icon: 'save' as IconName }].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex min-w-[64px] flex-1 flex-col items-center rounded-t-2xl border-[3px] border-b-0 border-[#5b3a29] px-1 py-1 text-[11px] ${tab === t.id ? 'bg-[#fdf8ef]' : 'bg-[#f6a99a]'}`}>
            <PixelIcon name={t.icon} size={20} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="scroll-soft min-h-0 flex-1 overflow-y-auto border-t-[3px] border-[#5b3a29] p-4 pb-10">
        {tab === 'outfits' ? (
          <OutfitsTab save={save} setSave={setSave} applyPreset={applyPreset} flash={flash} />
        ) : (
          <>
            {current.cats.map((c) => {
              const opts = who === 'g' ? G_OPTS[c.cat as GCat] : R_OPTS[c.cat as RCat];
              const equipped = (who === 'g' ? (save.look as Record<string, string>) : (save.rlook as Record<string, string>))[c.cat];
              return (
                <Section key={c.cat} title={c.label}>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {opts.map((opt) => {
                      const has = owns(save.owned, who, c.cat, opt.id);
                      const on = equipped === opt.id;
                      const trying = trial?.cat === c.cat && trial.id === opt.id && trial.who === who;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => choose(c.cat, opt)}
                          className={`relative flex flex-col items-center rounded-2xl border-[3px] p-1.5 ${on ? 'border-[#f08a6c] bg-[#fde7df]' : trying ? 'border-[#ffd84d] bg-[#fff8dc]' : 'border-transparent bg-[#efe8dc]'}`}
                        >
                          <Crop who={who} crop={c.crop}>
                            {who === 'g' ? <Goldfish look={{ ...save.look, [c.cat]: opt.id } as Look} /> : <Rohio look={{ ...save.rlook, [c.cat]: opt.id } as RohioLook} />}
                          </Crop>
                          <span className="mt-0.5 text-center text-[11px] leading-tight">{opt.label}</span>
                          {!has && (
                            <span className="absolute -right-1 -top-1 flex items-center gap-0.5 rounded-full border-2 border-[#5b3a29] bg-[#ffd567] px-1 text-[10px]">
                              <PixelIcon name="fish" size={12} />{opt.cost}
                            </span>
                          )}
                          {on && <span className="absolute -left-1 -top-1 grid h-5 w-5 place-items-center rounded-full border-2 border-[#5b3a29] bg-[#9cc47f] text-[10px] text-white">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </Section>
              );
            })}
            {current.colors.map((col) => {
              const value = (who === 'g' ? (save.look as Record<string, string>) : (save.rlook as Record<string, string>))[col.field];
              return (
                <Section key={col.field} title={col.label}>
                  <div className="flex flex-wrap gap-2">
                    {col.list.map((c) => (
                      <button
                        key={c}
                        onClick={() => setField(who, col.field, c)}
                        title={c === 'none' ? 'No apron' : c}
                        className={`relative grid h-10 w-10 place-items-center rounded-full border-[3px] ${value === c ? 'border-[#f08a6c] ring-2 ring-[#f08a6c]' : 'border-[#5b3a29]'}`}
                        style={{ background: c === 'none' ? 'repeating-linear-gradient(45deg,#fffaf2 0 5px,#f4ece0 5px 10px)' : c }}
                      >
                        {c === 'none' && <span className="text-xs">✕</span>}
                      </button>
                    ))}
                  </div>
                </Section>
              );
            })}
          </>
        )}
      </div>
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      <div className="mb-2 text-sm opacity-80">{title}</div>
      {children}
    </div>
  );
}

function Crop({ who, crop, children }: { who: Who; crop: [number, number]; children: ReactNode }) {
  const w = who === 'g' ? 64 : 70;
  const [y0, h] = crop;
  const k = Math.min(1, 46 / h);
  return (
    <div className="relative overflow-hidden" style={{ width: w * k, height: h * k }}>
      <div className="absolute left-0" style={{ top: -y0 * k, transform: `scale(${k})`, transformOrigin: 'top left' }}>
        {children}
      </div>
    </div>
  );
}

function OutfitsTab({ save, setSave, applyPreset, flash }: { save: Save; setSave: (f: (s: Save) => Save) => void; applyPreset: (p: (typeof PRESETS)[number]) => void; flash: (t: string) => void }) {
  return (
    <>
      <Section title="Feeling lucky?">
        <button
          onClick={() => {
            const o = randomOutfit(save.owned);
            setSave((s) => ({ ...s, look: o.look, rlook: o.rlook }));
            flash('Shuffled both outfits!');
          }}
          className="btn flex items-center gap-2 bg-[#ffd567] px-4 py-1.5"
        >
          <PixelIcon name="dice" size={22} /> Randomize both outfits
        </button>
      </Section>
      <Section title="My saved outfits">
        <div className="grid grid-cols-3 gap-2">
          {save.outfits.map((o, i) => (
            <div key={i} className="flex flex-col items-center gap-1 rounded-2xl border-[3px] border-[#e8dccb] bg-[#f8f2e8] p-2">
              {o ? (
                <div className="flex h-[58px] items-end gap-0.5 overflow-hidden">
                  <div style={{ transform: 'scale(.62)', transformOrigin: 'bottom' }}><Goldfish look={o.look} /></div>
                  <div style={{ transform: 'scale(.56)', transformOrigin: 'bottom' }}><Rohio look={o.rlook} /></div>
                </div>
              ) : (
                <div className="grid h-[58px] place-items-center text-xs opacity-60">Empty slot</div>
              )}
              <div className="flex gap-1">
                {o && (
                  <button onClick={() => { setSave((s) => ({ ...s, look: o.look, rlook: o.rlook })); flash(`Outfit ${i + 1} on!`); }} className="btn bg-[#9cc47f] px-2 text-xs text-white">
                    Wear
                  </button>
                )}
                <button
                  onClick={() => {
                    setSave((s) => ({ ...s, outfits: s.outfits.map((x, j) => (j === i ? { look: s.look, rlook: s.rlook } : x)) }));
                    flash(`Saved to slot ${i + 1}.`);
                  }}
                  className="btn bg-[#fffaf2] px-2 text-xs"
                >
                  Save
                </button>
              </div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Couple presets">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PRESETS.map((p) => (
            <button key={p.name} onClick={() => applyPreset(p)} className="flex flex-col items-center rounded-2xl border-[3px] border-transparent bg-[#efe8dc] p-2 hover:border-[#f4917a]">
              <div className="flex h-[62px] items-end gap-0.5 overflow-hidden">
                <div style={{ transform: 'scale(.64)', transformOrigin: 'bottom' }}><Goldfish look={{ ...save.look, ...p.look }} expr="happy" /></div>
                <div style={{ transform: 'scale(.58)', transformOrigin: 'bottom' }}><Rohio look={{ ...save.rlook, ...p.rlook }} expr="happy" /></div>
              </div>
              <span className="text-xs">{p.name}</span>
            </button>
          ))}
        </div>
      </Section>
    </>
  );
}
