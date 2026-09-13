'use client';

import Link from "next/link";
import { useEffect, useState } from "react";

interface DashboardTemplateProps {
  children: React.ReactNode;
}

export default function DashboardTemplate({ children }: DashboardTemplateProps) {
  const [text, setText] = useState<string>('');

  useEffect(() => console.log('DashboardTemplate mounted'), []);

  return (
    <div className="flex-1 p-6 border-4 border-dashed border-purple-400 rounded-lg flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex justify-between items-center mb-6">
            <div className="text-xs font-bold text-purple-400 uppercase tracking-widest">
                Dashboard Template
            </div>
            <div className="flex flex-col items-end">
                <label className="block text-[10px] font-bold text-purple-400 uppercase mb-2">
                    Persist State
                </label>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full p-2 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
            </div>
        </div>
        {children}
    </div>
  );
}