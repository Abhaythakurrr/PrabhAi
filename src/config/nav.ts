
import React from 'react';
import Image from 'next/image';
// cn utility is not strictly needed here for AppLogoIcon's div anymore
// import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Mic,
  Users,
  Newspaper,
  ImageIcon as ImageLucide, // Renamed to avoid conflict with next/image
  Brain,
  Shuffle,
  Blocks,
  Settings,
  MessageSquare,
  Library,
  Cpu
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon | React.FC<any>; // AppLogoIcon is React.FC<any>
  label?: string;
  disabled?: boolean;
}

// Define AppLogoIcon as a React component
// It now directly returns the Image component.
// The parent component (app-sidebar.tsx, mobile-header.tsx) is responsible for the wrapper div and sizing.
export const AppLogoIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <Image
      src={"/logo/logo.png"} // Path to your logo in public/logo/ - explicitly a JSX expression
      alt="PrabhAI Logo"
      width={32} // Added explicit width
      height={32} // Added explicit height
      className={className} // Apply any passed className to the Image itself
    />
  );
};

export const mainNav: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Prabh Chat',
    href: '/prabh-chat',
    icon: MessageSquare,
  },
  {
    title: 'Voice Interaction',
    href: '/voice-interaction',
    icon: Mic,
  },
  {
    title: 'Persona Engine',
    href: '/persona-engine',
    icon: Users,
  },
  {
    title: 'Real-Time Knowledge',
    href: '/real-time-knowledge',
    icon: Newspaper,
  },
  {
    title: 'Deep Research',
    href: '/deep-research',
    icon: Library,
  },
  {
    title: "Prabh's Core Systems",
    href: '/core-systems',
    icon: Cpu,
  },
  {
    title: 'Media Generation',
    href: '/media-generation',
    icon: ImageLucide,
  },
  {
    title: 'Unforgettable Memory',
    href: '/memory',
    icon: Brain,
  },
  {
    title: 'Can Be Anything',
    href: '/can-be-anything',
    icon: Shuffle,
  },
  {
    title: 'Prabh AI Studio',
    href: '/studio',
    icon: Blocks,
  },
];

export const footerNav: NavItem[] = [
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];
