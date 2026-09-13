'use client';

import Link from "next/link";
import { useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [text, setText] = useState<string>('');

  return (
    <div className="flex flex-row min-h-[calc(100vh-2rem)] border-4 border-blue-500 rounded-xl m-4 overflow-hidden">
      <aside className="w-64 bg-blue-50 p-6 border-r border-blue-100 flex flex-col">
        <div className="mb-8 text-xs font-bold text-blue-500 uppercase tracking-widest font-sans">
            Dashboard Layout
        </div>
        <nav className="flex flex-col gap-4">
            <span className="font-bold text-sm text-zinc-400">Navigation</span>
            <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
                Dashboard
            </Link>
            <Link href="/dashboard/settings" className="hover:text-blue-600 transition-colors">
                Settings
            </Link>
            <Link href="/deers" className="hover:text-blue-600 transition-colors">
                Deers
            </Link>
            <Link href="/dashboard/users" className="hover:text-blue-600 transition-colors">
                Users
            </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-blue-200">
          <label className="block text-[10px] font-bold text-blue-400 uppercase mb-2">
            Persist State
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-2 border border-blue-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </aside>
      <main className="flex-1 flex flex-col bg-white p-8">
        {children}
      </main>
    </div>
  );
}