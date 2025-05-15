import React from 'react';
import Image from 'next/image'; // Correct import for Next.js Image component
import {
  LayoutDashboard,
  Mic,
  Users,
  Newspaper,
  ImageIcon as ImageLucide, // Renamed to avoid conflict
  Brain,
  Shuffle,
  Blocks,
  Settings,
  MessageSquare,
  Library,
  Cpu
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react'; // For NavItem type
import { cn } from '@/lib/utils'; // Assuming cn is in lib/utils

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon | React.FC<any>; // Allow React components for icons
  label?: string;
  disabled?: boolean;
}

// Define AppLogoIcon as a React component
export const AppLogoIcon: React.FC<{ className?: string }> = ({ className: passedClassName }) => {
  // Construct the className for the div
  // The div itself will be 'relative' for the Next/Image layout="fill" to work within it.
  // And it will take any className passed from the parent.
  const divClasses = cn("relative", passedClassName);

  return (
    <div style={{ width: '32px', height: '32px' }} className={divClasses}>
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
