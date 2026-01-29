import { useState, useEffect, useRef } from 'react';
import { Pencil } from 'lucide-react';

interface EditableCellProps {
    value: string;
    onSave: (newValue: string) => Promise<void>;
    onClickText: () => void;
    placeholder?: string;
    type?: 'text' | 'email' | 'tel';
}

export function EditableCell({ value, onSave, onClickText, placeholder = '...', type = 'text' }: EditableCellProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setTempValue(value);
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSave = async () => {
        if (tempValue !== value) {
            await onSave(tempValue);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setTempValue(value);
            setIsEditing(false);
        }
    };

    if (isEditing) {
        return (
            <div className="flex items-center w-full">
                <input
                    ref={inputRef}
                    type={type}
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-white border border-blue-400 rounded px-2 py-1 text-sm outline-none shadow-sm"
                />
            </div>
        );
    }

    return (
        <div
            className="group flex items-center justify-between gap-2 min-w-[100px] h-8"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <span
                onClick={onClickText}
                className={`truncate cursor-pointer hover:text-blue-600 ${!value ? 'text-gray-400 italic' : 'text-gray-700'}`}
                title={value}
            >
                {value || placeholder}
            </span>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                }}
                className={`text-gray-400 hover:text-blue-500 p-1 rounded hover:bg-gray-100 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            >
                <Pencil size={12} />
            </button>
        </div>
    );
}
