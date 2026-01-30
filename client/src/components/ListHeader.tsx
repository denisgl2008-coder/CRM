import { Button } from '@/components/ui/Button';
import { MoreHorizontal, Plus, X, List, Kanban } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { FilterMenu } from './FilterMenu';

interface ListHeaderProps {
    title: string;
    onAdd: () => void;
    addButtonLabel: string;
    viewName?: string;
    count?: number;
    unitLabel?: string;
    onFilter?: (filters: any) => void;
    activeFilters?: any;
    onRemoveFilter?: (key: string) => void;
    onPredefinedFilter?: (filterType: string) => void;
    preAddContent?: React.ReactNode;
    viewMode?: 'kanban' | 'list';
    onViewModeChange?: (mode: 'kanban' | 'list') => void;
}

export function ListHeader({
    title,
    onAdd,
    addButtonLabel,
    viewName = "Lista completa",
    count = 0,
    unitLabel = "elementos",
    onFilter,
    activeFilters = {},
    onRemoveFilter,
    onPredefinedFilter,
    actions,
    customMenu,
    preAddContent,
    viewMode,
    onViewModeChange
}: ListHeaderProps & { actions?: { label: string; icon: React.ReactNode; onClick: () => void }[]; customMenu?: React.ReactNode }) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleFilterApply = (filters: any) => {
        setIsFilterOpen(false);
        if (onFilter) onFilter(filters);
    };

    const activeChips = Object.entries(activeFilters).map(([key, value]) => {
        if (!value) return null;
        if (key === 'dateRange' && (value === 'all' || value === 'open')) return null;
        if (key === 'dateType' || key === 'selectedDate') return null;
        if (key === 'activeStages' && value === false) return null;

        let label = `${key}: ${value}`;
        if (key === 'name') label = `Nombre: ${value}`;
        if (key === 'phone') label = `Teléfono: ${value}`;
        if (key === 'email') label = `Correo: ${value}`;
        if (key === 'position') label = `Cargo: ${value}`;
        if (key === 'activeStages') label = 'Etapas activas';
        if (key === 'dateRange') {
            const type = activeFilters['dateType'] === 'modified' ? 'Modificado' : 'Creados';
            label = `${type}: ${value}`;
        }

        return { key, label };
    }).filter(Boolean) as { key: string, label: string }[];

    return (
        <div className="flex flex-col gap-4 mb-6">
            {/* Top Bar */}
            <div className="flex justify-between items-center bg-white p-2 pr-32 border-b border-gray-100 relative">
                <div className="flex items-center gap-4">
                    {/* ... (left side content) ... */}
                    {/* ... (left side content) ... */}
                    <h1 className="text-xl font-bold text-gray-800 uppercase tracking-wide px-4">{title}</h1>

                    {viewMode && onViewModeChange && (
                        <div className="flex items-center gap-1 border-r border-gray-200 pr-4 mr-2">
                            <button
                                onClick={() => onViewModeChange('kanban')}
                                className={`p-1 rounded hover:bg-gray-100 ${viewMode === 'kanban' ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}
                                title="Vista Kanban"
                            >
                                <Kanban size={18} className="rotate-90" /> {/* Rotate to look like columns if needed, or just normal */}
                            </button>
                            <button
                                onClick={() => onViewModeChange('list')}
                                className={`p-1 rounded hover:bg-gray-100 ${viewMode === 'list' ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}
                                title="Vista Lista"
                            >
                                <List size={18} />
                            </button>
                        </div>
                    )}

                    <div className="flex gap-1" ref={filterRef}>
                        <button className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase rounded-sm whitespace-nowrap">
                            {viewName}
                        </button>
                        <div className="relative flex items-center bg-gray-50 rounded-sm hover:bg-gray-100 transition-colors cursor-pointer group"
                            onClick={(e) => {
                                // Prevent opening if clicking X
                                if ((e.target as HTMLElement).closest('.remove-filter')) return;
                                setIsFilterOpen(!isFilterOpen);
                            }}
                        >
                            <div className="flex items-center gap-1 px-2 py-1 max-w-[600px] overflow-hidden flex-wrap">
                                {activeChips.map(chip => (
                                    <span key={chip.key} className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded border border-blue-200 whitespace-nowrap">
                                        {chip.label}
                                        <button
                                            className="remove-filter hover:text-blue-900"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (onRemoveFilter) onRemoveFilter(chip.key);
                                            }}
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}

                                <span className={`text-xs font-bold uppercase px-1 ${activeChips.length > 0 ? 'text-gray-400' : 'text-gray-400'}`}>
                                    Búsqueda y filtro
                                </span>
                            </div>

                            <div onClick={(e) => e.stopPropagation()} className="cursor-default">
                                <FilterMenu
                                    isOpen={isFilterOpen}
                                    onClose={() => setIsFilterOpen(false)}
                                    // onFilter (Apply button) closes menu and triggers filter
                                    onFilter={handleFilterApply}
                                    // Live updates: just trigger filter, don't close
                                    onFilterChange={(newFilters) => {
                                        if (onFilter) onFilter(newFilters);
                                    }}
                                    onPredefinedFilter={onPredefinedFilter}
                                    currentFilters={activeFilters}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 px-4 mr-6">
                    <span className="text-xs text-gray-400">{count} {unitLabel}</span>
                    <div className="relative" ref={menuRef}>
                        <button
                            className="p-1 hover:bg-gray-100 rounded"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </button>

                        {isMenuOpen && (
                            <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-2 z-50 text-gray-700 animate-in fade-in zoom-in-95 duration-100 border border-gray-100">
                                {customMenu ? customMenu : actions && actions.map((action, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            action.onClick();
                                            setIsMenuOpen(false);
                                        }}
                                        className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50 text-left"
                                    >
                                        <span className="text-gray-400">{action.icon}</span>
                                        <span>{action.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Pre Add Content */}
                    {preAddContent}

                    <Button
                        size="sm"
                        onClick={onAdd}
                        className="rounded-sm px-6 py-2 uppercase tracking-tight text-xs font-bold"
                    >
                        <Plus className="w-3 h-3" />
                        {addButtonLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}
