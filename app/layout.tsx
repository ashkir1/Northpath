import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NorthPath — Minnesota EIDBI Provisional License',
  description: 'Get your Minnesota EIDBI provisional license application ready before May 31, 2026. Guided step-by-step. No lawyer required.',
  keywords: 'EIDBI provisional license Minnesota, DHS EIDBI application, autism services compliance Minnesota',
  openGraph: {
    title: 'NorthPath — EIDBI Provisional License Before May 31',
    description: 'Get licensed without a $15,000 lawyer. Step-by-step guided application for Minnesota EIDBI agencies.',
    type: 'website',
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
