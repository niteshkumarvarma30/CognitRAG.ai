'use client';

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  className = '',
  onClick,
  ...props
}) {
  const variants = {
    default: 'cr-card',
    soft: 'cr-card cr-card--soft',
    dark: 'cr-card cr-card--dark',
    outline: 'cr-card cr-card--outline',
  };

  const paddings = {
    none: '',
    sm: 'cr-card--pad-sm',
    md: 'cr-card--pad-md',
    lg: 'cr-card--pad-lg',
  };

  return (
    <div
      className={`${variants[variant]} ${paddings[padding]} ${hover ? 'cr-card--hover' : ''} ${onClick ? 'cr-card--clickable' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`cr-card__header ${className}`}>{children}</div>;
}

export function CardBody({ children, className = '' }) {
  return <div className={`cr-card__body ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return <div className={`cr-card__footer ${className}`}>{children}</div>;
}
