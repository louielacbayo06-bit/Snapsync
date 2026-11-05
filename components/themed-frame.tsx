'use client';

import { useEffect, useState } from 'react';
import styles from './themed-frame.module.css';

type ThemeId = 'classic' | 'birthday' | 'funny' | 'y2k' | 'love' | 'kawaii' | 'retro-film';
export type FrameLayoutId = 'strip' | 'doubleStrip' | 'grid' | 'trio' | 'polaroid';
type PhotoPosition = { x: number; y: number };
type PhotoPair = { host: string; guest: string } | undefined;
type Background =
  | { type: 'solid'; color: string }
  | { type: 'gradient'; stops: { color: string; offset: string }[] };
type ThemeDecoration =
  | { kind: 'bunting'; colors: string[] }
  | { kind: 'confetti'; colors: string[]; count: number; seed: number }
  | { kind: 'balloons'; colors: string[] }
  | { kind: 'cake'; colors: string[] }
  | { kind: 'halftone'; color: string }
  | { kind: 'comic'; colors: string[]; labels: string[] }
  | { kind: 'sparkles'; color: string; count: number }
  | { kind: 'butterflies'; colors: string[] }
  | { kind: 'hearts'; colors: string[]; count: number }
  | { kind: 'interlocking-hearts'; colors: string[] }
  | { kind: 'stars-clouds'; colors: string[] }
  | { kind: 'rainbow'; colors: string[] }
  | { kind: 'sprockets'; color: string };

type ThemeConfig = {
  id: ThemeId;
  label: string;
  background: Background;
  slotStyle: { borderColor: string; borderWidth: number; cornerRadius: number; fill: string; shadow?: { color: string; offset: number } };
  textColors: { primary: string; secondary: string; outline?: string; accent?: string };
  fonts: { title: string; body: string; footer: string };
  decorations: ThemeDecoration[];
  defaultMessage: string;
  subtitle: string;
};

export const FRAME_THEMES: Record<ThemeId, ThemeConfig> = {
  classic: {
    id: 'classic',
    label: 'Classic',
    background: { type: 'solid', color: '#000000' },
    slotStyle: { borderColor: 'transparent', borderWidth: 0, cornerRadius: 0, fill: '#FFFFFF' },
    textColors: { primary: '#FFFFFF', secondary: '#FFFFFF' },
    fonts: { title: 'Georgia, serif', body: 'Arial, sans-serif', footer: 'Arial, sans-serif' },
    decorations: [],
    defaultMessage: 'SnapSync',
    subtitle: 'SNAP · SYNC · SMILE',
  },
  birthday: {
    id: 'birthday',
    label: 'Birthday',
    background: { type: 'solid', color: '#FFE2EE' },
    slotStyle: { borderColor: '#FFFFFF', borderWidth: 10, cornerRadius: 22, fill: '#FFFFFF' },
    textColors: { primary: '#FF63A0', secondary: '#5F3296', outline: '#FFFFFF', accent: '#5F3296' },
    fonts: { title: 'Arial, sans-serif', body: 'Arial, sans-serif', footer: 'Arial, sans-serif' },
    decorations: [
      { kind: 'bunting', colors: ['#FF63A0', '#FFCE3C', '#3CC8BE', '#966EF0', '#FF8C3C', '#46A0FF'] },
      { kind: 'confetti', colors: ['#FF63A0', '#FFCE3C', '#3CC8BE', '#966EF0', '#FF8C3C', '#46A0FF'], count: 48, seed: 11 },
      { kind: 'balloons', colors: ['#FF63A0', '#3CC8BE', '#FFCE3C', '#966EF0'] },
      { kind: 'cake', colors: ['#FF8CB8', '#FFF4D8', '#46A0FF', '#FFCE3C', '#3CC8BE'] },
    ],
    defaultMessage: 'HAPPY BIRTHDAY!',
    subtitle: 'Make a wish! · SnapSync',
  },
  funny: {
    id: 'funny',
    label: 'Funny',
    background: { type: 'solid', color: '#FFE23C' },
    slotStyle: { borderColor: '#111111', borderWidth: 8, cornerRadius: 3, fill: '#FFFFFF', shadow: { color: '#111111', offset: 12 } },
    textColors: { primary: '#111111', secondary: '#111111', accent: '#111111' },
    fonts: { title: 'Arial, sans-serif', body: 'Arial, sans-serif', footer: 'Arial, sans-serif' },
    decorations: [
      { kind: 'halftone', color: '#FFC400' },
      { kind: 'comic', colors: ['#FF69B4', '#5ADCFF', '#FF5555', '#82E678'], labels: ['LOL!', 'BRUH', 'NO WAY', 'OMG!'] },
    ],
    defaultMessage: 'ME & MY BESTIE',
    subtitle: '',
  },
  y2k: {
    id: 'y2k',
    label: 'Y2K',
    background: { type: 'gradient', stops: [{ color: '#FF8CD7', offset: '0%' }, { color: '#BE96FF', offset: '52%' }, { color: '#78D7FF', offset: '100%' }] },
    slotStyle: { borderColor: '#FFFFFF', borderWidth: 10, cornerRadius: 34, fill: '#FFFFFF' },
    textColors: { primary: '#FFFFFF', secondary: '#FFFFFF', outline: '#4659E1', accent: '#4659E1' },
    fonts: { title: 'Arial, sans-serif', body: 'Arial, sans-serif', footer: 'Georgia, serif' },
    decorations: [
      { kind: 'sparkles', color: '#FFFFFF', count: 24 },
      { kind: 'butterflies', colors: ['#FF8CD7', '#78D7FF', '#BE96FF'] },
    ],
    defaultMessage: 'PHOTOBOOTH',
    subtitle: 'snap. sync. sparkle.',
  },
  love: {
    id: 'love',
    label: 'Love',
    background: { type: 'gradient', stops: [{ color: '#C81E46', offset: '0%' }, { color: '#960F37', offset: '100%' }] },
    slotStyle: { borderColor: '#FFBED2', borderWidth: 10, cornerRadius: 22, fill: '#FFFFFF' },
    textColors: { primary: '#FFFFFF', secondary: '#FFBED2', accent: '#FFBED2' },
    fonts: { title: 'Georgia, serif', body: 'Arial, sans-serif', footer: 'Georgia, serif' },
    decorations: [
      { kind: 'hearts', colors: ['#E64B6D', '#F27892'], count: 34 },
      { kind: 'interlocking-hearts', colors: ['#FF9BC1', '#FFFFFF'] },
    ],
    defaultMessage: 'Love Booth',
    subtitle: '',
  },
  kawaii: {
    id: 'kawaii',
    label: 'Kawaii',
    background: { type: 'solid', color: '#BEE1FF' },
    slotStyle: { borderColor: '#FFA0C8', borderWidth: 10, cornerRadius: 40, fill: '#FFFFFF' },
    textColors: { primary: '#FF6EAA', secondary: '#4C68A8', outline: '#FFFFFF', accent: '#FFD83D' },
    fonts: { title: 'Arial, sans-serif', body: 'Arial, sans-serif', footer: 'Georgia, serif' },
    decorations: [
      { kind: 'stars-clouds', colors: ['#FFFFFF', '#FFD83D'] },
      { kind: 'rainbow', colors: ['#FF5B76', '#FFAB49', '#FFE66D', '#70D68B', '#58B9F4'] },
    ],
    defaultMessage: 'BESTIE ERA',
    subtitle: '',
  },
  'retro-film': {
    id: 'retro-film',
    label: 'Retro film',
    background: { type: 'solid', color: '#100E0C' },
    slotStyle: { borderColor: '#100E0C', borderWidth: 4, cornerRadius: 12, fill: '#F3E8D0' },
    textColors: { primary: '#F3E8D0', secondary: '#FF9A2E', accent: '#CDBD98' },
    fonts: { title: 'Georgia, serif', body: 'Arial, sans-serif', footer: 'Arial, sans-serif' },
    decorations: [{ kind: 'sprockets', color: '#EBE4D2' }],
    defaultMessage: 'SnapSync',
    subtitle: 'ROLL 01 · 36 EXP',
  },
};

export type FrameThemeId = ThemeId;
export type ThemedFrameSticker = { key: string; src: string; x: number; y: number; size: number; rotation: number };

const HEIGHT = 1800;

type FrameSlot = { x: number; y: number; width: number; height: number; photoIndex: number };
type FrameLayout = { width: number; height: number; captionStart: number; slots: FrameSlot[] };

export const FRAME_LAYOUTS: Record<FrameLayoutId, FrameLayout> = {
  strip: {
    width: 600,
    height: HEIGHT,
    captionStart: 1456,
    slots: [40, 394, 748, 1102].map((y, photoIndex) => ({ x: 40, y, width: 520, height: 326, photoIndex })),
  },
  doubleStrip: {
    width: 1200,
    height: HEIGHT,
    captionStart: 1456,
    slots: [40, 394, 748, 1102].flatMap((y, photoIndex) => [
      { x: 40, y, width: 520, height: 326, photoIndex },
      { x: 640, y, width: 520, height: 326, photoIndex },
    ]),
  },
  grid: {
    width: 1200,
    height: HEIGHT,
    captionStart: 1400,
    slots: [
      { x: 40, y: 40, width: 535, height: 655, photoIndex: 0 },
      { x: 625, y: 40, width: 535, height: 655, photoIndex: 1 },
      { x: 40, y: 715, width: 535, height: 655, photoIndex: 2 },
      { x: 625, y: 715, width: 535, height: 655, photoIndex: 3 },
    ],
  },
  trio: {
    width: 600,
    height: HEIGHT,
    captionStart: 1408,
    slots: [40, 496, 952].map((y, photoIndex) => ({ x: 40, y, width: 520, height: 428, photoIndex })),
  },
  polaroid: {
    width: 1200,
    height: HEIGHT,
    captionStart: 1110,
    slots: [{ x: 90, y: 90, width: 1020, height: 1020, photoIndex: 0 }],
  },
};

function seeded(index: number, seed: number) {
  const value = Math.sin(index * 127.1 + seed * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function PhotoImage({ src, x, y, width, height, position, clipId }: {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  position: PhotoPosition;
  clipId: string;
}) {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    let active = true;
    const image = new Image();
    image.onload = () => {
      if (active) setDimensions({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      if (active) setDimensions(null);
    };
    image.src = src;
    return () => { active = false; };
  }, [src]);

  const scale = dimensions ? Math.max(width / dimensions.width, height / dimensions.height) : 1;
  const drawnWidth = dimensions ? dimensions.width * scale : width;
  const drawnHeight = dimensions ? dimensions.height * scale : height;
  const imageX = x + (width - drawnWidth) * position.x / 100;
  const imageY = y + (height - drawnHeight) * position.y / 100;

  return (
    <image
      clipPath={`url(#${clipId})`}
      data-frame-photo="true"
      data-fit-height={height}
      data-fit-width={width}
      data-fit-x={x}
      data-fit-y={y}
      data-position-x={position.x}
      data-position-y={position.y}
      href={src}
      preserveAspectRatio="none"
      x={imageX}
      y={imageY}
      width={drawnWidth}
      height={drawnHeight}
    />
  );
}

function Confetti({ colors, count, seed, width, height }: Extract<ThemeDecoration, { kind: 'confetti' }> & { width: number; height: number }) {
  return <g aria-hidden="true">{Array.from({ length: count }, (_, index) => {
    const x = 12 + seeded(index, seed) * (width - 24);
    const y = 16 + seeded(index + 63, seed) * (height - 32);
    const size = 5 + seeded(index + 127, seed) * 11;
    const rotation = seeded(index + 191, seed) * 180;
    return <rect key={index} fill={colors[index % colors.length]} height={size * 0.52} opacity=".92" transform={`rotate(${rotation} ${x} ${y})`} width={size} x={x} y={y} />;
  })}</g>;
}

function Heart({ x, y, size, color, opacity = 1 }: { x: number; y: number; size: number; color: string; opacity?: number }) {
  return <path d="M0 10 C-15 -4 -38 3 -34 23 C-31 38 0 58 0 58 C0 58 31 38 34 23 C38 3 15 -4 0 10Z" fill={color} opacity={opacity} transform={`translate(${x} ${y}) scale(${size / 58})`} />;
}

function Sparkle({ x, y, size, color }: { x: number; y: number; size: number; color: string }) {
  return <path d={`M${x} ${y - size} Q${x + size * .12} ${y - size * .12} ${x + size} ${y} Q${x + size * .12} ${y + size * .12} ${x} ${y + size} Q${x - size * .12} ${y + size * .12} ${x - size} ${y} Q${x - size * .12} ${y - size * .12} ${x} ${y - size}`} fill={color} />;
}

function BackgroundDecoration({ decoration, width, height }: { decoration: ThemeDecoration; width: number; height: number }) {
  if (decoration.kind === 'halftone') {
    return <defs><pattern height="34" id="funny-dots" patternUnits="userSpaceOnUse" width="34"><circle cx="4" cy="4" fill={decoration.color} r="4" /></pattern></defs>;
  }
  if (decoration.kind === 'confetti') return <Confetti {...decoration} height={height} width={width} />;
  if (decoration.kind === 'hearts') {
    return <g aria-hidden="true">{Array.from({ length: decoration.count }, (_, index) => (
      <Heart key={index} color={decoration.colors[index % decoration.colors.length]} opacity={0.4} size={16 + seeded(index, 9) * 24} x={24 + seeded(index + 5, 23) * (width - 48)} y={20 + seeded(index + 27, 31) * (height - 40)} />
    ))}</g>;
  }
  if (decoration.kind === 'sparkles') {
    return <g aria-hidden="true">{Array.from({ length: decoration.count }, (_, index) => (
      <Sparkle key={index} color={decoration.color} size={7 + seeded(index, 4) * 13} x={18 + seeded(index + 2, 8) * (width - 36)} y={35 + seeded(index + 4, 12) * (height - 70)} />
    ))}</g>;
  }
  if (decoration.kind === 'stars-clouds') {
    const clouds = [[0.15, 0.045], [0.83, 0.07], [0.5, 0.02], [0.92, 0.44], [0.03, 0.73]] as const;
    const stars = [[0.32, 0.14], [0.93, 0.48], [0.05, 0.47], [0.96, 0.68], [0.36, 0.89], [0.92, 0.93]] as const;
    return <g aria-hidden="true">
      {clouds.map(([x, y], index) => <g key={`cloud-${index}`} fill={decoration.colors[0]} transform={`translate(${width * x} ${height * y})`}><circle cx="0" cy="8" r="13" /><circle cx="17" cy="0" r="18" /><circle cx="37" cy="9" r="13" /><rect height="13" width="50" x="-7" y="8" /></g>)}
      {stars.map(([x, y], index) => <Sparkle key={`star-${index}`} color={decoration.colors[1]} size={10} x={width * x} y={height * y} />)}
    </g>;
  }
  if (decoration.kind === 'sprockets') {
    return <g aria-hidden="true" fill={decoration.color}>{Array.from({ length: 20 }, (_, index) => (
    <g key={index}><rect height="38" rx="8" width="20" x="10" y={24 + index * 91} /><rect height="38" rx="8" width="20" x={width - 30} y={24 + index * 91} /></g>
    ))}</g>;
  }
  return null;
}

function Bunting({ colors, width }: Extract<ThemeDecoration, { kind: 'bunting' }> & { width: number }) {
  return <g aria-hidden="true">
    <path d={`M0 20 Q${width / 2} 70 ${width} 20`} fill="none" stroke="#71547B" strokeWidth="4" />
    {Array.from({ length: Math.ceil(width / 48) }, (_, index) => {
      const step = width / Math.ceil(width / 48);
      const x = index * step;
      return <path key={index} d={`M${x} 22 L${x + step} 22 L${x + step / 2} 78Z`} fill={colors[index % colors.length]} />;
    })}
  </g>;
}

function Balloon({ x, y, color }: { x: number; y: number; color: string }) {
  return <g aria-hidden="true"><ellipse cx={x} cy={y} fill={color} rx="28" ry="38" /><ellipse cx={x - 9} cy={y - 12} fill="#FFFFFF" opacity=".45" rx="5" ry="9" /><path d={`M${x} ${y + 38} l-6 10 h12z M${x} ${y + 48} q-18 25 0 50`} fill={color} stroke={color} strokeWidth="3" /></g>;
}

function BirthdayCake({ colors, width, captionStart }: Extract<ThemeDecoration, { kind: 'cake' }> & { width: number; captionStart: number }) {
  const cakeWidth = Math.min(300, width * 0.5);
  const x = (width - cakeWidth) / 2;
  const y = captionStart + (HEIGHT - captionStart) * 0.54;
  return <g aria-hidden="true">
    <rect fill={colors[0]} height="52" rx="15" width={cakeWidth} x={x} y={y} />
    <rect fill={colors[1]} height="25" rx="10" width={cakeWidth} x={x} y={y - 10} />
    {Array.from({ length: 7 }, (_, index) => <circle key={index} cx={x + 14 + index * (cakeWidth - 28) / 6} cy={y + 10} fill={colors[1]} r="12" />)}
    {colors.slice(2, 5).map((color, index) => <g key={color}><rect fill={color} height="48" rx="6" width="11" x={x + cakeWidth * (0.25 + index * 0.25)} y={y - 52} /><ellipse cx={x + cakeWidth * (0.25 + index * 0.25) + 5.5} cy={y - 54} fill={colors[3]} rx="7" ry="10" /></g>)}
  </g>;
}

function ComicDecorations({ colors, labels, layout }: Extract<ThemeDecoration, { kind: 'comic' }> & { layout: FrameLayout }) {
  const burstPath = 'M0 -38 L12 -24 L34 -29 L31 -8 L48 1 L31 13 L34 34 L12 28 L0 45 L-12 28 L-34 34 L-31 13 L-48 1 L-31 -8 L-34 -29 L-12 -24Z';
  return <g aria-hidden="true">
    {layout.slots.map((slot, index) => {
      const x = slot.x + slot.width - 18;
      const y = slot.y + 24;
      const scale = Math.min(1, slot.width / 520, slot.height / 220);
      return <g key={`burst-${index}`} transform={`translate(${x} ${y}) scale(${scale})`}>
        <path d={burstPath} fill={colors[index % colors.length]} stroke="#111111" strokeLinejoin="round" strokeWidth="5" />
        <text dominantBaseline="middle" fill="#111111" fontFamily="Arial, sans-serif" fontSize="17" fontWeight="900" textAnchor="middle" y="1">{labels[index % labels.length]}</text>
      </g>;
    })}
    {layout.slots.length >= 4 && [1, 3].map((slotIndex, index) => {
      const slot = layout.slots.find((item) => item.photoIndex === slotIndex);
      if (!slot || slot.width < 450 || slot.height < 250) return null;
      const text = index === 0 ? 'send help' : "i'm fine";
      const x = slot.x + 18;
      const y = slot.y + slot.height - 60;
      return <g key={text} transform={`translate(${x} ${y})`}>
        <rect fill="#FFFFFF" height="43" rx="18" stroke="#111111" strokeWidth="5" width="142" />
        <path d="M30 41 l16 17 2-17" fill="#FFFFFF" stroke="#111111" strokeLinejoin="round" strokeWidth="4" />
        <text dominantBaseline="middle" fill="#111111" fontFamily="Arial, sans-serif" fontSize="15" fontWeight="700" textAnchor="middle" x="71" y="22">{text}</text>
      </g>;
    })}
  </g>;
}

function Butterflies({ colors, layout }: Extract<ThemeDecoration, { kind: 'butterflies' }> & { layout: FrameLayout }) {
  const points = layout.slots.flatMap((slot) => [
    { x: slot.x, y: slot.y + 12 },
    { x: slot.x + slot.width, y: slot.y + slot.height - 12 },
  ]);
  return <g aria-hidden="true" stroke="#4659E1" strokeWidth="3">{points.map(({ x, y }, index) => <g key={index} transform={`translate(${x} ${y}) scale(${Math.min(1, layout.width / 600)})`}>
    <ellipse cx="-9" cy="-6" fill={colors[index % colors.length]} rx="9" ry="12" /><ellipse cx="9" cy="-6" fill={colors[(index + 1) % colors.length]} rx="9" ry="12" /><ellipse cx="-8" cy="9" fill={colors[(index + 1) % colors.length]} rx="8" ry="10" /><ellipse cx="8" cy="9" fill={colors[index % colors.length]} rx="8" ry="10" /><path d="M0 -15v34 M-2 -15l-6-8 M2 -15l6-8" fill="none" />
  </g>)}</g>;
}

function InterlockingHearts({ colors, layout }: Extract<ThemeDecoration, { kind: 'interlocking-hearts' }> & { layout: FrameLayout }) {
  const center = layout.width / 2;
  const y = layout.captionStart + (HEIGHT - layout.captionStart) * 0.28;
  const size = Math.min(95, layout.width * 0.16);
  return <g aria-hidden="true" stroke="#FFFFFF" strokeWidth="4"><Heart color={colors[0]} size={size} x={center - size * 0.32} y={y} /><Heart color={colors[1]} size={size} x={center + size * 0.32} y={y} /></g>;
}

function Rainbow({ colors, layout }: Extract<ThemeDecoration, { kind: 'rainbow' }> & { layout: FrameLayout }) {
  const center = layout.width / 2;
  const base = HEIGHT + 10;
  const radius = Math.min(145, (HEIGHT - layout.captionStart) * 0.56, layout.width * 0.3);
  return <g aria-hidden="true" fill="none" strokeLinecap="butt">{colors.map((color, index) => <path key={color} d={`M${center - radius + index * 18} ${base} A${radius - index * 18} ${radius - index * 18} 0 0 1 ${center + radius - index * 18} ${base}`} stroke={color} strokeWidth="18" />)}
    <g fill="#FFFFFF"><circle cx={center - radius - 25} cy={HEIGHT - 38} r="23" /><circle cx={center - radius} cy={HEIGHT - 50} r="28" /><circle cx={center - radius + 24} cy={HEIGHT - 38} r="22" /><circle cx={center + radius - 24} cy={HEIGHT - 38} r="22" /><circle cx={center + radius} cy={HEIGHT - 50} r="28" /><circle cx={center + radius + 25} cy={HEIGHT - 38} r="23" /></g>
  </g>;
}

function OverlayDecoration({ decoration, layout }: { decoration: ThemeDecoration; layout: FrameLayout }) {
  if (decoration.kind === 'bunting') return <Bunting {...decoration} width={layout.width} />;
  if (decoration.kind === 'balloons') {
    const balloons = layout.slots.map((slot, index) => ({
      x: index % 2 === 0 ? slot.x + 12 : slot.x + slot.width - 12,
      y: slot.y + (index % 2 === 0 ? 30 : slot.height - 30),
      color: decoration.colors[index % decoration.colors.length],
    }));
    return <g>{balloons.map((balloon, index) => <Balloon key={index} {...balloon} />)}
      {layout.slots.length > 1 && <g transform={`translate(${layout.slots[0].x + layout.slots[0].width - 58} ${layout.slots[0].y + 10})`}><path d="M0 70 l28-70 31 70z" fill="#FFCE3C" /><circle cx="29" cy="2" fill="#3CC8BE" r="9" /></g>}
    </g>;
  }
  if (decoration.kind === 'cake') return <BirthdayCake {...decoration} captionStart={layout.captionStart} width={layout.width} />;
  if (decoration.kind === 'comic') return <ComicDecorations {...decoration} layout={layout} />;
  if (decoration.kind === 'butterflies') return <Butterflies {...decoration} layout={layout} />;
  if (decoration.kind === 'hearts') return <g aria-hidden="true">{layout.slots.map((slot, index) => <Heart key={index} color={decoration.colors[index % decoration.colors.length]} size={30} x={index % 2 ? slot.x + slot.width - 12 : slot.x + 12} y={index % 2 ? slot.y + 4 : slot.y + slot.height - 34} />)}</g>;
  if (decoration.kind === 'interlocking-hearts') return <InterlockingHearts {...decoration} layout={layout} />;
  if (decoration.kind === 'rainbow') return <Rainbow {...decoration} layout={layout} />;
  return null;
}

export function ThemedFrameSvg({
  themeId,
  layoutId,
  frameColor,
  frameTextColor,
  photos,
  photoPositions,
  duoPairs,
  stickers,
  customMessage,
  name,
  showText,
  svgRef,
}: {
  themeId: FrameThemeId;
  layoutId: FrameLayoutId;
  frameColor: string;
  frameTextColor: string;
  photos: string[];
  photoPositions: PhotoPosition[];
  duoPairs: PhotoPair[];
  stickers: ThemedFrameSticker[];
  customMessage: string;
  name: string;
  showText: boolean;
  svgRef: React.RefObject<SVGSVGElement | null>;
}) {
  const theme = FRAME_THEMES[themeId];
  const layout = FRAME_LAYOUTS[layoutId];
  const width = layout.width;
  const height = layout.height;
  const background = themeId === 'classic' ? frameColor : theme.background.type === 'solid' ? theme.background.color : `url(#${theme.id}-background)`;
  const title = customMessage.trim() || (themeId === 'birthday' && name.trim()
    ? `HAPPY BIRTHDAY, ${name.trim()}!`
    : theme.defaultMessage);
  const isBirthday = themeId === 'birthday' && !customMessage.trim();
  const fontFamily = theme.fonts.title;
  const captionHeight = height - layout.captionStart;
  const titleY = layout.captionStart + Math.min(75, captionHeight * 0.22);
  const footerY = layout.captionStart + captionHeight * 0.72;
  const footerTitle = themeId === 'retro-film' ? '' : themeId === 'kawaii' || themeId === 'y2k' || themeId === 'love' ? 'SnapSync' : '';
  const strokeWidth = theme.textColors.outline ? 7 : 0;

  return (
    <svg aria-label={`${theme.label} photo frame preview`} height={height} ref={svgRef} role="img" viewBox={`0 0 ${width} ${height}`} width={width} xmlns="http://www.w3.org/2000/svg">
      <defs>
        {theme.background.type === 'gradient' && <linearGradient id={`${theme.id}-background`} x1="0" x2="0" y1="0" y2="1">{theme.background.stops.map((stop) => <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />)}</linearGradient>}
        {theme.decorations.filter((decoration) => decoration.kind === 'halftone').map((decoration) => <BackgroundDecoration decoration={decoration} height={height} key={decoration.kind} width={width} />)}
        {layout.slots.map((slot, index) => {
          const inset = theme.slotStyle.borderWidth / 2;
          const slotWidth = slot.width - theme.slotStyle.borderWidth;
          const slotHeight = slot.height - theme.slotStyle.borderWidth;
          return <clipPath id={`slot-${theme.id}-${index}`} key={index}><rect height={Math.max(1, slotHeight)} rx={Math.max(0, theme.slotStyle.cornerRadius - inset)} width={Math.max(1, slotWidth)} x={slot.x + inset} y={slot.y + inset} /></clipPath>;
        })}
      </defs>
      <rect fill={background} height={height} width={width} />
      {themeId === 'funny' && <rect fill="url(#funny-dots)" height={height} width={width} />}
      {theme.decorations.map((decoration, index) => <BackgroundDecoration decoration={decoration} height={height} key={`bg-${index}`} width={width} />)}
      {theme.decorations.filter((decoration) => decoration.kind === 'bunting').map((decoration) => <OverlayDecoration decoration={decoration} key="bunting" layout={layout} />)}
      {layoutId === 'doubleStrip' && <path d={`M${width / 2} 0v${height}`} fill="none" stroke={theme.textColors.primary} strokeDasharray="12 12" strokeOpacity=".6" strokeWidth="2" />}

      {showText && (
        <g textAnchor="middle">
          {themeId === 'classic' ? null : themeId === 'birthday' && isBirthday ? (
            <>
              <text fill={theme.textColors.primary} fontFamily={theme.fonts.title} fontSize={Math.min(70, captionHeight * 0.12)} fontWeight="900" paintOrder="stroke" stroke={theme.textColors.outline} strokeLinejoin="round" strokeWidth={strokeWidth} x={width / 2} y={titleY}>HAPPY</text>
              <text fill={theme.textColors.secondary} fontFamily={theme.fonts.title} fontSize={Math.min(62, captionHeight * 0.11)} fontWeight="900" paintOrder="stroke" stroke={theme.textColors.outline} strokeLinejoin="round" strokeWidth={strokeWidth} textLength={name.trim() ? width * 0.86 : undefined} lengthAdjust="spacingAndGlyphs" x={width / 2} y={titleY + Math.min(58, captionHeight * 0.1)}>{`BIRTHDAY${name.trim() ? `, ${name.trim()}` : ''}!`}</text>
            </>
          ) : (
            <text fill={theme.textColors.primary} fontFamily={fontFamily} fontSize={themeId === 'love' ? Math.min(78, captionHeight * 0.14) : themeId === 'retro-film' ? Math.min(82, captionHeight * 0.15) : Math.min(58, captionHeight * 0.11)} fontStyle={themeId === 'love' || themeId === 'retro-film' ? 'italic' : undefined} fontWeight={themeId === 'love' || themeId === 'retro-film' ? 500 : 900} paintOrder="stroke" stroke={theme.textColors.outline ?? 'none'} strokeLinejoin="round" strokeWidth={strokeWidth} textLength={title.length > 13 ? width * 0.86 : undefined} lengthAdjust="spacingAndGlyphs" x={width / 2} y={titleY}>{title}</text>
          )}
          {themeId === 'retro-film' && <text fill={theme.textColors.secondary} fontFamily={theme.fonts.body} fontSize={Math.min(24, captionHeight * 0.045)} fontWeight="700" letterSpacing="5" x={width / 2} y={titleY + Math.min(48, captionHeight * 0.09)}>{customMessage.trim() ? theme.subtitle : 'ROLL 01 · 36 EXP'}</text>}
        </g>
      )}

      {layout.slots.map((slot, index) => {
        const clipId = `slot-${theme.id}-${index}`;
        const inset = theme.slotStyle.borderWidth / 2;
        const innerX = slot.x + inset;
        const innerY = slot.y + inset;
        const innerWidth = slot.width - theme.slotStyle.borderWidth;
        const innerHeight = slot.height - theme.slotStyle.borderWidth;
        const position = photoPositions[slot.photoIndex] ?? { x: 50, y: 50 };
        const pair = duoPairs[slot.photoIndex];
        const photo = photos[slot.photoIndex];
        const radius = theme.slotStyle.cornerRadius;
        return <g key={index}>
          {theme.slotStyle.shadow && <rect fill={theme.slotStyle.shadow.color} height={slot.height} rx={radius} width={slot.width} x={slot.x + theme.slotStyle.shadow.offset} y={slot.y + theme.slotStyle.shadow.offset} />}
          <rect fill={theme.slotStyle.fill} height={slot.height} rx={radius} stroke={theme.slotStyle.borderColor} strokeWidth={theme.slotStyle.borderWidth} width={slot.width} x={slot.x} y={slot.y} />
          {pair ? (
            <>
              <PhotoImage clipId={clipId} height={innerHeight} position={position} src={pair.host} width={innerWidth / 2} x={innerX} y={innerY} />
              <PhotoImage clipId={clipId} height={innerHeight} position={position} src={pair.guest} width={innerWidth / 2} x={innerX + innerWidth / 2} y={innerY} />
              <path d={`M${innerX + innerWidth / 2} ${innerY}v${innerHeight}`} stroke={theme.slotStyle.borderColor} strokeOpacity=".7" strokeWidth="2" />
            </>
          ) : photo ? (
            <PhotoImage clipId={clipId} height={innerHeight} position={position} src={photo} width={innerWidth} x={innerX} y={innerY} />
          ) : null}
          {theme.slotStyle.borderWidth > 0 && <rect fill="none" height={slot.height} pointerEvents="none" rx={radius} stroke={theme.slotStyle.borderColor} strokeWidth={theme.slotStyle.borderWidth} width={slot.width} x={slot.x} y={slot.y} />}
        </g>;
      })}

      {theme.decorations.filter((decoration) => ['balloons', 'cake', 'comic', 'butterflies', 'hearts', 'interlocking-hearts', 'rainbow'].includes(decoration.kind)).map((decoration, index) => <OverlayDecoration decoration={decoration} key={`overlay-${index}`} layout={layout} />)}
      {themeId === 'funny' && showText && <g aria-hidden="true"><rect fill="#111111" height={Math.min(88, captionHeight * 0.25)} rx="12" width={width * 0.86} x={width * 0.07} y={layout.captionStart + captionHeight * 0.35} /><text fill="#FFE23C" fontFamily="Arial, sans-serif" fontSize={Math.min(43, captionHeight * 0.13)} fontWeight="900" textAnchor="middle" x={width / 2} y={layout.captionStart + captionHeight * 0.35 + Math.min(58, captionHeight * 0.17)}>CAUGHT IN 4K</text><text fill="#111111" fontFamily="Georgia, serif" fontSize={Math.min(50, captionHeight * 0.15)} fontStyle="italic" textAnchor="middle" x={width / 2} y={footerY}>SnapSync</text></g>}
      {showText && footerTitle && <g aria-hidden="true"><text fill={theme.textColors.primary} fontFamily={theme.fonts.footer} fontSize={Math.min(themeId === 'y2k' ? 72 : 54, captionHeight * 0.18)} fontStyle="italic" paintOrder="stroke" stroke={theme.textColors.outline ?? 'none'} strokeWidth={theme.textColors.outline ? 5 : 0} textAnchor="middle" x={width / 2} y={footerY}>{footerTitle}</text>{themeId === 'y2k' && <text fill={theme.textColors.primary} fontFamily={theme.fonts.body} fontSize={Math.min(25, captionHeight * 0.07)} fontWeight="800" paintOrder="stroke" stroke={theme.textColors.outline} strokeWidth="5" textAnchor="middle" x={width / 2} y={footerY + Math.min(48, captionHeight * 0.14)}>{theme.subtitle}</text>}</g>}
      {themeId === 'birthday' && showText && <text fill={theme.textColors.secondary} fontFamily={theme.fonts.footer} fontSize={Math.min(22, captionHeight * 0.07)} fontStyle="italic" fontWeight="700" textAnchor="middle" x={width / 2} y={height - 18}>{theme.subtitle}</text>}
      {themeId === 'retro-film' && showText && <g aria-hidden="true"><text fill={theme.textColors.secondary} fontFamily={theme.fonts.body} fontSize={Math.min(52, captionHeight * 0.15)} fontWeight="800" letterSpacing="4" textAnchor="middle" x={width / 2} y={footerY}>{new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(new Date()).replaceAll('/', ' · ')}</text><text fill={theme.textColors.primary} fontFamily={theme.fonts.body} fontSize={Math.min(21, captionHeight * 0.06)} fontWeight="700" letterSpacing="5" textAnchor="middle" x={width / 2} y={height - 24}>DEVELOPED BY SNAPSYNC</text></g>}
      {showText && themeId === 'classic' && <g aria-hidden="true"><text fill={frameTextColor} fontFamily={theme.fonts.body} fontSize={Math.min(30, captionHeight * 0.09)} fontWeight="700" textAnchor="middle" x={width / 2} y={layout.captionStart + captionHeight * 0.34}>{customMessage.trim()}</text><text fill={frameTextColor} fontFamily={theme.fonts.title} fontSize={Math.min(54, captionHeight * 0.17)} fontStyle="italic" textAnchor="middle" x={width / 2} y={layout.captionStart + captionHeight * 0.58}>SnapSync</text><text fill={frameTextColor} fontFamily={theme.fonts.body} fontSize={Math.min(18, captionHeight * 0.055)} fontWeight="700" letterSpacing="4" textAnchor="middle" x={width / 2} y={layout.captionStart + captionHeight * 0.77}>SNAP · SYNC · SMILE</text></g>}
      {stickers.map((sticker) => {
        const size = width * sticker.size / 100;
        const x = width * sticker.x / 100;
        const y = height * sticker.y / 100;
        return <image data-frame-sticker={sticker.key} href={sticker.src} key={sticker.key} preserveAspectRatio="xMidYMid meet" transform={`rotate(${sticker.rotation} ${x} ${y})`} width={size} height={size} x={x - size / 2} y={y - size / 2} />;
      })}
    </svg>
  );
}

export function ThemeCardPreview({ themeId }: { themeId: FrameThemeId }) {
  const theme = FRAME_THEMES[themeId];
  const background = theme.background.type === 'solid' ? theme.background.color : `linear-gradient(${theme.background.stops.map((stop) => `${stop.color} ${stop.offset}`).join(', ')})`;
  return <span aria-hidden="true" className={styles.themeCardPreview} style={{ background }}>
    <i style={{ backgroundColor: theme.textColors.primary, borderColor: theme.slotStyle.borderColor }} />
    <i style={{ backgroundColor: theme.textColors.primary, borderColor: theme.slotStyle.borderColor }} />
    <i style={{ backgroundColor: theme.textColors.primary, borderColor: theme.slotStyle.borderColor }} />
    <i style={{ backgroundColor: theme.textColors.primary, borderColor: theme.slotStyle.borderColor }} />
  </span>;
}
