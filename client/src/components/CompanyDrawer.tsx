import { X, MoreHorizontal, Paperclip, Calendar, ChevronLeft, Copy, Printer, Hash, FileSpreadsheet, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

import { companiesService, Company } from '../services/companies';
import { notesService, Note } from '../services/notes';

interface CompanyDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    company?: Company | null;
}

export function CompanyDrawer({ isOpen, onClose, onSave, company }: CompanyDrawerProps) {
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showExitConfirmation, setShowExitConfirmation] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('principal');

    // Form States
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [website, setWebsite] = useState('');
    const [address, setAddress] = useState('');
    const [industry, setIndustry] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [users, setUsers] = useState<any[]>([]);

    // Note State
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState('');

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
            setHasUnsavedChanges(false);
            setShowExitConfirmation(false);
            setShowDeleteConfirmation(false);
            setIsMenuOpen(false);
            if (company) {
                loadNotes(company.id);
                setName(company.name || '');
                setPhone(company.phone || '');
                setEmail(company.email || '');
                setWebsite(company.website || '');
                setAddress(company.address || '');
                setIndustry(company.industry || '');
                setAssignedTo(company.assignedTo || '');
            } else {
                // Reset form for create mode
                setNotes([]);
                setName('');
                setPhone('');
                setEmail('');
                setWebsite('');
                setAddress('');
                setIndustry('');
                setAssignedTo('');
            }
        }
    }, [isOpen, company]);

    // Mark as dirty on changes
    const handleChange = (setter: any, value: any) => {
        setter(value);
        setHasUnsavedChanges(true);
    };

    const loadNotes = async (companyId: string) => {
        try {
            const data = await notesService.getAll({ companyId });
            setNotes(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSaveNote = async () => {
        if (!newNote.trim() || !company?.id) return;
        try {
            await notesService.create({
                content: newNote,
                companyId: company.id
            });
            setNewNote('');
            loadNotes(company.id);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async () => {
        try {
            if (!name.trim()) {
                alert('El nombre es obligatorio');
                return;
            }

            let savedCompany;
            if (company?.id) {
                savedCompany = await companiesService.update(company.id, {
                    name,
                    phone,
                    email,
                    website,
                    address,
                    industry,
                    assignedTo
                });
            } else {
                savedCompany = await companiesService.create({
                    name,
                    phone,
                    email,
                    website,
                    address,
                    industry,
                    assignedTo
                });
            }

            // Save Note if exists
            if (newNote.trim()) {
                await notesService.create({
                    content: newNote,
                    companyId: savedCompany.id
                });
                setNewNote('');
            }

            setHasUnsavedChanges(false);
            setShowExitConfirmation(false);
            onSave();
            onClose();
        } catch (error: any) {
            console.error('Error saving company', error);
            const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
            const errorDetails = error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : '';
            alert(`Error al guardar: ${errorMessage} ${errorDetails ? `\nDetalles: ${errorDetails}` : ''}`);
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
        const fullName = name.trim();
        navigator.clipboard.writeText(fullName);
        setIsMenuOpen(false);
    };

    const handlePrint = () => {
        window.print();
        setIsMenuOpen(false);
    };

    const handleExport = () => {
        if (!company) return;
        const csvContent = "data:text/csv;charset=utf-8,"
            + "ID,Nombre,Email,Telefono,Web,Direccion,Industria\n"
            + `${company.id},${name},${email},${phone},${website},${address},${industry}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `compania_${name}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsMenuOpen(false);
    };

    const handleDelete = async () => {
        if (!company?.id) return;
        try {
            await companiesService.delete(company.id);
            setShowDeleteConfirmation(false);
            onSave(); // Trigger refresh
            onClose();
        } catch (error) {
            console.error('Error deleting company', error);
            alert('Error al eliminar la compañía');
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-20 left-64 bg-[#f5f7f8] border-l border-gray-200">
                <div className="w-full h-full flex flex-row bg-[#f5f7f8]">
                    {/* Left Column - Header + Forms + Footer */}
                    <div className="w-[40%] min-w-[350px] flex flex-col border-r border-gray-200 bg-white">
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
                                        placeholder="Nombre de la compañía"
                                        className="bg-transparent border-b border-transparent hover:border-gray-600 focus:border-blue-500 w-full text-lg font-bold text-white focus:outline-none placeholder-gray-400/50"
                                        value={name}
                                        onChange={(e) => handleChange(setName, e.target.value)}
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
                                                <span>Eliminar compañía</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Subtitle: ID & Tags */}
                            <div className="pl-9 mb-4 flex items-center gap-3">
                                <span className="text-xs text-gray-400 font-medium">#{company?.id ? company.id.slice(-6) : 'NUEVO'}</span>
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
                                <button className="text-gray-400 hover:text-white pb-3 border-b-2 border-transparent hover:border-gray-600 transition-colors">Configurar</button>
                            </div>
                        </div>

                        {/* Body - Forms */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Company Info */}
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
                                    <label className="text-gray-400 text-sm">Teléfono</label>
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
                                    <label className="text-gray-400 text-sm">Web</label>
                                    <input
                                        className="w-full border-b border-gray-100 focus:border-blue-400 focus:outline-none py-1 text-sm bg-transparent"
                                        placeholder="..."
                                        value={website}
                                        onChange={(e) => handleChange(setWebsite, e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                                    <label className="text-gray-400 text-sm">Dirección</label>
                                    <input
                                        className="w-full border-b border-gray-100 focus:border-blue-400 focus:outline-none py-1 text-sm bg-transparent"
                                        placeholder="..."
                                        value={address}
                                        onChange={(e) => handleChange(setAddress, e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                                    <label className="text-gray-400 text-sm">Industria</label>
                                    <input
                                        className="w-full border-b border-gray-100 focus:border-blue-400 focus:outline-none py-1 text-sm bg-transparent"
                                        placeholder="..."
                                        value={industry}
                                        onChange={(e) => handleChange(setIndustry, e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-start gap-2">
                            <button
                                onClick={handleSubmit}
                                className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-1.5 rounded"
                            >
                                Guardar
                            </button>
                            <button onClick={handleCloseRequest} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1">Cancelar</button>
                        </div>
                    </div>

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
                                ¿Estás seguro de eliminar esta compañía?
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
