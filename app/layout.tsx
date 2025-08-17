import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Windows 95 Bot LLM',
  description: 'A retro Windows 95-style chatbot with LLM integration',
  icons: {
    icon: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-ms-sans bg-win95-cyan overflow-hidden">
        {children}
      </body>
    </html>
  )
}
