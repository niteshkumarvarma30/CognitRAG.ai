'use client';

const colorMap = {
  primary: 'cr-badge--primary',
  violet:  'cr-badge--violet',
  success: 'cr-badge--success',
  warning: 'cr-badge--warning',
  error:   'cr-badge--error',
  info:    'cr-badge--info',
  neutral: 'cr-badge--neutral',
};

const sizeMap = {
  sm: 'cr-badge--sm',
  md: 'cr-badge--md',
  lg: 'cr-badge--lg',
};

export default function Badge({
  children,
  color = 'neutral',
  size = 'md',
  dot = false,
  icon: Icon,
  className = '',
}) {
  return (
    <span className={`cr-badge ${colorMap[color]} ${sizeMap[size]} ${className}`}>
      {dot && <span className="cr-badge__dot" />}
      {Icon && <Icon size={size === 'sm' ? 10 : 12} />}
      {children}
    </span>
  );
}

/** Confidence-specific badge with predefined color mapping */
export function ConfidenceBadge({ level }) {
  const config = {
    high:          { color: 'success', label: 'High Confidence' },
    moderate:      { color: 'info',    label: 'Moderate Confidence' },
    low:           { color: 'warning', label: 'Low Confidence' },
    conflicting:   { color: 'error',   label: 'Conflicting Sources' },
    insufficient:  { color: 'neutral', label: 'Insufficient Evidence' },
  };

  const { color, label } = config[level] || config.moderate;
  return <Badge color={color} dot>{label}</Badge>;
}

/** Status badge for integration/sync states */
export function StatusBadge({ status }) {
  const config = {
    healthy:     { color: 'success', label: 'Healthy' },
    syncing:     { color: 'info',    label: 'Syncing' },
    error:       { color: 'error',   label: 'Error' },
    paused:      { color: 'warning', label: 'Paused' },
    disconnected:{ color: 'neutral', label: 'Disconnected' },
  };

  const { color, label } = config[status] || config.disconnected;
  return <Badge color={color} dot size="sm">{label}</Badge>;
}
