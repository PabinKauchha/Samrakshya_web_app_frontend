import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import { SosRedirectGuard } from "@/components/sos-redirect-guard";
import { AuthProvider } from "@/components/auth/auth-provider";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Samrakshya - Women Safety App",
  description:
    "Your safety companion - Emergency SOS alerts, legal guidance, and mental health support for women in Nepal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          <SosRedirectGuard />
          {children}
          <Toaster richColors position="top-right" />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
