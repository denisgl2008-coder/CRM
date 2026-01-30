import { Search, Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState, useEffect } from 'react';

import { usersService, User } from '../services/users';

interface FilterMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onFilter: (filters: any) => void;
    onFilterChange?: (filters: any) => void;
    currentFilters?: any;
    onPredefinedFilter?: (filterType: string) => void;
}

export function FilterMenu({ isOpen, onClose, onFilter, onFilterChange, currentFilters, onPredefinedFilter }: FilterMenuProps) {
    const defaultState = {
        name: '',
        dateRange: 'all',
        dateType: 'created',
        activeStages: false,
        phone: '',
        email: '',
        position: '',
        createdBy: ''
    };

    const [formData, setFormData] = useState(defaultState);
    const [users, setUsers] = useState<User[]>([]);

    const [showCalendar, setShowCalendar] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await usersService.getAll();
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users', error);
        }
    };

    // Sync with upstream filters when they change (e.g. removed via chip)
    useEffect(() => {
        if (currentFilters) {
            setFormData(() => ({
                ...defaultState,
                ...currentFilters
            }));
            // Also sync selectedDate if present in currentFilters
            if (currentFilters.selectedDate) {
                setSelectedDate(currentFilters.selectedDate);
            } else if (currentFilters.dateRange === 'all') {
                setSelectedDate(null);
            }
        }
    }, [currentFilters]);

    // Helper to update state and notify active change
    const updateFilters = (newData: any) => {
        setFormData(newData);
        if (onFilterChange) onFilterChange(newData);
    };

    // Helpers for calendar
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month); // 0 = Sunday

        // Let's stick to standard Sun=0 for simplicity, or Mon=0 if user is EU. Screenshot shows 'Lu Ma Mi...' so Monday start.
        // Monday = 0 in our grid logic
        const startDay = firstDay === 0 ? 6 : firstDay - 1;

        const days = [];
        // Empty slots
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
        }
        // Days
        for (let d = 1; d <= daysInMonth; d++) {
            const isSelected = selectedDate?.getDate() === d && selectedDate?.getMonth() === month && selectedDate?.getFullYear() === year;
            const isToday = new Date().getDate() === d && new Date().getMonth() === month && new Date().getFullYear() === year;

            days.push(
                <button
                    key={d}
                    onClick={() => setSelectedDate(new Date(year, month, d))}
                    className={`w-8 h-8 text-xs rounded-full flex items-center justify-center transition-colors
                        ${isSelected ? 'bg-blue-600 text-white' : 'hover:bg-blue-50 text-gray-700'}
                        ${isToday && !isSelected ? 'text-blue-600 font-bold' : ''}
                    `}
                >
                    {d}
                </button>
            );
        }
        return days;
    };

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    if (!isOpen) return null;

    return (
        <div className="absolute top-full left-0 mt-1 min-w-[800px] bg-white shadow-xl rounded-lg border border-gray-200 z-50 flex">

            {/* Left Column: Views/Presets */}
            <div className="w-1/4 border-r border-gray-100 py-2">
                <button
                    onClick={() => onPredefinedFilter?.('all')}
                    className="w-full px-4 py-2 flex justify-between items-center text-sm font-bold text-gray-700 bg-green-50/50 hover:bg-green-100/50 transition-colors"
                >
                    <span>Lista completa</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                </button>
                <div className="space-y-1 mt-1">
                    <button
                        onClick={() => onPredefinedFilter?.('without_tasks')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        Contactos sin tareas
                    </button>
                    <button
                        onClick={() => onPredefinedFilter?.('overdue_tasks')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        Contactos con tareas atrasadas
                    </button>
                    <button
                        onClick={() => onPredefinedFilter?.('no_leads')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        Sin leads
                    </button>
                    <button
                        onClick={() => onPredefinedFilter?.('deleted')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        Eliminados
                    </button>
                </div>
            </div>

            {/* Middle Column: Filter Form */}
            <div className="w-1/2 border-r border-gray-100 p-4 space-y-3">

                <div className="relative group">
                    <input
                        placeholder="Nombre"
                        className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500 pr-8"
                        value={formData.name}
                        onChange={e => updateFilters({ ...formData, name: e.target.value })}
                    />
                    {formData.name && (
                        <button
                            onClick={() => updateFilters({ ...formData, name: '' })}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="relative">
                    <button
                        onClick={() => updateFilters({ ...formData, dateRange: formData.dateRange === 'open' ? 'all' : 'open' })}
                        className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm text-left flex items-center gap-2 text-gray-600 focus:border-blue-500 hover:border-blue-400"
                    >
                        <Calendar size={14} />
                        {selectedDate ? selectedDate.toLocaleDateString() : (formData.dateRange === 'all' || formData.dateRange === 'open' ? 'Todo el tiempo' : formData.dateRange)}
                    </button>

                    {/* Clear Date Button */}
                    {/* Note: User request specific to "campos", but let's check if date needs it. The date picker has 'Reiniciar'.
                        The screenshot shows 'Hoy (28.01) X' in the CHIP, but also X in the input field.
                        The input field here is a button. We can add an X inside the button if we want.
                        Lets skip date input X for now as it has internal restart logic, unless requested.
                        Wait, the screenshot shows 'Hoy' in a text input-like box with X.
                        Our date picker is a button. Let's add X to the button if value != 'all'.
                     */}
                    {(formData.dateRange !== 'all' && formData.dateRange !== 'open') && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                updateFilters({ ...formData, dateRange: 'all', selectedDate: null });
                            }}
                            className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                        >
                            <X size={14} />
                        </button>
                    )}


                    {/* Date Picker Dropdown */}
                    {formData.dateRange === 'open' && (
                        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 shadow-lg rounded-lg z-50">
                            {/* Toggle Header */}
                            <div className="flex p-1 bg-gray-50 border-b border-gray-100 rounded-t-lg">
                                <button
                                    onClick={() => updateFilters({ ...formData, dateType: 'created' })}
                                    className={`flex-1 py-1 text-xs font-bold rounded border ${formData.dateType === 'created' ? 'text-gray-700 bg-white shadow-sm border-gray-200' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                                >
                                    Creado
                                </button>
                                <button
                                    onClick={() => updateFilters({ ...formData, dateType: 'modified' })}
                                    className={`flex-1 py-1 text-xs font-bold rounded border ${formData.dateType === 'modified' ? 'text-gray-700 bg-white shadow-sm border-gray-200' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                                >
                                    Modificado
                                </button>
                            </div>

                            {/* Calendar Input Trigger */}
                            <div className="p-2 border-b border-gray-100">
                                <div className="relative">
                                    <button
                                        onClick={() => setShowCalendar(!showCalendar)}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
                                    >
                                        <Calendar size={14} />
                                    </button>
                                    <input
                                        readOnly
                                        placeholder="Seleccionar fecha..."
                                        value={selectedDate ? selectedDate.toLocaleDateString() : ''}
                                        onClick={() => setShowCalendar(true)}
                                        className="w-full pl-8 pr-2 py-1 text-sm border border-gray-300 rounded outline-none focus:border-blue-500 cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Actual Calendar Widget */}
                            {showCalendar && (
                                <div className="p-3 bg-white border-t border-gray-100">
                                    {/* Month Nav */}
                                    <div className="flex justify-between items-center mb-3">
                                        <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft size={16} /></button>
                                        <span className="text-sm font-bold text-gray-700">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                                        <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={16} /></button>
                                    </div>

                                    {/* Week Days */}
                                    <div className="grid grid-cols-7 mb-2 text-center">
                                        {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map(d => (
                                            <span key={d} className="text-xs font-bold text-gray-400">{d}</span>
                                        ))}
                                    </div>

                                    {/* Days Grid */}
                                    <div className="grid grid-cols-7 gap-1 justify-items-center">
                                        {renderCalendar()}
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
                                        <button
                                            className="px-3 py-1 text-xs font-bold text-white bg-blue-500 rounded hover:bg-blue-600"
                                            onClick={() => {
                                                setShowCalendar(false);
                                                // Keep selection
                                                if (selectedDate) {
                                                    updateFilters({
                                                        ...formData,
                                                        selectedDate,
                                                        dateRange: `${selectedDate.toLocaleDateString()} - ${formData.dateType === 'created' ? 'Creado' : 'Modificado'}`
                                                    });
                                                }
                                            }}
                                        >
                                            Hecho
                                        </button>
                                        <button
                                            className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
                                            onClick={() => {
                                                setSelectedDate(null);
                                                setShowCalendar(false);
                                            }}
                                        >
                                            Reiniciar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Presets (Hide if calendar is open to save space, or keep? Screenshot implies overlay logic or replacement) */}
                            {!showCalendar && (
                                <div className="max-h-60 overflow-y-auto">
                                    {[
                                        'Hoy', 'Ayer', 'Últimos 30 días', 'Esta semana',
                                        'La última semana', 'Este mes', 'El mes pasado',
                                        'Este trimestre', 'Este año'
                                    ].map(preset => (
                                        <button
                                            key={preset}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                            onClick={() => {
                                                updateFilters({ ...formData, dateRange: preset });
                                                setSelectedDate(null); // Clear specific date if preset chosen
                                            }}
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300"
                        checked={formData.activeStages}
                        onChange={e => updateFilters({ ...formData, activeStages: e.target.checked })}
                    />
                    <span className="text-sm text-gray-600">Etapas activas</span>
                </div>

                <div className="space-y-3 pt-2">
                    {/* Placeholder inputs - now bound if we want, or at least structure for future */}
                    <div className="relative group">
                        <input
                            placeholder="Usuarios responsables"
                            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500 pr-8"
                        // If we want to bind later: value={formData.responsible}
                        />
                        {/* Add X here if bound */}
                    </div>
                    <div className="relative group">
                        <select
                            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500 appearance-none bg-white"
                            value={formData.createdBy || ''}
                            onChange={e => updateFilters({ ...formData, createdBy: e.target.value })}
                        >
                            <option value="">Creado por</option>
                            {/* Assuming users are loaded in parent or fetched here. Using simple fetch for now */}
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                        {formData.createdBy && (
                            <button
                                onClick={() => updateFilters({ ...formData, createdBy: '' })}
                                className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <div className="relative group">
                        <input
                            placeholder="Modificado por"
                            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500 pr-8"

                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span className="text-sm text-gray-600">Tareas: Todo valores</span>
                </div>

                <div className="space-y-3 pt-2">
                    <div className="relative group">
                        <input
                            placeholder="Teléfono"
                            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500 pr-8"
                            value={formData.phone}
                            onChange={e => updateFilters({ ...formData, phone: e.target.value })}
                        />
                        {formData.phone && (
                            <button
                                onClick={() => updateFilters({ ...formData, phone: '' })}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="relative group">
                        <input
                            placeholder="Correo"
                            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500 pr-8"
                            value={formData.email}
                            onChange={e => updateFilters({ ...formData, email: e.target.value })}
                        />
                        {formData.email && (
                            <button
                                onClick={() => updateFilters({ ...formData, email: '' })}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="relative group">
                        <input
                            placeholder="Cargo"
                            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500 pr-8"
                            value={formData.position}
                            onChange={e => updateFilters({ ...formData, position: e.target.value })}
                        />
                        {formData.position && (
                            <button
                                onClick={() => updateFilters({ ...formData, position: '' })}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-4">
                    <button onClick={() => onFilter({ ...formData, selectedDate })} className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold uppercase px-4 py-2 rounded">
                        Aplicar
                    </button>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xs font-bold uppercase px-4 py-2">
                        Cancelar
                    </button>
                </div>
            </div>

            {/* Right Column: Tags */}
            <div className="w-1/4 p-4">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase">Etiquetas</span>
                    <button className="text-xs text-blue-500 hover:underline">Administrar etiquetas</button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                        placeholder="Buscar o agregar una etiqueta"
                        className="w-full border border-gray-300 rounded pl-9 pr-3 py-1.5 text-sm outline-none focus:border-blue-500"
                    />
                </div>

                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-400">No tienes etiquetas conectadas</p>
                </div>
            </div>

        </div>
    );
}
