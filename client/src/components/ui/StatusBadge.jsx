export default function StatusBadge({ type }) {
  const isLost = type === 'lost';
  return (
    <span className={isLost ? 'badge-lost' : 'badge-found'}>
      {isLost ? 'LOST' : 'FOUND'}
    </span>
  );
}
