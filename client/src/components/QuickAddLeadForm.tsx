import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search, ChevronDown, User, Building2, Phone, Mail, Settings } from 'lucide-react';
import { contactsService } from '@/services/contacts';
import { companiesService } from '@/services/companies';
import { leadsService } from '@/services/leads';

interface QuickAddLeadFormProps {
    statusId: string;
    onCancel: () => void;
    onSave: () => void;
}

export function QuickAddLeadForm({ statusId, onCancel, onSave }: QuickAddLeadFormProps) {
    const [name, setName] = useState('');
    const [budget, setBudget] = useState('');

    // Contact State
    const [contactSearch, setContactSearch] = useState('');
    const [contactId, setContactId] = useState<string | undefined>(undefined);
    const [contactPhone, setContactPhone] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [showContactDropdown, setShowContactDropdown] = useState(false);
    const [allContacts, setAllContacts] = useState<any[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<any[]>([]);

    // Company State
    const [companyName, setCompanyName] = useState('');
    const [companyAddress, setCompanyAddress] = useState('');
    const [companyId, setCompanyId] = useState<string | undefined>(undefined);
    const [allCompanies, setAllCompanies] = useState<any[]>([]);

    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadData();
        // Click outside handler
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowContactDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadData = async () => {
        try {
            const [contacts, companies] = await Promise.all([
                contactsService.getAll(),
                companiesService.getAll()
            ]);
            setAllContacts(contacts);
            setAllCompanies(companies);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const handleSearchContact = (query: string) => {
        setContactSearch(query);
        if (!query.trim()) {
            setFilteredContacts([]);
            setShowContactDropdown(false);
            return;
        }

        const filtered = allContacts.filter(c =>
            `${c.firstName} ${c.lastName}`.toLowerCase().includes(query.toLowerCase()) ||
            c.email?.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredContacts(filtered);
        setShowContactDropdown(true);
    };

    const handleSelectContact = (contact: any) => {
        setContactId(contact.id);
        setContactSearch(`${contact.firstName} ${contact.lastName}`);
        setContactPhone(contact.phone || '');
        setContactEmail(contact.email || '');
        setShowContactDropdown(false);

        // Auto-fill company if exists
        if (contact.companyId) {
            const company = allCompanies.find(c => c.id === contact.companyId);
            if (company) {
                setCompanyId(company.id);
                setCompanyName(company.name);
                setCompanyAddress(company.address || '');
            }
        }
    };

    const handleSubmit = async () => {
        if (!name.trim()) return;

        try {
            await leadsService.create({
                name,
                budget: parseFloat(budget) || 0,
                status: statusId,
                contactId: contactId,
                // Note: backend might not support direct companyId on lead creation if schema doesn't allow it, 
                // usually it's inferred from contact or handled separately. 
                // Based on previous files, Lead has contactId.
            });
            onSave();
        } catch (error) {
            console.error('Error creating lead:', error);
            alert('Error al crear el lead');
        }
    };

    return (
        <Card className="p-0 border-2 border-dashed border-blue-400 bg-white overflow-hidden shadow-lg relative z-10">
            <div className="p-3 space-y-3" ref={wrapperRef}>
                {/* Name & Budget */}
                <div className="space-y-2">
                    <Input
                        autoFocus
                        placeholder="Nombre"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    />
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">C$</span>
                        <Input
                            placeholder="0"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            className="bg-gray-50 border-gray-200 focus:bg-white pl-8"
                            type="number"
                        />
                    </div>
                </div>

                {/* Contact Section */}
                <div className="space-y-1 pt-2 border-t border-gray-100">
                    <div className="relative">
                        <Input
                            placeholder="Contacto: Nombre"
                            value={contactSearch}
                            onChange={(e) => handleSearchContact(e.target.value)}
                            onFocus={() => contactSearch && setShowContactDropdown(true)}
                            className="text-sm bg-transparent border-none px-0 h-8 placeholder:text-gray-400 focus-visible:ring-0 shadow-none border-b border-gray-100 rounded-none focus:border-blue-400"
                        />
                        {/* Dropdown */}
                        {showContactDropdown && filteredContacts.length > 0 && (
                            <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto z-50 mt-1">
                                {filteredContacts.map(contact => (
                                    <button
                                        key={contact.id}
                                        onClick={() => handleSelectContact(contact)}
                                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm flex flex-col"
                                    >
                                        <span className="font-medium text-gray-800">{contact.firstName} {contact.lastName}</span>
                                        {contact.email && <span className="text-xs text-gray-400">{contact.email}</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <Input
                        placeholder="Contacto: Teléfono"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="text-sm bg-transparent border-none px-0 h-8 placeholder:text-gray-400 focus-visible:ring-0 shadow-none border-b border-gray-100 rounded-none focus:border-blue-400"
                    />
                    <Input
                        placeholder="Contacto: Correo"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="text-sm bg-transparent border-none px-0 h-8 placeholder:text-gray-400 focus-visible:ring-0 shadow-none border-b border-gray-100 rounded-none focus:border-blue-400"
                    />
                </div>

                {/* Company Section */}
                <div className="space-y-1 pt-2 border-t border-gray-100 mb-2">
                    <Input
                        placeholder="Compañía: Nombre"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="text-sm bg-transparent border-none px-0 h-8 placeholder:text-gray-400 focus-visible:ring-0 shadow-none border-b border-gray-100 rounded-none focus:border-blue-400"
                        readOnly={!!companyId} // Read only if auto-filled from contact
                    />
                    <Input
                        placeholder="Compañía: Dirección"
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        className="text-sm bg-transparent border-none px-0 h-8 placeholder:text-gray-400 focus-visible:ring-0 shadow-none border-b border-gray-100 rounded-none focus:border-blue-400"
                        readOnly={!!companyId}
                    />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center gap-2 pt-2">
                    <Button
                        size="sm"
                        onClick={handleSubmit}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-7"
                    >
                        Instalar
                    </Button>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600 text-xs font-medium"
                    >
                        Cancelar
                    </button>
                    <div className="ml-auto">
                        <button className="text-gray-300 hover:text-gray-500">
                            <Settings size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </Card>
    );
}
