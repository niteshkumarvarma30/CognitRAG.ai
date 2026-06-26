import { ClerkProvider } from '@clerk/nextjs'
import Script from 'next/script'
import './globals.css'

export const metadata = {
  title: 'CognitRAG.ai | Graph-Powered Workspace Intelligence',
  description: 'Preserve knowledge. Connect context. Retain intelligence. Continuously transform documents, conversations, and decisions into a living workspace memory powered by hybrid retrieval and graph intelligence.',
  openGraph: {
    title: 'CognitRAG.ai | Graph-Powered Workspace Intelligence',
    description: 'Transform your company\'s fragmented knowledge into a persistent, searchable, and explainable intelligence network.',
    url: 'https://cognitrag.ai',
    siteName: 'CognitRAG.ai',
    images: [
      {
        url: 'https://cognitrag.ai/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CognitRAG.ai Graph Network Visualization',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CognitRAG.ai | Graph-Powered Workspace Intelligence',
    description: 'Knowledge belongs to the workspace, not the employee. Prevent information fragmentation with hybrid retrieval.',
  },
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          {children}
          <Script src="https://apis.google.com/js/api.js" strategy="beforeInteractive" />
          <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />
        </body>
      </html>
    </ClerkProvider>
  )
}
