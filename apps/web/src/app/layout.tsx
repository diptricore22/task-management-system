import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/modules/auth/context/auth.context';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Task Management System',
    template: '%s | Task Management System',
  },
  description: 'Collaborative task management for engineering teams',
  keywords: ['task management', 'project management', 'team collaboration'],
  authors: [{ name: 'Task Management Team' }],
  creator: 'Task Management System',
  metadataBase: new URL(process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000',
    siteName: 'Task Management System',
    title: 'Task Management System',
    description: 'Collaborative task management for engineering teams',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Task Management System',
    description: 'Collaborative task management for engineering teams',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.className
        )}
      >
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}