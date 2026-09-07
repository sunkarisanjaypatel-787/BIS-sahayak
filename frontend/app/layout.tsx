import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BIS Sahayak — AI Compliance Assistant",
  description:
    "AI-powered compliance assistant for Indian Standards. Trusted standards, verified knowledge, actionable compliance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Loaded via <link> rather than next/font so the build never depends
            on reaching fonts.googleapis.com at compile time. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
