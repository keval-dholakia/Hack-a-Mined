import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'TechMicra ERP',
  description: 'TechMicra ERP — Manufacturing & Operations Management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app">
          <Sidebar />
          <div className="main">
            <Header />
            <main className="content">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
