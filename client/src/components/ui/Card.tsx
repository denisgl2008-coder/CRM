import React from 'react';
import { cn } from '@/lib/utils';

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'bg-surface rounded-2xl shadow-soft border border-gray-100 p-6',
                    className
                )}
                {...props}
            />
        );
    }
);
Card.displayName = 'Card';
