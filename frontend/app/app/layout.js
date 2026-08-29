import { ClerkProvider } from '@clerk/nextjs'
import Script from 'next/script'
import './globals.css'
import './components.css'

export const metadata = {
  title: 'CognitRAG — The Company Brain',
  description: 'Your company already has a brain. Connect it. CognitRAG turns fragmented enterprise knowledge into trusted context for people and AI agents.',
  openGraph: {
    title: 'CognitRAG — The Company Brain',
    description: 'Connect fragmented company knowledge into trusted, verifiable context for humans and AI agents.',
    url: 'https://cognitrag.ai',
    siteName: 'CognitRAG',
    images: [
      {
        url: 'https://cognitrag.ai/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CognitRAG — The Company Brain',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CognitRAG — The Company Brain',
    description: 'Your company already has a brain. Connect it.',
  },
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en">
        <head>
          {/* Geist Font — Primary UI typeface */}
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-sans/style.min.css"
          />
          {/* JetBrains Mono — Code & metadata typeface */}
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-mono/style.min.css"
          />
        </head>
        <body>
          {children}
          <Script src="https://apis.google.com/js/api.js" strategy="afterInteractive" />
          <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        </body>
      </html>
    </ClerkProvider>
  )
}
