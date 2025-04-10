// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Quicksand } from 'next/font/google';
import Logo from './components/logo';

const quicksand = Quicksand({
  weight: '300',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Login Page',
  description: 'Magic Link Login',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={quicksand.className}>
        <div className="flex justify-center bg-white">
          <Logo />
        </div>
        <div>{children}</div>
      </body>
    </html>
  );
}
