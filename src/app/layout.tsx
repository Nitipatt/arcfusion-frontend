import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthWrapper } from "@/components/layout/AuthWrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "ArcFusion Analytics | AI-Powered Data Insights",
  description:
    "Ask natural language questions about your data and get AI-generated insights, recommendations, and interactive visualizations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className="antialiased bg-slate-50 text-foreground">
        <AuthWrapper>{children}</AuthWrapper>
      </body>
    </html>
  );
}
