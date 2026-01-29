import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { authService } from '@/services/auth';
import { useEffect, useState } from 'react';

export default function Layout() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const user = authService.getCurrentUser();
        setIsAuthenticated(!!user);
    }, []);

    if (isAuthenticated === null) return null; // Loading state

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex min-h-screen bg-background text-gray-900 font-sans">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
