// app/layout.tsx
import './globals.css'
import { Providers } from './providers'
import { GlobalErrorBoundary } from '@/components/GlobalErrorBoundary'
import { ConditionalNav } from '@/components/ConditionalNav'
import { PageWrapper } from '@/components/PageWrapper'
import { PageLoadingIndicator } from '@/components/PageLoadingIndicator'
import { ReactNode } from 'react'

export const metadata = {
  title: 'First Response Clinic',
  description: 'Healthcare Management System',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GlobalErrorBoundary>
          <Providers>
            <PageLoadingIndicator />
            <ConditionalNav />
            <PageWrapper>
              {children}
            </PageWrapper>
          </Providers>
        </GlobalErrorBoundary>
      </body>
    </html>
  )
}