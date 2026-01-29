import { X, Plus, MoreHorizontal, Paperclip, Calendar, ChevronLeft, Copy, Printer, Hash, FileSpreadsheet, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

import { companiesService, Company } from '../services/companies';
import { contactsService, Contact } from '../services/contacts';
import { leadsService } from '../services/leads';
import { notesService, Note } from '../services/notes';
import { authService } from '../services/auth';

interface ContactDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    contact?: Contact | null;
}

export function ContactDrawer({ isOpen, onClose, onSave, contact }: ContactDrawerProps) {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [activeTab, setActiveTab] = useState('principal');
    const [showCompanyForm, setShowCompanyForm] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showExitConfirmation, setShowExitConfirmation] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Form States
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [position, setPosition] = useState('');
    const [companyId, setCompanyId] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [users, setUsers] = useState<any[]>([]);

    // Lead State
    const [leadName, setLeadName] = useState('');
    const [leadBudget, setLeadBudget] = useState('');
    const [leadStatus] = useState('active');

    // Note State
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState('');

    // New Company State
    const [newCompany, setNewCompany] = useState({
        name: '',
        phone: '',
        email: '',
        website: '',
        address: ''
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const { usersService } = await import('../services/users');
            const data = await usersService.getAll();
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users', error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadCompanies();
            setHasUnsavedChanges(false);
            setShowExitConfirmation(false);
            setShowDeleteConfirmation(false);
            setIsMenuOpen(false);
            if (contact) {
                loadNotes(contact.id);
                setFirstName(contact.firstName || '');
                setLastName(contact.lastName || '');
                setPhone(contact.phone || '');
                setEmail(contact.email || '');
                setPosition(contact.position || '');
                setCompanyId(contact.companyId || '');
                setAssignedTo(contact.assignedTo || '');
            } else {
                // Reset form for create mode
                setNotes([]);
                setFirstName('');
                setLastName('');
                setPhone('');
                setEmail('');
                setPosition('');
                setCompanyId('');
                const currentUser = authService.getCurrentUser();
                setAssignedTo(currentUser?.id || '');
                setLeadName('');
                setLeadBudget('');
                setShowCompanyForm(false);
                setNewCompany({
                    name: '',
                    phone: '',
                    email: '',
                    website: '',
                    address: ''
                });
            }
        }
    }, [isOpen, contact]);

    // Mark as dirty on changes
    const handleChange = (setter: any, value: any) => {
        setter(value);
        setHasUnsavedChanges(true);
    };

    const loadCompanies = async () => {
        try {
            const data = await companiesService.getAll();
            setCompanies(data);
        } catch (error) {
            console.error(error);
        }
    };

    const loadNotes = async (contactId: string) => {
        try {
            const data = await notesService.getAll({ contactId });
            setNotes(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSaveNote = async () => {
        if (!newNote.trim() || !contact?.id) return;
        try {
            await notesService.create({
                content: newNote,
                contactId: contact.id
            });
            setNewNote('');
            loadNotes(contact.id);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async () => {
        try {
            if (!firstName.trim()) {
                alert('El nombre es obligatorio');
                return;
            }

            let finalCompanyId = companyId;

            // If creating a new company inline
            if (showCompanyForm && newCompany.name) {
                const createdCompany = await companiesService.create({
                    name: newCompany.name,
                    email: newCompany.email,
                    phone: newCompany.phone,
                    website: newCompany.website,
                    address: newCompany.address,
                    industry: ''
                });
                finalCompanyId = createdCompany.id;
            }

            let savedContact;

            if (contact?.id) {
                savedContact = await contactsService.update(contact.id, {
                    firstName,
                    lastName,
                    phone,
                    email,
                    position,
                    companyId: finalCompanyId,
                    assignedTo
                });
            } else {
                savedContact = await contactsService.create({
                    firstName,
                    lastName,
                    phone,
                    email,
                    position,
                    companyId: finalCompanyId,
                    assignedTo
                });
            }

            // Create Lead if name is provided
            if (leadName) {
                await leadsService.create({
                    name: leadName,
                    budget: leadBudget ? parseFloat(leadBudget) : undefined,
                    status: leadStatus,
                    contactId: savedContact.id
                });
            }

            // Save Note if exists
            if (newNote.trim()) {
                await notesService.create({
                    content: newNote,
                    contactId: savedContact.id
                });
                setNewNote('');
            }

            setHasUnsavedChanges(false);
            setShowExitConfirmation(false);
            onSave();
            onClose();
        } catch (error: any) {
            console.error('Error saving contact', error);
            alert(error.response?.data?.message || 'Error al guardar el contacto. Por favor intente de nuevo.');
        }
    };

    const handleCloseRequest = () => {
        if (hasUnsavedChanges) {
            setShowExitConfirmation(true);
        } else {
            onClose();
        }
    };

    const handleCopyName = () => {
        const fullName = `${firstName} ${lastName}`.trim();
        navigator.clipboard.writeText(fullName);
        setIsMenuOpen(false);
    };

    const handlePrint = () => {
        window.print();
        setIsMenuOpen(false);
    };

    const handleExport = () => {
        if (!contact) return;
        const companyName = companies.find(c => c.id === companyId)?.name || '';
        const csvContent = "data:text/csv;charset=utf-8,"
            + "ID,Nombre,Apellido,Email,Telefono,Cargo,Compania\n"
            + `${contact.id},${firstName},${lastName},${email},${phone},${position},${companyName}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `contacto_${firstName}_${lastName}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsMenuOpen(false);
    };

    const handleDelete = async () => {
        if (!contact?.id) return;
        try {
            await contactsService.delete(contact.id);
            setShowDeleteConfirmation(false);
            onSave(); // Trigger refresh
            onClose();
        } catch (error) {
            console.error('Error deleting contact', error);
            alert('Error al eliminar el contacto');
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-20 left-64 bg-[#f5f7f8] border-l border-gray-200">
                {/* ... (existing drawer content) ... */}
                {/* Drawer Body - Full Height */}
                <div className="w-full h-full flex flex-row bg-[#f5f7f8]">
                    {/* Left Column - Header + Forms + Footer */}
                    <div className="w-[40%] min-w-[350px] flex flex-col border-r border-gray-200 bg-white relative">
                        {/* Header */}
                        {/* Header - Dark Blue */}
                        <div className="bg-[#1a2b42] text-white p-4 pb-0 shrink-0">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2 w-full mr-4">
                                    <button
                                        onClick={handleCloseRequest}
                                        className="text-gray-400 hover:text-white mr-2 p-1 hover:bg-white/10 rounded-full transition-colors"
                                        title="Cerrar formulario"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <input
                                        type="text"
                                        placeholder="Nombre completo"
                                        className="bg-transparent border-b border-transparent hover:border-gray-600 focus:border-blue-500 w-full text-lg font-bold text-white focus:outline-none placeholder-gray-400/50"
                                        value={`${firstName} ${lastName}`.trim()}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const parts = val.split(' ');
                                            const first = parts[0];
                                            const last = parts.slice(1).join(' ');
                                            setFirstName(first);
                                            setLastName(last);
                                            setHasUnsavedChanges(true);
                                        }}
                                    />
                                </div>
                                <div className="flex items-center gap-3 relative shrink-0">
                                    <button
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"
                                    >
                                        <MoreHorizontal size={20} />
                                    </button>

                                    {isMenuOpen && (
                                        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 text-gray-700 animate-in fade-in zoom-in-95 duration-100 border border-gray-100">
                                            <button onClick={handleCopyName} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 text-left">
                                                <Copy size={16} className="text-gray-400" />
                                                <span>Copie el nombre</span>
                                            </button>
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
                                                <span>Eliminar contacto</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Subtitle: ID & Tags */}
                            <div className="pl-9 mb-4 flex items-center gap-3">
                                <span className="text-xs text-gray-400 font-medium">#{contact?.id ? contact.id.slice(-6) : 'NUEVO'}</span>
                                <button className="text-[10px] sm:text-xs font-medium text-slate-400 border border-slate-600 border-dashed rounded px-2 py-0.5 hover:text-white hover:border-slate-400 uppercase tracking-wide">
                                    #Agregar etiquetas
                                </button>
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
                                    className={`pb-3 border-b-2 transition-colors ${activeTab === 'leads' ? 'text-white border-white' : 'text-gray-400 border-transparent hover:text-white'}`}
                                    onClick={() => setActiveTab('leads')}
                                >
                                    Leads
                                </button>
                                <button className="text-gray-400 hover:text-white pb-3 border-b-2 border-transparent hover:border-gray-600 transition-colors">Configurar</button>
                            </div>
                        </div>

                        {/* Body - Forms */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* ... Contact Info ... */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                                    <label className="text-gray-400 text-sm">Usuario resp.</label>
                                    <select
                                        className="w-full border-b border-gray-100 focus:border-blue-400 focus:outline-none py-1 text-sm bg-transparent appearance-none"
                                        value={assignedTo}
                                        onChange={(e) => handleChange(setAssignedTo, e.target.value)}
                                    >
                                        <option value="">Seleccionar usuario...</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.id}>{user.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                                    <label className="text-gray-400 text-sm">Teléfono Oficina</label>
                                    <input
                                        className="w-full border-b border-gray-100 focus:border-blue-400 focus:outline-none py-1 text-sm bg-transparent"
                                        placeholder="..."
                                        value={phone}
                                        onChange={(e) => handleChange(setPhone, e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                                    <label className="text-gray-400 text-sm">Correo</label>
                                    <input
                                        className="w-full border-b border-gray-100 focus:border-blue-400 focus:outline-none py-1 text-sm bg-transparent"
                                        placeholder="..."
                                        value={email}
                                        onChange={(e) => handleChange(setEmail, e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                                    <label className="text-gray-400 text-sm">Cargo</label>
                                    <input
                                        className="w-full border-b border-gray-100 focus:border-blue-400 focus:outline-none py-1 text-sm bg-transparent"
                                        placeholder="..."
                                        value={position}
                                        onChange={(e) => handleChange(setPosition, e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Company Divider */}
                            <div className="border-t border-gray-100 pt-4">
                                {/* ... (company logic kept as is, just hidden in snippet) ... */}
                                {!showCompanyForm && !companyId ? (
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
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-medium text-sm text-gray-700">Compañía</h4>
                                            <button onClick={() => { setShowCompanyForm(false); setCompanyId(''); handleChange(setHasUnsavedChanges, true); }} className="text-xs text-red-400 hover:text-red-600">cancelar</button>
                                        </div>

                                        {!showCompanyForm ? (
                                            <select
                                                className="w-full border-b border-gray-200 py-1 text-sm focus:outline-none"
                                                value={companyId}
                                                onChange={(e) => handleChange(setCompanyId, e.target.value)}
                                            >
                                                <option value="">Seleccionar existente...</option>
                                                <option value="new">+ Crear nueva</option>
                                                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        ) : (
                                            <div className="space-y-3 animate-in fade-in">
                                                <input
                                                    className="w-full border-b border-gray-200 py-1 text-sm font-medium placeholder-gray-800"
                                                    placeholder="Nombre de la compañía"
                                                    value={newCompany.name}
                                                    onChange={(e) => handleChange(setNewCompany, { ...newCompany, name: e.target.value })}
                                                />
                                                {/* ... (new company inputs) ... */}
                                                <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                                                    <label className="text-gray-400 text-sm">Teléfono</label>
                                                    <input
                                                        className="w-full border-b border-gray-100 py-1 text-sm bg-transparent"
                                                        placeholder="..."
                                                        value={newCompany.phone}
                                                        onChange={(e) => handleChange(setNewCompany, { ...newCompany, phone: e.target.value })}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                                                    <label className="text-gray-400 text-sm">Correo</label>
                                                    <input
                                                        className="w-full border-b border-gray-100 py-1 text-sm bg-transparent"
                                                        placeholder="..."
                                                        value={newCompany.email}
                                                        onChange={(e) => handleChange(setNewCompany, { ...newCompany, email: e.target.value })}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                                                    <label className="text-gray-400 text-sm">Página web</label>
                                                    <input
                                                        className="w-full border-b border-gray-100 py-1 text-sm bg-transparent"
                                                        placeholder="..."
                                                        value={newCompany.website}
                                                        onChange={(e) => handleChange(setNewCompany, { ...newCompany, website: e.target.value })}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                                                    <label className="text-gray-400 text-sm">Dirección</label>
                                                    <input
                                                        className="w-full border-b border-gray-100 py-1 text-sm bg-transparent"
                                                        placeholder="..."
                                                        value={newCompany.address}
                                                        onChange={(e) => handleChange(setNewCompany, { ...newCompany, address: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {!showCompanyForm && companyId && companies.find(c => c.id === companyId) && (
                                            <div className="mt-4 space-y-4">
                                                {(() => {
                                                    const selected = companies.find(c => c.id === companyId);
                                                    if (!selected) return null;
                                                    return (
                                                        <>
                                                            <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                                                                <label className="text-gray-400 text-sm">Teléfono Oficina</label>
                                                                <div className="text-sm border-b border-transparent py-1 text-gray-700">{selected.phone || '...'}</div>
                                                            </div>
                                                            <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                                                                <label className="text-gray-400 text-sm">Correo</label>
                                                                <div className="text-sm border-b border-transparent py-1 text-gray-700">{selected.email || '...'}</div>
                                                            </div>
                                                            <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                                                                <label className="text-gray-400 text-sm">Página web</label>
                                                                <div className="text-sm border-b border-transparent py-1 text-gray-700">{selected.website || '...'}</div>
                                                            </div>
                                                            <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                                                                <label className="text-gray-400 text-sm">Dirección</label>
                                                                <div className="text-sm border-b border-transparent py-1 text-gray-700">{selected.address || '...'}</div>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Separate Footer for Contact Form */}
                        <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-start gap-2">
                            <button
                                onClick={handleSubmit}
                                className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-1.5 rounded"
                            >
                                {contact?.id ? 'Guardar' : 'Guardar (Instalar)'}
                            </button>
                            <button onClick={handleCloseRequest} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1">Cancelar</button>
                        </div>
                    </div>

                    {/* Leads Tab Content */}
                    {activeTab === 'leads' && (
                        <div className="w-[40%] bg-white border-r border-gray-200 overflow-y-auto p-6 space-y-8 animate-in slide-in-from-right duration-300 absolute inset-0 left-0 z-10">
                            <h3 className="text-sm font-medium text-gray-400 mb-4">Agregar rápido</h3>

                            <div className="space-y-6">
                                <div>
                                    <input
                                        className="w-full border-b-2 border-blue-500 py-2 text-lg font-medium outline-none placeholder-gray-300"
                                        placeholder="Nombre del lead"
                                        value={leadName}
                                        onChange={(e) => handleChange(setLeadName, e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                                    <label className="text-gray-500 text-sm">Presupuesto</label>
                                    <div className="flex items-center border-b border-gray-200">
                                        <input
                                            className="w-full py-1 text-sm outline-none"
                                            placeholder="0"
                                            type="number"
                                            value={leadBudget}
                                            onChange={(e) => handleChange(setLeadBudget, e.target.value)}
                                        />
                                        <span className="text-gray-500 text-sm px-2">C$</span>
                                    </div>
                                </div>

                                <div>
                                    <button className="bg-blue-100 text-blue-600 px-4 py-2 rounded text-sm font-medium w-full text-left flex justify-between items-center">
                                        <span>{leadStatus === 'active' ? 'Contactado' : leadStatus}</span>
                                        <Plus size={16} />
                                    </button>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <button
                                        onClick={() => setActiveTab('principal')}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded text-sm"
                                    >
                                        Guardar
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('principal')}
                                        className="text-gray-500 px-4 py-1.5 text-sm hover:underline"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Right Column - Notes List + Footer */}
                    <div className="flex-1 flex flex-col bg-[#f5f7f8]">
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

                        {/* Note Input Footer (Always visible) */}
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
                                        <button className="hover:text-gray-600"><Calendar size={16} /></button>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setNewNote('')}
                                            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleSaveNote}
                                            className="bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium px-4 py-1.5 rounded disabled:opacity-50"
                                            disabled={!newNote.trim()}
                                        >
                                            Instalar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Custom Confirmation Modal */}
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
                                ¿Estás seguro de eliminar este contacto?
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
