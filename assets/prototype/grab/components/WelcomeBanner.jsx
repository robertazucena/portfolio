import "./tokens.css";
import "./base.css";
import "./WelcomeBanner.css";

// Brand icon art — pre-rendered mint-circle badges (see assets/icons/).
// Swap these imports for your own asset pipeline (bundler import,
// CDN URL, whatever "./assets/icons/*.webp" resolves to for you).
const DEFAULT_ACTIONS = [
  { label: "My activity", icon: "./assets/icons/my-activity.webp" },
  { label: "Timesheets", icon: "./assets/icons/timesheets.webp" },
  { label: "Payslips", icon: "./assets/icons/payslips.webp" },
  { label: "Connections", icon: "./assets/icons/connections.webp" },
  { label: "Leave", icon: "./assets/icons/leave.webp" },
  { label: "Skill Center", icon: "./assets/icons/skill-center.webp" },
];

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4 16.5V20h3.5L18.4 9.1a1.5 1.5 0 0 0 0-2.1l-1.4-1.4a1.5 1.5 0 0 0-2.1 0L4 16.5Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * WelcomeBanner — greeting card with the "top actions" shortcut grid,
 * paired with the hero image/caption. Renders the left two-thirds of
 * the Home page's top strip; place a <TodoPanel> alongside it.
 *
 * Sizes are matched to the approved visual: 304px card, 52px icon
 * badges clipped to a circle (the artwork already bakes in its own
 * mint-green circle on a white square canvas), 11.5px nowrap labels.
 *
 * @param {string} name — first name for the greeting
 * @param {{label: string, icon: string, href?: string}[]} [actions] — `icon` is an image src
 * @param {{imageUrl: string, eyebrow: string, title: string}} hero
 */
export default function WelcomeBanner({
  name,
  actions = DEFAULT_ACTIONS,
  hero,
  onEdit,
}) {
  return (
    <div className="gp-welcome">
      <div className="gp-card gp-welcome__card">
        <p className="gp-welcome__greeting">
          Welcome back,
          <br />
          <strong>{name}!</strong>
        </p>

        <div>
          <div className="gp-welcome__actions-head">
            My top actions
            <a href="#" className="gp-link" onClick={onEdit}>
              <EditIcon />
              Edit
            </a>
          </div>
          <div className="gp-welcome__actions">
            {actions.map((a) => (
              <a key={a.label} href={a.href || "#"} className="gp-action">
                <span className="gp-action__icon">
                  <img src={a.icon} alt="" />
                </span>
                {a.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="gp-welcome__hero">
        <img className="gp-welcome__hero-photo" src={hero?.imageUrl} alt="" />
        <div className="gp-welcome__hero-scrim" />
        <div className="gp-welcome__hero-copy">
          <span className="gp-welcome__hero-eyebrow">{hero?.eyebrow}</span>
          <h3 className="gp-welcome__hero-title">{hero?.title}</h3>
        </div>
      </div>
    </div>
  );
}
