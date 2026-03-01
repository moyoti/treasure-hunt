import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { ToastProvider } from '@/components/ToastProvider';
import BottomNav from '@/components/BottomNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '寻宝记 - Treasure Hunt',
  description: '探索世界，收集宝藏 - 一个地理位置收集游戏',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 高德地图 JS API */}
        <script
          src="https://webapi.amap.com/maps?v=2.0&key=897b2837359811602eb5d7b8d38af011"
          async
        />
      </head>
      <body className={`${inter.className} bg-dark-300 text-white`}>
        <AuthProvider>
          <ToastProvider>
            <div className="min-h-screen bg-dark-300">
              {children}
            </div>
            <BottomNav />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
