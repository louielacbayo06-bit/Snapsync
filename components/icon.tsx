export type IconName = 'camera' | 'users' | 'layout' | 'sparkles' | 'heart' | 'cloud' | 'arrow';

export function Icon({ name, className }: { name: IconName; className?: string }) {
  const shared = {
    'aria-hidden': true as const,
    className,
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 1.8,
    viewBox: '0 0 24 24',
    width: 24,
    height: 24,
  };

  switch (name) {
    case 'camera':
      return (
        <svg {...shared}>
          <path d="M4 7.5h3l1.6-2h6.8l1.6 2h3A2 2 0 0 1 22 9.5v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z" />
          <circle cx="12" cy="13.5" r="4" />
          <path d="M18.5 10h.01" />
        </svg>
      );
    case 'users':
      return (
        <svg {...shared}>
          <path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20" />
          <circle cx="9.5" cy="7.5" r="4" />
          <path d="M17 4a4 4 0 0 1 0 7.8M21 20v-1.5a4 4 0 0 0-3-3.9" />
        </svg>
      );
    case 'layout':
      return (
        <svg {...shared}>
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      );
    case 'sparkles':
      return (
        <svg {...shared}>
          <path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3Z" />
          <path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14ZM5 3l.7 2.3L8 6l-2.3.7L5 9l-.7-2.3L2 6l2.3-.7L5 3Z" />
        </svg>
      );
    case 'heart':
      return (
        <svg {...shared}>
          <path d="M20.8 8.7c0 4.2-8.8 10-8.8 10s-8.8-5.8-8.8-10A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.8 2.5Z" />
        </svg>
      );
    case 'cloud':
      return (
        <svg {...shared}>
          <path d="M7 18h10a4 4 0 0 0 .6-8 6 6 0 0 0-11.5 1A3.5 3.5 0 0 0 7 18Z" />
          <path d="M12 12v7m-2.5-2.5L12 19l2.5-2.5" />
        </svg>
      );
    case 'arrow':
      return (
        <svg {...shared}>
          <path d="M5 12h14m-6-6 6 6-6 6" />
        </svg>
      );
  }
}
