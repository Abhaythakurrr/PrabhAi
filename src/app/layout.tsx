
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Changed from Geist
import { Geist_Mono } from 'next/font/google';
import './globals.css';
import { SidebarProvider, SidebarInset, SidebarRail } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { MobileHeader } from '@/components/layout/mobile-header';
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ // Changed from geistSans
  variable: '--font-inter', // Changed variable name
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PrabhAI',
  description: 'Your Personalized AI Companion and Creator.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${geistMono.variable} antialiased`}> {/* Updated font variable */}
        <SidebarProvider defaultOpen={false}>
          <AppSidebar />
          <SidebarRail />
          <SidebarInset>
            <MobileHeader />
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
