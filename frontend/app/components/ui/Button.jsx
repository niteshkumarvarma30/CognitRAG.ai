'use client';

import { forwardRef } from 'react';

const variants = {
  primary: 'cr-btn cr-btn--primary',
  secondary: 'cr-btn cr-btn--secondary',
  ghost: 'cr-btn cr-btn--ghost',
  danger: 'cr-btn cr-btn--danger',
};

const sizes = {
  sm: 'cr-btn--sm',
  md: 'cr-btn--md',
  lg: 'cr-btn--lg',
};

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      className={`${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="cr-btn__spinner" aria-label="Loading">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" opacity="0.25" />
            <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" from="0 8 8" to="360 8 8" dur="0.8s" repeatCount="indefinite" />
            </path>
          </svg>
        </span>
      )}
      {!loading && Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
      {children && <span>{children}</span>}
      {IconRight && <IconRight size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
