import { Construction } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

export default function ComingSoonPage({ title }: { title?: string }) {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-surface rounded-2xl shadow-soft border border-gray-100">
            <div className="bg-blue-50 p-6 rounded-full mb-6">
                <Construction className="w-16 h-16 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{title || 'En Construcción'}</h1>
            <p className="text-gray-500 max-w-md mb-8">
                Estamos trabajando duro para traerte esta funcionalidad.
                ¡Pronto podrás ver análisis detallados y reportes aquí!
            </p>
            <Button onClick={() => navigate(-1)} variant="outline">
                Volver atrás
            </Button>
        </div>
    );
}
