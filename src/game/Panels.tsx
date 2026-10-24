import { useState, type ReactNode } from 'react';
import { COLLECTABLES, DECOR, DRINKS, PETS, ROHIO_LETTERS, type CollectId, type PetId } from './data';
import type { Save } from './save';
import { DrinkIcon, ItemIcon, PetSprite } from './sprites';
import { MEMORIES } from './story';
import { PixelIcon } from './icons';

export function Modal({ children, onClose, title }: { children: ReactNode; onClose: () => void; title?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#5b3a29]/35 p-3 pb-14" onPointerDown={(e) => e.stopPropagation()}>
      <div className="pop relative flex max-h-[88dvh] w-full max-w-[min(640px,96vw)] flex-col pb-1">
        {title && <div className="mb-[-4px] ml-4 self-start rounded-t-2xl border-4 border-b-0 border-[#5b3a29] bg-[#ffd567] px-5 py-1 text-xl">{title}</div>}
        <div className="panel flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
        <button onClick={onClose} aria-label="Close" className="btn absolute -bottom-5 left-1/2 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-full bg-[#f08a3c] text-2xl text-white">
          ✕
        </button>
      </div>
    </div>
  );
}

const Fish = () => <PixelIcon name="fish" size={18} className="inline-block" />;

/* ---------------- Shop ---------------- */
export function ShopPanel({ save, setSave, onClose, toast }: { save: Save; setSave: (f: (s: Save) => Save) => void; onClose: () => void; toast: (t: string) => void }) {
  const [tab, setTab] = useState<'equip' | 'pets'>('equip');
  const canAfford = (cost: Partial<Record<CollectId, number>>) => Object.entries(cost).every(([k, v]) => save.inv[k as CollectId] >= (v || 0));

  const buyDecor = (id: string, price: number) => {
    if (save.coins < price) return toast('Not enough fish coins. Serve more visitors.');
    setSave((s) => ({ ...s, coins: s.coins - price, decor: [...s.decor, id as any] }));
    toast('Placed in HUA CAFE.');
  };
  const redeem = (id: PetId, cost: Partial<Record<CollectId, number>>) => {
    if (!canAfford(cost)) return toast('Need more collectables. Explore the café floor.');
    setSave((s) => {
      const inv = { ...s.inv };
      Object.entries(cost).forEach(([k, v]) => (inv[k as CollectId] -= v || 0));
      const active = s.activePets.length < 3 ? [...s.activePets, id] : s.activePets;
      return { ...s, inv, pets: [...s.pets, id], activePets: active };
    });
    toast(`${PETS.find((p) => p.id === id)!.name} joined HUA CAFE.`);
  };
  const toggleActive = (id: PetId) => {
    setSave((s) => {
      if (s.activePets.includes(id)) return { ...s, activePets: s.activePets.filter((p) => p !== id) };
      if (s.activePets.length >= 3) {
        toast('Max 3 companions walking with you!');
        return s;
      }
      return { ...s, activePets: [...s.activePets, id] };
    });
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex gap-1 px-3 pt-3">
        {(['equip', 'pets'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`tab flex-1 py-2 text-lg ${tab === t ? 'tab-active' : ''}`}>
            {t === 'equip' ? 'Equipment' : 'Pet Companions'}
          </button>
        ))}
      </div>
      <div className="scroll-soft grid flex-1 grid-cols-2 gap-3 overflow-y-auto p-4 pb-10 sm:grid-cols-3">
        {tab === 'equip' &&
          DECOR.map((d) => {
            const owned = save.decor.includes(d.id);
            const locked = d.id === 'table5' && !save.decor.includes('table4');
            return (
              <div key={d.id} className={`${owned ? 'card' : 'card-locked'} flex flex-col items-center p-3 text-center`}>
                <div className="text-lg leading-tight">{d.name}</div>
                <div className="my-2 flex h-10 items-center justify-center"><DecorIcon id={d.id} /></div>
                <div className="text-sm opacity-80">{d.desc}</div>
                {owned ? (
                  <div className="mt-2 rounded-full bg-[#9cc47f] px-3 text-white">Owned ✓</div>
                ) : (
                  <button disabled={locked} onClick={() => buyDecor(d.id, d.price)} className="btn mt-2 bg-[#ffd567] px-3 py-0.5 disabled:opacity-40">
                    <Fish /> {d.price}
                  </button>
                )}
              </div>
            );
          })}
        {tab === 'pets' &&
          PETS.map((p) => {
            const owned = save.pets.includes(p.id);
            const active = save.activePets.includes(p.id);
            return (
              <div key={p.id} className={`${owned ? 'card' : 'card-locked'} relative flex flex-col items-center p-3 text-center`}>
                {owned && active && <div className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full border-2 border-[#5b3a29] bg-[#f08a3c] text-sm text-white">♥</div>}
                <div className="text-lg">{p.name}</div>
                <div className="bob flex h-[74px] items-end justify-center" style={{ filter: owned ? 'none' : 'grayscale(.2) opacity(.85)' }}>
                  <PetSprite id={p.id} />
                </div>
                <div className="text-xs leading-tight opacity-80">{p.desc}</div>
                {owned ? (
                  <button onClick={() => toggleActive(p.id)} className={`btn mt-2 px-3 py-0.5 text-sm ${active ? 'bg-[#f6b8c8]' : 'bg-[#fffaf2]'}`}>
                    {active ? 'Walking with you' : 'Bring along'}
                  </button>
                ) : (
                  <>
                    <div className="mt-1 flex flex-wrap justify-center gap-1">
                      {Object.entries(p.cost).map(([k, v]) => (
                        <span key={k} className={`flex items-center gap-0.5 rounded-full px-1.5 text-sm ${save.inv[k as CollectId] >= (v || 0) ? 'bg-[#e3f1d4]' : 'bg-[#fbe0d8]'}`}>
                          <ItemIcon id={k as CollectId} size={16} />
                          {save.inv[k as CollectId]}/{v}
                        </span>
                      ))}
                    </div>
                    <button onClick={() => redeem(p.id, p.cost)} className="btn mt-2 bg-[#ffd567] px-3 py-0.5 text-sm">
                      Redeem
                    </button>
                  </>
                )}
              </div>
            );
          })}
      </div>
    </Modal>
  );
}

function DecorIcon({ id }: { id: string }) {
  const icons: Record<string, Parameters<typeof PixelIcon>[0]['name']> = {
    turbo: 'brew', table4: 'table', table5: 'table', plants: 'plant', rug: 'sparkle', lights: 'lights', bookshelf: 'books', cake: 'cake', cattower: 'cat', training: 'training',
  };
  return <PixelIcon name={icons[id] || 'shop'} size={38} />;
}

/* ---------------- Editable menu ---------------- */
export function MenuPanel({ save, setSave, onClose }: { save: Save; setSave: (f: (s: Save) => Save) => void; onClose: () => void }) {
  return (
    <Modal onClose={onClose} title="HUA CAFE Menu">
      <div className="scroll-soft flex flex-1 flex-col gap-3 overflow-y-auto p-5 pb-10">
        <p className="text-sm opacity-75">Tap the chalkboard in the café any time to change drink names, prices, or what is currently listed.</p>
        {DRINKS.map((drink) => {
          const item = save.menu[drink.id];
          return (
            <div key={drink.id} className="grid grid-cols-[42px_1fr_76px] items-center gap-2 rounded-2xl border-[3px] border-[#e8dccb] bg-[#f8f2e8] p-2">
              <DrinkIcon id={drink.id} size={34} />
              <label className="min-w-0">
                <span className="sr-only">Drink name</span>
                <input
                  value={item.name}
                  maxLength={18}
                  onChange={(e) => setSave((s) => ({ ...s, menu: { ...s.menu, [drink.id]: { ...s.menu[drink.id], name: e.target.value || drink.name } } }))}
                  className="w-full rounded-lg border-2 border-[#5b3a29] bg-white px-2 py-1.5 text-base outline-none focus:border-[#f08a6c]"
                />
              </label>
              <label className="flex items-center gap-1 text-sm">
                <PixelIcon name="fish" size={18} />
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="99"
                  value={item.price}
                  onChange={(e) => setSave((s) => ({ ...s, menu: { ...s.menu, [drink.id]: { ...s.menu[drink.id], price: clampPrice(e.target.value) } } }))}
                  className="w-12 rounded-lg border-2 border-[#5b3a29] bg-white px-1 py-1.5 text-center text-base outline-none"
                />
              </label>
              <label className="col-span-3 flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" checked={item.shown} onChange={(e) => setSave((s) => ({ ...s, menu: { ...s.menu, [drink.id]: { ...s.menu[drink.id], shown: e.target.checked } } }))} className="h-4 w-4 accent-[#f08a6c]" />
                Show this drink on the board
              </label>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

function clampPrice(value: string) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(1, Math.min(99, Math.round(n))) : 1;
}

/* ---------------- Storage / Journal ---------------- */
export function JournalPanel({ save, onClose, openLetter, onMemory }: { save: Save; onClose: () => void; openLetter: (i: number) => void; onMemory: (id: string) => void }) {
  const [sel, setSel] = useState<CollectId>('frog');
  const info = COLLECTABLES.find((c) => c.id === sel)!;
  return (
    <Modal onClose={onClose} title="Journal">
      <div className="grid grid-cols-4 gap-2 p-4 sm:grid-cols-8">
        {COLLECTABLES.map((c) => (
          <button key={c.id} onClick={() => setSel(c.id)} className={`relative flex flex-col items-center rounded-2xl border-[3px] p-1.5 ${sel === c.id ? 'border-[#f08a6c] bg-[#fde7df]' : 'border-[#e8dccb] bg-[#f4ece0]'}`}>
            <ItemIcon id={c.id} size={34} />
            <span className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full border-2 border-[#5b3a29] bg-white px-1 text-xs">{save.inv[c.id]}</span>
          </button>
        ))}
      </div>
      <div className="mx-4 text-xl">{info.name}s found</div>
      <div className="scroll-soft m-4 mt-2 flex-1 overflow-y-auto rounded-2xl bg-[#f4ece0] p-3 pb-8">
        {sel === 'letter' ? (
          save.letters.length ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {save.letters.map((i) => (
                <button key={i} onClick={() => openLetter(i)} className="btn flex items-center gap-2 bg-[#fffaf2] px-2 py-2 text-left text-sm">
                  <ItemIcon id="letter" size={24} /> Letter #{i + 1}
                </button>
              ))}
            </div>
          ) : (
            <Empty />
          )
        ) : save.found[sel].length ? (
          <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {save.found[sel].map((e) => (
              <li key={e} className="flex items-center gap-2 rounded-xl bg-[#fffaf2] px-2 py-1.5">
                <ItemIcon id={sel} size={22} /> {e}
              </li>
            ))}
          </ul>
        ) : (
          <Empty />
        )}
      </div>
      <div className="mx-4 text-xl">Memories with Rohio</div>
      <div className="mx-4 mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {MEMORIES.map((m) => {
          const open = save.memories.includes(m.id);
          return (
            <button
              key={m.id}
              disabled={!open}
              onClick={() => onMemory(m.id)}
              className={`rounded-xl border-[3px] px-2 py-1.5 text-left text-xs leading-tight ${open ? 'border-[#f4917a] bg-[#fde7df]' : 'border-[#e8dccb] bg-[#f4ece0] opacity-70'}`}
            >
              <div className="flex items-center gap-1 text-sm"><PixelIcon name={open ? 'heart' : 'lock'} size={16} />{open ? m.title : '???'}</div>
              <div className="opacity-75">{open ? 'Tap to replay' : m.hint}</div>
            </button>
          );
        })}
      </div>
      <div className="mx-4 mb-8 mt-3 text-center text-sm opacity-75">Served {save.stats.served} visitors · Day {save.day} · Rohio's affection {Math.round(save.affection)}%</div>
    </Modal>
  );
}
const Empty = () => <div className="py-8 text-center opacity-60">Nothing yet. Walk around HUA CAFE to find some.</div>;

export function LetterModal({ index, onClose }: { index: number; onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <div className="relative m-4 mb-10 rounded-2xl border-[3px] border-dashed border-[#f4917a] bg-[#fffaf2] p-6 text-lg leading-relaxed" style={{ backgroundImage: 'repeating-linear-gradient(transparent 0 31px, #f6dccf 31px 32px)' }}>
        <div className="absolute -top-5 right-6"><PixelIcon name="heart" size={38} /></div>
        <div className="whitespace-pre-line">{ROHIO_LETTERS[index]}</div>
      </div>
    </Modal>
  );
}

/* ---------------- Settings ---------------- */
export function SettingsPanel({ save, setSave, onClose, onReset, handStatus }: { save: Save; setSave: (f: (s: Save) => Save) => void; onClose: () => void; onReset: () => void; handStatus: string }) {
  const set = (p: Partial<Save['settings']>) => setSave((s) => ({ ...s, settings: { ...s.settings, ...p } }));
  const modes = [
    { id: 'tap', t: 'Tap & Drag', d: 'Tap/click to walk, hold & drag to steer (touch + trackpad)' },
    { id: 'glide', t: 'Trackpad Glide', d: 'Goldfish follows your cursor — just glide on the trackpad' },
    { id: 'hand', t: 'Hand Gestures', d: 'Use your webcam: point with index finger, pinch to tap' },
  ] as const;
  return (
    <Modal onClose={onClose} title="Settings">
      <div className="scroll-soft flex flex-col gap-3 overflow-y-auto p-5 pb-10">
        <div className="text-lg">Movement</div>
        {modes.map((m) => (
          <button key={m.id} onClick={() => set({ mode: m.id })} className={`rounded-2xl border-[3px] p-3 text-left ${save.settings.mode === m.id ? 'border-[#9cc47f] bg-[#eef7e4]' : 'border-[#e8dccb] bg-[#f8f2e8]'}`}>
            <div className="text-lg">{m.t}</div>
            <div className="text-sm opacity-75">{m.d}</div>
          </button>
        ))}
        {save.settings.mode === 'hand' && handStatus && <div className="rounded-xl bg-[#fde7df] p-2 text-sm">{handStatus}</div>}
        <div className="mt-2 text-lg">Sensitivity: {save.settings.sens.toFixed(1)}×</div>
        <input type="range" min={0.5} max={2} step={0.1} value={save.settings.sens} onChange={(e) => set({ sens: +e.target.value })} className="accent-[#f08a6c]" />
        <div className="text-sm opacity-70">Controls walking speed & hand-tracking range. Keyboard WASD / arrows also work.</div>
        <button onClick={() => set({ sound: !save.settings.sound })} className={`mt-2 flex items-center gap-2 self-start rounded-2xl border-[3px] px-3 py-2 ${save.settings.sound ? 'border-[#9cc47f] bg-[#eef7e4]' : 'border-[#e8dccb] bg-[#f8f2e8]'}`}>
          <PixelIcon name={save.settings.sound ? 'sound' : 'mute'} size={22} /> Sound & music: {save.settings.sound ? 'On' : 'Off'}
        </button>
        <button
          onClick={() => {
            if (confirm('Reset all progress?')) onReset();
          }}
          className="btn mt-4 self-start bg-[#fbe0d8] px-4 py-1"
        >
          Reset progress
        </button>
      </div>
    </Modal>
  );
}

/* ---------------- Claw machine ---------------- */
export function ClawPanel({ save, onPlay, onClose }: { save: Save; onPlay: () => CollectId | null; onClose: () => void }) {
  const [anim, setAnim] = useState(false);
  const [won, setWon] = useState<CollectId | null>(null);
  const play = () => {
    if (anim) return;
    setWon(null);
    setAnim(true);
    setTimeout(() => {
      const r = onPlay();
      setWon(r);
      setAnim(false);
    }, 1400);
  };
  return (
    <Modal onClose={onClose} title="Claw Machine">
      <div className="flex flex-col items-center gap-3 p-5 pb-10">
        <div className="relative h-56 w-56 overflow-hidden rounded-3xl border-4 border-[#5b3a29] bg-[#cfe6f5]">
          <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-[#5b3a29]" style={{ height: anim ? 120 : 40, transition: 'height .6s' }} />
          <div className="absolute left-1/2 -translate-x-1/2" style={{ top: anim ? 110 : 30, transition: 'top .6s' }}><PixelIcon name="claw" size={44} /></div>
          <div className="absolute bottom-2 left-0 right-0 flex flex-wrap justify-center gap-1 px-2">
            {COLLECTABLES.map((c) => (
              <ItemIcon key={c.id} id={c.id} size={34} />
            ))}
          </div>
        </div>
        {won && (
          <div className="pop flex items-center gap-2 rounded-full bg-[#fde7df] px-4 py-1 text-lg">
            You got <ItemIcon id={won} size={26} /> {COLLECTABLES.find((c) => c.id === won)!.name}!
          </div>
        )}
        <button onClick={play} disabled={anim || save.hearts < 5} className="btn bg-[#f6a99a] px-6 py-2 text-xl disabled:opacity-50">
          <span className="flex items-center gap-1">Play · 5 <PixelIcon name="heart" size={18} /></span>
        </button>
        <div className="flex items-center gap-1 text-sm opacity-70">Hearts come from happy visitors ({save.hearts} <PixelIcon name="heart" size={16} />)</div>
      </div>
    </Modal>
  );
}
