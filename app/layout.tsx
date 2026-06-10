import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Autumn Lake Email Signature Builder",
  description: "Build your Outlook email signature with GitHub-hosted images",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-gray-50">{children}</body>
    </html>
  );
}
