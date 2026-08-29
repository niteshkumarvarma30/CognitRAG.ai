'use client';

/** Skeleton placeholder — animated loading shimmer */
export default function Skeleton({
  width,
  height = '16px',
  borderRadius = 'var(--radius-md)',
  className = '',
  variant = 'text',
}) {
  const variants = {
    text:    { width: width || '100%', height },
    circle:  { width: width || '40px', height: width || '40px', borderRadius: '50%' },
    card:    { width: width || '100%', height: height || '120px', borderRadius: 'var(--radius-xl)' },
    avatar:  { width: '32px', height: '32px', borderRadius: '50%' },
  };

  const style = variants[variant] || variants.text;

  return (
    <div
      className={`cr-skeleton ${className}`}
      aria-hidden="true"
      style={{
        ...style,
        borderRadius: variant === 'text' || variant === 'card' ? borderRadius : style.borderRadius,
        background: 'linear-gradient(90deg, var(--border) 25%, rgba(233, 231, 240, 0.5) 50%, var(--border) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
      }}
    />
  );
}

/** Multiple skeleton lines for paragraph-like loading */
export function SkeletonLines({ lines = 3, gap = 'var(--space-3)' }) {
  const widths = ['100%', '92%', '78%', '85%', '65%'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} width={widths[i % widths.length]} height="14px" />
      ))}
    </div>
  );
}

/** Skeleton for metric card loading */
export function SkeletonCard() {
  return (
    <div style={{
      padding: 'var(--space-5)',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)',
    }}>
      <Skeleton width="60%" height="12px" />
      <div style={{ marginTop: 'var(--space-3)' }}>
        <Skeleton width="40%" height="28px" />
      </div>
    </div>
  );
}
