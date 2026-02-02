import React from 'react';
import './Button.css';

/**
 * Reusable Button Component
 * @param {string} children - Button text/content
 * @param {string} variant - 'primary', 'secondary', 'outline', 'ghost', 'destructive'
 * @param {string} size - 'sm', 'md', 'lg'
 * @param {boolean} isLoading - Shows loading spinner
 * @param {boolean} fullWidth - 100% width
 * @param {object} props - Other standard button props (onClick, disabled, type, etc.)
 */
const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    className = '',
    disabled,
    ...props
}) => {
    const baseClass = 'btn';
    const classes = [
        baseClass,
        `btn-${variant}`,
        `btn-${size}`,
        fullWidth ? 'btn-full' : '',
        isLoading ? 'btn-loading' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            className={classes}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <span className="spinner-sm" aria-hidden="true"></span>}
            {children}
        </button>
    );
};

export default Button;
