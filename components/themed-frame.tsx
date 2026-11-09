'use client';

import { useEffect, useState } from 'react';
import styles from './themed-frame.module.css';

export type FrameLayoutId = 'strip' | 'doubleStrip' | 'grid' | 'trio' | 'polaroid';
type PhotoPosition = { x: number; y: number; zoom?: number };
type PhotoPair = { host: string; guest: string } | undefined;
type Background =
  | { type: 'solid'; color: string }
  | { type: 'gradient'; stops: { color: string; offset: string }[] };
type EditorialDesign = { kind: 'editorial'; ink: string; labels: [string, string, string]; quote: string; times?: boolean };
type ThemeDesign = EditorialDesign | { kind: 'groovy' } | { kind: 'neon' } | { kind: 'scrapbook' } | { kind: 'sakura' } | { kind: 'tropical' } | { kind: 'christmas' };
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
  id: string;
  label: string;
  group: string;
  background: Background;
  slotStyle: { borderColor: string; borderWidth: number; cornerRadius: number; fill: string; shadow?: { color: string; offset: number } };
  textColors: { primary: string; secondary: string; outline?: string; accent?: string };
  fonts: { title: string; body: string; footer: string };
  decorations: ThemeDecoration[];
  defaultMessage: string;
  subtitle: string;
  design?: ThemeDesign;
};

const editorialDesign = (ink: string, labels: [string, string, string], quote: string, times = false): EditorialDesign => ({ kind: 'editorial', ink, labels, quote, times });

export const FRAME_THEMES: Record<string, ThemeConfig> = {
  classic: {
    id: 'classic',
    label: 'Classic',
    group: 'Classic',
    background: { type: 'solid', color: '#000000' },
    slotStyle: { borderColor: 'transparent', borderWidth: 0, cornerRadius: 0, fill: '#FFFFFF' },
    textColors: { primary: '#FFFFFF', secondary: '#FFFFFF' },
    fonts: { title: 'var(--font-lora), Georgia, serif', body: 'var(--font-poppins), Arial, sans-serif', footer: 'var(--font-poppins), Arial, sans-serif' },
    decorations: [],
    defaultMessage: 'SnapSync',
    subtitle: 'SNAP · SYNC · SMILE',
  },
  birthday: {
    id: 'birthday',
    label: 'Birthday',
    group: 'Seasonal',
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
    group: 'Fun',
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
    group: 'Aesthetic',
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
    group: 'Aesthetic',
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
    group: 'Aesthetic',
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
    group: 'Aesthetic',
    background: { type: 'solid', color: '#100E0C' },
    slotStyle: { borderColor: '#100E0C', borderWidth: 4, cornerRadius: 12, fill: '#F3E8D0' },
    textColors: { primary: '#F3E8D0', secondary: '#FF9A2E', accent: '#CDBD98' },
    fonts: { title: 'Georgia, serif', body: 'Arial, sans-serif', footer: 'Arial, sans-serif' },
    decorations: [{ kind: 'sprockets', color: '#EBE4D2' }],
    defaultMessage: 'SnapSync',
    subtitle: 'ROLL 01 · 36 EXP',
  },
  editorial: {
    id: 'editorial', label: 'Editorial', group: 'Minimal',
    background: { type: 'solid', color: '#F5F1E9' }, slotStyle: { borderColor: '#181818', borderWidth: 2, cornerRadius: 0, fill: '#FFFFFF' },
    textColors: { primary: '#181818', secondary: '#77716A' }, fonts: { title: 'var(--font-lora), Georgia, serif', body: 'var(--font-poppins), Arial, sans-serif', footer: 'var(--font-poppins), Arial, sans-serif' }, decorations: [],
    defaultMessage: 'keep the moment. share the frame.', subtitle: '', design: editorialDesign('#181818', ['VOL. 01', 'THE PHOTO ISSUE', 'NO. 04'], 'keep the moment. share the frame.'),
  },
  noir: {
    id: 'noir', label: 'Noir', group: 'Minimal',
    background: { type: 'solid', color: '#121212' }, slotStyle: { borderColor: '#F0ECE2', borderWidth: 2, cornerRadius: 0, fill: '#F7F4EC' },
    textColors: { primary: '#F0ECE2', secondary: '#77756F' }, fonts: { title: 'var(--font-lora), Georgia, serif', body: 'var(--font-poppins), Arial, sans-serif', footer: 'var(--font-poppins), Arial, sans-serif' }, decorations: [],
    defaultMessage: 'good people. good light.', subtitle: '', design: editorialDesign('#F0ECE2', ['VOL. 01', 'THE NIGHT ISSUE', 'NO. 05'], 'good people. good light.'),
  },
  blush: {
    id: 'blush', label: 'Blush', group: 'Minimal',
    background: { type: 'solid', color: '#F9E5E5' }, slotStyle: { borderColor: '#702034', borderWidth: 2, cornerRadius: 0, fill: '#FFF8F6' },
    textColors: { primary: '#702034', secondary: '#A8757F' }, fonts: { title: 'var(--font-lora), Georgia, serif', body: 'var(--font-poppins), Arial, sans-serif', footer: 'var(--font-poppins), Arial, sans-serif' }, decorations: [],
    defaultMessage: 'moments, in sync.', subtitle: '', design: editorialDesign('#702034', ['VOL. 01', 'THE LOVE ISSUE', 'NO. 06'], 'moments, in sync.'),
  },
  sage: {
    id: 'sage', label: 'Sage', group: 'Minimal',
    background: { type: 'solid', color: '#E2E9D7' }, slotStyle: { borderColor: '#2E422C', borderWidth: 2, cornerRadius: 0, fill: '#FAFAF2' },
    textColors: { primary: '#2E422C', secondary: '#75816E' }, fonts: { title: 'var(--font-lora), Georgia, serif', body: 'var(--font-poppins), Arial, sans-serif', footer: 'var(--font-poppins), Arial, sans-serif' }, decorations: [],
    defaultMessage: 'keep it simple. keep it real.', subtitle: '', design: editorialDesign('#2E422C', ['VOL. 01', 'THE GARDEN ISSUE', 'NO. 07'], 'keep it simple. keep it real.'),
  },
  sky: {
    id: 'sky', label: 'Sky', group: 'Minimal',
    background: { type: 'solid', color: '#E2EBF6' }, slotStyle: { borderColor: '#1E3260', borderWidth: 2, cornerRadius: 0, fill: '#FAFCFF' },
    textColors: { primary: '#1E3260', secondary: '#6F809F' }, fonts: { title: 'var(--font-lora), Georgia, serif', body: 'var(--font-poppins), Arial, sans-serif', footer: 'var(--font-poppins), Arial, sans-serif' }, decorations: [],
    defaultMessage: 'for the ones you miss.', subtitle: '', design: editorialDesign('#1E3260', ['VOL. 01', 'THE SUMMER ISSUE', 'NO. 08'], 'for the ones you miss.'),
  },
  times: {
    id: 'times', label: 'The Times', group: 'Minimal',
    background: { type: 'solid', color: '#EEE8DA' }, slotStyle: { borderColor: '#1E1C1A', borderWidth: 2, cornerRadius: 0, fill: '#FAF7EF' },
    textColors: { primary: '#1E1C1A', secondary: '#81796D' }, fonts: { title: 'var(--font-lora), Georgia, serif', body: 'var(--font-poppins), Arial, sans-serif', footer: 'var(--font-poppins), Arial, sans-serif' }, decorations: [],
    defaultMessage: 'You looked great.', subtitle: '', design: editorialDesign('#1E1C1A', ['NOVEMBER 2026', 'VOL. 01', 'PRICE: ONE SMILE'], 'You looked great.', true),
  },
  groovy: {
    id: 'groovy', label: 'Groovy 70s', group: 'Aesthetic', background: { type: 'solid', color: '#FCECCC' },
    slotStyle: { borderColor: '#783C28', borderWidth: 8, cornerRadius: 46, fill: '#FFF9E8', shadow: { color: '#F4A028', offset: 10 } },
    textColors: { primary: '#783C28', secondary: '#D65428' }, fonts: { title: 'var(--font-lora), Georgia, serif', body: 'var(--font-poppins), Arial, sans-serif', footer: 'var(--font-lora), Georgia, serif' }, decorations: [], defaultMessage: 'GOOD VIBRATIONS', subtitle: '', design: { kind: 'groovy' },
  },
  neon: {
    id: 'neon', label: 'Neon arcade', group: 'Fun', background: { type: 'gradient', stops: [{ color: '#0E0828', offset: '0%' }, { color: '#280C4A', offset: '100%' }] },
    slotStyle: { borderColor: '#3CE6FF', borderWidth: 3, cornerRadius: 16, fill: '#18103E' },
    textColors: { primary: '#FFFFFF', secondary: '#3CE6FF', outline: '#FF46AA' }, fonts: { title: 'var(--font-poppins), Arial, sans-serif', body: 'var(--font-poppins), Arial, sans-serif', footer: 'var(--font-poppins), Arial, sans-serif' }, decorations: [], defaultMessage: 'SNAPSYNC', subtitle: '', design: { kind: 'neon' },
  },
  scrapbook: {
    id: 'scrapbook', label: 'Scrapbook', group: 'Fun', background: { type: 'solid', color: '#E4CFAC' },
    slotStyle: { borderColor: '#FFFFFF', borderWidth: 14, cornerRadius: 2, fill: '#FFFFFF', shadow: { color: '#82684A', offset: 7 } },
    textColors: { primary: '#34291F', secondary: '#8C594D' }, fonts: { title: 'var(--font-lora), Georgia, serif', body: 'var(--font-poppins), Arial, sans-serif', footer: 'var(--font-poppins), Arial, sans-serif' }, decorations: [], defaultMessage: 'SnapSync', subtitle: '', design: { kind: 'scrapbook' },
  },
  sakura: {
    id: 'sakura', label: 'Sakura', group: 'Aesthetic', background: { type: 'gradient', stops: [{ color: '#FFF2F6', offset: '0%' }, { color: '#FFDEEA', offset: '100%' }] },
    slotStyle: { borderColor: '#F4A0BC', borderWidth: 6, cornerRadius: 28, fill: '#FFFFFF' },
    textColors: { primary: '#B0486A', secondary: '#D97D9B' }, fonts: { title: 'var(--font-lora), Georgia, serif', body: 'var(--font-poppins), Arial, sans-serif', footer: 'var(--font-lora), Georgia, serif' }, decorations: [], defaultMessage: 'Sakura', subtitle: '', design: { kind: 'sakura' },
  },
  tropical: {
    id: 'tropical', label: 'Tropical', group: 'Aesthetic', background: { type: 'gradient', stops: [{ color: '#FFF6DE', offset: '0%' }, { color: '#FFE2B0', offset: '100%' }] },
    slotStyle: { borderColor: '#FFFFFF', borderWidth: 10, cornerRadius: 34, fill: '#FFFDF6' },
    textColors: { primary: '#007A7A', secondary: '#268C60', outline: '#FFF6DE' }, fonts: { title: 'var(--font-poppins), Arial, sans-serif', body: 'var(--font-poppins), Arial, sans-serif', footer: 'var(--font-lora), Georgia, serif' }, decorations: [], defaultMessage: 'Summer Vibes', subtitle: '', design: { kind: 'tropical' },
  },
  christmas: {
    id: 'christmas', label: 'Christmas', group: 'Seasonal', background: { type: 'gradient', stops: [{ color: '#12503A', offset: '0%' }, { color: '#0C382C', offset: '100%' }] },
    slotStyle: { borderColor: '#D62838', borderWidth: 10, cornerRadius: 22, fill: '#FFFBF0' },
    textColors: { primary: '#FFF6E2', secondary: '#E2C36B' }, fonts: { title: 'var(--font-lora), Georgia, serif', body: 'var(--font-poppins), Arial, sans-serif', footer: 'var(--font-lora), Georgia, serif' }, decorations: [], defaultMessage: 'Merry & Bright', subtitle: '', design: { kind: 'christmas' },
  },
};

export type FrameThemeId = keyof typeof FRAME_THEMES;
export type ThemedFrameSticker = { key: string; src: string; x: number; y: number; size: number; rotation: number };

const HEIGHT = 1800;

type FrameSlot = { x: number; y: number; width: number; height: number; photoIndex: number };
type FrameLayout = { width: number; height: number; captionStart: number; slots: FrameSlot[] };

export const FRAME_LAYOUTS: Record<FrameLayoutId, FrameLayout> = {
  strip: {
    width: 600,
    height: HEIGHT,
    captionStart: 1548,
    slots: [270, 590, 910, 1230].map((y, photoIndex) => ({ x: 40, y, width: 520, height: 300, photoIndex })),
  },
  doubleStrip: {
    width: 1200,
    height: HEIGHT,
    captionStart: 1472,
    slots: [40, 404, 768, 1132].flatMap((y, photoIndex) => [
      { x: 40, y, width: 520, height: 340, photoIndex },
      { x: 640, y, width: 520, height: 340, photoIndex },
    ]),
  },
  grid: {
    width: 1200,
    height: HEIGHT,
    captionStart: 1584,
    slots: [
      { x: 40, y: 40, width: 535, height: 760, photoIndex: 0 },
      { x: 625, y: 40, width: 535, height: 760, photoIndex: 1 },
      { x: 40, y: 824, width: 535, height: 760, photoIndex: 2 },
      { x: 625, y: 824, width: 535, height: 760, photoIndex: 3 },
    ],
  },
  trio: {
    width: 600,
    height: HEIGHT,
    captionStart: 1624,
    slots: [40, 576, 1112].map((y, photoIndex) => ({ x: 40, y, width: 520, height: 512, photoIndex })),
  },
  polaroid: {
    width: 1200,
    height: HEIGHT,
    captionStart: 1500,
    slots: [{ x: 90, y: 90, width: 1020, height: 1410, photoIndex: 0 }],
  },
};

function getFrameLayout(layoutId: FrameLayoutId, themeId: FrameThemeId, showText: boolean): FrameLayout {
  const layout = FRAME_LAYOUTS[layoutId];
  if (themeId === 'classic' && (layoutId === 'strip' || layoutId === 'doubleStrip')) {
    const height = showText ? 340 : 414;
    const firstY = 40;
    const gap = 24;
    return {
      ...layout,
      captionStart: showText ? 1472 : 1768,
      slots: Array.from({ length: 4 }, (_, photoIndex) => {
        const y = firstY + photoIndex * (height + gap);
        const slot = { y, width: 520, height, photoIndex };
        return layoutId === 'strip'
          ? { ...slot, x: 40 }
          : [{ ...slot, x: 40 }, { ...slot, x: 640 }];
      }).flat(),
    };
  }

  if (themeId !== 'classic') {
    const theme = FRAME_THEMES[themeId];
    const hasFooterDecoration = theme.decorations.some((decoration) =>
      decoration.kind === 'cake' || decoration.kind === 'interlocking-hearts' || decoration.kind === 'rainbow');
    if (layoutId === 'strip' && !(theme.design && showText)) {
      const hasHeaderDecoration = theme.decorations.some((decoration) => decoration.kind === 'bunting');
      const preserveFooter = showText || hasFooterDecoration;
      const height = preserveFooter ? (hasHeaderDecoration ? 340 : 355) : 414;
      const firstY = hasHeaderDecoration ? 90 : 40;
      const slots = [0, 1, 2, 3].map((photoIndex) => ({
        x: 40,
        y: firstY + photoIndex * (height + 24),
        width: 520,
        height,
        photoIndex,
      }));

      return {
        ...layout,
        captionStart: slots[slots.length - 1].y + height,
        slots,
      };
    }

    if (!showText && !hasFooterDecoration) {
      if (layoutId === 'doubleStrip') {
        return {
          ...layout,
          captionStart: 1768,
          slots: [40, 478, 916, 1354].flatMap((y, photoIndex) => [
            { x: 40, y, width: 520, height: 414, photoIndex },
            { x: 640, y, width: 520, height: 414, photoIndex },
          ]),
        };
      }
      if (layoutId === 'grid') {
        return {
          ...layout,
          captionStart: 1744,
          slots: [
            { x: 40, y: 40, width: 535, height: 840, photoIndex: 0 },
            { x: 625, y: 40, width: 535, height: 840, photoIndex: 1 },
            { x: 40, y: 904, width: 535, height: 840, photoIndex: 2 },
            { x: 625, y: 904, width: 535, height: 840, photoIndex: 3 },
          ],
        };
      }
      if (layoutId === 'trio') {
        return { ...layout, captionStart: 1759, slots: [40, 621, 1202].map((y, photoIndex) => ({ x: 40, y, width: 520, height: 557, photoIndex })) };
      }
      if (layoutId === 'polaroid') {
        return { ...layout, captionStart: 1710, slots: [{ x: 90, y: 90, width: 1020, height: 1620, photoIndex: 0 }] };
      }
    }

    return layout;
  }

  if (!showText) {
    if (layoutId === 'trio') {
      return { ...layout, captionStart: 1759, slots: [40, 621, 1202].map((y, photoIndex) => ({ x: 40, y, width: 520, height: 557, photoIndex })) };
    }
    if (layoutId === 'grid') {
      return {
        ...layout,
        captionStart: 1744,
        slots: [
          { x: 40, y: 40, width: 535, height: 840, photoIndex: 0 },
          { x: 625, y: 40, width: 535, height: 840, photoIndex: 1 },
          { x: 40, y: 904, width: 535, height: 840, photoIndex: 2 },
          { x: 625, y: 904, width: 535, height: 840, photoIndex: 3 },
        ],
      };
    }
    return { ...layout, captionStart: 1710, slots: [{ x: 90, y: 90, width: 1020, height: 1620, photoIndex: 0 }] };
  }

  return layout;
}

function seeded(index: number, seed: number) {
  const value = Math.sin(index * 127.1 + seed * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function duoHalfClipPath(x: number, y: number, width: number, height: number, radius: number, half: 'left' | 'right' | 'top' | 'bottom') {
  const r = Math.min(Math.max(0, radius), width / 2, height / 2);
  if (half === 'left') return `M${x + r} ${y}H${x + width}V${y + height}H${x + r}Q${x} ${y + height} ${x} ${y + height - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`;
  if (half === 'right') return `M${x} ${y}H${x + width - r}Q${x + width} ${y} ${x + width} ${y + r}V${y + height - r}Q${x + width} ${y + height} ${x + width - r} ${y + height}H${x}Z`;
  if (half === 'top') return `M${x + r} ${y}H${x + width - r}Q${x + width} ${y} ${x + width} ${y + r}V${y + height}H${x}V${y + r}Q${x} ${y} ${x + r} ${y}Z`;
  return `M${x} ${y}H${x + width}V${y + height - r}Q${x + width} ${y + height} ${x + width - r} ${y + height}H${x + r}Q${x} ${y + height} ${x} ${y + height - r}Z`;
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

  const scale = dimensions ? Math.max(width / dimensions.width, height / dimensions.height) * Math.max(1, position.zoom ?? 1) : 1;
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
      data-zoom={Math.max(1, position.zoom ?? 1)}
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

function DesignBackground({ design, layout }: { design: ThemeDesign; layout: FrameLayout }) {
  const { width, height, slots } = layout;
  const firstSlot = Math.min(...slots.map((slot) => slot.y));
  if (design.kind === 'editorial') return null;
  if (design.kind === 'groovy') return <g aria-hidden="true" fill="none" strokeLinecap="butt">{['#783C28', '#D65428', '#F4A028', '#FAC840', '#FFF0CD', '#D65428'].map((color, index) => {
    const radius = 240 - index * 34;
    return <path key={color + index} d={`M${width / 2 - radius} ${firstSlot} A${radius} ${radius} 0 0 1 ${width / 2 + radius} ${firstSlot}`} stroke={color} strokeWidth="34" />;
  })}</g>;
  if (design.kind === 'neon') return <g aria-hidden="true">
    {Array.from({ length: 36 }, (_, index) => <Sparkle key={index} color="#FFFFFF" size={2 + seeded(index, 22) * 3} x={12 + seeded(index + 5, 31) * (width - 24)} y={12 + seeded(index + 10, 41) * Math.max(20, firstSlot - 24)} />)}
  </g>;
  if (design.kind === 'scrapbook') return <g aria-hidden="true">
    {Array.from({ length: Math.floor(height / 38) }, (_, index) => <path key={index} d={`M0 ${index * 38 + 1}H${width}`} stroke="#8E795E" strokeOpacity=".2" />)}
    <path d={`M28 0V${height}`} stroke="#C15A5A" strokeOpacity=".45" strokeWidth="2" />
    {[[width * .17, height * .44], [width * .82, height * .7], [width * .22, height * .83]].map(([x, y], index) => <g key={`doodle-${index}`} fill="none" stroke="#34291F" strokeWidth="3"><path d={`M${x} ${y - 10}l3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z`} /><path d={`M${x + 17} ${y + 16}q8-10 14 0t14 0`} /></g>)}
  </g>;
  if (design.kind === 'sakura') return <g aria-hidden="true" fill="none" stroke="#7E503F" strokeLinecap="round" strokeWidth="5">
    <path d={`M${width - 8} 5 Q${width - 155} 45 ${width - 190} ${Math.min(firstSlot - 8, 240)} M${width - 38} 18 Q${width - 91} 74 ${width - 300} 94 M5 ${height - 8} Q130 ${height - 100} 145 ${height - 260} M20 ${height - 24} Q115 ${height - 30} 210 ${height - 180}`} />
    {Array.from({ length: 28 }, (_, index) => <g key={index} transform={`translate(${seeded(index, 4) * width} ${seeded(index + 8, 9) * height}) rotate(${seeded(index + 3, 8) * 360})`}><ellipse fill="#F4A0BC" fillOpacity=".75" rx="5" ry="10" stroke="none" /></g>)}
    {Array.from({ length: 18 }, (_, index) => <g key={`b${index}`} transform={`translate(${seeded(index, 13) * width} ${seeded(index + 4, 15) * firstSlot})`} fill="#F6ABC4" stroke="none">{Array.from({ length: 5 }, (_, petal) => <ellipse key={petal} cx="0" cy="-7" rx="5" ry="9" transform={`rotate(${petal * 72})`} />)}<circle fill="#F6D57D" r="3" /></g>)}
  </g>;
  if (design.kind === 'tropical') return <g aria-hidden="true" fill="none" strokeLinecap="round" strokeWidth="8">
    {[[0, 0, 1], [width, 0, -1], [0, height * .58, 1], [width, height * .58, -1]].map(([x, y, direction], index) => <g key={index} transform={`translate(${x} ${y}) scale(${direction} 1)`}>
      <path d="M0 0 Q65 65 150 125 M8 5Q74 13 130 90 M5 6Q45 50 78 116 M22 17Q89 43 146 55 M15 12Q37 81 37 125" stroke={index % 2 ? '#38AA6E' : '#268C60'} />
    </g>)}
  </g>;
  return <g aria-hidden="true" fill="none">
    {Array.from({ length: 32 }, (_, index) => {
      const x = 15 + seeded(index, 33) * (width - 30);
      const y = 10 + seeded(index, 47) * (height - 20);
      const size = 4 + seeded(index, 52) * 6;
      return <g key={index} stroke="#FFFFFF" strokeOpacity=".35" strokeWidth="2"><path d={`M${x - size} ${y}h${size * 2} M${x} ${y - size}v${size * 2} M${x - size * .7} ${y - size * .7}l${size * 1.4} ${size * 1.4} M${x + size * .7} ${y - size * .7}l-${size * 1.4} ${size * 1.4}`} /></g>;
    })}
    <path d={`M0 68 Q${width * .25} 132 ${width * .5} 68 T${width} 68`} stroke="#D62838" strokeWidth="3" />
    {Array.from({ length: 13 }, (_, index) => <g key={`light-${index}`}><path d={`M${index * width / 12} ${68 + Math.sin(index / 12 * Math.PI * 2) * 32}v12`} stroke="#D62838" strokeWidth="2" /><circle cx={index * width / 12} cy={80 + Math.sin(index / 12 * Math.PI * 2) * 32} fill={['#D62838', '#F4CF4C', '#48C98B', '#44BBE8'][index % 4]} r="7" /></g>)}
  </g>;
}

function DesignHeader({ design, layout, showText }: { design: ThemeDesign; layout: FrameLayout; showText: boolean }) {
  const strip = layout.width === 600 && layout.slots.length === 4 && layout.slots[0].height === 300;
  const hasRoom = Math.min(...layout.slots.map((slot) => slot.y)) >= 180;
  const x = layout.width / 2;
  if (design.kind === 'editorial') {
    if (strip && showText && design.times) return <g fill={design.ink} textAnchor="middle">
      <path d="M40 34H560" stroke={design.ink} strokeWidth="5" /><path d="M40 46H560" stroke={design.ink} />
      <text fontFamily="var(--font-lora), Georgia, serif" fontSize="30" x="300" y="98">The</text>
      <text fontFamily="var(--font-lora), Georgia, serif" fontSize="76" fontStyle="italic" x="300" y="160">SnapSync Times</text>
      <path d="M40 206H560" stroke={design.ink} /><text fontFamily="var(--font-poppins), Arial, sans-serif" fontSize="13" letterSpacing="2" x="300" y="230">NOVEMBER 2026 · VOL. 01 · PRICE: ONE SMILE</text>
      <path d="M40 252H560" stroke={design.ink} strokeWidth="3" />
    </g>;
    if (strip && showText) return <g fill={design.ink} textAnchor="middle">
      <path d="M40 40H560" stroke={design.ink} strokeWidth="3" /><path d="M40 48H560" stroke={design.ink} />
      <text fontFamily="var(--font-poppins), Arial, sans-serif" fontSize="17" letterSpacing="4" x="95" y="76">{design.labels[0]}</text>
      <text fontFamily="var(--font-poppins), Arial, sans-serif" fontSize="17" letterSpacing="4" x="300" y="76">{design.labels[1]}</text>
      <text fontFamily="var(--font-poppins), Arial, sans-serif" fontSize="17" letterSpacing="4" x="505" y="76">{design.labels[2]}</text>
      <text fontFamily="var(--font-lora), Georgia, serif" fontSize="104" fontStyle="italic" x="300" y="180">SnapSync</text>
      <path d="M40 248H560" stroke={design.ink} />
    </g>;
    if (hasRoom && showText) return <g fill={design.ink} textAnchor="middle"><text fontFamily="var(--font-lora), Georgia, serif" fontSize={Math.min(76, layout.width * .11)} fontStyle="italic" x={x} y={Math.min(...layout.slots.map((slot) => slot.y)) * .72}>SnapSync</text><path d={`M40 ${Math.min(...layout.slots.map((slot) => slot.y)) - 12}H${layout.width - 40}`} stroke={design.ink} /></g>;
    return null;
  }
  const titleY = Math.max(74, Math.min(...layout.slots.map((slot) => slot.y)) * .7);
  if (!showText || !hasRoom) return null;
  if (design.kind === 'neon') return <g aria-hidden="true" textAnchor="middle"><text fill="#FF46AA" filter="url(#neon-glow)" fontFamily="var(--font-poppins), Arial, sans-serif" fontSize={Math.min(80, layout.width * .14)} fontWeight="700" x={x} y={titleY}>SNAPSYNC</text><text fill="#FFFFFF" fontFamily="var(--font-poppins), Arial, sans-serif" fontSize={Math.min(80, layout.width * .14)} fontWeight="700" x={x} y={titleY}>SNAPSYNC</text></g>;
  if (design.kind === 'sakura') return <text fill="#B0486A" fontFamily="var(--font-lora), Georgia, serif" fontSize={Math.min(96, layout.width * .16)} fontStyle="italic" x={layout.width * .18} y={titleY}>Sakura</text>;
  if (design.kind === 'tropical') return <text fill="#007A7A" fontFamily="var(--font-poppins), Arial, sans-serif" fontSize={Math.min(60, layout.width * .1)} fontStyle="italic" fontWeight="700" paintOrder="stroke" stroke="#FFF6DE" strokeWidth="8" textAnchor="middle" x={x} y={titleY}>Summer Vibes</text>;
  if (design.kind === 'christmas') return <text fill="#FFF6E2" fontFamily="var(--font-lora), Georgia, serif" fontSize={Math.min(68, layout.width * .12)} fontStyle="italic" textAnchor="middle" x={x} y={titleY}>Merry &amp; Bright</text>;
  if (design.kind === 'scrapbook' && hasRoom) return <g><rect fill="#FFFFFF" height="86" rx="5" width={Math.min(380, layout.width - 80)} x={(layout.width - Math.min(380, layout.width - 80)) / 2} y={titleY - 62} /><circle cx={x} cy={titleY - 53} fill="#C9B897" r="5" /><text fill="#34291F" fontFamily="var(--font-lora), Georgia, serif" fontSize="66" fontStyle="italic" textAnchor="middle" x={x} y={titleY}>SnapSync</text></g>;
  return null;
}

function DesignFooter({ design, layout, showText, customMessage, defaultMessage }: { design: ThemeDesign; layout: FrameLayout; showText: boolean; customMessage: string; defaultMessage: string }) {
  const lastBottom = Math.max(...layout.slots.map((slot) => slot.y + slot.height));
  const free = layout.height - lastBottom;
  const width = layout.width;
  const height = layout.height;
  if (!showText || free < 75) return null;
  if (design.kind === 'editorial' && layout.width === 600 && layout.slots[0].height === 300) {
    const muted = design.times ? '#81796D' : `${design.ink}73`;
    if (design.times) return <g fill={design.ink} textAnchor="middle">
      <path d="M40 1550H560" stroke={design.ink} strokeWidth="3" />
      <text fill={muted} fontFamily="var(--font-poppins), Arial, sans-serif" fontSize="16" letterSpacing="6" x="300" y="1598">TODAY&apos;S HEADLINE</text>
      <text fontFamily="var(--font-lora), Georgia, serif" fontSize="52" fontStyle="italic" x="300" y="1650">{customMessage.trim() || defaultMessage}</text>
      <path d="M40 1696H560" stroke={design.ink} /><text fontFamily="var(--font-poppins), Arial, sans-serif" fontSize="26" fontWeight="700" letterSpacing="6" x="300" y="1740">SNAPSYNC</text>
      <text fill={muted} fontFamily="var(--font-poppins), Arial, sans-serif" fontSize="18" fontStyle="italic" x="300" y="1776">printed with love, developed in sync</text><path d="M40 1794H560" stroke={design.ink} strokeWidth="5" />
    </g>;
    const barcode = Array.from({ length: 24 }, (_, index) => [2, 3, 5][Math.floor(seeded(index, 8) * 3)]);
    let cursor = 60;
    const bars = barcode.map((barWidth, index) => {
      const x = cursor;
      cursor += barWidth + [3, 4, 6][Math.floor(seeded(index + 40, 11) * 3)];
      return <rect key={index} fill={design.ink} height="75" width={barWidth} x={x} y="1575" />;
    });
    return <g fill={design.ink} textAnchor="middle">
      <path d="M40 1548H560" stroke={design.ink} />{bars}
      <text fontFamily="var(--font-poppins), Arial, sans-serif" fontSize="30" fontWeight="700" letterSpacing="4" x="410" y="1595">SNAPSYNC</text>
      <text fill={muted} fontFamily="var(--font-poppins), Arial, sans-serif" fontSize="17" letterSpacing="5" x="410" y="1635">EST. 2026</text>
      <path d="M40 1700H560" stroke={design.ink} strokeWidth="3" /><path d="M40 1708H560" stroke={design.ink} />
      <text fontFamily="var(--font-poppins), Arial, sans-serif" fontSize="22" fontStyle="italic" x="300" y="1752">{customMessage.trim() || design.quote}</text>
    </g>;
  }
  const y = lastBottom + free * .62;
  if (design.kind === 'editorial') return <g fill={design.ink} textAnchor="middle"><path d={`M40 ${lastBottom + 22}H${width - 40}`} stroke={design.ink} /><text fontFamily="var(--font-lora), Georgia, serif" fontSize={Math.min(50, free * .16)} fontStyle="italic" x={width / 2} y={y}>{customMessage.trim() || defaultMessage}</text></g>;
  if (design.kind === 'groovy') return <g aria-hidden="true" fill="none" strokeLinecap="round"><path d={`M0 ${lastBottom + 14}q${width * .12} -24 ${width * .24} 0t${width * .24} 0t${width * .24} 0t${width * .28} 0`} stroke="#D65428" strokeWidth="12"/><path d={`M0 ${lastBottom + 32}q${width * .12} -24 ${width * .24} 0t${width * .24} 0t${width * .24} 0t${width * .28} 0`} stroke="#F4A028" strokeWidth="12"/><path d={`M0 ${lastBottom + 50}q${width * .12} -24 ${width * .24} 0t${width * .24} 0t${width * .24} 0t${width * .28} 0`} stroke="#783C28" strokeWidth="12"/><text fill="#F4A028" fontFamily="var(--font-lora), Georgia, serif" fontSize={Math.min(92, free * .36)} fontStyle="italic" stroke="#F4A028" strokeWidth="3" textAnchor="middle" x={width / 2 + 5} y={y + 5}>SnapSync</text><text fill="#783C28" fontFamily="var(--font-lora), Georgia, serif" fontSize={Math.min(92, free * .36)} fontStyle="italic" textAnchor="middle" x={width / 2} y={y}>SnapSync</text></g>;
  if (design.kind === 'neon') {
    const horizon = lastBottom + Math.max(105, Math.min(150, free * .5));
    const sunRadius = Math.min(105, free * .38);
    return <g aria-hidden="true">
      <defs><clipPath id="neon-sunset"><path d={`M${width / 2 - sunRadius} ${horizon}A${sunRadius} ${sunRadius} 0 0 1 ${width / 2 + sunRadius} ${horizon}Z`} /></clipPath></defs>
      <path d={`M0 ${lastBottom + 20}H${width}V${height}H0Z`} fill="#100A27" />
      {Array.from({ length: 9 }, (_, index) => <path key={index} d={`M${width / 2} ${horizon}L${index * width / 8} ${height}`} stroke="#3CE6FF" strokeOpacity=".55" />)}
      {Array.from({ length: 5 }, (_, index) => <path key={`h${index}`} d={`M0 ${horizon + index * 24}H${width}`} stroke="#3CE6FF" strokeOpacity=".5" />)}
      <path d={`M${width / 2 - sunRadius} ${horizon}A${sunRadius} ${sunRadius} 0 0 1 ${width / 2 + sunRadius} ${horizon}Z`} fill="#F7CA45" />
      <g clipPath="url(#neon-sunset)" stroke="#FF46AA" strokeWidth="8">{[horizon - 25, horizon - 48, horizon - 69, horizon - 88].map((line) => <path key={line} d={`M${width / 2 - sunRadius} ${line}H${width / 2 + sunRadius}`} />)}</g>
    </g>;
  }
  if (design.kind === 'scrapbook') return <g aria-hidden="true"><path d={`M0 ${height - 30}L${Array.from({ length: Math.ceil(width / 24) }, (_, index) => `${index * 24} ${height - 30 + (index % 2 ? 0 : 18)}`).join(' ')}L${width} ${height}H0Z`} fill="#FFFFFF" />{free > 140 && <><path d={`M24 ${height - 100}l24-32 24 32-24 32z`} fill="#F4C928" stroke="#34291F" strokeWidth="3"/><text fill="#34291F" fontFamily="var(--font-poppins), Arial, sans-serif" fontSize="14" fontWeight="700" textAnchor="middle" x="48" y={height - 96}>SMILE!</text><Heart color="#ED7BA8" size={50} x={width - 50} y={height - 124} /></>}</g>;
  if (design.kind === 'sakura') return <text fill="#B0486A" fontFamily="var(--font-lora), Georgia, serif" fontSize={Math.min(60, free * .2)} fontStyle="italic" textAnchor="middle" x={width / 2} y={y}>SnapSync</text>;
  if (design.kind === 'tropical') return <g><circle cx={width / 2} cy={lastBottom + free * .4} fill="#FFA442" r={Math.min(92, free * .3)} /><path d={`M0 ${lastBottom + free * .62}Q${width * .2} ${lastBottom + free * .5} ${width * .4} ${lastBottom + free * .62}T${width * .8} ${lastBottom + free * .62}T${width * 1.2} ${lastBottom + free * .62}V${height}H0Z`} fill="#78D6D6"/><path d={`M0 ${lastBottom + free * .75}Q${width * .2} ${lastBottom + free * .63} ${width * .4} ${lastBottom + free * .75}T${width * .8} ${lastBottom + free * .75}T${width * 1.2} ${lastBottom + free * .75}V${height}H0Z`} fill="#2EACAC"/><path d={`M0 ${lastBottom + free * .88}Q${width * .2} ${lastBottom + free * .76} ${width * .4} ${lastBottom + free * .88}T${width * .8} ${lastBottom + free * .88}T${width * 1.2} ${lastBottom + free * .88}V${height}H0Z`} fill="#007A7A"/><text fill="#FFFFFF" fontFamily="var(--font-lora), Georgia, serif" fontSize={Math.min(66, free * .2)} fontStyle="italic" textAnchor="middle" x={width / 2} y={height - 30}>SnapSync</text></g>;
  return <g aria-hidden="true"><path d={`M${width / 2} ${lastBottom + 18}L${width * .29} ${height - 25}H${width * .71}Z`} fill="#176346"/><path d={`M${width / 2} ${lastBottom + 18}l-15 20h30z`} fill="#D9B54C"/><Sparkle color="#F4D361" size={14} x={width / 2} y={lastBottom + 12}/>{Array.from({ length: 9 }, (_, index) => <circle key={index} cx={width / 2 + (index % 3 - 1) * (12 + index * 2)} cy={lastBottom + 58 + index * 13} fill={['#D62838', '#F4CF4C', '#3CE6FF'][index % 3]} r="5"/>)}<text fill="#FFF6E2" fontFamily="var(--font-lora), Georgia, serif" fontSize={Math.min(38, free * .13)} fontStyle="italic" textAnchor="middle" x={width / 2} y={height - 8}>SnapSync</text></g>;
}

function SlotArtwork({ design, slot }: { design: ThemeDesign; slot: FrameSlot }) {
  const { x, y, width, height } = slot;
  if (design.kind === 'groovy') return <g aria-hidden="true">{[[x + 18, y + 18], [x + width - 18, y + 18], [x + 18, y + height - 18], [x + width - 18, y + height - 18]].map(([cx, cy], index) => <g key={index} transform={`translate(${cx} ${cy})`}><g fill="#FFFFFF">{Array.from({ length: 8 }, (_, petal) => <ellipse key={petal} cx="0" cy="-8" rx="5" ry="9" transform={`rotate(${petal * 45})`} />)}</g><circle fill="#F4A028" r="5" /></g>)}</g>;
  if (design.kind === 'scrapbook') return <g aria-hidden="true">{[[x + 22, y + 8, ['#F48CAE', '#A7D8C5', '#F4D46B', '#B9A7E9'][slot.photoIndex % 4], -24], [x + width - 18, y + height - 14, ['#A7D8C5', '#F4D46B', '#B9A7E9', '#F48CAE'][slot.photoIndex % 4], -24]].map(([tx, ty, color, rotation], index) => <rect key={index} fill={String(color)} fillOpacity=".78" height="26" transform={`rotate(${rotation} ${tx} ${ty})`} width="100" x={Number(tx) - 50} y={Number(ty) - 13} />)}</g>;
  if (design.kind === 'sakura') return <g aria-hidden="true">{[[x + 15, y + 15], [x + width - 15, y + height - 15]].map(([cx, cy], index) => <g key={index} transform={`translate(${cx} ${cy})`} fill="#F6ABC4">{Array.from({ length: 5 }, (_, petal) => <ellipse key={petal} cx="0" cy="-7" rx="5" ry="9" transform={`rotate(${petal * 72})`} />)}<circle fill="#F6D57D" r="3" /></g>)}</g>;
  if (design.kind === 'tropical') return <g aria-hidden="true">{[[x + 10, y + 10], [x + width - 10, y + height - 10]].map(([cx, cy], index) => <g key={index} transform={`translate(${cx} ${cy})`}><path d="M0 0C-22-34-18-45 0-22C2-49 14-45 7-17C30-39 34-29 12-8C42-17 42-4 13 2C37 12 29 23 9 10C16 38 2 36 3 10C-14 36-26 26-9 7C-39 14-38 2-9-2Z" fill="#E94F68"/><circle fill="#F4C44E" r="4" /></g>)}</g>;
  if (design.kind === 'christmas') return <g aria-hidden="true">{[[x + 14, y + 14], [x + width - 14, y + height - 14]].map(([cx, cy], index) => <g key={index} transform={`translate(${cx} ${cy})`}><path d="M0 0q-20-17-20-4q10 12 20 4q20-17 20-4Q10 12 0 4Z" fill="#16784D"/><circle cx="-4" cy="5" fill="#D62838" r="5"/><circle cx="4" cy="5" fill="#D62838" r="5"/><circle cy="10" fill="#D62838" r="5"/></g>)}</g>;
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
  const layout = getFrameLayout(layoutId, themeId, showText);
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
        {theme.design?.kind === 'neon' && <>
          <filter height="300%" id="neon-glow" width="300%" x="-100%" y="-100%"><feGaussianBlur result="blur" stdDeviation="7" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter height="180%" id="cyan-slot-glow" width="180%" x="-40%" y="-40%"><feGaussianBlur in="SourceAlpha" result="blur" stdDeviation="5" /><feFlood floodColor="#3CE6FF" floodOpacity=".9" result="color" /><feComposite in="color" in2="blur" operator="in" result="glow" /><feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </>}
        {theme.decorations.filter((decoration) => decoration.kind === 'halftone').map((decoration) => <BackgroundDecoration decoration={decoration} height={height} key={decoration.kind} width={width} />)}
        {layout.slots.map((slot, index) => {
          const inset = theme.slotStyle.borderWidth / 2;
          const slotWidth = slot.width - theme.slotStyle.borderWidth;
          const slotHeight = slot.height - theme.slotStyle.borderWidth;
          const innerX = slot.x + inset;
          const innerY = slot.y + inset;
          const portrait = slotHeight > slotWidth;
          const cornerRadius = Math.max(0, theme.slotStyle.cornerRadius - inset);
          return <g key={index}>
            <clipPath id={`slot-${theme.id}-${index}`}><rect height={Math.max(1, slotHeight)} rx={cornerRadius} width={Math.max(1, slotWidth)} x={innerX} y={innerY} /></clipPath>
            <clipPath id={`slot-${theme.id}-${index}-host`}><path d={portrait ? duoHalfClipPath(innerX, innerY, slotWidth, slotHeight / 2, cornerRadius, 'top') : duoHalfClipPath(innerX, innerY, slotWidth / 2, slotHeight, cornerRadius, 'left')} /></clipPath>
            <clipPath id={`slot-${theme.id}-${index}-guest`}><path d={portrait ? duoHalfClipPath(innerX, innerY + slotHeight / 2, slotWidth, slotHeight / 2, cornerRadius, 'bottom') : duoHalfClipPath(innerX + slotWidth / 2, innerY, slotWidth / 2, slotHeight, cornerRadius, 'right')} /></clipPath>
          </g>;
        })}
      </defs>
      <rect fill={background} height={height} width={width} />
      {themeId === 'funny' && <rect fill="url(#funny-dots)" height={height} width={width} />}
      {theme.decorations.map((decoration, index) => <BackgroundDecoration decoration={decoration} height={height} key={`bg-${index}`} width={width} />)}
      {theme.decorations.filter((decoration) => decoration.kind === 'bunting').map((decoration) => <OverlayDecoration decoration={decoration} key="bunting" layout={layout} />)}
      {theme.design && <DesignBackground design={theme.design} layout={layout} />}
      {layoutId === 'doubleStrip' && <path d={`M${width / 2} 0v${height}`} fill="none" stroke={theme.textColors.primary} strokeDasharray="12 12" strokeOpacity=".6" strokeWidth="2" />}

      {theme.design && <DesignHeader design={theme.design} layout={layout} showText={showText} />}
      {!theme.design && showText && (
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
        const position = photoPositions[slot.photoIndex] ?? { x: 50, y: 35, zoom: 1 };
        const pair = duoPairs[slot.photoIndex];
        const photo = photos[slot.photoIndex];
        const radius = theme.slotStyle.cornerRadius;
        return <g key={index}>
          {theme.slotStyle.shadow && <rect fill={theme.slotStyle.shadow.color} height={slot.height} rx={radius} width={slot.width} x={slot.x + theme.slotStyle.shadow.offset} y={slot.y + theme.slotStyle.shadow.offset} />}
          {theme.design?.kind === 'neon' && <rect fill="none" filter="url(#cyan-slot-glow)" height={slot.height} rx={radius} stroke="#3CE6FF" strokeWidth="3" width={slot.width} x={slot.x} y={slot.y} />}
          <rect fill={theme.slotStyle.fill} height={slot.height} rx={radius} stroke={theme.slotStyle.borderColor} strokeWidth={theme.slotStyle.borderWidth} width={slot.width} x={slot.x} y={slot.y} />
          {pair ? (
            <>
              {innerHeight > innerWidth ? <>
                <PhotoImage clipId={`${clipId}-host`} height={innerHeight / 2} position={position} src={pair.host} width={innerWidth} x={innerX} y={innerY} />
                <PhotoImage clipId={`${clipId}-guest`} height={innerHeight / 2} position={position} src={pair.guest} width={innerWidth} x={innerX} y={innerY + innerHeight / 2} />
                <path d={`M${innerX} ${innerY + innerHeight / 2}h${innerWidth}`} stroke={theme.slotStyle.borderColor} strokeOpacity=".7" strokeWidth="2" />
              </> : <>
                <PhotoImage clipId={`${clipId}-host`} height={innerHeight} position={position} src={pair.host} width={innerWidth / 2} x={innerX} y={innerY} />
                <PhotoImage clipId={`${clipId}-guest`} height={innerHeight} position={position} src={pair.guest} width={innerWidth / 2} x={innerX + innerWidth / 2} y={innerY} />
                <path d={`M${innerX + innerWidth / 2} ${innerY}v${innerHeight}`} stroke={theme.slotStyle.borderColor} strokeOpacity=".7" strokeWidth="2" />
              </>}
            </>
          ) : photo ? (
            <PhotoImage clipId={clipId} height={innerHeight} position={position} src={photo} width={innerWidth} x={innerX} y={innerY} />
          ) : null}
          {theme.slotStyle.borderWidth > 0 && <rect fill="none" height={slot.height} pointerEvents="none" rx={radius} stroke={theme.slotStyle.borderColor} strokeWidth={theme.slotStyle.borderWidth} width={slot.width} x={slot.x} y={slot.y} />}
          {theme.design && <SlotArtwork design={theme.design} slot={slot} />}
        </g>;
      })}

      {theme.decorations.filter((decoration) => ['balloons', 'cake', 'comic', 'butterflies', 'hearts', 'interlocking-hearts', 'rainbow'].includes(decoration.kind)).map((decoration, index) => <OverlayDecoration decoration={decoration} key={`overlay-${index}`} layout={layout} />)}
      {theme.design && <DesignFooter customMessage={customMessage} defaultMessage={theme.defaultMessage} design={theme.design} layout={layout} showText={showText} />}
      {!theme.design && themeId === 'funny' && showText && <g aria-hidden="true"><rect fill="#111111" height={Math.min(88, captionHeight * 0.25)} rx="12" width={width * 0.86} x={width * 0.07} y={layout.captionStart + captionHeight * 0.35} /><text fill="#FFE23C" fontFamily="Arial, sans-serif" fontSize={Math.min(43, captionHeight * 0.13)} fontWeight="900" textAnchor="middle" x={width / 2} y={layout.captionStart + captionHeight * 0.35 + Math.min(58, captionHeight * 0.17)}>CAUGHT IN 4K</text><text fill="#111111" fontFamily="Georgia, serif" fontSize={Math.min(50, captionHeight * 0.15)} fontStyle="italic" textAnchor="middle" x={width / 2} y={footerY}>SnapSync</text></g>}
      {!theme.design && showText && footerTitle && <g aria-hidden="true"><text fill={theme.textColors.primary} fontFamily={theme.fonts.footer} fontSize={Math.min(themeId === 'y2k' ? 72 : 54, captionHeight * 0.18)} fontStyle="italic" paintOrder="stroke" stroke={theme.textColors.outline ?? 'none'} strokeWidth={theme.textColors.outline ? 5 : 0} textAnchor="middle" x={width / 2} y={footerY}>{footerTitle}</text>{themeId === 'y2k' && <text fill={theme.textColors.primary} fontFamily={theme.fonts.body} fontSize={Math.min(25, captionHeight * 0.07)} fontWeight="800" paintOrder="stroke" stroke={theme.textColors.outline} strokeWidth="5" textAnchor="middle" x={width / 2} y={footerY + Math.min(48, captionHeight * 0.14)}>{theme.subtitle}</text>}</g>}
      {!theme.design && themeId === 'birthday' && showText && <text fill={theme.textColors.secondary} fontFamily={theme.fonts.footer} fontSize={Math.min(22, captionHeight * 0.07)} fontStyle="italic" fontWeight="700" textAnchor="middle" x={width / 2} y={height - 18}>{theme.subtitle}</text>}
      {!theme.design && themeId === 'retro-film' && showText && <g aria-hidden="true"><text fill={theme.textColors.secondary} fontFamily={theme.fonts.body} fontSize={Math.min(52, captionHeight * 0.15)} fontWeight="800" letterSpacing="4" textAnchor="middle" x={width / 2} y={footerY}>{new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(new Date()).replaceAll('/', ' · ')}</text><text fill={theme.textColors.primary} fontFamily={theme.fonts.body} fontSize={Math.min(21, captionHeight * 0.06)} fontWeight="700" letterSpacing="5" textAnchor="middle" x={width / 2} y={height - 24}>DEVELOPED BY SNAPSYNC</text></g>}
      {!theme.design && showText && themeId === 'classic' && <g aria-hidden="true"><text fill={frameTextColor} fontFamily={theme.fonts.body} fontSize={Math.min(30, captionHeight * 0.09)} fontWeight="700" textAnchor="middle" x={width / 2} y={layout.captionStart + captionHeight * 0.15}>{customMessage.trim()}</text><text fill={frameTextColor} fontFamily={theme.fonts.title} fontSize={Math.min(92, captionHeight * 0.28)} fontStyle="italic" textAnchor="middle" x={width / 2} y={layout.captionStart + captionHeight * 0.36}>SnapSync</text><text fill={frameTextColor} fontFamily={theme.fonts.body} fontSize={Math.min(22, captionHeight * 0.07)} fontWeight="700" letterSpacing="5" textAnchor="middle" x={width / 2} y={layout.captionStart + captionHeight * 0.665}>SNAP · SYNC · SMILE</text></g>}
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
    <i style={{ backgroundColor: theme.slotStyle.fill, borderColor: theme.slotStyle.borderColor, borderRadius: theme.slotStyle.cornerRadius / 5 }} />
    <i style={{ backgroundColor: theme.slotStyle.fill, borderColor: theme.slotStyle.borderColor, borderRadius: theme.slotStyle.cornerRadius / 5 }} />
    <i style={{ backgroundColor: theme.slotStyle.fill, borderColor: theme.slotStyle.borderColor, borderRadius: theme.slotStyle.cornerRadius / 5 }} />
    <i style={{ backgroundColor: theme.slotStyle.fill, borderColor: theme.slotStyle.borderColor, borderRadius: theme.slotStyle.cornerRadius / 5 }} />
  </span>;
}
