'use client';

import { useEffect, useState } from 'react';
import styles from './themed-frame.module.css';

type ThemeId = 'classic' | 'birthday' | 'funny' | 'y2k' | 'love' | 'kawaii' | 'retro-film';
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

const SLOT_X = 40;
const SLOT_WIDTH = 520;
const SLOT_HEIGHT = 300;
const SLOT_YS = [270, 590, 910, 1230];
const WIDTH = 600;
const HEIGHT = 1800;

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

function Confetti({ colors, count, seed }: Extract<ThemeDecoration, { kind: 'confetti' }>) {
  return <g aria-hidden="true">{Array.from({ length: count }, (_, index) => {
    const x = 12 + seeded(index, seed) * 576;
    const y = 16 + seeded(index + 63, seed) * 1768;
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

function BackgroundDecoration({ decoration }: { decoration: ThemeDecoration }) {
  if (decoration.kind === 'halftone') {
    return <defs><pattern height="34" id="funny-dots" patternUnits="userSpaceOnUse" width="34"><circle cx="4" cy="4" fill={decoration.color} r="4" /></pattern></defs>;
  }
  if (decoration.kind === 'confetti') return <Confetti {...decoration} />;
  if (decoration.kind === 'hearts') {
    return <g aria-hidden="true">{Array.from({ length: decoration.count }, (_, index) => (
      <Heart key={index} color={decoration.colors[index % decoration.colors.length]} opacity={0.4} size={16 + seeded(index, 9) * 24} x={24 + seeded(index + 5, 23) * 552} y={20 + seeded(index + 27, 31) * 1760} />
    ))}</g>;
  }
  if (decoration.kind === 'sparkles') {
    return <g aria-hidden="true">{Array.from({ length: decoration.count }, (_, index) => (
      <Sparkle key={index} color={decoration.color} size={7 + seeded(index, 4) * 13} x={18 + seeded(index + 2, 8) * 564} y={35 + seeded(index + 4, 12) * 1730} />
    ))}</g>;
  }
  if (decoration.kind === 'stars-clouds') {
    const clouds = [[88, 82], [496, 130], [285, 34], [562, 780], [18, 1310]] as const;
    const stars = [[190, 250], [560, 870], [28, 850], [580, 1210], [220, 1600], [550, 1670]] as const;
    return <g aria-hidden="true">
      {clouds.map(([x, y], index) => <g key={`cloud-${index}`} fill={decoration.colors[0]} transform={`translate(${x} ${y})`}><circle cx="0" cy="8" r="13" /><circle cx="17" cy="0" r="18" /><circle cx="37" cy="9" r="13" /><rect height="13" width="50" x="-7" y="8" /></g>)}
      {stars.map(([x, y], index) => <Sparkle key={`star-${index}`} color={decoration.colors[1]} size={10} x={x} y={y} />)}
    </g>;
  }
  if (decoration.kind === 'sprockets') {
    return <g aria-hidden="true" fill={decoration.color}>{Array.from({ length: 20 }, (_, index) => (
      <g key={index}><rect height="38" rx="8" width="20" x="10" y={24 + index * 91} /><rect height="38" rx="8" width="20" x="570" y={24 + index * 91} /></g>
    ))}</g>;
  }
  return null;
}

function Bunting({ colors }: Extract<ThemeDecoration, { kind: 'bunting' }>) {
  return <g aria-hidden="true">
    <path d="M0 30 Q300 84 600 30" fill="none" stroke="#71547B" strokeWidth="5" />
    {Array.from({ length: 12 }, (_, index) => {
      const x = index * 52 - 6;
      return <path key={index} d={`M${x} 30 L${x + 48} 34 L${x + 24} 118Z`} fill={colors[index % colors.length]} />;
    })}
  </g>;
}

function Balloon({ x, y, color }: { x: number; y: number; color: string }) {
  return <g aria-hidden="true"><ellipse cx={x} cy={y} fill={color} rx="28" ry="38" /><ellipse cx={x - 9} cy={y - 12} fill="#FFFFFF" opacity=".45" rx="5" ry="9" /><path d={`M${x} ${y + 38} l-6 10 h12z M${x} ${y + 48} q-18 25 0 50`} fill={color} stroke={color} strokeWidth="3" /></g>;
}

function BirthdayCake({ colors }: Extract<ThemeDecoration, { kind: 'cake' }>) {
  return <g aria-hidden="true">
    <rect fill={colors[0]} height="72" rx="18" width="300" x="150" y="1650" />
    <rect fill={colors[1]} height="36" rx="14" width="300" x="150" y="1638" />
    {Array.from({ length: 7 }, (_, index) => <circle key={index} cx={168 + index * 44} cy="1672" fill={colors[1]} r="17" />)}
    {colors.slice(2).map((color, index) => <g key={color}><rect fill={color} height="65" rx="8" width="14" x={220 + index * 75} y="1570" /><ellipse cx={227 + index * 75} cy="1568" fill={colors[3]} rx="9" ry="13" /></g>)}
  </g>;
}

function ComicDecorations({ colors, labels }: Extract<ThemeDecoration, { kind: 'comic' }>) {
  const bursts = ['M0 -38 L12 -24 L34 -29 L31 -8 L48 1 L31 13 L34 34 L12 28 L0 45 L-12 28 L-34 34 L-31 13 L-48 1 L-31 -8 L-34 -29 L-12 -24Z'];
  return <g aria-hidden="true">
    {SLOT_YS.map((y, index) => <g key={`burst-${index}`} transform={`translate(548 ${y + 24})`}>
      <path d={bursts[0]} fill={colors[index]} stroke="#111111" strokeLinejoin="round" strokeWidth="5" />
      <text dominantBaseline="middle" fill="#111111" fontFamily="Arial, sans-serif" fontSize="17" fontWeight="900" textAnchor="middle" y="1">{labels[index]}</text>
    </g>)}
    {[{ y: 590, text: 'send help' }, { y: 1230, text: "i'm fine" }].map(({ y, text }) => <g key={text} transform={`translate(60 ${y + 218})`}>
      <rect fill="#FFFFFF" height="43" rx="18" stroke="#111111" strokeWidth="5" width="142" />
      <path d="M30 41 l16 17 2-17" fill="#FFFFFF" stroke="#111111" strokeLinejoin="round" strokeWidth="4" />
      <text dominantBaseline="middle" fill="#111111" fontFamily="Arial, sans-serif" fontSize="15" fontWeight="700" textAnchor="middle" x="71" y="22">{text}</text>
    </g>)}
  </g>;
}

function Butterflies({ colors }: Extract<ThemeDecoration, { kind: 'butterflies' }>) {
  const points = [[44, 272], [555, 594], [555, 914], [44, 1215]] as const;
  return <g aria-hidden="true" stroke="#4659E1" strokeWidth="3">{points.map(([x, y], index) => <g key={index} transform={`translate(${x} ${y})`}>
    <ellipse cx="-9" cy="-6" fill={colors[index % colors.length]} rx="9" ry="12" /><ellipse cx="9" cy="-6" fill={colors[(index + 1) % colors.length]} rx="9" ry="12" /><ellipse cx="-8" cy="9" fill={colors[(index + 1) % colors.length]} rx="8" ry="10" /><ellipse cx="8" cy="9" fill={colors[index % colors.length]} rx="8" ry="10" /><path d="M0 -15v34 M-2 -15l-6-8 M2 -15l6-8" fill="none" />
  </g>)}</g>;
}

function InterlockingHearts({ colors }: Extract<ThemeDecoration, { kind: 'interlocking-hearts' }>) {
  return <g aria-hidden="true" stroke="#FFFFFF" strokeWidth="4"><Heart color={colors[0]} size={95} x={278} y={1640} /><Heart color={colors[1]} size={95} x={338} y={1640} /></g>;
}

function Rainbow({ colors }: Extract<ThemeDecoration, { kind: 'rainbow' }>) {
  return <g aria-hidden="true" fill="none" strokeLinecap="butt">{colors.map((color, index) => <path key={color} d={`M${156 + index * 18} 1810 A${144 - index * 18} ${144 - index * 18} 0 0 1 ${444 - index * 18} 1810`} stroke={color} strokeWidth="18" />)}
    <g fill="#FFFFFF"><circle cx="110" cy="1760" r="26" /><circle cx="138" cy="1748" r="31" /><circle cx="166" cy="1762" r="24" /><circle cx="434" cy="1762" r="24" /><circle cx="463" cy="1748" r="31" /><circle cx="491" cy="1760" r="26" /></g>
  </g>;
}

function OverlayDecoration({ decoration }: { decoration: ThemeDecoration }) {
  if (decoration.kind === 'bunting') return <Bunting {...decoration} />;
  if (decoration.kind === 'balloons') return <g><Balloon color={decoration.colors[0]} x={42} y={324} /><Balloon color={decoration.colors[1]} x={558} y={620} /><Balloon color={decoration.colors[2]} x={42} y={1005} /><Balloon color={decoration.colors[3]} x={558} y={1270} /><path d="M490 505 l30-75 34 75z" fill="#FFCE3C" /><circle cx="520" cy="426" fill="#3CC8BE" r="10" /></g>;
  if (decoration.kind === 'cake') return <BirthdayCake {...decoration} />;
  if (decoration.kind === 'comic') return <ComicDecorations {...decoration} />;
  if (decoration.kind === 'butterflies') return <Butterflies {...decoration} />;
  if (decoration.kind === 'interlocking-hearts') return <InterlockingHearts {...decoration} />;
  if (decoration.kind === 'rainbow') return <Rainbow {...decoration} />;
  return null;
}

export function ThemedFrameSvg({
  themeId,
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
  const background = themeId === 'classic' ? frameColor : theme.background.type === 'solid' ? theme.background.color : `url(#${theme.id}-background)`;
  const title = customMessage.trim() || (themeId === 'birthday' && name.trim()
    ? `HAPPY BIRTHDAY, ${name.trim()}!`
    : theme.defaultMessage);
  const isBirthday = themeId === 'birthday' && !customMessage.trim();
  const fontFamily = theme.fonts.title;
  const footerTitle = themeId === 'retro-film' ? '' : themeId === 'kawaii' ? 'SnapSync' : themeId === 'y2k' ? 'SnapSync' : themeId === 'love' ? 'SnapSync' : '';
  const strokeWidth = theme.textColors.outline ? 7 : 0;

  return (
    <svg aria-label={`${theme.label} photo frame preview`} height={HEIGHT} ref={svgRef} role="img" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width={WIDTH} xmlns="http://www.w3.org/2000/svg">
      <defs>
        {theme.background.type === 'gradient' && <linearGradient id={`${theme.id}-background`} x1="0" x2="0" y1="0" y2="1">{theme.background.stops.map((stop) => <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />)}</linearGradient>}
        {theme.decorations.filter((decoration) => decoration.kind === 'halftone').map((decoration) => <BackgroundDecoration decoration={decoration} key={decoration.kind} />)}
        {SLOT_YS.map((y, index) => {
          const inset = theme.slotStyle.borderWidth / 2;
          const slotWidth = SLOT_WIDTH - theme.slotStyle.borderWidth;
          const slotHeight = SLOT_HEIGHT - theme.slotStyle.borderWidth;
          return <clipPath id={`slot-${theme.id}-${index}`} key={index}><rect height={Math.max(1, slotHeight)} rx={Math.max(0, theme.slotStyle.cornerRadius - inset)} width={Math.max(1, slotWidth)} x={SLOT_X + inset} y={y + inset} /></clipPath>;
        })}
      </defs>
      <rect fill={background} height={HEIGHT} width={WIDTH} />
      {themeId === 'funny' && <rect fill="url(#funny-dots)" height={HEIGHT} width={WIDTH} />}
      {theme.decorations.map((decoration, index) => <BackgroundDecoration decoration={decoration} key={`bg-${index}`} />)}
      {theme.decorations.filter((decoration) => decoration.kind === 'bunting').map((decoration) => <OverlayDecoration decoration={decoration} key="bunting" />)}

      {showText && (
        <g textAnchor="middle">
          {themeId === 'classic' ? null : themeId === 'birthday' && isBirthday ? (
            <>
              <text fill={theme.textColors.primary} fontFamily={theme.fonts.title} fontSize="70" fontWeight="900" paintOrder="stroke" stroke={theme.textColors.outline} strokeLinejoin="round" strokeWidth={strokeWidth} x="300" y="165">HAPPY</text>
              <text fill={theme.textColors.secondary} fontFamily={theme.fonts.title} fontSize={name.trim() ? 48 : 62} fontWeight="900" paintOrder="stroke" stroke={theme.textColors.outline} strokeLinejoin="round" strokeWidth={strokeWidth} textLength={name.trim() ? 520 : undefined} lengthAdjust="spacingAndGlyphs" x="300" y="235">{`BIRTHDAY${name.trim() ? `, ${name.trim()}` : ''}!`}</text>
            </>
          ) : (
            <text fill={theme.textColors.primary} fontFamily={fontFamily} fontSize={themeId === 'love' ? 78 : themeId === 'retro-film' ? 82 : 58} fontStyle={themeId === 'love' || themeId === 'retro-film' ? 'italic' : undefined} fontWeight={themeId === 'love' || themeId === 'retro-film' ? 500 : 900} paintOrder="stroke" stroke={theme.textColors.outline ?? 'none'} strokeLinejoin="round" strokeWidth={strokeWidth} textLength={title.length > 13 ? 520 : undefined} lengthAdjust="spacingAndGlyphs" x="300" y="170">{title}</text>
          )}
          {themeId === 'retro-film' && <text fill={theme.textColors.secondary} fontFamily={theme.fonts.body} fontSize="24" fontWeight="700" letterSpacing="5" x="300" y="220">{customMessage.trim() ? theme.subtitle : 'ROLL 01 · 36 EXP'}</text>}
        </g>
      )}

      {SLOT_YS.map((y, index) => {
        const clipId = `slot-${theme.id}-${index}`;
        const inset = theme.slotStyle.borderWidth / 2;
        const innerX = SLOT_X + inset;
        const innerY = y + inset;
        const innerWidth = SLOT_WIDTH - theme.slotStyle.borderWidth;
        const innerHeight = SLOT_HEIGHT - theme.slotStyle.borderWidth;
        const position = photoPositions[index] ?? { x: 50, y: 50 };
        const pair = duoPairs[index];
        const photo = photos[index];
        const radius = theme.slotStyle.cornerRadius;
        return <g key={index}>
          {theme.slotStyle.shadow && <rect fill={theme.slotStyle.shadow.color} height={SLOT_HEIGHT} rx={radius} width={SLOT_WIDTH} x={SLOT_X + theme.slotStyle.shadow.offset} y={y + theme.slotStyle.shadow.offset} />}
          <rect fill={theme.slotStyle.fill} height={SLOT_HEIGHT} rx={radius} stroke={theme.slotStyle.borderColor} strokeWidth={theme.slotStyle.borderWidth} width={SLOT_WIDTH} x={SLOT_X} y={y} />
          {pair ? (
            <>
              <PhotoImage clipId={clipId} height={innerHeight} position={position} src={pair.host} width={innerWidth / 2} x={innerX} y={innerY} />
              <PhotoImage clipId={clipId} height={innerHeight} position={position} src={pair.guest} width={innerWidth / 2} x={innerX + innerWidth / 2} y={innerY} />
              <path d={`M${WIDTH / 2} ${innerY}v${innerHeight}`} stroke={theme.slotStyle.borderColor} strokeOpacity=".7" strokeWidth="2" />
            </>
          ) : photo ? (
            <PhotoImage clipId={clipId} height={innerHeight} position={position} src={photo} width={innerWidth} x={innerX} y={innerY} />
          ) : null}
          {showText && <text fill={themeId === 'retro-film' ? '#BDAF8D' : themeId === 'love' ? '#EFC8D4' : '#D8CCDB'} fontFamily={theme.fonts.body} fontSize="18" opacity=".9" textAnchor="middle" x="300" y={y + 278}>PHOTO {index + 1}</text>}
          {themeId === 'retro-film' && showText && <text fill={theme.textColors.secondary} fontFamily={theme.fonts.body} fontSize="15" fontWeight="700" textAnchor="middle" x="27" y={y + 24}>{index + 1}</text>}
          {theme.slotStyle.borderWidth > 0 && <rect fill="none" height={SLOT_HEIGHT} pointerEvents="none" rx={radius} stroke={theme.slotStyle.borderColor} strokeWidth={theme.slotStyle.borderWidth} width={SLOT_WIDTH} x={SLOT_X} y={y} />}
        </g>;
      })}

      {theme.decorations.filter((decoration) => decoration.kind === 'balloons' || decoration.kind === 'cake' || decoration.kind === 'comic' || decoration.kind === 'butterflies' || decoration.kind === 'interlocking-hearts' || decoration.kind === 'rainbow').map((decoration, index) => <OverlayDecoration decoration={decoration} key={`overlay-${index}`} />)}
      {themeId === 'funny' && showText && <g aria-hidden="true"><rect fill="#111111" height="88" rx="12" width="520" x="40" y="1548" /><text fill="#FFE23C" fontFamily="Arial, sans-serif" fontSize="43" fontWeight="900" textAnchor="middle" x="300" y="1607">CAUGHT IN 4K</text><text fill="#111111" fontFamily="Georgia, serif" fontSize="50" fontStyle="italic" textAnchor="middle" x="300" y="1713">SnapSync</text><text fill="#111111" fontFamily="Arial, sans-serif" fontSize="22" fontStyle="italic" textAnchor="middle" x="300" y="1750">no filter. no shame.</text></g>}
      {showText && footerTitle && <g aria-hidden="true"><text fill={theme.textColors.primary} fontFamily={theme.fonts.footer} fontSize={themeId === 'y2k' ? 72 : 54} fontStyle="italic" paintOrder="stroke" stroke={theme.textColors.outline ?? 'none'} strokeWidth={theme.textColors.outline ? 5 : 0} textAnchor="middle" x="300" y={themeId === 'kawaii' ? 1605 : 1700}>{footerTitle}</text>{themeId === 'y2k' && <text fill={theme.textColors.primary} fontFamily={theme.fonts.body} fontSize="25" fontWeight="800" paintOrder="stroke" stroke={theme.textColors.outline} strokeWidth="5" textAnchor="middle" x="300" y="1755">{theme.subtitle}</text>}</g>}
      {themeId === 'birthday' && showText && <text fill={theme.textColors.secondary} fontFamily={theme.fonts.footer} fontSize="22" fontStyle="italic" fontWeight="700" textAnchor="middle" x="300" y="1772">{theme.subtitle}</text>}
      {themeId === 'retro-film' && showText && <g aria-hidden="true"><text fill={theme.textColors.secondary} fontFamily={theme.fonts.body} fontSize="52" fontWeight="800" letterSpacing="4" textAnchor="middle" x="300" y="1650">{new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(new Date()).replaceAll('/', ' · ')}</text><text fill={theme.textColors.primary} fontFamily={theme.fonts.body} fontSize="21" fontWeight="700" letterSpacing="5" textAnchor="middle" x="300" y="1724">DEVELOPED BY SNAPSYNC</text></g>}
      {showText && themeId === 'classic' && <g aria-hidden="true"><text fill={frameTextColor} fontFamily={theme.fonts.title} fontSize="54" fontStyle="italic" textAnchor="middle" x="300" y="1660">{customMessage.trim() || theme.defaultMessage}</text><text fill={frameTextColor} fontFamily={theme.fonts.body} fontSize="18" fontWeight="700" letterSpacing="4" textAnchor="middle" x="300" y="1718">{theme.subtitle}</text></g>}
      {stickers.map((sticker) => {
        const size = WIDTH * sticker.size / 100;
        const x = WIDTH * sticker.x / 100;
        const y = HEIGHT * sticker.y / 100;
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
