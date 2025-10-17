import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Silk from "@/components/Silk";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jersey Sales Tracker",
  description: "Professional jersey inventory and sales tracking system",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link 
          href="https://fonts.cdnfonts.com/css/helvetica-neue-5?styles=103508" 
          rel="stylesheet" 
        />
        <link 
          rel="preload" 
          href="https://fonts.cdnfonts.com/css/helvetica-neue-5?styles=103508" 
          as="style"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="fixed inset-0 z-0">
          <Silk
            speed={3}
            scale={.85}
            color="#012d24"
            noiseIntensity={0.1}
            rotation={0}
          />
        </div>
        <div className="relative z-10 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
