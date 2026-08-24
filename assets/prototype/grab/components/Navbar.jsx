import "./tokens.css";
import "./base.css";
import "./Navbar.css";

const GRAB_LOGO = "./assets/logo/grab-logo.png";

/**
 * Navbar — top site navigation for the Grab Heroes Portal.
 *
 * Reusable across every page of the portal (Home, Analytics, My Team,
 * Resources, ...). Pass the current page's menu items with one flagged
 * `active`, and the signed-in user's identity.
 *
 * @param {{label: string, active?: boolean, hasChildren?: boolean, href?: string}[]} items
 * @param {{name: string, avatarUrl?: string, notifications?: number}} user
 * @param {boolean} [showMenuButton=true] — show the green "Menu" pill (site nav)
 *   vs. a plain bell icon (app-shell pages like Analytics/My Team/Resources).
 * @param {() => void} [onMenuClick]
 */
export default function Navbar({
  items = [],
  user = { name: "" },
  showMenuButton = true,
  onMenuClick,
}) {
  return (
    <header className="gp-navbar">
      <div className="gp-shell gp-navbar__inner">
        <img className="gp-navbar__logo" src={GRAB_LOGO} alt="Grab" />

        <ul className="gp-navbar__menu">
          {items.map((item) => (
            <li key={item.label}>
              <a
                href={item.href || "#"}
                className={
                  "gp-navbar__item" +
                  (item.active ? " gp-navbar__item--active" : "")
                }
              >
                {item.label}
                {item.hasChildren && (
                  <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path
                      d="M3 4.5 6 7.5 9 4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </a>
            </li>
          ))}
        </ul>

        <div className="gp-navbar__right">
          {!showMenuButton && (
            <button className="gp-navbar__bell" aria-label="Notifications">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.7 21a2 2 0 0 1-3.4 0"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              {!!user.notifications && (
                <span className="gp-badge">{user.notifications}</span>
              )}
            </button>
          )}

          <div className="gp-navbar__user">
            <img
              className="gp-navbar__avatar"
              src={user.avatarUrl}
              alt=""
              aria-hidden="true"
            />
            <div className="gp-navbar__user-meta">
              <span className="gp-navbar__user-name">{user.name}</span>
              {user.role && (
                <span className="gp-navbar__user-role">{user.role}</span>
              )}
            </div>
            {showMenuButton && !!user.notifications && (
              <span className="gp-badge">{user.notifications}</span>
            )}
          </div>

          {showMenuButton && (
            <button className="gp-navbar__menu-btn" onClick={onMenuClick}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Menu
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
