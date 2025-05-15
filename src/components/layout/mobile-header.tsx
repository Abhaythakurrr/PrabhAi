
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { AppLogoIcon } from '@/config/nav'; // AppLogoIcon is now a component
import Link from 'next/link';

export function MobileHeader() {
  return (
    <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <Link href="/" className="flex items-center gap-2" aria-label="Go to homepage">
        {/* Added a div wrapper for AppLogoIcon to handle relative positioning and dimensions */}
        <div className="relative h-6 w-6">
          <AppLogoIcon />
        </div>
        <span className="font-semibold text-lg text-primary">PrabhAI</span>
      </Link>
      <SidebarTrigger />
    </div>
  );
}
