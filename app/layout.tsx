import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "DEV.AI — Multi-Model AI Coding Agent", description: "Production-style frontend and orchestration framework for a multi-model coding agent." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }