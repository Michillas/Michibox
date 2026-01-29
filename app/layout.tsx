import React from "react"
import type { Metadata } from 'next'
import { Poppins, Outfit } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { authClient } from '@/lib/auth/client'
import { NeonAuthUIProvider } from '@neondatabase/auth/react'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

const outfit = Outfit({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'michibox - Your Manga-Style Watch Tracker',
  description: 'Track the movies and TV shows you have seen and want to watch in a hand-drawn manga style',
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
      <body className={`${outfit.className} ${poppins.variable} ${outfit.variable} antialiased manga-style`}>
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
