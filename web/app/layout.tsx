// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import Logo from "./components/logo";
import NavArrows from "./components/navigation_arrow";

const quicksand = Quicksand({
  weight: "300",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Login Page",
  description: "Magic Link Login",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${quicksand.className} bg-white min-h-screen relative`}>
        <div className="flex justify-center py-4">
          <Logo />
        </div>

        <main>{children}</main>

        {/* ✅ Interactive nav lives in a client component */}
        <NavArrows />
      </body>
    </html>
  );
}