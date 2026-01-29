import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { ListHeader } from '@/components/ListHeader';
import { MoreHorizontal, Zap, Search, ChevronLeft, ChevronRight, SlidersHorizontal, Settings } from 'lucide-react';

interface Lead {
    id: string;
    name: string;
    budget: string | number;
    status: string;
    contact?: { firstName: string; lastName: string };
    company?: { name: string };
    currency?: string;
}

import { useNavigate } from 'react-router-dom';

export default function LeadsListPage() {
    const navigate = useNavigate();
    const [leads, setLeads] = useState<Lead[]>([]);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const { data } = await api.get<Lead[]>('/leads');
            setLeads(data);
        } catch (error) {
            console.error('Failed to fetch leads', error);
        }
    };

    const headerActions = [
        { label: 'Importar', icon: <div className='w-4' />, onClick: () => alert('Importar') },
        { label: 'Exportar', icon: <div className='w-4' />, onClick: () => alert('Exportar') },
    ];

    const AutomationButton = (
        <Button
            variant="outline"
            className="flex items-center gap-2 border-orange-200 text-orange-600 hover:bg-orange-50 font-bold uppercase text-xs h-9 px-4 mr-2"
            onClick={() => alert('Automatización')}
        >
            <Zap className="w-4 h-4 fill-current" />
            AUTOMATIZA
        </Button>
    );

    return (
        <div className="bg-white min-h-screen flex flex-col">
            <ListHeader
                title="LEADS"
                onAdd={() => alert('Nuevo Lead Action')}
                addButtonLabel="NUEVO LEAD"
                viewName="Leads abiertos"
                count={leads.length}
                unitLabel={leads.length === 1 ? 'lead' : 'leads: C$0'}
                actions={headerActions}
                preAddContent={AutomationButton}
                viewMode="list"
                onViewModeChange={(mode) => {
                    if (mode === 'kanban') navigate('/leads');
                }}
            />

            {/* Table Area */}
            <div className="flex-1 px-6 pb-6 overflow-auto">
                {/* Table Header */}
                <div className="grid grid-cols-[40px_2fr_1.5fr_1.5fr_1fr_1fr] bg-white border-b border-gray-200 py-3 px-2 sticky top-0 uppercase text-xs font-bold text-gray-400">
                    <div className="flex items-center justify-center">
                        <input type="checkbox" className="rounded border-gray-300" />
                    </div>
                    <div>NOMBRE DEL LEAD</div>
                    <div>CONTACTO PRINCIPAL</div>
                    <div>COMPAÑÍA DEL LEAD</div>
                    <div>ESTATUS DEL LEAD</div>
                    <div className="text-right">PRESUPUESTO, C$</div>
                </div>

                {/* Table Body / Empty State */}
                {leads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        {/* Placeholder Content matching screenshot's empty state style approximately */}
                        {/* Actually screenshot shows "Lamentablemente, no hay leads..." just below header but left aligned? 
                            It looks like a message in the table body.
                        */}
                        <div className="w-full text-left px-2 py-4">
                            <span className="text-red-400">Lamentablemente, no hay leads con estos parámetros. </span>
                            <button className="text-blue-500 underline" onClick={fetchLeads}>Mostrar todo</button>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {leads.map((lead) => (
                            <div key={lead.id} className="grid grid-cols-[40px_2fr_1.5fr_1.5fr_1fr_1fr] py-3 px-2 hover:bg-gray-50 items-center text-sm text-gray-700">
                                <div className="flex items-center justify-center">
                                    <input type="checkbox" className="rounded border-gray-300" />
                                </div>
                                <div className="font-medium text-blue-600">{lead.name}</div>
                                <div>
                                    {lead.contact ? `${lead.contact.firstName || ''} ${lead.contact.lastName || ''}` : '-'}
                                </div>
                                <div>
                                    {lead.company?.name || '-'}
                                </div>
                                <div>
                                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600 border border-gray-200">
                                        {lead.status || 'Active'}
                                    </span>
                                </div>
                                <div className="text-right font-medium">
                                    {lead.budget ? `C$ ${lead.budget}` : '-'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination Footer (Mock) */}
            <div className="border-t border-gray-200 p-4 flex justify-between items-center text-sm text-gray-500 bg-white">
                <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                        <button className="p-1 hover:bg-gray-100 rounded"><ChevronLeft size={16} /></button>
                        <button className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={16} /></button>
                    </div>
                    {/* Mock Pagination */}
                    <span>Ctrl →</span>
                </div>
                <div className="flex items-center gap-2">
                    <span>Mostrar filas:</span>
                    <select className="border-none bg-transparent font-medium focus:ring-0 cursor-pointer">
                        <option>50</option>
                        <option>100</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
