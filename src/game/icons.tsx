import type { Action } from './data';

type IconName =
  | 'fish' | 'heart' | 'journal' | 'shop' | 'wardrobe' | 'claw' | 'settings' | 'help'
  | 'brew' | 'menu' | 'goals' | 'move' | 'hand' | 'pointer' | 'close' | 'sparkle'
  | 'taunt' | 'hit' | 'laugh' | 'comfort' | 'assure' | 'hug' | 'support' | 'edit'
  | 'table' | 'plant' | 'lights' | 'books' | 'cake' | 'cat' | 'training'
  | 'lock' | 'sound' | 'mute' | 'music' | 'mop' | 'gift' | 'sun' | 'moon' | 'star' | 'dice' | 'chat' | 'paw'
  | 'save' | 'rain' | 'hat' | 'hair' | 'shirt' | 'pants' | 'shoe' | 'glasses' | 'radio';

const C = '#5b3a29';
const P = '#f4917a';
const Y = '#ffd84d';
const B = '#a7d3f2';
const G = '#9cc47f';

function Px({ x, y, w = 2, h = 2, c = C }: { x: number; y: number; w?: number; h?: number; c?: string }) {
  return <rect x={x} y={y} width={w} height={h} fill={c} />;
}

/** Small hand-drawn grid icons, intentionally rendered on a 24px pixel grid. */
export type { IconName };
export function PixelIcon({ name, size = 24, className = '' }: { name: IconName; size?: number; className?: string }) {
  const icon = (() => {
    switch (name) {
      case 'fish': return <><Px x={3} y={9} w={14} h={7} c={Y} /><Px x={1} y={11} w={3} h={3} c={P} /><Px x={17} y={8} w={5} h={9} c={Y} /><Px x={7} y={11} /><Px x={5} y={15} w={2} h={1} c="#fffaf2" /></>;
      case 'heart': return <><Px x={6} y={6} w={5} h={5} c={P} /><Px x={12} y={6} w={5} h={5} c={P} /><Px x={5} y={8} w={13} h={5} c={P} /><Px x={7} y={13} w={9} h={4} c={P} /><Px x={9} y={17} w={5} h={3} c={P} /></>;
      case 'journal': return <><Px x={5} y={3} w={13} h={18} c={B} /><Px x={3} y={5} w={2} h={14} c={C} /><Px x={8} y={7} w={7} h={1} c="#fffaf2" /><Px x={8} y={11} w={6} h={1} c="#fffaf2" /><Px x={8} y={15} w={7} h={1} c="#fffaf2" /></>;
      case 'shop': return <><Px x={3} y={9} w={18} h={12} c={Y} /><Px x={2} y={6} w={20} h={4} c={P} /><Px x={4} y={4} w={3} h={3} c="#fffaf2" /><Px x={10} y={4} w={3} h={3} c="#fffaf2" /><Px x={17} y={4} w={3} h={3} c="#fffaf2" /><Px x={7} y={14} w={4} h={7} c={B} /><Px x={15} y={13} w={3} h={3} c="#fffaf2" /></>;
      case 'wardrobe': return <><Px x={5} y={4} w={14} h={3} c={P} /><Px x={3} y={7} w={18} h={14} c={B} /><Px x={8} y={10} w={3} h={8} c={Y} /><Px x={14} y={10} w={3} h={2} c="#fffaf2" /></>;
      case 'claw': return <><Px x={10} y={2} w={3} h={10} c={C} /><Px x={7} y={11} w={9} h={3} c={P} /><Px x={6} y={14} w={3} h={5} c={C} /><Px x={15} y={14} w={3} h={5} c={C} /><Px x={8} y={18} w={3} h={3} c={Y} /><Px x={13} y={18} w={3} h={3} c={Y} /></>;
      case 'settings': return <><Px x={9} y={2} w={6} h={20} c={C} /><Px x={2} y={9} w={20} h={6} c={C} /><Px x={5} y={5} w={14} h={14} c={C} /><Px x={8} y={8} w={8} h={8} c={Y} /><Px x={10} y={10} w={4} h={4} c={C} /></>;
      case 'help': return <><Px x={6} y={3} w={12} h={3} c={B} /><Px x={4} y={6} w={16} h={12} c={B} /><Px x={7} y={18} w={10} h={3} c={B} /><Px x={10} y={7} w={5} h={3} c="#fffaf2" /><Px x={13} y={10} w={3} h={4} c="#fffaf2" /><Px x={12} y={16} w={3} h={2} c="#fffaf2" /></>;
      case 'brew': return <><Px x={4} y={8} w={14} h={11} c="#fffaf2" /><Px x={18} y={11} w={3} h={5} c={P} /><Px x={5} y={6} w={12} h={3} c={Y} /><Px x={8} y={4} w={2} h={2} c={C} /><Px x={13} y={3} w={2} h={3} c={C} /><Px x={7} y={12} w={8} h={5} c={P} /></>;
      case 'menu': return <><Px x={4} y={3} w={16} h={18} c={G} /><Px x={7} y={7} w={10} h={2} c="#fffaf2" /><Px x={7} y={11} w={8} h={2} c="#fffaf2" /><Px x={7} y={15} w={10} h={2} c="#fffaf2" /></>;
      case 'goals': return <><Px x={4} y={3} w={16} h={18} c="#fffaf2" /><Px x={3} y={5} w={2} h={14} c={P} /><Px x={8} y={7} w={3} h={3} c={G} /><Px x={12} y={7} w={5} h={2} c={C} /><Px x={8} y={13} w={3} h={3} c={Y} /><Px x={12} y={13} w={5} h={2} c={C} /></>;
      case 'move': return <><Px x={10} y={2} w={4} h={20} c={B} /><Px x={2} y={10} w={20} h={4} c={B} /><Px x={9} y={2} w={6} h={4} c={B} /><Px x={9} y={18} w={6} h={4} c={B} /></>;
      case 'hand': return <><Px x={10} y={2} w={3} h={12} c={Y} /><Px x={6} y={8} w={3} h={8} c={Y} /><Px x={14} y={7} w={3} h={9} c={Y} /><Px x={8} y={14} w={8} h={7} c={Y} /><Px x={4} y={14} w={3} h={4} c={Y} /></>;
      case 'pointer': return <><Px x={5} y={3} w={3} h={14} c="#fffaf2" /><Px x={8} y={6} w={3} h={4} c="#fffaf2" /><Px x={11} y={9} w={3} h={4} c="#fffaf2" /><Px x={8} y={17} w={6} h={3} c="#fffaf2" /><Px x={14} y={16} w={3} h={4} c={P} /></>;
      case 'close': return <><Px x={4} y={4} w={4} h={4} c="#fffaf2" /><Px x={16} y={4} w={4} h={4} c="#fffaf2" /><Px x={8} y={8} w={8} h={8} c="#fffaf2" /><Px x={4} y={16} w={4} h={4} c="#fffaf2" /><Px x={16} y={16} w={4} h={4} c="#fffaf2" /></>;
      case 'sparkle': return <><Px x={10} y={2} w={4} h={20} c={Y} /><Px x={2} y={10} w={20} h={4} c={Y} /><Px x={6} y={6} w={12} h={12} c={Y} /><Px x={9} y={9} w={6} h={6} c="#fffaf2" /></>;
      case 'taunt': return <><Px x={4} y={5} w={16} h={14} c={P} /><Px x={7} y={9} w={3} h={2} /><Px x={14} y={9} w={3} h={2} /><Px x={9} y={14} w={7} h={2} c="#fffaf2" /></>;
      case 'hit': return <><Px x={3} y={4} w={5} h={5} c={Y} /><Px x={7} y={8} w={5} h={5} c={Y} /><Px x={11} y={12} w={5} h={5} c={Y} /><Px x={15} y={16} w={6} h={4} c={C} /></>;
      case 'laugh': return <><Px x={4} y={5} w={16} h={14} c={Y} /><Px x={7} y={9} w={3} h={2} /><Px x={14} y={9} w={3} h={2} /><Px x={7} y={13} w={10} h={4} c="#fffaf2" /></>;
      case 'comfort': return <><Px x={4} y={10} w={16} h={8} c={P} /><Px x={6} y={7} w={5} h={5} c={P} /><Px x={13} y={7} w={5} h={5} c={P} /><Px x={8} y={16} w={8} h={4} c={P} /></>;
      case 'assure': return <><Px x={3} y={11} w={8} h={7} c={Y} /><Px x={13} y={7} w={8} h={7} c={B} /><Px x={9} y={10} w={6} h={7} c={G} /></>;
      case 'hug': return <><Px x={8} y={4} w={8} h={8} c={P} /><Px x={4} y={11} w={16} h={8} c={P} /><Px x={2} y={12} w={4} h={5} c={Y} /><Px x={18} y={12} w={4} h={5} c={Y} /></>;
      case 'support': return <><Px x={7} y={3} w={10} h={9} c={B} /><Px x={5} y={12} w={14} h={8} c={Y} /><Px x={3} y={15} w={5} h={3} c={P} /><Px x={16} y={15} w={5} h={3} c={P} /></>;
      case 'edit': return <><Px x={5} y={17} w={4} h={3} c={Y} /><Px x={8} y={13} w={4} h={5} c={Y} /><Px x={11} y={9} w={4} h={5} c={P} /><Px x={14} y={5} w={4} h={5} c={B} /><Px x={17} y={3} w={3} h={4} c={C} /></>;
      case 'table': return <><Px x={3} y={8} w={18} h={5} c={Y} /><Px x={6} y={13} w={3} h={8} c={C} /><Px x={16} y={13} w={3} h={8} c={C} /></>;
      case 'plant': return <><Px x={10} y={11} w={4} h={8} c={P} /><Px x={5} y={6} w={6} h={8} c={G} /><Px x={13} y={4} w={6} h={10} c={G} /></>;
      case 'lights': return <><Px x={2} y={5} w={20} h={2} c={C} /><Px x={5} y={7} w={3} h={6} c={Y} /><Px x={11} y={7} w={3} h={6} c={P} /><Px x={17} y={7} w={3} h={6} c={B} /></>;
      case 'books': return <><Px x={4} y={4} w={4} h={17} c={P} /><Px x={9} y={3} w={4} h={18} c={B} /><Px x={14} y={5} w={5} h={16} c={Y} /></>;
      case 'cake': return <><Px x={4} y={12} w={16} h={8} c={P} /><Px x={6} y={8} w={12} h={4} c="#fffaf2" /><Px x={10} y={3} w={3} h={5} c={Y} /></>;
      case 'cat': return <><Px x={5} y={7} w={14} h={12} c={Y} /><Px x={5} y={3} w={5} h={6} c={Y} /><Px x={14} y={3} w={5} h={6} c={Y} /><Px x={8} y={11} w={2} h={2} /><Px x={14} y={11} w={2} h={2} /></>;
      case 'training': return <><Px x={5} y={4} w={14} h={16} c={B} /><Px x={8} y={2} w={8} h={3} c={Y} /><Px x={8} y={9} w={8} h={2} c="#fffaf2" /><Px x={8} y={14} w={6} h={2} c="#fffaf2" /></>;
      case 'lock': return <><Px x={7} y={3} w={10} h={3} c={C} /><Px x={6} y={5} w={3} h={6} c={C} /><Px x={15} y={5} w={3} h={6} c={C} /><Px x={4} y={10} w={16} h={11} c={Y} /><Px x={11} y={13} w={2} h={5} c={C} /></>;
      case 'sound': return <><Px x={3} y={9} w={5} h={6} c={B} /><Px x={8} y={6} w={3} h={12} c={B} /><Px x={11} y={3} w={2} h={18} c={B} /><Px x={15} y={9} w={2} h={6} c={P} /><Px x={18} y={6} w={2} h={12} c={P} /></>;
      case 'mute': return <><Px x={3} y={9} w={5} h={6} c={B} /><Px x={8} y={6} w={3} h={12} c={B} /><Px x={11} y={3} w={2} h={18} c={B} /><Px x={15} y={8} w={2} h={2} c={P} /><Px x={17} y={10} w={2} h={4} c={P} /><Px x={19} y={14} w={2} h={2} c={P} /><Px x={19} y={8} w={2} h={2} c={P} /><Px x={15} y={14} w={2} h={2} c={P} /></>;
      case 'music': return <><Px x={9} y={3} w={11} h={3} c={C} /><Px x={9} y={3} w={3} h={13} c={C} /><Px x={18} y={3} w={3} h={11} c={C} /><Px x={4} y={15} w={7} h={6} c={P} /><Px x={14} y={13} w={7} h={6} c={P} /></>;
      case 'mop': return <><Px x={14} y={2} w={3} h={13} c={Y} /><Px x={6} y={14} w={14} h={3} c={C} /><Px x={5} y={17} w={3} h={5} c={B} /><Px x={9} y={17} w={3} h={5} c={B} /><Px x={13} y={17} w={3} h={5} c={B} /><Px x={17} y={17} w={3} h={5} c={B} /></>;
      case 'gift': return <><Px x={3} y={9} w={18} h={5} c={P} /><Px x={4} y={14} w={16} h={7} c={P} /><Px x={10} y={9} w={4} h={12} c={Y} /><Px x={6} y={4} w={5} h={5} c={Y} /><Px x={13} y={4} w={5} h={5} c={Y} /></>;
      case 'sun': return <><Px x={7} y={7} w={10} h={10} c={Y} /><Px x={11} y={1} w={2} h={4} c={Y} /><Px x={11} y={19} w={2} h={4} c={Y} /><Px x={1} y={11} w={4} h={2} c={Y} /><Px x={19} y={11} w={4} h={2} c={Y} /><Px x={4} y={4} w={2} h={2} c={Y} /><Px x={18} y={4} w={2} h={2} c={Y} /><Px x={4} y={18} w={2} h={2} c={Y} /><Px x={18} y={18} w={2} h={2} c={Y} /></>;
      case 'moon': return <><Px x={8} y={3} w={8} h={3} c={Y} /><Px x={5} y={6} w={6} h={12} c={Y} /><Px x={8} y={18} w={8} h={3} c={Y} /><Px x={16} y={16} w={3} h={3} c={Y} /><Px x={16} y={5} w={3} h={2} c={Y} /></>;
      case 'star': return <><Px x={10} y={2} w={4} h={5} c={Y} /><Px x={2} y={8} w={20} h={4} c={Y} /><Px x={6} y={12} w={12} h={4} c={Y} /><Px x={4} y={16} w={6} h={5} c={Y} /><Px x={14} y={16} w={6} h={5} c={Y} /><Px x={9} y={7} w={6} h={2} c={Y} /></>;
      case 'dice': return <><Px x={3} y={3} w={18} h={18} c="#fffaf2" /><Px x={6} y={6} w={3} h={3} /><Px x={15} y={6} w={3} h={3} /><Px x={10} y={10} w={3} h={3} c={P} /><Px x={6} y={15} w={3} h={3} /><Px x={15} y={15} w={3} h={3} /></>;
      case 'chat': return <><Px x={3} y={4} w={18} h={12} c={B} /><Px x={6} y={16} w={4} h={4} c={B} /><Px x={7} y={9} w={2} h={2} /><Px x={11} y={9} w={2} h={2} /><Px x={15} y={9} w={2} h={2} /></>;
      case 'paw': return <><Px x={8} y={12} w={9} h={8} c={P} /><Px x={4} y={8} w={4} h={4} c={P} /><Px x={8} y={4} w={4} h={5} c={P} /><Px x={13} y={4} w={4} h={5} c={P} /><Px x={17} y={8} w={4} h={4} c={P} /></>;
      case 'save': return <><Px x={3} y={3} w={18} h={18} c={B} /><Px x={6} y={3} w={11} h={6} c="#fffaf2" /><Px x={6} y={13} w={12} h={6} c="#fffaf2" /><Px x={13} y={4} w={2} h={4} c={C} /></>;
      case 'rain': return <><Px x={5} y={4} w={14} h={6} c={B} /><Px x={3} y={7} w={18} h={4} c={B} /><Px x={6} y={13} w={2} h={4} c={B} /><Px x={11} y={15} w={2} h={4} c={B} /><Px x={16} y={13} w={2} h={4} c={B} /></>;
      case 'hat': return <><Px x={7} y={5} w={10} h={9} c={P} /><Px x={3} y={14} w={18} h={4} c={P} /><Px x={7} y={11} w={10} h={2} c={Y} /></>;
      case 'hair': return <><Px x={6} y={3} w={12} h={4} c={C} /><Px x={4} y={6} w={16} h={6} c={C} /><Px x={4} y={12} w={4} h={8} c={C} /><Px x={16} y={12} w={4} h={8} c={C} /><Px x={8} y={10} w={8} h={8} c="#fff1e3" /></>;
      case 'shirt': return <><Px x={7} y={4} w={10} h={3} c={Y} /><Px x={3} y={6} w={18} h={5} c={Y} /><Px x={6} y={10} w={12} h={11} c={Y} /><Px x={11} y={7} w={2} h={2} c={P} /></>;
      case 'pants': return <><Px x={5} y={3} w={14} h={5} c={B} /><Px x={5} y={8} w={6} h={13} c={B} /><Px x={13} y={8} w={6} h={13} c={B} /></>;
      case 'shoe': return <><Px x={4} y={8} w={8} h={8} c={P} /><Px x={4} y={15} w={17} h={5} c={P} /><Px x={4} y={19} w={17} h={2} c="#fffaf2" /></>;
      case 'glasses': return <><Px x={2} y={9} w={8} h={7} c={C} /><Px x={14} y={9} w={8} h={7} c={C} /><Px x={4} y={11} w={4} h={3} c={B} /><Px x={16} y={11} w={4} h={3} c={B} /><Px x={10} y={10} w={4} h={2} c={C} /></>;
      case 'radio': return <><Px x={3} y={7} w={18} h={13} c={P} /><Px x={14} y={2} w={2} h={5} c={C} /><Px x={5} y={9} w={8} h={9} c={C} /><Px x={15} y={10} w={4} h={2} c={Y} /><Px x={15} y={14} w={4} h={2} c={Y} /></>;
    }
  })();
  return <svg className={className} viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" shapeRendering="crispEdges">{icon}</svg>;
}

export function ActionIcon({ action, size = 22 }: { action: Action; size?: number }) {
  const names: Record<Action, IconName> = { taunt: 'taunt', hit: 'hit', makefun: 'laugh', comfort: 'comfort', assure: 'assure', hug: 'hug', help: 'support' };
  return <PixelIcon name={names[action]} size={size} />;
}