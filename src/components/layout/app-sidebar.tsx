
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { mainNav, footerNav, AppLogoIcon } from '@/config/nav'; // AppLogoIcon is now a component
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface AppSidebarProps {
  className?: string;
}

export function AppSidebar({ className }: AppSidebarProps) {
  const pathname = usePathname();
  const { open } = useSidebar();

  return (
    <Sidebar
      className={cn('border-r border-sidebar-border', className)}
      collapsible="icon"
      variant="sidebar"
    >
      <SidebarHeader className="flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2">
          {/* Pass 'relative' and sizing classes to AppLogoIcon */}
          <AppLogoIcon className="relative h-8 w-8" />
          {open && <span className="text-xl font-semibold">PrabhAI</span>}
        </Link>
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-1">
        <SidebarMenu>
          {mainNav.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.title}
                  disabled={item.disabled}
                  className="justify-start"
                >
                  <a>
                    {/* Handle if icon is LucideIcon or React.FC */}
                    {typeof item.icon === 'function' ? (
                      <item.icon className="h-5 w-5" />
                    ) : (
                      <item.icon className="h-5 w-5" /> // Fallback if it's somehow not a function (LucideIcon)
                    )}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <Separator className="my-2" />
      <SidebarFooter className="p-2">
        <SidebarMenu>
          {footerNav.map((item) => (
            <SidebarMenuItem key={item.href}>
               <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.title}
                  disabled={item.disabled}
                  className="justify-start"
                >
                  <a>
                    {typeof item.icon === 'function' ? (
                      <item.icon className="h-5 w-5" />
                    ) : (
                      <item.icon className="h-5 w-5" />
                    )}
                    <span>{item.title}</span>
                   </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
