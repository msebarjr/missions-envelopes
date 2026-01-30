export default function EnvelopeIcon({
  size = 24,
  className = '',
  title = 'Envelope',
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox='0 0 24 24'
      aria-label={title}
      role='img'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <title>{title}</title>
      <path d='M3 8.5v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' />
      <path d='M21 8.5l-9 6-9-6' />
      <path d='M3 8.5L12 14l9-5.5' opacity='0.0' />
    </svg>
  );
}
