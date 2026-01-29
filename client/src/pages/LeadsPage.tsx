import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { ListHeader } from '@/components/ListHeader';
import { MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    DndContext,
    DragOverlay,
    useDraggable,
    useDroppable,
    DragEndEvent,
    DragStartEvent,
    useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { LeadDrawer } from '@/components/LeadDrawer';
import { QuickAddLeadForm } from '@/components/QuickAddLeadForm';
import { PipelineSettingsModal } from '@/components/PipelineSettingsModal';
import { pipelinesService } from '@/services/pipelines';

interface Lead {
    id: string;
    name: string;
    budget: string | number;
    status: string;
}



function DraggableLead({ lead, onClick }: { lead: Lead, onClick?: (lead: Lead) => void }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: lead.id,
        data: { lead },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            <Card className="p-4 cursor-grab hover:border-blue-400 transition-all group relative border-gray-100 shadow-sm active:cursor-grabbing" onClick={() => onClick?.(lead)}>
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-800 text-sm leading-tight text-blue-600 group-hover:underline">
                        {lead.name}
                    </h4>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                </div>
                <div className="flex justify-between items-center mt-4">
                    <span className="text-xs font-bold text-gray-900">C$ {lead.budget || 0}</span>
                    <div className="flex -space-x-1">
                        <div className="w-5 h-5 rounded-full bg-gray-200 border border-white flex items-center justify-center text-[10px] font-bold text-gray-500">
                            US
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}

function DroppableColumn({ id, children, className }: { id: string, children: React.ReactNode, className?: string }) {
    const { setNodeRef } = useDroppable({
        id: id,
    });

    return (
        <div ref={setNodeRef} className={className}>
            {children}
        </div>
    );
}

export default function LeadsPage() {
    const navigate = useNavigate();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [showQuickAdd, setShowQuickAdd] = useState<string | null>(null);
    const [quickAddValue, setQuickAddValue] = useState('');
    const [activeLead, setActiveLead] = useState<Lead | null>(null); // For DragOverlay

    // Drawer State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | undefined>(undefined);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );



    const fetchPipeline = async () => {
        try {
            const pipeline = await pipelinesService.get();
            if (pipeline && pipeline.stages.length > 0) {
                setColumns(pipeline.stages.map(s => ({
                    id: s.id,
                    title: s.name,
                    color: s.color,
                    bgColor: s.bgColor
                })));
            }
        } catch (error) {
            console.error('Failed to fetch pipeline', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchLeads = async () => {
        try {
            const { data } = await api.get<Lead[]>('/leads');
            setLeads(data);
        } catch (error) {
            console.error('Failed to fetch leads', error);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchLeads();
        fetchPipeline();
    }, []);

    const handleQuickAdd = async (statusId: string) => {
        if (!quickAddValue) return;
        try {
            await api.post('/leads', { name: quickAddValue, status: statusId, budget: 0 });
            setQuickAddValue('');
            setShowQuickAdd(null);
            fetchLeads();
        } catch (error) {
            console.error('Failed to quick add lead', error);
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        const lead = event.active.data.current?.lead;
        setActiveLead(lead);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveLead(null);

        if (!over) return;

        const leadId = active.id as string;
        const newStatus = over.id as string;

        // Optimistic update
        const leadIndex = leads.findIndex(l => l.id === leadId);
        if (leadIndex === -1) return;

        const originalLeads = [...leads];
        const updatedLeads = [...leads];

        // Don't update if status hasn't changed
        if (updatedLeads[leadIndex].status === newStatus) return;

        updatedLeads[leadIndex] = { ...updatedLeads[leadIndex], status: newStatus };
        setLeads(updatedLeads);

        try {
            await api.patch(`/leads/${leadId}`, { status: newStatus });
        } catch (error) {
            console.error('Failed to update lead status', error);
            // Revert on error
            setLeads(originalLeads);
        }
    };

    const [columns, setColumns] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPipelineModalOpen, setIsPipelineModalOpen] = useState(false);

    return (
        <div className="bg-gray-50 min-h-screen">
            <ListHeader
                title="LEADS"
                onAdd={() => {
                    setSelectedLead(undefined);
                    setIsDrawerOpen(true);
                }}
                addButtonLabel="AGREGAR LEAD"
                viewName="Ventas"
                viewMode="kanban"
                onViewModeChange={(mode) => {
                    if (mode === 'list') navigate('/leads/list');
                }}
                /* ... keep customMenu ... */
                customMenu={
                    <div className="flex flex-col">
                        <button className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50 text-left text-blue-600 font-medium">
                            <MoreHorizontal size={16} />
                            <span>Nueva difusión</span>
                        </button>
                        <button
                            onClick={() => setIsPipelineModalOpen(true)}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50 text-left text-blue-600"
                        >
                            <span className="w-4 h-4 border border-blue-600 rounded-sm flex items-center justify-center text-[10px]">⚙</span>
                            <span>Editar embudo</span>
                        </button>
                        <button className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50 text-left text-gray-700">
                            <span className="w-4">✎</span>
                            <span>Editar el diseño de la tarjeta</span>
                        </button>

                        <div className="my-1 border-t border-gray-100"></div>

                        <button className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50 text-left text-gray-700">
                            <span className="w-4">⬇</span>
                            <span>Importa</span>
                        </button>
                        <button
                            onClick={() => {
                                // Basic export logic
                                const csv = "ID,Nombre,Presupuesto,Estado\n" + leads.map(l => `${l.id},${l.name},${l.budget},${l.status}`).join('\n');
                                const link = document.createElement("a");
                                link.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
                                link.download = 'leads_export.csv';
                                link.click();
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50 text-left text-gray-700"
                        >
                            <span className="w-4">⬆</span>
                            <span>Exportar</span>
                        </button>
                        <button className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50 text-left text-gray-700">
                            <span className="w-4">🔍</span>
                            <span>Buscar duplicados</span>
                        </button>
                        <button className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50 text-left text-gray-700">
                            <span className="w-4">☑</span>
                            <span>Seleccionar varios</span>
                        </button>

                        <div className="my-1 border-t border-gray-100"></div>

                        <div className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Orden
                        </div>
                        <button className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50 text-left text-gray-700">
                            <span>Por último mensaje</span>
                        </button>
                        <button className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50 text-left text-gray-700">
                            <span>Por último evento</span>
                        </button>
                        <button className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50 text-left text-blue-600 bg-blue-50">
                            <span>Por fecha de creación</span>
                            <span className="ml-auto">↓</span>
                        </button>
                        <button className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50 text-left text-gray-700">
                            <span>Por nombre</span>
                        </button>
                        <button className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50 text-left text-gray-700">
                            <span>Por venta</span>
                        </button>

                        <div className="my-1 border-t border-gray-100"></div>

                        <button className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50 text-left text-gray-700">
                            <span>Actualización automática</span>
                            <span className="ml-auto text-blue-600">✓</span>
                        </button>
                    </div>
                }
            />

            {isLoading ? (
                <div className="flex items-center justify-center h-[calc(100vh-180px)]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <>
                    <DndContext
                        sensors={sensors}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="px-4 flex gap-4 overflow-x-auto pb-8 h-[calc(100vh-180px)]">
                            {columns.map((col, index) => {
                                const colLeads = leads.filter(l => l.status === col.id || (col.id === 'new' && !['negotiation', 'proposal', 'closing'].includes(l.status)));

                                return (
                                    <div key={col.id} className="min-w-[280px] w-[280px] flex flex-col h-full">
                                        {/* Column Header */}
                                        <div className={`p-3 border-t-4 ${col.color} bg-white shadow-sm mb-4 rounded-b-md flex justify-between items-center`}>
                                            <span className="font-bold text-xs text-gray-700 uppercase">{col.title}</span>
                                            <span className="text-xs text-gray-400">{colLeads.length} leads</span>
                                        </div>

                                        <DroppableColumn id={col.id} className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                                            {/* Quick Add Form in Column - Only for first column */}
                                            {index === 0 && (
                                                showQuickAdd === col.id ? (
                                                    <QuickAddLeadForm
                                                        statusId={col.id}
                                                        onCancel={() => setShowQuickAdd(null)}
                                                        onSave={() => {
                                                            setShowQuickAdd(null);
                                                            fetchLeads();
                                                        }}
                                                    />
                                                ) : (
                                                    <div
                                                        onClick={() => setShowQuickAdd(col.id)}
                                                        className="p-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-xs text-center cursor-pointer hover:border-blue-300 hover:text-blue-400 transition-colors"
                                                    >
                                                        + Agregar lead rápido
                                                    </div>
                                                )
                                            )}

                                            {colLeads.map((lead) => (
                                                <DraggableLead
                                                    key={lead.id}
                                                    lead={lead}
                                                    onClick={(l) => {
                                                        setSelectedLead(l);
                                                        setIsDrawerOpen(true);
                                                    }}
                                                />
                                            ))}
                                        </DroppableColumn>
                                    </div>
                                );
                            })}
                        </div>

                        <DragOverlay>
                            {activeLead ? (
                                <Card className="p-4 cursor-grabbing border-blue-400 shadow-lg bg-white opacity-90 rotate-2">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-gray-800 text-sm leading-tight text-blue-600">
                                            {activeLead.name}
                                        </h4>
                                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div className="flex justify-between items-center mt-4">
                                        <span className="text-xs font-bold text-gray-900">C$ {activeLead.budget || 0}</span>
                                    </div>
                                </Card>
                            ) : null}
                        </DragOverlay>
                    </DndContext>

                    <PipelineSettingsModal
                        isOpen={isPipelineModalOpen}
                        onClose={() => setIsPipelineModalOpen(false)}
                        onSave={async (newColumns, templateName) => {
                            setColumns(newColumns);
                            try {
                                await pipelinesService.save(newColumns, templateName);
                                // Optional: fetchPipeline() again if we want to sync strictly
                            } catch (error) {
                                console.error('Failed to save pipeline', error);
                            }
                        }}
                        currentColumns={columns}
                    />

                    <LeadDrawer
                        isOpen={isDrawerOpen}
                        onClose={() => setIsDrawerOpen(false)}
                        onSave={fetchLeads}
                        lead={selectedLead}
                    />
                </>
            )}
        </div>
    );
}
