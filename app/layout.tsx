import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "KirayePe — Don't Buy It. Rent It.",
    template: "%s · KirayePe",
  },
  description:
    "KirayePe is India's friendly rental marketplace for cameras, gadgets, furniture, bikes and more. Rent what you need, earn from what you own.",
  keywords: [
    "rental marketplace",
    "rent products India",
    "camera rental",
    "furniture rental",
    "KirayePe",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-canvas text-ink">{children}</body>
    </html>
  );
}