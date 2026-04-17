export function AppCard({ app, onDelete, onEdit, isOwner }) {
  return (
    <div className="card bg-base-200 shadow-xl overflow-hidden">
      {app.cover && (
        <figure className="h-40 overflow-hidden bg-base-300">
          <img
            src={app.cover}
            alt={`${app.name} cover`}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        </figure>
      )}
      <div className="card-body p-4 gap-2">
        <div className="flex items-start justify-between gap-2">
          <h2 className="card-title text-base leading-snug">{app.name}</h2>
          {app.github && (
            <a href={app.github} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-xs btn-circle shrink-0" title="View on GitHub">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </a>
          )}
        </div>

        <p className="text-sm text-base-content/70 line-clamp-3">{app.description}</p>

        <div className="text-xs text-base-content/50">
          by <span className="text-secondary font-medium">@{app.author}</span>
        </div>

        {app.versions.length > 0 && (
          <div tabIndex={0} className="collapse bg-base-300 border-base-300 border mt-1">
            <div className="collapse-title text-xs font-semibold py-2 min-h-0">
              Downloads ({app.versions.length})
            </div>
            <div className="collapse-content">
              <div className="flex flex-wrap gap-1 pt-1">
                {app.versions.map((v) => {
                  const label = app.category && app.category !== v.version
                    ? `${app.category} / ${v.version}`
                    : v.version
                  return (
                    <a key={v.version} href={v.file} className="btn btn-outline btn-primary btn-xs gap-1" title={`Published ${v.published_at}`}>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                      </svg>
                      {label}
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {isOwner && (
          <div className="card-actions justify-end mt-1 gap-1">
            {onEdit && <button className="btn btn-ghost btn-xs" onClick={() => onEdit(app)}>Edit</button>}
            {onDelete && <button className="btn btn-ghost btn-xs text-error" onClick={() => onDelete(app.name)}>Delete</button>}
          </div>
        )}
      </div>
    </div>
  )
}
