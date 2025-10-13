import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'
import LoadingOverlay from '@/components/LoadingOverlay'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Strat Plan - Strategic Planning System',
  description: 'Municipal government strategic planning and management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Inline critical styles to prevent FOUC */
            body {
              font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
              background-color: #f9fafb;
              margin: 0;
              padding: 0;
              min-height: 100vh;
            }
            
            /* Loading state styles */
            .loading-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: #f9fafb;
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 9999;
              opacity: 1;
              transition: opacity 0.3s ease-out;
            }
            
            .loading-overlay.loaded {
              opacity: 0;
              pointer-events: none;
            }
            
            .loading-spinner {
              width: 40px;
              height: 40px;
              border: 4px solid #e5e7eb;
              border-left: 4px solid #3b82f6;
              border-radius: 50%;
              animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `
        }} />
      </head>
      <body className={`${inter.className} h-full`}>
        <LoadingOverlay />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
