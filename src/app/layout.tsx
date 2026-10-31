import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClosetCloud — Your style, beautifully connected",
  description: "Discover, curate and share your personal style with ClosetCloud."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
