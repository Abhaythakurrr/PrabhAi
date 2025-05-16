
import type { LucideIcon } from 'lucide-react';
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
import { AppLogoIcon } from '@/components/layout/app-logo-icon'; // Updated import path

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon | React.FC<any>; // AppLogoIcon is React.FC<any>
  label?: string;
  disabled?: boolean;
  colorAccent?: string;
}

export const mainNav: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    colorAccent: 'accent-cyan',
  },
  {
    title: 'Prabh Chat',
    href: '/prabh-chat',
    icon: MessageSquare,
    colorAccent: 'accent-neon-green',
  },
  {
    title: 'Voice Interaction',
    href: '/voice-interaction',
    icon: Mic,
    colorAccent: 'accent-orange',
  },
  {
    title: 'Persona Engine',
    href: '/persona-engine',
    icon: Users,
    colorAccent: 'accent-pink',
  },
  {
    title: 'Real-Time Knowledge',
    href: '/real-time-knowledge',
    icon: Newspaper,
    colorAccent: 'accent-teal',
  },
  {
    title: 'Deep Research',
    href: '/deep-research',
    icon: Library,
    colorAccent: 'accent-purple',
  },
  {
    title: "Prabh's Core Systems",
    href: '/core-systems',
    icon: Cpu,
    colorAccent: 'accent-gold',
  },
  {
    title: 'Media Generation',
    href: '/media-generation',
    icon: ImageLucide,
    colorAccent: 'accent-magenta',
  },
  {
    title: 'Unforgettable Memory',
    href: '/memory',
    icon: Brain,
    colorAccent: 'accent-yellow',
  },
  {
    title: 'Can Be Anything',
    href: '/can-be-anything',
    icon: Shuffle,
    colorAccent: 'accent-rainbow',
  },
  {
    title: 'Prabh AI Studio',
    href: '/studio',
    icon: Blocks,
    colorAccent: 'accent-terminal',
  },
];

export const footerNav: NavItem[] = [
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    colorAccent: 'accent-gold', // Assuming a similar neutral color for settings
  },
];
