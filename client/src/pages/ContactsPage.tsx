import { ContactDrawer } from '@/components/ContactDrawer';
import { CompanyDrawer } from '@/components/CompanyDrawer';
import { EditableCell } from '@/components/EditableCell';
import { ListHeader } from '@/components/ListHeader';
import { useState, useEffect } from 'react';
import { contactsService, Contact } from '@/services/contacts';
import { Printer, Building2, Upload, Download, SlidersHorizontal, Activity, Copy } from 'lucide-react';

// interface Contact moved to service

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [allContacts, setAllContacts] = useState<Contact[]>([]); // Store unfiltered data
    // const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isCompanyDrawerOpen, setIsCompanyDrawerOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [filters, setFilters] = useState<any>({});

    // Load initial list
    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        const data = await contactsService.getAll();
        setAllContacts(data);
        setContacts(data); // Initially show all
    };

    // Apply filters whenever filters change
    useEffect(() => {
        applyFilters();
    }, [filters, allContacts]);

    const applyFilters = () => {
        let filtered = [...allContacts];

        // Filter by name (searches in firstName + lastName)
        if (filters.name && filters.name.trim()) {
            const searchTerm = filters.name.toLowerCase().trim();
            filtered = filtered.filter(contact => {
                const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
                return fullName.includes(searchTerm);
            });
        }

        // Filter by phone
        if (filters.phone && filters.phone.trim()) {
            const searchTerm = filters.phone.toLowerCase().trim();
            filtered = filtered.filter(contact =>
                contact.phone?.toLowerCase().includes(searchTerm)
            );
        }

        // Filter by email
        if (filters.email && filters.email.trim()) {
            const searchTerm = filters.email.toLowerCase().trim();
            filtered = filtered.filter(contact =>
                contact.email?.toLowerCase().includes(searchTerm)
            );
        }

        // Filter by position/cargo
        if (filters.position && filters.position.trim()) {
            const searchTerm = filters.position.toLowerCase().trim();
            filtered = filtered.filter(contact =>
                contact.position?.toLowerCase().includes(searchTerm)
            );
        }

        // Filter by created by
        if (filters.createdBy) {
            // Since creator doesn't have id property, we need to add it to the Contact interface
            // For now, filter based on creation (this will be fixed in service)
            filtered = filtered.filter(contact =>
                contact.creator?.name === filters.createdBy ||
                String(contact.createdAt).includes(filters.createdBy)
            );
        }

        // Filter by assigned to
        if (filters.assignedTo) {
            filtered = filtered.filter(contact =>
                contact.assignedTo === filters.assignedTo
            );
        }

        // Advanced Date range filtering with presets
        if (filters.dateRange && filters.dateRange !== 'all') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            filtered = filtered.filter(contact => {
                // Determine which date to compare based on dateType
                const dateField = filters.dateType === 'modified' ? contact.updatedAt : contact.createdAt;
                if (!dateField) return false;

                const contactDate = new Date(dateField);
                const contactDateOnly = new Date(contactDate.getFullYear(), contactDate.getMonth(), contactDate.getDate());

                // Handle specific date selection from calendar
                if (filters.selectedDate) {
                    const filterDate = new Date(filters.selectedDate);
                    const filterDateOnly = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate());
                    return contactDateOnly.getTime() === filterDateOnly.getTime();
                }

                // Handle preset date ranges
                switch (filters.dateRange) {
                    case 'Hoy':
                        return contactDateOnly.getTime() === today.getTime();

                    case 'Ayer':
                        const yesterday = new Date(today);
                        yesterday.setDate(yesterday.getDate() - 1);
                        return contactDateOnly.getTime() === yesterday.getTime();

                    case 'Últimos 30 días':
                        const last30Days = new Date(today);
                        last30Days.setDate(last30Days.getDate() - 30);
                        return contactDateOnly >= last30Days && contactDateOnly <= today;

                    case 'Esta semana':
                        const startOfWeek = new Date(today);
                        startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
                        const endOfWeek = new Date(startOfWeek);
                        endOfWeek.setDate(startOfWeek.getDate() + 6);
                        return contactDateOnly >= startOfWeek && contactDateOnly <= endOfWeek;

                    case 'La última semana':
                        const lastWeekStart = new Date(today);
                        lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
                        const lastWeekEnd = new Date(lastWeekStart);
                        lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
                        return contactDateOnly >= lastWeekStart && contactDateOnly <= lastWeekEnd;

                    case 'Este mes':
                        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                        return contactDateOnly >= startOfMonth && contactDateOnly <= endOfMonth;

                    case 'El mes pasado':
                        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
                        return contactDateOnly >= lastMonthStart && contactDateOnly <= lastMonthEnd;

                    case 'Este trimestre':
                        const currentQuarter = Math.floor(now.getMonth() / 3);
                        const quarterStart = new Date(now.getFullYear(), currentQuarter * 3, 1);
                        const quarterEnd = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0);
                        return contactDateOnly >= quarterStart && contactDateOnly <= quarterEnd;

                    case 'Este año':
                        const yearStart = new Date(now.getFullYear(), 0, 1);
                        const yearEnd = new Date(now.getFullYear(), 11, 31);
                        return contactDateOnly >= yearStart && contactDateOnly <= yearEnd;

                    default:
                        // If it's a custom date string but not a preset, skip this filter
                        return true;
                }
            });
        }

        setContacts(filtered);
    };

    const handleUpdate = async (id: string, field: string, value: string) => {
        try {
            await contactsService.update(id, { [field]: value });
            // Update both filtered and all contacts
            const updater = (c: Contact) => c.id === id ? { ...c, [field]: value } : c;
            setContacts(prev => prev.map(updater));
            setAllContacts(prev => prev.map(updater));
        } catch (error) {
            console.error('Failed to update contact', error);
        }
    };

    const handleOpenDrawer = (contact?: Contact) => {
        setSelectedContact(contact || null);
        setIsDrawerOpen(true);
    };

    const handleFilter = (newFilters: any) => {
        setFilters(newFilters);
    };

    const handleRemoveFilter = (key: string) => {
        const newFilters = { ...filters };
        if (key === 'dateRange') {
            newFilters.dateRange = 'all';
            newFilters.selectedDate = null;
        } else if (key === 'activeStages') {
            newFilters.activeStages = false;
        } else {
            // For string fields
            newFilters[key] = '';
        }
        setFilters(newFilters);
    };

    const handlePredefinedFilter = (filterType: string) => {
        // Handle predefined filter views
        let newFilters = { ...filters };

        switch (filterType) {
            case 'all':
                // Reset all filters
                newFilters = {};
                break;
            case 'without_tasks':
                // TODO: Implement when tasks are linked to contacts
                console.log('Filter: Contacts without tasks');
                break;
            case 'overdue_tasks':
                // TODO: Implement when tasks are linked to contacts
                console.log('Filter: Contacts with overdue tasks');
                break;
            case 'no_leads':
                // TODO: Implement when leads relationship is available
                console.log('Filter: Contacts without leads');
                break;
            case 'deleted':
                // TODO: Implement soft delete filtering
                console.log('Filter: Deleted contacts');
                break;
        }

        setFilters(newFilters);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleAddCompany = () => {
        setIsCompanyDrawerOpen(true);
    };

    const handleExport = () => {
        if (contacts.length === 0) return;
        const csvContent = "data:text/csv;charset=utf-8,"
            + "ID,Nombre,Apellido,Email,Teléfono,Compañía,Cargo\n"
            + contacts.map(c =>
                `${c.id},${c.firstName},${c.lastName},${c.email},${c.phone},${c.company?.name || ''},${c.position || ''}`
            ).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `contactos_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const headerActions = [
        { label: 'Imprimir', icon: <Printer size={16} />, onClick: handlePrint },
        { label: 'Agregar una compañía', icon: <Building2 size={16} />, onClick: handleAddCompany },
        { label: 'Exportar', icon: <Upload size={16} />, onClick: handleExport },
        { label: 'Importar', icon: <Download size={16} />, onClick: () => alert('Importar: Próximamente') },
        { label: 'Ajustes de la lista', icon: <SlidersHorizontal size={16} />, onClick: () => alert('Ajustes: Próximamente') },
        { label: 'Procesos empresariales', icon: <Activity size={16} />, onClick: () => alert('Procesos: Próximamente') },
        { label: 'Buscar duplicados', icon: <Copy size={16} />, onClick: () => alert('Duplicados: Próximamente') },
    ];

    return (
        <div className="bg-gray-50 min-h-screen">
            <ListHeader
                title="CONTACTOS"
                onAdd={() => handleOpenDrawer()}
                addButtonLabel="AGREGAR CONTACTO"
                onFilter={handleFilter}
                onPredefinedFilter={handlePredefinedFilter}
                activeFilters={filters}
                onRemoveFilter={handleRemoveFilter}
                actions={headerActions}
            />

            <ContactDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onSave={fetchContacts}
                contact={selectedContact}
            />

            <CompanyDrawer
                isOpen={isCompanyDrawerOpen}
                onClose={() => setIsCompanyDrawerOpen(false)}
                onSave={() => { /* Maybe refresh contacts if company name might change? */ fetchContacts(); }}
            />

            <div className="px-4">

                {/* Empty State matching screenshot */}
                {contacts.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-red-400 text-sm mb-1">Lamentablemente, no hay contactos con estos parámetros.</p>
                        <button onClick={fetchContacts} className="text-blue-500 text-sm underline hover:text-blue-600">Mostrar todo</button>
                    </div>
                )}

                {/* Table View (Only if data exists) */}
                {contacts.length > 0 && (
                    <div className="bg-white rounded border border-gray-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-400 font-bold uppercase">
                                <tr>
                                    <th className="px-4 py-3 w-8"><input type="checkbox" /></th>
                                    <th className="px-4 py-3">Nombre</th>
                                    <th className="px-4 py-3">Compañía</th>
                                    <th className="px-4 py-3">Teléfono</th>
                                    <th className="px-4 py-3">Correo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {contacts.map(contact => (
                                    <tr key={contact.id} className="hover:bg-gray-50/50 transition-colors group/row">
                                        <td className="px-4 py-3"><input type="checkbox" /></td>
                                        <td className="px-4 py-3 font-medium text-blue-600">
                                            <EditableCell
                                                value={`${contact.firstName} ${contact.lastName}`.trim()}
                                                onSave={async (val) => {
                                                    // Simple name splitting logic for demo
                                                    const [first, ...rest] = val.split(' ');
                                                    await contactsService.update(contact.id, { firstName: first, lastName: rest.join(' ') });
                                                    fetchContacts();
                                                }}
                                                onClickText={() => handleOpenDrawer(contact)}
                                                placeholder="Nombre no especificado"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {/* Company is complex because it's a relation, just showing name for now, linking to drawer for complex edit */}
                                            <span
                                                onClick={() => handleOpenDrawer(contact)}
                                                className="hover:underline cursor-pointer hover:text-blue-600"
                                            >
                                                {contact.company?.name || '-'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            <EditableCell
                                                value={contact.phone}
                                                onSave={(val) => handleUpdate(contact.id, 'phone', val)}
                                                onClickText={() => handleOpenDrawer(contact)}
                                                type="tel"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            <EditableCell
                                                value={contact.email}
                                                onSave={(val) => handleUpdate(contact.id, 'email', val)}
                                                onClickText={() => handleOpenDrawer(contact)}
                                                type="email"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
