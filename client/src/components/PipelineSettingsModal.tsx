
import { Button } from '@/components/ui/Button';
import { GripVertical, Plus, Trash2, Edit2, RotateCcw } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type ColumnDef = {
    id: string;
    title: string;
    color: string;
    bgColor: string;
};

interface PipelineSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (columns: ColumnDef[], templateName: string) => void;
    currentColumns: ColumnDef[];
}

const COLORS = [
    { name: 'Blue', color: 'border-blue-400', bgColor: 'bg-blue-50', dot: 'bg-blue-400' },
    { name: 'Yellow', color: 'border-yellow-400', bgColor: 'bg-yellow-50', dot: 'bg-yellow-400' },
    { name: 'Orange', color: 'border-orange-400', bgColor: 'bg-orange-50', dot: 'bg-orange-400' },
    { name: 'Purple', color: 'border-purple-400', bgColor: 'bg-purple-50', dot: 'bg-purple-400' },
    { name: 'Green', color: 'border-green-400', bgColor: 'bg-green-50', dot: 'bg-green-400' },
    { name: 'Red', color: 'border-red-400', bgColor: 'bg-red-50', dot: 'bg-red-400' },
    { name: 'Gray', color: 'border-gray-400', bgColor: 'bg-gray-50', dot: 'bg-gray-400' },
    { name: 'Pink', color: 'border-pink-400', bgColor: 'bg-pink-50', dot: 'bg-pink-400' },
];

const TEMPLATES = {
    'Personalizado': {
        stages: [],
        closing: { won: 'Cerrar-ganar', lost: 'Cerrar-perder' }
    },
    'Tienda online': {
        stages: [
            { id: 'contacted', title: 'Contactado', color: 'border-blue-400', bgColor: 'bg-blue-50' },
            { id: 'new_inquiry', title: 'Nueva consulta', color: 'border-yellow-400', bgColor: 'bg-yellow-50' },
            { id: 'invoice_sent', title: 'Factura enviada', color: 'border-orange-400', bgColor: 'bg-orange-50' },
            { id: 'ready_to_ship', title: 'Listo para el envío', color: 'border-purple-400', bgColor: 'bg-purple-50' },
            { id: 'delivered', title: 'Entregado', color: 'border-blue-300', bgColor: 'bg-blue-50' },
        ],
        closing: { won: 'Pedido completado', lost: 'Pedido abandonado' }
    },
    'Consultoria': {
        stages: [
            { id: 'contacted', title: 'Contactado', color: 'border-blue-400', bgColor: 'bg-blue-50' },
            { id: 'qualify', title: 'Calificar', color: 'border-yellow-200', bgColor: 'bg-yellow-50' },
            { id: 'nurture', title: 'Nutrir', color: 'border-orange-400', bgColor: 'bg-orange-50' },
            { id: 'present', title: 'Presentar', color: 'border-purple-400', bgColor: 'bg-purple-50' },
            { id: 'negotiate', title: 'Negociar', color: 'border-blue-200', bgColor: 'bg-blue-50' },
            { id: 'invoice_sent', title: 'Factura enviada', color: 'border-green-400', bgColor: 'bg-green-50' },
        ],
        closing: { won: 'Cerrar-ganar', lost: 'Cerrar-perder' }
    },
    'Servicios': {
        stages: [
            { id: 'contacted', title: 'Contactado', color: 'border-blue-400', bgColor: 'bg-blue-50' },
            { id: 'processed', title: 'Solicitud procesada', color: 'border-yellow-400', bgColor: 'bg-yellow-50' },
            { id: 'reserved', title: 'Servicio reservado', color: 'border-orange-400', bgColor: 'bg-orange-50' },
            { id: 'assigned', title: 'Especialista asignado', color: 'border-purple-400', bgColor: 'bg-purple-50' },
            { id: 'invoice_sent', title: 'Factura enviada', color: 'border-blue-300', bgColor: 'bg-blue-50' },
        ],
        closing: { won: 'Servicio prestado', lost: 'Cancelado' }
    },
    'Marketing': {
        stages: [
            { id: 'qualify', title: 'Calificar', color: 'border-blue-400', bgColor: 'bg-blue-50' },
            { id: 'booked_call', title: 'Llamada reservada', color: 'border-yellow-200', bgColor: 'bg-yellow-50' },
            { id: 'proposal_prep', title: 'Preparación de la propuesta', color: 'border-orange-400', bgColor: 'bg-orange-50' },
            { id: 'proposal_sent', title: 'Envío de la propuesta', color: 'border-purple-400', bgColor: 'bg-purple-50' },
            { id: 'follow_up', title: 'Seguimiento', color: 'border-blue-200', bgColor: 'bg-blue-50' },
            { id: 'invoice_sent', title: 'Factura enviada', color: 'border-green-400', bgColor: 'bg-green-50' },
        ],
        closing: { won: 'Cerrar-ganar', lost: 'Cerrar-perder' }
    },
    'Agencia de viajes': {
        stages: [
            { id: 'contacted', title: 'Contactado', color: 'border-blue-400', bgColor: 'bg-blue-50' },
            { id: 'processed', title: 'Solicitud procesada', color: 'border-yellow-400', bgColor: 'bg-yellow-50' },
            { id: 'itinerary_sent', title: 'Envío del itinerario', color: 'border-orange-400', bgColor: 'bg-orange-50' },
            { id: 'contract_sent', title: 'Envío del contrato', color: 'border-purple-400', bgColor: 'bg-purple-50' },
            { id: 'invoice_sent', title: 'Factura enviada', color: 'border-blue-300', bgColor: 'bg-blue-50' },
        ],
        closing: { won: 'Pagado', lost: 'Cancelado' }
    }
};

interface SortableStageItemProps {
    stage: ColumnDef;
    onDelete: (id: string) => void;
    onUpdate: (id: string, updates: Partial<ColumnDef>) => void;
}

function SortableStageItem({ stage, onDelete, onUpdate }: SortableStageItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: stage.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(stage.title);
    const [showColorPicker, setShowColorPicker] = useState(false);

    useEffect(() => {
        setTitle(stage.title);
    }, [stage.title]);

    const handleTitleSave = () => {
        if (title.trim()) {
            onUpdate(stage.id, { title });
        } else {
            setTitle(stage.title);
        }
        setIsEditing(false);
    };

    return (
        <div ref={setNodeRef} style={style} className={`p-2 rounded border-l-4 ${stage.color} ${stage.bgColor} flex items-center gap-3 group relative shadow-sm mb-2 transition-all hover:shadow-md`}>
            {/* Drag Handle */}
            <div {...attributes} {...listeners} className="text-gray-500/70 cursor-grab hover:text-gray-700 p-1">
                <GripVertical size={16} />
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center gap-2">
                {/* Color Picker Trigger */}
                <div className="relative">
                    <button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="p-1 hover:bg-white/50 rounded-full text-gray-500 hover:text-gray-800 transition-colors"
                        title="Cambiar color"
                    >
                        <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center bg-white shadow-sm">
                            <div className={`w-2 h-2 rounded-full ${stage.color.replace('border-', 'bg-')}`}></div>
                        </div>
                    </button>

                    {/* Color Picker Dropdown */}
                    {showColorPicker && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowColorPicker(false)}></div>
                            <div className="absolute top-full left-0 mt-2 p-2 bg-white rounded-lg shadow-xl border border-gray-100 z-20 grid grid-cols-4 gap-2 w-48 animate-in fade-in zoom-in-95 duration-150">
                                {COLORS.map((c) => (
                                    <button
                                        key={c.name}
                                        onClick={() => {
                                            onUpdate(stage.id, { color: c.color, bgColor: c.bgColor });
                                            setShowColorPicker(false);
                                        }}
                                        className={`w-8 h-8 rounded-full ${c.dot} hover:ring-2 hover:ring-offset-1 hover:ring-gray-300 transition-all ${stage.color === c.color ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
                                        title={c.name}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Title Editable */}
                {isEditing ? (
                    <input
                        autoFocus
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleTitleSave}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleTitleSave();
                            if (e.key === 'Escape') {
                                setIsEditing(false);
                                setTitle(stage.title);
                            }
                        }}
                        className="flex-1 bg-white/60 border border-blue-400 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                ) : (
                    <span
                        className="font-medium text-gray-800 flex-1 cursor-pointer hover:text-blue-700 hover:bg-white/40 px-2 py-1 rounded transition-colors"
                        onClick={() => setIsEditing(true)}
                    >
                        {stage.title}
                    </span>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 hover:bg-white/60 hover:shadow-sm rounded text-gray-500 hover:text-blue-600 transition-colors"
                    title="Editar nombre"
                >
                    <Edit2 size={14} />
                </button>
                <button
                    onClick={() => onDelete(stage.id)}
                    className="p-1.5 hover:bg-white/60 hover:shadow-sm rounded text-gray-500 hover:text-red-600 transition-colors"
                    title="Eliminar etapa"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
}

export function PipelineSettingsModal({ isOpen, onClose, onSave, currentColumns }: PipelineSettingsModalProps) {
    const [selectedTemplate, setSelectedTemplate] = useState<string>('Personalizado');
    const [localStages, setLocalStages] = useState<ColumnDef[]>([]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Reset template selection when modal is closed
    useEffect(() => {
        if (!isOpen) {
            // Small delay to allow animation to finish if needed, or instant
            setSelectedTemplate('Personalizado');
        }
    }, [isOpen]);

    // Initialize/Update local stages based on template/open state
    useEffect(() => {
        if (!isOpen) return;

        if (selectedTemplate === 'Personalizado') {
            // When opening in Personalizado mode, load current columns
            setLocalStages(currentColumns);
        } else {
            // When switching to a template, load template stages
            const template = TEMPLATES[selectedTemplate as keyof typeof TEMPLATES];
            if (template) {
                setLocalStages([...template.stages]);
            }
        }
    }, [selectedTemplate, isOpen]); // removed currentColumns to avoid overwriting draft on unrelated parent updates

    if (!isOpen) return null;

    const closingStages = selectedTemplate === 'Personalizado'
        ? { won: 'Cerrar-ganar', lost: 'Cerrar-perder' }
        : TEMPLATES[selectedTemplate as keyof typeof TEMPLATES]?.closing;

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setLocalStages((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over?.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleAddStage = () => {
        const newStage: ColumnDef = {
            id: `new-stage-${Date.now()}`,
            title: 'Nuevo estado',
            color: 'border-gray-400',
            bgColor: 'bg-gray-50'
        };
        setLocalStages([...localStages, newStage]);
    };

    const handleDeleteStage = (id: string) => {
        setLocalStages(localStages.filter(s => s.id !== id));
    };

    const handleUpdateStage = (id: string, updates: Partial<ColumnDef>) => {
        setLocalStages(localStages.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const handleSave = () => {
        onSave(localStages, selectedTemplate);
        onClose();
    };

    const handleRestoreDefaults = () => {
        const template = TEMPLATES[selectedTemplate as keyof typeof TEMPLATES];
        if (template) {
            setLocalStages([...template.stages]);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl w-[900px] h-[600px] flex overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Sidebar */}
                <div className="w-64 bg-gray-50 border-r border-gray-100 flex flex-col">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800">Establece tu pipeline</h2>
                        <p className="text-xs text-gray-500 mt-1">Elige una plantilla prediseñada</p>
                    </div>
                    <div className="flex-1 overflow-y-auto py-2">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Plantillas</div>
                        {Object.keys(TEMPLATES).map(template => (
                            <button
                                key={template}
                                onClick={() => setSelectedTemplate(template)}
                                className={`w-full text-left px-6 py-3 text-sm flex items-center justify-between transition-colors ${selectedTemplate === template ? 'bg-white border-l-4 border-blue-500 font-medium text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100 border-l-4 border-transparent'
                                    }`}
                            >
                                {template}
                                {selectedTemplate === template && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col bg-white">
                    <div className="p-8 flex-1 overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{selectedTemplate}</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {selectedTemplate === 'Personalizado'
                                        ? 'Tu configuración actual.'
                                        : 'Esta plantilla estructura tu flujo de trabajo para este tipo de negocio.'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Leads entrantes</span>
                                <div className="w-10 h-5 bg-blue-500 rounded-full relative cursor-pointer">
                                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-200 p-3 rounded text-sm text-gray-700 font-medium mb-6">
                            Leads entrantes
                        </div>

                        <div className="mb-8">
                            <h4 className="text-sm font-medium text-gray-900 mb-4">Etapas activas</h4>

                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={localStages.map(s => s.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-2">
                                        {localStages.map((stage) => (
                                            <SortableStageItem
                                                key={stage.id}
                                                stage={stage}
                                                onDelete={handleDeleteStage}
                                                onUpdate={handleUpdateStage}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>

                            <div className="mt-3 flex gap-2">
                                <button
                                    onClick={handleAddStage}
                                    className="flex-1 py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                >
                                    <Plus size={16} />
                                    Agregar etapa
                                </button>

                                {selectedTemplate !== 'Personalizado' && (
                                    <button
                                        onClick={handleRestoreDefaults}
                                        className="px-4 py-2 border border-gray-200 rounded text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                        title="Restaurar a la configuración original de la plantilla"
                                    >
                                        <RotateCcw size={14} />
                                        Restaurar
                                    </button>
                                )}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-4">Etapas de cierre</h4>
                            <div className="space-y-3">
                                <div className="p-3 rounded bg-green-100 border-l-4 border-green-500 font-medium text-green-800">
                                    {closingStages?.won || 'Cerrar-ganar'}
                                </div>
                                <div className="p-3 rounded bg-gray-100 border-l-4 border-gray-400 font-medium text-gray-600">
                                    {closingStages?.lost || 'Cerrar-perder'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                        <Button variant="ghost" onClick={onClose} className="text-gray-600">Cancelar</Button>
                        <Button onClick={handleSave} className="px-6">Guardar</Button>
                    </div>
                </div>

            </div>
        </div>
    );
}
