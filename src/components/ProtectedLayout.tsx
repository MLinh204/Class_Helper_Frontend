'use client'
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedLayoutProps {
    children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const isPublicPage = ['/login', '/register'].includes(pathname);
        const token = localStorage.getItem('token'); // or any login info key

        if (!isPublicPage && !token) {
            router.replace('/login');
        }
    }, [pathname, router]);

    return <>{children}</>;
}