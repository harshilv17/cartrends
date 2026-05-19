import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Attendance & Timesheet Analyzer",
  description: "Analyze attendance and timesheet data with simple AI-driven insights.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
