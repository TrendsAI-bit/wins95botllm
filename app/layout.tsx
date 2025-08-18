import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Windows XP ChatBot',
  description: 'A modern retro Windows XP-style chatbot with AI integration',
  icons: {
    icon: '/Logo.png',
    shortcut: '/Logo.png',
    apple: '/Logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-system bg-xp-desktop overflow-hidden">
        {children}
      </body>
    </html>
  )
}
