import type { PoseCategoryId } from './pose-ideas';

const ARM_POSES = [
  ['M38 43 Q29 51 30 63 L28 77', 'M62 43 Q71 51 70 63 L72 77'],
  ['M38 43 Q27 48 28 61 L36 67', 'M62 43 Q71 49 67 61 L61 26'],
  ['M38 43 Q28 48 31 61 L42 34', 'M62 43 Q73 50 69 64 L72 77'],
  ['M38 43 Q26 34 31 21 L40 29', 'M62 43 Q74 34 69 21 L60 29'],
  ['M38 43 Q27 50 32 62 L43 68', 'M62 43 Q73 52 70 64 L64 72'],
  ['M38 43 Q27 52 26 67 L22 77', 'M62 43 Q73 52 76 64 L80 76'],
  ['M38 43 Q28 53 34 65 L43 69', 'M62 43 Q72 50 67 62 L57 67'],
  ['M38 43 Q28 34 37 23 L44 29', 'M62 43 Q72 34 63 23 L56 29'],
  ['M38 43 Q27 49 33 60 L44 37', 'M62 43 Q72 48 68 61 L62 30'],
  ['M38 43 Q27 48 34 59 L45 65', 'M62 43 Q73 48 67 59 L56 65'],
] as const;

const LEG_POSES = [
  ['M43 76 Q40 92 36 108', 'M57 76 Q60 92 64 108'],
  ['M43 76 Q36 91 31 107', 'M57 76 Q63 90 70 105'],
  ['M43 76 Q40 91 37 108', 'M57 76 Q64 89 72 104'],
  ['M43 76 Q39 91 35 108', 'M57 76 Q61 91 65 108'],
  ['M43 76 Q38 91 34 107', 'M57 76 Q62 90 68 106'],
  ['M43 76 Q37 90 30 105', 'M57 76 Q64 91 72 108'],
  ['M43 76 Q37 91 31 107', 'M57 76 Q62 89 67 103'],
  ['M43 76 Q40 91 37 108', 'M57 76 Q60 91 63 108'],
  ['M43 76 Q39 91 35 107', 'M57 76 Q62 91 70 104'],
  ['M43 76 Q34 87 31 96 L45 98', 'M57 76 Q64 86 71 92 L84 92'],
] as const;

const PALETTES: Record<PoseCategoryId, { background: string; accent: string; outfit: string; skin: string }> = {
  solo: { background: '#292246', accent: '#d6ff5f', outfit: '#f34fa7', skin: '#ffd0aa' },
  couple: { background: '#46233d', accent: '#ffb5d3', outfit: '#ff78a8', skin: '#ffd0aa' },
  funny: { background: '#223c46', accent: '#ffdb67', outfit: '#61d8c4', skin: '#ffd0aa' },
  friends: { background: '#263750', accent: '#91c8ff', outfit: '#a984fa', skin: '#ffd0aa' },
  family: { background: '#3a3440', accent: '#ffd28a', outfit: '#ffa36f', skin: '#ffd0aa' },
  glam: { background: '#392344', accent: '#f4cbff', outfit: '#d7a4ff', skin: '#ffd0aa' },
};

function Person({
  x,
  y,
  scale,
  poseIndex,
  color,
  skin,
  reverse = false,
}: {
  x: number;
  y: number;
  scale: number;
  poseIndex: number;
  color: string;
  skin: string;
  reverse?: boolean;
}) {
  const index = poseIndex % ARM_POSES.length;
  return (
    <g transform={`translate(${x} ${y}) scale(${reverse ? -scale : scale} ${scale})`}>
      <path d={LEG_POSES[index][0]} fill="none" stroke="#27213c" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7" />
      <path d={LEG_POSES[index][1]} fill="none" stroke="#27213c" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7" />
      <path d={ARM_POSES[index][0]} fill="none" stroke={skin} strokeLinecap="round" strokeLinejoin="round" strokeWidth="7" />
      <path d={ARM_POSES[index][1]} fill="none" stroke={skin} strokeLinecap="round" strokeLinejoin="round" strokeWidth="7" />
      <path d="M38 40 Q50 34 62 40 L64 78 Q50 84 36 78 Z" fill={color} stroke="#fff" strokeOpacity=".22" strokeWidth="1.5" />
      <path d="M46 34 L46 39 M54 34 L54 39" stroke={skin} strokeLinecap="round" strokeWidth="4" />
      <circle cx="50" cy="23" r="10" fill={skin} />
      <path d={poseIndex % 3 === 0 ? 'M45 26 Q50 31 55 26' : 'M46 27 Q50 29 54 27'} fill="none" stroke="#824d58" strokeLinecap="round" strokeWidth="1.5" />
      <path d="M43 20 Q46 18 48 20 M52 20 Q55 18 57 20" fill="none" stroke="#493042" strokeLinecap="round" strokeWidth="1.5" />
    </g>
  );
}

export function PoseIllustration({ category, index }: { category: PoseCategoryId; index: number }) {
  const palette = PALETTES[category];
  const isGroup = category === 'friends' || category === 'family';
  const isPair = category === 'couple' || category === 'funny';
  const people = isGroup
    ? [{ x: 2, scale: 0.58 }, { x: 48, scale: 0.66 }, { x: 94, scale: 0.58 }]
    : isPair
      ? [{ x: 12, scale: 0.82 }, { x: 72, scale: 0.82 }]
      : [{ x: 30, scale: 1 }];

  return (
    <svg aria-hidden="true" className="pose-illustration" viewBox="0 0 160 120">
      <rect x="1" y="1" width="158" height="118" rx="16" fill={palette.background} />
      <circle cx="20" cy="20" r="14" fill={palette.accent} opacity=".13" />
      <circle cx="142" cy="29" r="21" fill={palette.accent} opacity=".1" />
      <path d="M10 106 Q80 96 150 106" fill="none" stroke={palette.accent} strokeOpacity=".32" strokeWidth="2" />
      <path d="M21 84 l3 6 6 1-5 4 1 6-5-3-5 3 1-6-5-4 6-1z" fill={palette.accent} opacity=".8" />
      {people.map((person, personIndex) => (
        <Person
          color={personIndex === 1 && isPair ? '#f6a85f' : palette.outfit}
          key={person.x}
          poseIndex={index + personIndex}
          reverse={personIndex === 1 && isPair}
          scale={person.scale}
          skin={personIndex === 2 ? '#e8b48f' : palette.skin}
          x={person.x}
          y={isGroup ? 14 : 10}
        />
      ))}
      {category === 'glam' && (
        <>
          <path d="M130 48 l3 6 6 1-5 4 1 6-5-3-5 3 1-6-5-4 6-1z" fill={palette.accent} />
          <circle cx="129" cy="25" r="2" fill="white" />
          <circle cx="139" cy="40" r="1.5" fill="white" />
        </>
      )}
      {category === 'funny' && (
        <path d="M66 20 Q80 11 94 20" fill="none" stroke={palette.accent} strokeLinecap="round" strokeWidth="3" />
      )}
    </svg>
  );
}
