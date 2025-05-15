
import React from 'react';
import Image from 'next/image';
// cn utility is not strictly needed here for AppLogoIcon's div anymore
// import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Mic,
  Users,
  Newspaper,
  ImageIcon as ImageLucide,
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
// The component now expects the full className (including 'relative' and dimensions) to be passed from the parent.
export const AppLogoIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={className}>
      <Image
        src="/logo/logo.png" // Path to your logo in public/logo/
        alt="PrabhAI Logo"
        layout="fill" // Fills the parent div
        objectFit="contain" // Ensures the logo scales correctly
      />
    </div>
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
