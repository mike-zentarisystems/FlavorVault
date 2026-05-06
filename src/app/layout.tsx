import type {Metadata} from 'next';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AdminBannerWrapper } from '@/components/admin-banner-wrapper';

export const metadata: Metadata = {
  title: 'FlavorVault - Smart Recipe Box',
  description: 'Manage your pantry and generate smart recipes with AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-primary/20 flex flex-col min-h-screen">
        <FirebaseClientProvider>
          <Navbar />
          {/* Admin banner — only visible to carolynjuba@gmail.com */}
          <AdminBannerWrapper />
          <div className="flex-1">
            {children}
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
