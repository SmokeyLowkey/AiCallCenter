import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'AI Call Clarity',
  description: 'AI-Powered Intelligence for Every Call',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="w-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
