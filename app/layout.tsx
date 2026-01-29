import React from "react"
import type { Metadata } from 'next'
import { M_PLUS_1p, Noto_Sans_JP } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { authClient } from '@/lib/auth/client'
import { NeonAuthUIProvider } from '@neondatabase/auth/react'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const mplus = M_PLUS_1p({ 
  weight: ['400', '500', '700', '800', '900'],
  subsets: ['latin', 'japanese'],
  display: 'swap',
  variable: '--font-mplus',
});

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '500', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto',
});

export const metadata: Metadata = {
  title: 'michibox - 映画猫の箱',
  description: 'Track the movies and TV shows you have seen and want to watch in manga style',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${mplus.className} ${mplus.variable} ${notoSansJP.variable} antialiased manga-style`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <NeonAuthUIProvider
            authClient={authClient}
            redirectTo="/profile"
            emailOTP
          >
            {children}
          </NeonAuthUIProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
