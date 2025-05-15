
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Mic,
  Users,
  Newspaper,
  ImageIcon as Image, // Renamed to avoid conflict with NextImage
  Brain,
  Shuffle,
  Blocks,
  Settings,
  BotMessageSquare,
  MessageSquare,
  Library,
  Cpu // Added for Core Systems
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
}

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
    title: "Prabh's Core Systems", // New Page
    href: '/core-systems',
    icon: Cpu,
  },
  {
    title: 'Media Generation',
    href: '/media-generation',
    icon: Image,
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

export const AppLogoIcon = BotMessageSquare;
