import React from 'react';
import { cn } from '@/lib/utils'; // We need a utils file for cn

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        const variants = {
            primary: 'bg-primary text-white hover:bg-primary-dark shadow-sm',
            secondary: 'bg-secondary text-white hover:bg-secondary-dark',
            outline: 'border-2 border-primary text-primary hover:bg-primary/5',
            ghost: 'hover:bg-gray-100 text-gray-700',
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-6 py-2.5 text-base',
            lg: 'px-8 py-3.5 text-lg',
        };

        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center rounded-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

export default Button;
