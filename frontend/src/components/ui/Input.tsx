import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, required, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="ui-field">
        {label && (
          <label htmlFor={inputId} className="ui-field-label">
            {label}
            {required && <span className="ui-required-mark">*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          required={required}
          className={`ui-control${error ? ' has-error' : ''} ${className}`}
          {...props}
        />
        {error && <p className="ui-field-error">{error}</p>}
        {helperText && !error && <p className="ui-field-helper">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, required, options, children, className = '', id, ...props }, ref) => {
    const selectId = id || props.name;

    return (
      <div className="ui-field">
        {label && (
          <label htmlFor={selectId} className="ui-field-label">
            {label}
            {required && <span className="ui-required-mark">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          required={required}
          className={`ui-control${error ? ' has-error' : ''} ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <p className="ui-field-error">{error}</p>}
        {helperText && !error && <p className="ui-field-helper">{helperText}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
