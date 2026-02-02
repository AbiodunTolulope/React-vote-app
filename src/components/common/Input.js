import React from 'react';
import './Input.css';

const Input = ({
    label,
    error,
    id,
    type = 'text',
    className = '',
    ...props
}) => {
    return (
        <div className={`input-group ${className}`}>
            {label && (
                <label htmlFor={id} className="input-label">
                    {label}
                </label>
            )}
            <input
                id={id}
                type={type}
                className={`input-field ${error ? 'input-error' : ''}`}
                {...props}
            />
            {error && <p className="input-error-msg">{error}</p>}
        </div>
    );
};

export default Input;
