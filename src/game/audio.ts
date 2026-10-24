/* Tiny chiptune synth: every album title seeds its own looping 8-bit melody. */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;
let timer: number | null = null;

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const freq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

function tone(c: AudioContext, out: AudioNode, type: OscillatorType, midi: number, at: number, dur: number, vol: number) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq(midi), at);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(vol, at + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g).connect(out);
  o.start(at);
  o.stop(at + dur + 0.02);
}

function hat(c: AudioContext, out: AudioNode, at: number) {
  if (!noise) {
    noise = c.createBuffer(1, c.sampleRate * 0.05, c.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = c.createBufferSource();
  src.buffer = noise;
  const g = c.createGain();
  const f = c.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = 6000;
  g.gain.setValueAtTime(0.18, at);
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.04);
  src.connect(f).connect(g).connect(out);
  src.start(at);
}

export function stopSong() {
  if (timer !== null) window.clearInterval(timer);
  timer = null;
  if (master && ctx) {
    const m = master;
    m.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.08);
    window.setTimeout(() => m.disconnect(), 400);
  }
  master = null;
}

export function playSong(title: string, seconds = 60) {
  const c = audio();
  if (!c) return;
  stopSong();
  const out = c.createGain();
  out.gain.value = 0.06;
  out.connect(c.destination);
  master = out;

  const r = rng(hash(title));
  const scale = [0, 2, 4, 7, 9, 12, 14, 16];
  const root = 60 + Math.floor(r() * 5);
  const bpm = 104 + Math.floor(r() * 28);
  const step = 60 / bpm / 2;
  const melody = Array.from({ length: 32 }, (_, i) => (i % 4 !== 0 && r() < 0.22 ? null : scale[Math.floor(r() * scale.length)]));
  const prog = [[0, 4, 7], [9, 12, 16], [5, 9, 12], [7, 11, 14]];
  const lead: OscillatorType = r() < 0.5 ? 'square' : 'triangle';

  let n = 0;
  let next = c.currentTime + 0.08;
  const end = c.currentTime + seconds;
  timer = window.setInterval(() => {
    if (!master) return;
    if (c.currentTime > end) return stopSong();
    while (next < c.currentTime + 0.2) {
      const i = n % 32;
      const bar = Math.floor(i / 8) % 4;
      const note = melody[i];
      if (note !== null) tone(c, out, lead, root + note, next, step * 0.9, 0.5);
      if (i % 2 === 0) tone(c, out, 'triangle', root - 24 + prog[bar][0], next, step * 1.8, 0.7);
      if (i % 4 === 2) tone(c, out, 'square', root - 12 + prog[bar][(i / 2) % 3 | 0], next, step * 0.6, 0.18);
      if (i % 2 === 1) hat(c, out, next);
      next += step;
      n++;
    }
  }, 50);
}

export type Sfx = 'coin' | 'pop' | 'splash' | 'sparkle' | 'bonk' | 'fanfare' | 'pour';

export function sfx(kind: Sfx) {
  const c = audio();
  if (!c) return;
  const out = c.createGain();
  out.gain.value = 0.08;
  out.connect(c.destination);
  const t = c.currentTime + 0.01;
  const seq: Record<Sfx, [OscillatorType, number[], number]> = {
    coin: ['square', [83, 88], 0.07],
    pop: ['triangle', [72, 79], 0.06],
    splash: ['sawtooth', [50, 45, 41], 0.07],
    sparkle: ['triangle', [84, 88, 91, 96], 0.06],
    bonk: ['square', [45, 40], 0.08],
    fanfare: ['square', [72, 76, 79, 84, 79, 84], 0.1],
    pour: ['triangle', [67, 69, 71], 0.05],
  };
  const [type, notes, d] = seq[kind];
  notes.forEach((m, i) => tone(c, out, type, m, t + i * d, d * 1.3, 0.6));
  window.setTimeout(() => out.disconnect(), (notes.length * d + 0.5) * 1000);
}
