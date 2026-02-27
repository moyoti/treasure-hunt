import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { ToastProvider } from '@/components/ToastProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '寻宝记 - Treasure Hunt',
  description: '探索世界，收集宝藏 - 一个地理位置收集游戏',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} bg-dark-300 text-white`}>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}