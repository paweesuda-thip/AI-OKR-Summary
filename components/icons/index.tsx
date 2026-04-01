import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const defaultProps = (size = 24): Partial<IconProps> => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export function IconShield({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7l-9-5z" />
    </svg>
  );
}

export function IconSword({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
      <path d="M13 19l6-6" />
      <path d="M16 16l4 4" />
      <path d="M19 21l2-2" />
      <path d="M14.5 17.5l-1.5-1.5" />
    </svg>
  );
}

export function IconHelmet({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M12 2C7 2 3 6.5 3 11v2c0 1.1.9 2 2 2h1v-3c0-3.3 2.7-6 6-6s6 2.7 6 6v3h1c1.1 0 2-.9 2-2v-2c0-4.5-4-9-9-9z" />
      <path d="M7 15v4c0 1.7 2.2 3 5 3s5-1.3 5-3v-4" />
      <line x1="3" y1="11" x2="21" y2="11" />
    </svg>
  );
}

export function IconTarget({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconFlame({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M12 2c0 4-4 6-4 10a4 4 0 0 0 8 0c0-4-4-6-4-10z" />
      <path d="M12 18a2 2 0 0 1-2-2c0-2 2-3 2-5 0 2 2 3 2 5a2 2 0 0 1-2 2z" fill="currentColor" stroke="none" opacity="0.3" />
    </svg>
  );
}

export function IconTrophy({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M6 9H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3" />
      <path d="M18 9h3a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-3" />
      <path d="M6 4h12v6a6 6 0 0 1-12 0V4z" />
      <path d="M9 18h6" />
      <path d="M12 16v2" />
      <path d="M8 22h8" />
      <path d="M10 22v-4" />
      <path d="M14 22v-4" />
    </svg>
  );
}

export function IconCrown({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M2 8l4 4 4-6 4 6 4-4 2 10H4L2 8z" fill="currentColor" fillOpacity="0.1" />
      <path d="M2 8l4 4 4-6 4 6 4-4 2 10H4L2 8z" />
    </svg>
  );
}

export function IconLightning({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
    </svg>
  );
}

export function IconChart({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <rect x="3" y="12" width="4" height="9" rx="1" />
      <rect x="10" y="8" width="4" height="13" rx="1" />
      <rect x="17" y="3" width="4" height="18" rx="1" />
    </svg>
  );
}

export function IconUsers({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <circle cx="9" cy="7" r="3" />
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M21 21v-1.5a3 3 0 0 0-2-2.83" />
    </svg>
  );
}

export function IconArrowTrend({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
      <polyline points="16,7 22,7 22,13" />
    </svg>
  );
}

export function IconMedal({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <path d="M7.2 4h9.6L20 8l-8 14L4 8l3.2-4z" />
      <path d="M12 8l-4 4h8l-4-4z" fill="currentColor" fillOpacity="0.15" />
      <line x1="4" y1="8" x2="20" y2="8" />
    </svg>
  );
}

export function IconPulse({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <polyline points="2,12 6,12 8,6 10,18 12,9 14,15 16,12 22,12" />
    </svg>
  );
}

export function IconFlag({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaultProps(size)} {...props}>
      <line x1="4" y1="2" x2="4" y2="22" />
      <path d="M4 4h12l-3 4 3 4H4" fill="currentColor" fillOpacity="0.15" />
      <path d="M4 4h12l-3 4 3 4H4" />
    </svg>
  );
}
