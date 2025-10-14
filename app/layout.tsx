import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'
import LoadingOverlay from '@/components/LoadingOverlay'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Strat Plan - Strategic Planning System',
  description: 'Municipal government strategic planning and management system',
  formatDetection: {
    telephone: false,
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover' as const,
  themeColor: '#486581',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Strategic Planning" />
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Inline critical styles to prevent FOUC */
            * {
              box-sizing: border-box;
            }
            
            html {
              height: 100%;
              height: 100dvh;
              -webkit-text-size-adjust: 100%;
              -webkit-tap-highlight-color: transparent;
            }
            
            body {
              font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
              background-color: #f9fafb;
              margin: 0;
              padding: 0;
              min-height: 100vh;
              min-height: 100dvh;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              overscroll-behavior: none;
            }
            
            /* Prevent iOS input zoom */
            input, select, textarea {
              font-size: 16px;
            }
            
            @media (max-width: 767px) {
              input, select, textarea {
                font-size: 16px !important;
              }
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
      <body className={`${inter.className} h-full mobile-full-height safe-area-inset`}>
        <LoadingOverlay />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
