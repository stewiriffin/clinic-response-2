// app/layout.tsx
import './globals.css'
import { Providers } from './providers'
import { GlobalErrorBoundary } from '@/components/GlobalErrorBoundary'
import { ConditionalNav } from '@/components/ConditionalNav'
import { PageWrapper } from '@/components/PageWrapper'
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