import { Link } from 'react-router-dom';

export default function FeedbackState({
  emoji = 'ℹ️',
  title,
  description = '',
  primaryAction,
  secondaryAction,
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center">
      <div className="text-4xl mb-3" aria-hidden="true">{emoji}</div>
      <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
      {description && <p className="text-sm text-neutral-500 mt-1">{description}</p>}
      {(primaryAction || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {primaryAction && (
            primaryAction.to ? (
              <Link to={primaryAction.to} className="btn-primary">
                {primaryAction.label}
              </Link>
            ) : (
              <button type="button" onClick={primaryAction.onClick} className="btn-primary">
                {primaryAction.label}
              </button>
            )
          )}
          {secondaryAction && (
            secondaryAction.to ? (
              <Link to={secondaryAction.to} className="btn-outline">
                {secondaryAction.label}
              </Link>
            ) : (
              <button type="button" onClick={secondaryAction.onClick} className="btn-outline">
                {secondaryAction.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
