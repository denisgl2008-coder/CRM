import { Plus, MoreHorizontal, Paperclip, ChevronLeft, ChevronDown, X, Printer, FileSpreadsheet, Hash, Trash2, Copy, AlertTriangle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { leadsService } from '../services/leads';
import { notesService } from '../services/notes';
import { authService } from '../services/auth';
import { usersService } from '../services/users';
import { companiesService } from '../services/companies';
import { contactsService } from '../services/contacts';
import { pipelinesService } from '../services/pipelines';


interface LeadDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    lead?: any; // Replace with Lead interface
}

export function LeadDrawer({ isOpen, onClose, onSave, lead }: LeadDrawerProps) {
    const [activeTab, setActiveTab] = useState('principal');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showExitConfirmation, setShowExitConfirmation] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form State
    const [leadName, setLeadName] = useState('');
    const [status, setStatus] = useState('new');
    const [budget, setBudget] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [users, setUsers] = useState<any[]>([]);

    // Contact Sub-form
    const [showContactForm, setShowContactForm] = useState(false);
    const [contactName, setContactName] = useState('');
    const [contactCompanyName, setContactCompanyName] = useState(''); // Just text for now or link to company creation
    const [contactPhone, setContactPhone] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPosition, setContactPosition] = useState('');

    // Contact Autocomplete
    const [allContacts, setAllContacts] = useState<any[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
    const [showContactSuggestions, setShowContactSuggestions] = useState(false);
    const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
    const contactInputRef = useRef<HTMLDivElement>(null);

    // Company Sub-form
    const [showCompanyForm, setShowCompanyForm] = useState(false);
    const [companyName, setCompanyName] = useState('');
    const [companyPhone, setCompanyPhone] = useState('');
    const [companyEmail, setCompanyEmail] = useState('');
    const [companyWeb, setCompanyWeb] = useState('');
    const [companyAddress, setCompanyAddress] = useState('');

    // Company Autocomplete
    const [allCompanies, setAllCompanies] = useState<any[]>([]);
    const [filteredCompanies, setFilteredCompanies] = useState<any[]>([]);
    const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
    const companyInputRef = useRef<HTMLDivElement>(null);

    // Pipeline / Stages
    const [stages, setStages] = useState<any[]>([]);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [pipelineError, setPipelineError] = useState<string | null>(null);


    useEffect(() => {
        loadPipeline();
    }, [isOpen]);

    const loadPipeline = async () => {
        try {
            const pipeline = await pipelinesService.get();
            if (!pipeline || !pipeline.stages || pipeline.stages.length === 0) {
                setPipelineError('No hay embudo de ventas configurado');
                setStages([]);
                return;
            }
            setPipelineError(null);
            setStages(pipeline.stages);
            // Set default status to first pipeline stage for new leads
            if (!lead?.id && pipeline.stages.length > 0) {
                setStatus(pipeline.stages[0].id);
            }
        } catch (error) {
            console.error('Failed to load pipeline', error);
            setPipelineError('Error al cargar embudo de ventas');
        }
    };

    const currentStageName = stages.find(s => s.id === status)?.name || (status === 'new' ? 'Etapa Inicial' : status);


    // Notes
    const [notes, setNotes] = useState<any[]>([]); // Using any[] for now, should be Note[]
    const [newNote, setNewNote] = useState('');

    const loadNotes = async (leadId: string) => {
        try {
            const data = await notesService.getAll({ leadId });
            setNotes(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSaveNote = async () => {
        if (!newNote.trim() || !lead?.id) return;
        try {
            await notesService.create({
                content: newNote,
                leadId: lead.id
            });
            setNewNote('');
            loadNotes(lead.id);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadUsers();
        loadCompanies();
        loadContacts();

        // Click outside handler for autocomplete
        const handleClickOutside = (event: MouseEvent) => {
            if (companyInputRef.current && !companyInputRef.current.contains(event.target as Node)) {
                setShowCompanySuggestions(false);
            }
            if (contactInputRef.current && !contactInputRef.current.contains(event.target as Node)) {
                setShowContactSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const loadUsers = async () => {
        try {
            const data = await usersService.getAll();
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users', error);
        }
    };

    const loadCompanies = async () => {
        try {
            const data = await companiesService.getAll();
            setAllCompanies(data);
        } catch (error) {
            console.error('Failed to load companies', error);
        }
    };

    const loadContacts = async () => {
        try {
            const data = await contactsService.getAll();
            setAllContacts(data);
        } catch (error) {
            console.error('Failed to load contacts', error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setHasUnsavedChanges(false); // Reset tracking on open
            setShowExitConfirmation(false); // Reset exit confirmation logic
            if (lead) {
                setLeadName(lead.name);
                setBudget(lead.budget);
                setStatus(lead.status);
                setAssignedTo(lead.assignedTo || '');
                loadNotes(lead.id);

                // Populate Contact Info if available
                if (lead.contact) {
                    setShowContactForm(true);
                    setContactName(`${lead.contact.firstName || ''} ${lead.contact.lastName || ''}`.trim());
                    setContactPhone(lead.contact.phone || '');
                    setContactEmail(lead.contact.email || '');
                    setContactPosition(lead.contact.position || '');
                    setSelectedContactId(lead.contact.id);

                    // Populate Company Info if available
                    if (lead.contact.company) {
                        setShowCompanyForm(true);
                        setCompanyName(lead.contact.company.name);
                        setCompanyPhone(lead.contact.company.phone || '');
                        setCompanyEmail(lead.contact.company.email || '');
                        setCompanyWeb(lead.contact.company.website || '');
                        setCompanyAddress(lead.contact.company.address || '');
                        setContactCompanyName(lead.contact.company.name);
                        setSelectedCompanyId(lead.contact.company.id);
                    }
                }
            } else {
                setLeadName('');
                setBudget('');
                // Status will be set by loadPipeline() to first pipeline stage
                setShowContactForm(false);
                setShowCompanyForm(false);
                setNewNote('');
                setNotes([]);

                // Reset Contact Form
                setContactName('');
                setContactCompanyName('');
                setContactPhone('');
                setContactEmail('');
                setContactPosition('');
                setSelectedContactId(null);

                // Reset Company Form
                setCompanyName('');
                setCompanyPhone('');
                setCompanyEmail('');
                setCompanyWeb('');
                setCompanyAddress('');
                setSelectedCompanyId(null);

                const currentUser = authService.getCurrentUser();
                setAssignedTo(currentUser?.id || '');
            }
        }
    }, [isOpen, lead]);

    const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCompanyName(value);
        setHasUnsavedChanges(true);
        setSelectedCompanyId(null); // Reset selection if typing

        if (value.trim()) {
            const filtered = allCompanies.filter(c =>
                c.name.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredCompanies(filtered);
            setShowCompanySuggestions(true);
        } else {
            setFilteredCompanies([]);
            setShowCompanySuggestions(false);
        }
    };

    const handleSelectCompany = (company: any) => {
        setCompanyName(company.name);
        setCompanyPhone(company.phone || '');
        setCompanyEmail(company.email || '');
        setCompanyWeb(company.website || '');
        setCompanyAddress(company.address || '');
        setSelectedCompanyId(company.id);
        setShowCompanySuggestions(false);
        setHasUnsavedChanges(true);
    };

    const handleContactNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setContactName(value);
        setHasUnsavedChanges(true);
        setSelectedContactId(null); // Reset selection if typing

        if (value.trim()) {
            const filtered = allContacts.filter(c => {
                const fullName = `${c.firstName || ''} ${c.lastName || ''}`.trim();
                return fullName.toLowerCase().includes(value.toLowerCase());
            });
            setFilteredContacts(filtered);
            setShowContactSuggestions(true);
        } else {
            setFilteredContacts([]);
            setShowContactSuggestions(false);
        }
    };

    const handleSelectContact = (contact: any) => {
        setContactName(`${contact.firstName || ''} ${contact.lastName || ''}`.trim());
        setContactPhone(contact.phone || '');
        setContactEmail(contact.email || '');
        setContactPosition(contact.position || '');
        // Auto-fill company name if available
        if (contact.company) {
            setContactCompanyName(contact.company.name);
        } else {
            setContactCompanyName('');
        }

        // Auto-fill Company Section if contact has a companyId
        if (contact.companyId) {
            const foundCompany = allCompanies.find(c => c.id === contact.companyId);
            if (foundCompany) {
                handleSelectCompany(foundCompany);
                setShowCompanyForm(true);
            }
        }

        setSelectedContactId(contact.id);
        setShowContactSuggestions(false);
        setHasUnsavedChanges(true);
    };

    const handleCloseRequest = () => {
        if (hasUnsavedChanges) {
            setShowExitConfirmation(true);
        } else {
            onClose();
        }
    };

    const handlePrint = () => {
        window.print();
        setIsMenuOpen(false);
    };

    const handleExport = () => {
        if (!lead) return;
        const csvContent = "data:text/csv;charset=utf-8,"
            + "ID,Nombre,Presupuesto,Estado,Asignado\n"
            + `${lead.id},${leadName},${budget},${status},${assignedTo}`; // Basic export, can be improved
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `lead_${leadName.replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsMenuOpen(false);
    };

    const handleDelete = async () => {
        if (!lead?.id) return;
        try {
            await leadsService.delete(lead.id);
            setShowDeleteConfirmation(false);
            onSave(); // Trigger refresh
            onClose();
        } catch (error) {
            console.error('Error deleting lead', error);
            alert('Error al eliminar el lead');
        }
    };

    const handleSubmit = async () => {
        if (saving) return; // Prevent double-submission

        try {
            setSaving(true);
            if (!leadName) return alert('Nombre requerido');

            let finalContactId: string | undefined = selectedContactId || undefined;
            let finalCompanyId: string | undefined = selectedCompanyId || undefined;

            // 1. Create Company if needed (only if name provided and NOT selected from existing)
            if (showCompanyForm && companyName && !selectedCompanyId) {
                const newCompany = await companiesService.create({
                    name: companyName,
                    phone: companyPhone,
                    email: companyEmail,
                    website: companyWeb,
                    address: companyAddress,
                    industry: ''
                });
                finalCompanyId = newCompany.id;
            }

            // 2. Create Contact if needed (and NOT selected from existing)
            if (showContactForm && contactName && !selectedContactId) {
                // Split name best effort
                const parts = contactName.split(' ');
                const firstName = parts[0];
                const lastName = parts.slice(1).join(' ');

                const newContact = await contactsService.create({
                    firstName,
                    lastName,
                    phone: contactPhone,
                    email: contactEmail,
                    position: contactPosition,
                    companyId: finalCompanyId, // Link if just created OR selected
                    assignedTo // Assign same user
                });
                finalContactId = newContact.id;
            }

            const leadData = {
                name: leadName,
                budget: parseFloat(budget) || 0,
                status,
                assignedTo: assignedTo || null,
                contactId: finalContactId // Link created contact or selected contact
            };

            let savedLead;
            if (lead?.id) {
                savedLead = await leadsService.update(lead.id, leadData);
            } else {
                savedLead = await leadsService.create(leadData);
            }

            // Save Note if exists
            if (newNote.trim()) {
                await notesService.create({
                    content: newNote,
                    leadId: savedLead.id
                });

                setNewNote('');
            }
            setHasUnsavedChanges(false);
            setShowExitConfirmation(false);
            onSave();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Error al guardar lead');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-20 left-64 bg-[#f5f7f8] border-l border-gray-200">
                <div className="w-full h-full flex flex-row bg-[#f5f7f8]">
                    {/* Left Column */}
                    <div className="w-[40%] min-w-[350px] flex flex-col border-r border-gray-200 bg-white relative">
                        {/* Header - Dark Blue */}
                        <div className="bg-[#1a2b42] text-white p-4 pb-0 shrink-0">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2 w-full mr-4">
                                    <button
                                        onClick={handleCloseRequest}
                                        className="text-gray-400 hover:text-white mr-2 p-1 hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <input
                                        value={leadName}
                                        onChange={(e) => { setLeadName(e.target.value); setHasUnsavedChanges(true); }}
                                        placeholder={lead ? `Lead #${lead.id.slice(-6)}` : "Nuevo Lead"}
                                        className="bg-transparent border-b border-transparent hover:border-gray-600 focus:border-blue-500 w-full text-lg font-bold text-white focus:outline-none placeholder-gray-400/50"
                                    />
                                </div>
                                <div className="relative">
                                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-400 hover:text-white shrink-0 p-1 hover:bg-white/10 rounded">
                                        <MoreHorizontal size={20} />
                                    </button>

                                    {isMenuOpen && (
                                        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 text-gray-700 animate-in fade-in zoom-in-95 duration-100 border border-gray-100">
                                            <button onClick={handlePrint} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 text-left">
                                                <Printer size={16} className="text-gray-400" />
                                                <span>Imprimir</span>
                                            </button>
                                            <button onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 text-left">
                                                <Hash size={16} className="text-gray-400" />
                                                <span>Administrar etiquetas</span>
                                            </button>
                                            <button onClick={handleExport} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 text-left">
                                                <FileSpreadsheet size={16} className="text-gray-400" />
                                                <span>Exportar a excel</span>
                                            </button>
                                            <div className="border-t border-gray-100 my-1"></div>
                                            <button
                                                onClick={() => { setShowDeleteConfirmation(true); setIsMenuOpen(false); }}
                                                className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-red-50 text-left text-red-600"
                                            >
                                                <Trash2 size={16} />
                                                <span>Eliminar el lead</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Subtitle: ID & Tags */}
                            <div className="pl-9 mb-3 flex items-center gap-3">
                                <span className="text-xs text-gray-400 font-medium">#{lead?.id ? lead.id.slice(-6) : 'NUEVO'}</span>
                                <button className="text-[10px] sm:text-xs font-medium text-slate-400 border border-slate-600 border-dashed rounded px-2 py-0.5 hover:text-white hover:border-slate-400 uppercase tracking-wide">
                                    #Agregar etiquetas
                                </button>
                            </div>

                            {/* Status Bar */}
                            <div className="pl-9 pr-0 mb-4">
                                <div className="relative">
                                    <button
                                        onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                        className="w-full flex justify-between items-center bg-[#2c3e50] hover:bg-[#34495e] text-white px-4 py-2 rounded transition-colors group"
                                    >
                                        <div className="flex items-center gap-2">
                                            {/* Optional: Add colored dot */}
                                            {stages.find(s => s.id === status) && (
                                                <div className={`w-2 h-2 rounded-full ${stages.find(s => s.id === status)?.color?.replace('border', 'bg') || 'bg-blue-400'}`}></div>
                                            )}
                                            <span className="font-medium truncate">{currentStageName}</span>
                                        </div>
                                        <ChevronDown size={16} className={`text-gray-400 group-hover:text-white transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isStatusDropdownOpen && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg py-1 z-50 text-gray-700 animate-in fade-in zoom-in-95 duration-100 border border-gray-100 max-h-60 overflow-y-auto">
                                            {stages.map(stage => (
                                                <button
                                                    key={stage.id}
                                                    onClick={() => {
                                                        setStatus(stage.id);
                                                        setHasUnsavedChanges(true); // Mark as modified
                                                        setIsStatusDropdownOpen(false);
                                                    }}
                                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 text-left"
                                                >
                                                    <div className={`w-2 h-2 rounded-full ${stage.color?.replace('border', 'bg') || 'bg-gray-400'}`}></div>
                                                    <span className={`${status === stage.id ? 'font-bold text-blue-600' : ''}`}>
                                                        {stage.name}
                                                    </span>
                                                    {status === stage.id && <span className="ml-auto text-blue-600">✓</span>}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex w-full mt-2 h-1 gap-0.5">
                                    {(() => {
                                        const currentStageIndex = stages.findIndex(s => s.id === status);
                                        return stages.map((stage, index) => {
                                            const isPastOrCurrent = currentStageIndex !== -1 && index <= currentStageIndex;
                                            const isActive = stage.id === status;

                                            // Active/Past: use stage color. Future: use dark gray
                                            const colorClass = isPastOrCurrent
                                                ? (stage.color?.replace('border-', 'bg-') || 'bg-blue-400')
                                                : 'bg-gray-600';

                                            return (
                                                <div
                                                    key={stage.id}
                                                    className={`flex-1 rounded-full ${colorClass} ${isActive ? 'h-1.5 -mt-0.5 shadow-sm brightness-110' : 'opacity-80'}`}
                                                    title={stage.name}
                                                ></div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>


                            {/* Tabs */}
                            <div className="pl-9 flex gap-6 text-sm font-medium">
                                <button
                                    className={`pb-3 border-b-2 transition-colors ${activeTab === 'principal' ? 'text-white border-white' : 'text-gray-400 border-transparent hover:text-white'}`}
                                    onClick={() => setActiveTab('principal')}
                                >
                                    Principal
                                </button>
                                <button
                                    className={`pb-3 border-b-2 transition-colors ${activeTab === 'configurar' ? 'text-white border-white' : 'text-gray-400 border-transparent hover:text-white'}`}
                                    onClick={() => setActiveTab('configurar')}
                                >
                                    Configurar
                                </button>
                            </div>
                        </div>

                        {/* Body - Left Column Form */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">

                            {/* Standard Fields */}

                            {/* Pipeline Warning */}
                            {pipelineError && !lead?.id && (
                                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <h4 className="font-medium text-yellow-900 mb-1">
                                                Embudo de ventas no configurado
                                            </h4>
                                            <p className="text-sm text-yellow-700 mb-3">
                                                Debes configurar un embudo de ventas antes de crear leads.
                                                Las etapas del embudo son necesarias para gestionar el proceso de ventas.
                                            </p>
                                            <button
                                                onClick={() => {
                                                    onClose();
                                                    // User needs to click "Editar embudo" from LeadsPage menu
                                                    alert('Por favor, haz clic en el menú "⋮" en la página de Leads y selecciona "Editar embudo" para configurar tu embudo de ventas.');
                                                }}
                                                className="text-sm bg-yellow-600 text-white px-3 py-1.5 rounded hover:bg-yellow-700 transition-colors"
                                            >
                                                Entendido
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                                    <label className="text-gray-400 text-sm">Usuario resp.</label>
                                    <select
                                        className="w-full border-b border-gray-100 focus:border-blue-400 focus:outline-none py-1 text-sm bg-transparent appearance-none"
                                        value={assignedTo}
                                        onChange={(e) => { setAssignedTo(e.target.value); setHasUnsavedChanges(true); }}
                                    >
                                        <option value="">Seleccionar usuario...</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.id}>{user.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                                    <label className="text-gray-400 text-sm">Presupuesto</label>
                                    <div className="flex items-center border-b border-gray-200">
                                        <span className="text-gray-500 text-sm pr-2">C$</span>
                                        <input
                                            className="w-full py-1 text-sm outline-none font-medium"
                                            placeholder="0"
                                            value={budget}
                                            onChange={(e) => { setBudget(e.target.value); setHasUnsavedChanges(true); }}
                                            type="number"
                                        />
                                    </div>
                                </div>
                            </div >

                            <div className="border-t border-gray-100 my-4"></div>

                            {/* Add Contact Section */}
                            <div>
                                {!showContactForm ? (
                                    <button
                                        onClick={() => setShowContactForm(true)}
                                        className="flex items-center gap-2 text-gray-400 hover:text-blue-500 text-sm"
                                    >
                                        <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center">
                                            <Plus size={14} />
                                        </div>
                                        Agregar contacto
                                    </button>
                                ) : (
                                    <div className="space-y-4 animate-in fade-in" ref={contactInputRef}>
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full border border-blue-500 flex items-center justify-center text-blue-500">
                                                    <Plus size={14} />
                                                </div>
                                                Agregar contacto
                                            </h4>
                                            <button onClick={() => setShowContactForm(false)} className="text-xs text-red-500 hover:text-red-700">cancelar</button>
                                        </div>

                                        <div className="relative">
                                            <input
                                                className="w-full border-b border-blue-200 py-1 text-sm outline-none placeholder-blue-300"
                                                placeholder="Buscar o crear contacto"
                                                value={contactName}
                                                onChange={handleContactNameChange}
                                                onFocus={() => {
                                                    if (contactName && filteredContacts.length > 0) setShowContactSuggestions(true);
                                                }}
                                            />
                                            {showContactSuggestions && filteredContacts.length > 0 && (
                                                <div className="absolute z-10 w-full bg-white border border-gray-200 shadow-lg rounded-md mt-1 max-h-48 overflow-y-auto">
                                                    {filteredContacts.map(contact => (
                                                        <div
                                                            key={contact.id}
                                                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                                                            onClick={() => handleSelectContact(contact)}
                                                        >
                                                            {contact.firstName} {contact.lastName} {contact.company ? `(${contact.company.name})` : ''}
                                                        </div>
                                                    ))}
                                                    <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100">
                                                        O sigue escribiendo para crear uno nuevo
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3 pl-8">
                                            <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                                                <label className="text-gray-400 text-sm">Compañía</label>
                                                <input
                                                    className="w-full border-b border-gray-100 py-1 text-sm outline-none"
                                                    placeholder="Nombre de la compañía"
                                                    value={contactCompanyName}
                                                    onChange={(e) => { setContactCompanyName(e.target.value); setHasUnsavedChanges(true); }}
                                                    disabled={!!selectedContactId} // Read only if contact selected
                                                />
                                            </div>
                                            <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                                                <label className="text-gray-400 text-sm">Teléfono Oficina</label>
                                                <input
                                                    className="w-full border-b border-gray-100 py-1 text-sm outline-none"
                                                    placeholder="..."
                                                    value={contactPhone}
                                                    onChange={(e) => { setContactPhone(e.target.value); setHasUnsavedChanges(true); }}
                                                    disabled={!!selectedContactId}
                                                />
                                            </div>
                                            <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                                                <label className="text-gray-400 text-sm">Correo</label>
                                                <input
                                                    className="w-full border-b border-gray-100 py-1 text-sm outline-none"
                                                    placeholder="..."
                                                    value={contactEmail}
                                                    onChange={(e) => { setContactEmail(e.target.value); setHasUnsavedChanges(true); }}
                                                    disabled={!!selectedContactId}
                                                />
                                            </div>
                                            <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                                                <label className="text-gray-400 text-sm">Cargo</label>
                                                <input
                                                    className="w-full border-b border-gray-100 py-1 text-sm outline-none"
                                                    placeholder="..."
                                                    value={contactPosition}
                                                    onChange={(e) => { setContactPosition(e.target.value); setHasUnsavedChanges(true); }}
                                                    disabled={!!selectedContactId}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-100 my-4"></div>

                            {/* Add Company Section */}
                            <div>
                                {!showCompanyForm ? (
                                    <button
                                        onClick={() => setShowCompanyForm(true)}
                                        className="flex items-center gap-2 text-gray-400 hover:text-blue-500 text-sm"
                                    >
                                        <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center">
                                            <Plus size={14} />
                                        </div>
                                        Agregar compañía
                                    </button>
                                ) : (
                                    <div className="space-y-4 animate-in fade-in" ref={companyInputRef}>
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full border border-blue-500 flex items-center justify-center text-blue-500">
                                                    <Plus size={14} />
                                                </div>
                                                Agregar compañía
                                            </h4>
                                            <button onClick={() => setShowCompanyForm(false)} className="text-xs text-red-500 hover:text-red-700">cancelar</button>
                                        </div>

                                        <div className="relative">
                                            <input
                                                className="w-full border-b border-blue-200 py-1 text-sm outline-none placeholder-blue-300"
                                                placeholder="Nombre de la compañía"
                                                value={companyName}
                                                onChange={handleCompanyNameChange}
                                                onFocus={() => {
                                                    if (companyName && filteredCompanies.length > 0) setShowCompanySuggestions(true);
                                                }}
                                            />
                                            {showCompanySuggestions && filteredCompanies.length > 0 && (
                                                <div className="absolute z-10 w-full bg-white border border-gray-200 shadow-lg rounded-md mt-1 max-h-48 overflow-y-auto">
                                                    {filteredCompanies.map(company => (
                                                        <div
                                                            key={company.id}
                                                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                                                            onClick={() => handleSelectCompany(company)}
                                                        >
                                                            {company.name}
                                                        </div>
                                                    ))}
                                                    <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100">
                                                        O sigue escribiendo para crear una nueva
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3 pl-8">
                                            <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                                                <label className="text-gray-400 text-sm">Teléfono Oficina</label>
                                                <input
                                                    className="w-full border-b border-gray-100 py-1 text-sm outline-none"
                                                    placeholder="..."
                                                    value={companyPhone}
                                                    onChange={(e) => { setCompanyPhone(e.target.value); setHasUnsavedChanges(true); }}
                                                    disabled={!!selectedCompanyId} // Disable if selected existing
                                                />
                                            </div>
                                            <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                                                <label className="text-gray-400 text-sm">Correo</label>
                                                <input
                                                    className="w-full border-b border-gray-100 py-1 text-sm outline-none"
                                                    placeholder="..."
                                                    value={companyEmail}
                                                    onChange={(e) => { setCompanyEmail(e.target.value); setHasUnsavedChanges(true); }}
                                                    disabled={!!selectedCompanyId}
                                                />
                                            </div>
                                            <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                                                <label className="text-gray-400 text-sm">Página web</label>
                                                <input
                                                    className="w-full border-b border-gray-100 py-1 text-sm outline-none"
                                                    placeholder="..."
                                                    value={companyWeb}
                                                    onChange={(e) => { setCompanyWeb(e.target.value); setHasUnsavedChanges(true); }}
                                                    disabled={!!selectedCompanyId}
                                                />
                                            </div>
                                            <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                                                <label className="text-gray-400 text-sm">Dirección</label>
                                                <input
                                                    className="w-full border-b border-gray-100 py-1 text-sm outline-none"
                                                    placeholder="..."
                                                    value={companyAddress}
                                                    onChange={(e) => { setCompanyAddress(e.target.value); setHasUnsavedChanges(true); }}
                                                    disabled={!!selectedCompanyId}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div >

                        {/* Footer */}
                        < div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-start gap-2" >
                            <button
                                onClick={handleSubmit}
                                disabled={saving || (!!pipelineError && !lead?.id)}
                                className={`bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-1.5 rounded transition-colors ${(pipelineError && !lead?.id) ? 'opacity-50 cursor-not-allowed hover:bg-blue-600' : ''}`}
                            >
                                {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button onClick={handleCloseRequest} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1">
                                Cancelar
                            </button>
                        </div >
                    </div >

                    {/* Right Column - Notes */}
                    < div className="flex-1 flex flex-col bg-[#f5f7f8]" >
                        <div className="flex-1 overflow-y-auto p-6">
                            {notes.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    <div className="text-center">
                                        <p className="text-sm">No hay notas ni actividad reciente.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {notes.map(note => (
                                        <div key={note.id} className="bg-white p-3 rounded shadow-sm border border-gray-100">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-medium text-xs text-blue-600">
                                                    {note.author?.name || 'Sistema'}
                                                </span>
                                                <div className="flex gap-2">
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(note.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="bg-white border-t border-gray-200 p-4">
                            <div className="bg-white border border-gray-300 rounded-lg p-2 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
                                <textarea
                                    className="w-full resize-none outline-none text-sm min-h-[40px]"
                                    placeholder="Nota: escribe aquí"
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <div className="flex gap-2 text-gray-400">
                                        <button className="hover:text-gray-600"><Paperclip size={16} /></button>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSaveNote}
                                            className="bg-gray-400 hover:bg-gray-500 text-white text-sm font-medium px-4 py-1.5 rounded disabled:opacity-50"
                                            disabled={!newNote.trim() || !lead?.id} // Only active if note exists and lead exists
                                        >
                                            Instalar
                                        </button>
                                        <button onClick={() => setNewNote('')} className="text-sm text-gray-500 px-2">
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div >
                </div >
            </div >

            {/* Exit Confirmation Modal */}
            {
                showExitConfirmation && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-lg shadow-xl w-[400px] p-6 relative animate-in zoom-in-95 duration-200">
                            <button
                                onClick={() => setShowExitConfirmation(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>

                            <h3 className="text-lg text-gray-800 font-medium mb-6 pr-6">
                                No guardó sus cambios. Por favor elija una opción:
                            </h3>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleSubmit}
                                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-medium transition-colors w-24 text-center"
                                >
                                    Guardar
                                </button>
                                <button
                                    onClick={() => { setShowExitConfirmation(false); onClose(); }}
                                    className="text-gray-500 hover:text-gray-700 text-sm font-medium w-fit"
                                >
                                    Salir sin guardar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Delete Confirmation Modal */}
            {
                showDeleteConfirmation && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-lg shadow-xl w-[400px] p-6 relative animate-in zoom-in-95 duration-200">
                            <button
                                onClick={() => setShowDeleteConfirmation(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>

                            <h3 className="text-lg text-gray-800 font-medium mb-4">
                                ¿Estás seguro de eliminar este lead?
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Esta acción no se puede deshacer.
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirmation(false)}
                                    className="text-gray-500 hover:text-gray-700 text-sm font-medium px-4 py-2"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-medium transition-colors"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
}
