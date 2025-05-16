import type { Metadata } from 'next';
// Removed Geist_Sans and direct Poppins import, will rely on globals.css and tailwind.config.ts
import './globals.css';
import { SidebarProvider, SidebarInset, SidebarRail } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar'; // Assuming AppSidebar will be your main sidebar component
import { MobileHeader } from '@/components/layout/mobile-header';
import { Toaster } from "@/components/ui/toaster";


export const metadata: Metadata = {
  title: 'PrabhAI',
  description: 'Your Personalized AI Companion and Creator, by Abhay for Akshu Ecosystem.',
};

export default function RootLayout({
  children, // children here represents the content of the current page (e.g., dashboard, chat, etc.)
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* font-body will be applied through globals.css and tailwind config */}
      <body className="font-body antialiased"> {/* Apply font-body from Tailwind config */}
        {/* === Dynamic Background and Scanlines === */}
        <div className="main-panel">
          <div className="scanlines"></div>

          <SidebarProvider defaultOpen={true}>
            <AppSidebar />
            <SidebarRail />
            <SidebarInset className="flex flex-col"> {/* Added flex flex-col for vertical layout */}
              <MobileHeader />
              {/* Example placement for ThemeToggle, adjust as needed */}
              {/* <div className="absolute top-4 right-4 z-50 hidden md:block">\
                <ThemeToggle />
              </div> */}
              {/* This div is the main content pane */}
              <div className="flex-1 p-4 sm:p-6 main-content-pane">
                {/* This div is a placeholder for the feature tile grid.
                    The actual grid layout and tiles will be implemented on the dashboard page. */}
                <div className="feature-tile-grid"></div>
                {children}
              </div>
            </SidebarInset>
          </SidebarProvider>
          <Toaster />
        </div>
      </body>
    </html>
  );
}
