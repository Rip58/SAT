'use client'

import { Inter } from "next/font/google";
import "./globals.css";
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Sidebar = dynamic(() => import('@/components/sidebar'), { ssr: false });

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <html lang="es">
            <body className={inter.className}>
                <div className="flex h-screen overflow-hidden">
                    {/* Mobile Menu Button */}
                    {!isLoginPage && (
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="fixed top-4 left-4 z-50 p-2 bg-secondary border border-border rounded-lg lg:hidden hover:bg-accent transition-colors"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    )}

                    {/* Overlay for mobile menu */}
                    {!isLoginPage && mobileMenuOpen && (
                        <div
                            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                    )}

                    {/* Sidebar */}
                    {!isLoginPage && (
                        <div className={`
                            fixed lg:static inset-y-0 left-0 z-40
                            transform transition-transform duration-300 ease-in-out
                            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                        `}>
                            <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
                        </div>
                    )}

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}

