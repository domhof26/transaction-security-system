import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fiscalization Simulator Dashboard",
  description: "Educational fiscalization dashboard inspired by fiskaly SIGN AT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
