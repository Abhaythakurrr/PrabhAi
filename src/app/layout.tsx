
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google'; // Changed from Inter
import { Geist_Mono } from 'next/font/google';
import './globals.css';
import { SidebarProvider, SidebarInset, SidebarRail } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { MobileHeader } from '@/components/layout/mobile-header';
import { Toaster } from "@/components/ui/toaster";

const poppins = Poppins({ // Changed from inter
  variable: '--font-poppins', // Changed variable name
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'] // Added weights for Poppins
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
      <body className={`${poppins.variable} ${geistMono.variable} font-sans antialiased`}> {/* Updated font variable and added font-sans */}
        <SidebarProvider defaultOpen={true}> {/* Changed defaultOpen to true */}
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
