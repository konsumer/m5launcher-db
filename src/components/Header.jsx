export function Header({ user, authLoading, onLogin, onLogout, onSubmit }) {
  return (
    <header className="navbar bg-base-200 shadow-md px-4 gap-2">
      <div className="flex-1 gap-3">
        <span className="text-2xl font-bold tracking-tight text-primary pr-4">Launcher App Database</span>
        <span className="text-base-content/50 hidden sm:inline text-sm">Community-maintained firmware apps for many ESP32 devices. Browse, download, and submit your own.</span>
      </div>

      <div className="flex-none gap-2">
        {user ? (
          <>
            <button className="btn btn-primary btn-sm" onClick={onSubmit}>+ Submit App</button>
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className="w-8 rounded-full">
                  <img src={user.avatar_url} alt={user.login} />
                </div>
              </label>
              <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-200 rounded-box w-52">
                <li className="menu-title text-xs opacity-60 px-2 pb-1">{user.name ?? user.login}</li>
                <li><a onClick={onLogout} className="text-error cursor-pointer">Logout</a></li>
              </ul>
            </div>
          </>
        ) : (
          <button className="btn btn-ghost btn-sm gap-2" onClick={onLogin} disabled={authLoading}>
            {authLoading ? <span className="loading loading-spinner loading-xs" /> : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            )}
            Login with GitHub
          </button>
        )}
      </div>
    </header>
  )
}
