import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CSV Insights Dashboard",
  description: "Upload CSVs, preview data, and generate AI-powered insights."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <Link href="/" className="flex items-center gap-2">
                <span className="h-7 w-7 rounded bg-gradient-to-br from-brand-500 to-brand-700" />
                <span className="text-sm font-semibold tracking-tight">
                  CSV Insights Dashboard
                </span>
              </Link>
              <nav className="flex items-center gap-4 text-xs font-medium text-slate-300">
                <Link
                  href="/"
                  className="rounded px-2 py-1 hover:bg-slate-800 hover:text-white"
                >
                  Home
                </Link>
                <Link
                  href="/status"
                  className="rounded px-2 py-1 hover:bg-slate-800 hover:text-white"
                >
                  Status
                </Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-6">
            {children}
          </main>
          <footer className="border-t border-slate-800 bg-slate-950/80">
            <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-3 text-xs text-slate-500">
              <span>CSV Insights Dashboard</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

