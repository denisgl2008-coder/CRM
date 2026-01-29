import { Card } from '@/components/ui/Card';
import { CheckCircle2, Circle, MessageSquare, Bot, DollarSign } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="grid grid-cols-12 gap-6">
            {/* Left Column (Suggestions/Promos) */}
            <div className="col-span-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <Card className="p-6 bg-white hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Conectar WhatsApp</h3>
                                <p className="text-sm text-gray-500">Enlaces útiles para integración</p>
                            </div>
                            <MessageSquare className="text-green-500 w-8 h-8" />
                        </div>
                    </Card>
                    <Card className="p-6 bg-white hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Reserva una demo 1:1</h3>
                                <p className="text-sm text-gray-500">Encuentra integración</p>
                            </div>
                            <div className="bg-lime-100 p-2 rounded-full">
                                <span className="text-xl">📅</span>
                            </div>
                        </div>
                    </Card>
                </div>

                <Card className="p-8 bg-blue-50 border-none">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Tutoriales de inicio</h2>
                    <div className="grid grid-cols-3 gap-8 text-center">
                        <div className="flex flex-col items-center gap-2 cursor-pointer group">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                <Bot className="w-8 h-8 text-blue-500" />
                            </div>
                            <span className="font-medium text-gray-700">Salesbot</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 cursor-pointer group">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                <MessageSquare className="w-8 h-8 text-blue-500" />
                            </div>
                            <span className="font-medium text-gray-700">Inbox</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 cursor-pointer group">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                <DollarSign className="w-8 h-8 text-blue-500" />
                            </div>
                            <span className="font-medium text-gray-700">Leads</span>
                        </div>
                    </div>
                </Card>

                {/* Space info card matching screenshot */}
                <Card className="p-6 flex justify-between items-center">
                    <div className="flex gap-8 text-sm">
                        <div>
                            <span className="block text-gray-400">Leads</span>
                            <span className="font-bold">Ilimitado</span>
                        </div>
                        <div>
                            <span className="block text-gray-400">Usuarios</span>
                            <span className="font-bold">Ilimitado</span>
                        </div>
                        <div>
                            <span className="block text-gray-400">Contactos & Empresas</span>
                            <span className="font-bold">Ilimitado</span>
                        </div>
                        <div>
                            <span className="block text-gray-400">Espacio en disco</span>
                            <span className="font-bold">0 / 10 GB</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Right Column (Checklist) */}
            <div className="col-span-4 space-y-6">
                <Card className="bg-white">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900">Checklist de inicio rápido</h3>
                        <span className="text-blue-500 font-medium">14%</span>
                    </div>
                    <div className="p-2">
                        <ChecklistItem completed label="Conoce Kommo" />
                        <ChecklistItem label="¡Sujétate! acompáñanos en este salvaje viaje" />
                        <ChecklistItem label="Conecta apps de chat" />
                        <ChecklistItem label="Configurar tu agente de IA" />
                        <ChecklistItem label="Gana tiempo con plantillas" />
                        <ChecklistItem label="Potencia tu chat" />
                        <ChecklistItem label="Crea un flujo de trabajo" />
                    </div>
                </Card>
            </div>
        </div>
    );
}

function ChecklistItem({ label, completed = false }: { label: string; completed?: boolean }) {
    return (
        <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors text-sm">
            {completed ? (
                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
            ) : (
                <Circle className="w-5 h-5 text-gray-300 shrink-0" />
            )}
            <span className={completed ? 'text-gray-900' : 'text-gray-600'}>{label}</span>
        </div>
    )
}
