import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={cn(
                        'w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white/50 focus:bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                        error && 'border-red-500 focus:ring-red-200 focus:border-red-500',
                        className
                    )}
                    {...props}
                />
                {error && <p className="mt-1 text-sm text-red-500 ml-1">{error}</p>}
            </div>
        );
    }
);
Input.displayName = 'Input';
