import { ClerkProvider } from '@clerk/nextjs'
import Script from 'next/script'
import './globals.css'
import './components.css'

export const metadata = {
  title: "CognitRAG.ai — Your team's memory, with proof",
  description: "CognitRAG connects Slack, GitHub, Jira and Notion to give engineering teams verifiable answers with citation proof, whether asked in English or Hinglish.",
  metadataBase: new URL('https://cognitrag.ai'),
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: "CognitRAG.ai — Your team's memory, with proof",
    description: "CognitRAG connects Slack, GitHub, Jira and Notion to give engineering teams verifiable answers with citation proof.",
    url: 'https://cognitrag.ai',
    siteName: 'CognitRAG.ai',
    images: [
      {
        url: 'https://cognitrag.ai/og-image.jpg',
        width: 1200,
        height: 630,
        alt: "CognitRAG.ai — Your team's memory, with proof",
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "CognitRAG.ai — Your team's memory, with proof",
    description: "Your team's memory, with proof. Connecting Slack, GitHub, Jira and Notion for Hinglish-speaking engineering teams.",
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
