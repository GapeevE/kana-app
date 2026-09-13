import type { Metadata } from 'next'
import { Noto_Sans_JP, Inter } from 'next/font/google'
import './globals.css'
import React from 'react'
import { auth } from '@/server/auth'
import { AppNav } from '@/components/app-nav'

const inter = Inter({ variable: '--font-sans', subsets: ['latin', 'cyrillic'] })
const notoJP = Noto_Sans_JP({ variable: '--font-jp', subsets: ['latin'], weight: ['400', '700'] })

export const metadata: Metadata = {
  title: 'kana-app',
  description: 'Изучение японской азбуки',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <html lang="ru" className={`${inter.variable} ${notoJP.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {session?.user && <AppNav />}
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  )
}
