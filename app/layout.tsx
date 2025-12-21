'use client'

import { Inter } from "next/font/google";
import "./globals.css";
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const Sidebar = dynamic(() => import('@/components/sidebar'), { ssr: false });

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';

    return (
        <html lang="es">
            <body className={inter.className}>
                <div className="flex h-screen overflow-hidden">
                    {!isLoginPage && <Sidebar />}
                    <main className="flex-1 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}

