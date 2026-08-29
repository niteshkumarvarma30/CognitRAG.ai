'use client';

import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  hint,
  icon: Icon,
  iconRight: IconRight,
  size = 'md',
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`cr-input-wrapper ${error ? 'cr-input-wrapper--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="cr-input__label">
          {label}
        </label>
      )}
      <div className={`cr-input__container cr-input__container--${size}`}>
        {Icon && (
          <span className="cr-input__icon cr-input__icon--left">
            <Icon size={16} />
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`cr-input ${Icon ? 'cr-input--has-icon-left' : ''} ${IconRight ? 'cr-input--has-icon-right' : ''}`}
          {...props}
        />
        {IconRight && (
          <span className="cr-input__icon cr-input__icon--right">
            <IconRight size={16} />
          </span>
        )}
      </div>
      {error && <span className="cr-input__error">{error}</span>}
      {hint && !error && <span className="cr-input__hint">{hint}</span>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
