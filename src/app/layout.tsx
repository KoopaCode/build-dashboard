import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Image from 'next/image'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KoopaLabs Plugin Builds',
  description: 'Download the latest Minecraft plugin builds from KoopaLabs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <header className="bg-gray-900 p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-center">
              <Image
                src="https://lapislabs.dev/images/KoopaLabs.png"
                alt="KoopaLabs Logo"
                width={300}
                height={75}
                priority
                className="h-auto"
              />
            </div>
          </header>
          <main className="flex-grow">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
} 