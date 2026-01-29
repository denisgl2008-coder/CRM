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
        // In a real app, pass filters to service
        const data = await contactsService.getAll();
        setContacts(data);
    };

    const handleUpdate = async (id: string, field: string, value: string) => {
        try {
            await contactsService.update(id, { [field]: value });
            // Optimistic update or refresh
            setContacts(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
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
        // Note: Actual filtering logic (backend or client-side) would go here
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
