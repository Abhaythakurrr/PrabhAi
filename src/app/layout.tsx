
import type { Metadata } from 'next';
// Removed Geist_Sans and direct Poppins import, will rely on globals.css and tailwind.config.ts
import './globals.css';
import { SidebarProvider, SidebarInset, SidebarRail } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { MobileHeader } from '@/components/layout/mobile-header';
import { Toaster } from "@/components/ui/toaster";
import { ThemeToggle } from '@/components/prabh_ui/ThemeToggle'; // Placeholder for ThemeToggle placement

export const metadata: Metadata = {
  title: 'PrabhAI',
  description: 'Your Personalized AI Companion and Creator, by Abhay for Akshu Ecosystem.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* font-body will be applied through globals.css and tailwind config */}
      <body className="font-body antialiased"> {/* Apply font-body from Tailwind config */}
        <SidebarProvider defaultOpen={true}>
          <AppSidebar />
          <SidebarRail />
          <SidebarInset>
            <MobileHeader />
            {/* Example placement for ThemeToggle, adjust as needed */}
            {/* <div className="absolute top-4 right-4 z-50 hidden md:block">
              <ThemeToggle />
            </div> */}
            <div className="flex-1 p-4 sm:p-6">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
