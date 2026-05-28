import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Teamtailor GTM toolkit, week-one shipped",
  description:
    "Three live AI tools across Teamtailor's GTM workflow: cold outbound, reply triage, account brief. An audition for the Forward Deployed AI Accelerator role by Pascoal Dias.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
