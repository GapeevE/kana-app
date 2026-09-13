import type { Metadata } from 'next'
import { Noto_Sans_JP, Inter } from 'next/font/google'
import './globals.css'
import React from 'react'

const inter = Inter({ variable: '--font-sans', subsets: ['latin', 'cyrillic'] })
const notoJP = Noto_Sans_JP({ variable: '--font-jp', subsets: ['latin'], weight: ['400', '700'] })

export const metadata: Metadata = {
  title: 'kana-app',
  description: 'Изучение японской азбуки',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${notoJP.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
