import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Kanban,
    Users,
    Home,
    MessageSquare,
    CheckSquare,
    LogOut,
    ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { authService } from '@/services/auth';
import { useState } from 'react';

const mainNavItems = [
    { icon: Home, label: 'Inicio', href: '/' },
    { icon: MessageSquare, label: 'Comunicaciones', href: '/inbox' }, // Placeholder
    // { icon: Kanban, label: 'Pipelines', href: '/leads' }, // Removed from main, added as collapsible
    { icon: CheckSquare, label: 'Tareas', href: '/tasks' }, // Placeholder
];

const listItems = [
    { label: 'Contactos', href: '/contacts' },
    { label: 'Empresas', href: '/companies' },
    { label: 'Todos los contactos y empresas', href: '/all-contacts' },
    { label: 'Archivos', href: '/files' },
    { label: 'Productos', href: '/products' },
];

export function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [listsOpen, setListsOpen] = useState(true);
    const [insightsOpen, setInsightsOpen] = useState(true);
    const [pipelinesOpen, setPipelinesOpen] = useState(true);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-10 shadow-sm text-sm">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900">LeadFlow</h1>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">v1.0</span>
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-0.5 px-3">
                    {mainNavItems.map((item) => {
                        const Icon = item.icon;
                        // Check exact match for home, startsWith for others
                        const isActive = item.href === '/'
                            ? location.pathname === '/'
                            : location.pathname.startsWith(item.href);

                        return (
                            <li key={item.href}>
                                <Link
                                    to={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group",
                                        isActive
                                            ? "bg-blue-50 text-blue-600 font-medium"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <Icon className={cn("w-5 h-5", isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600")} />
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}

                    {/* Pipelines Section (Collapsible) */}
                    <li>
                        <div
                            onClick={() => setPipelinesOpen(!pipelinesOpen)}
                            className="flex items-center justify-between px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <Kanban className={cn("w-5 h-5", location.pathname.startsWith('/leads') ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600")} />
                                <span>Pipelines</span>
                            </div>
                            <ChevronDown className={cn("w-4 h-4 transition-transform", pipelinesOpen ? "rotate-180" : "")} />
                        </div>

                        {pipelinesOpen && (
                            <ul className="pl-11 pr-2 mt-1 space-y-0.5">
                                <li>
                                    <Link
                                        to="/leads"
                                        className={cn(
                                            "block py-1.5 text-gray-500 hover:text-gray-900 transition-colors",
                                            (location.pathname === '/leads' || location.pathname === '/leads/funnel') && "text-blue-600 font-medium"
                                        )}
                                    >
                                        Embudo de ventas
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/leads/list"
                                        className={cn(
                                            "block py-1.5 text-gray-500 hover:text-gray-900 transition-colors",
                                            location.pathname === '/leads/list' && "text-blue-600 font-medium"
                                        )}
                                    >
                                        Todos los leads
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>

                    {/* Listas Section (Collapsible mock) */}
                    <li>
                        <div
                            onClick={() => setListsOpen(!listsOpen)}
                            className="flex items-center justify-between px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                                <span>Listas</span>
                            </div>
                            <ChevronDown className={cn("w-4 h-4 transition-transform", listsOpen ? "rotate-180" : "")} />
                        </div>

                        {listsOpen && (
                            <ul className="pl-11 pr-2 mt-1 space-y-0.5">
                                {listItems.map(item => (
                                    <li key={item.href}>
                                        <Link
                                            to={item.href}
                                            className={cn(
                                                "block py-1.5 text-gray-500 hover:text-gray-900 transition-colors",
                                                location.pathname.startsWith(item.href) && "text-blue-600 font-medium"
                                            )}
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>

                    <li>
                        {/* Insights Section (Collapsible) */}
                        <div
                            onClick={() => setInsightsOpen(!insightsOpen)}
                            className="flex items-center justify-between px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <LayoutDashboard className={cn("w-5 h-5", location.pathname.startsWith('/insights') || location.pathname === '/dashboard' ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600")} />
                                <span>Insights</span>
                            </div>
                            <ChevronDown className={cn("w-4 h-4 transition-transform", insightsOpen ? "rotate-180" : "")} />
                        </div>

                        {insightsOpen && (
                            <ul className="pl-11 pr-2 mt-1 space-y-0.5">
                                <li>
                                    <Link
                                        to="/dashboard"
                                        className={cn(
                                            "block py-1.5 text-gray-500 hover:text-gray-900 transition-colors",
                                            location.pathname === '/dashboard' && "text-blue-600 font-medium"
                                        )}
                                    >
                                        Panel
                                    </Link>
                                </li>
                                {[
                                    { label: 'ROI', href: '/insights/roi' },
                                    { label: 'Ganancias y pérdidas', href: '/insights/pnl' },
                                    { label: 'Reporte consolidado', href: '/insights/consolidated' },
                                    { label: 'Reporte de actividades', href: '/insights/activities' },
                                    { label: 'Registro de actividades', href: '/insights/activity-log' },
                                    { label: 'Reporte de llamadas', href: '/insights/calls' },
                                    { label: 'Reporte de objetivos', href: '/insights/goals' },
                                ].map(item => (
                                    <li key={item.href}>
                                        <Link
                                            to={item.href}
                                            className={cn(
                                                "block py-1.5 text-gray-500 hover:text-gray-900 transition-colors",
                                                location.pathname.startsWith(item.href) && "text-blue-600 font-medium"
                                            )}
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                </ul>
            </nav>

            <div className="p-3 border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600 w-full transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
}
