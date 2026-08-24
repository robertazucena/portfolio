import { useState } from "react";
import "./tokens.css";
import "./base.css";
import "./ToolsSection.css";

const ICONS = {
  personal: (
    <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.6" /><path d="M5 20c1.2-4 4-6 7-6s5.8 2 7 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
  ),
  connections: (
    <svg viewBox="0 0 24 24" fill="none"><circle cx="7" cy="7" r="2.4" stroke="currentColor" strokeWidth="1.6" /><circle cx="17" cy="7" r="2.4" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="17" r="2.4" stroke="currentColor" strokeWidth="1.6" /><path d="M9 8.5 10.5 15M15 8.5 13.5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
  ),
  journeys: (
    <svg viewBox="0 0 24 24" fill="none"><path d="M6 3v18M18 3v18M6 8h12M6 16h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
  ),
  time: (
    <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" /><path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  career: (
    <svg viewBox="0 0 24 24" fill="none"><rect x="4" y="8" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.6" /></svg>
  ),
};

const DEFAULT_TABS = ["My Grab", "My Team", "My Learning", "My Help", "My Procurement"];

/**
 * ToolsSection — the full-width band with a vertical tab rail, an
 * illustrative image, and a linked list of capabilities. Self-contained
 * tab state (`activeTab`) can be lifted by passing `activeTab`/`onTabChange`.
 *
 * @param {string} intro
 * @param {string[]} [tabs]
 * @param {string} [imageUrl]
 * @param {{icon: keyof typeof ICONS, title: string, desc: string, href?: string}[]} capabilities
 */
export default function ToolsSection({
  intro,
  tabs = DEFAULT_TABS,
  activeTab,
  onTabChange,
  imageUrl,
  capabilities = [],
}) {
  const [internalTab, setInternalTab] = useState(tabs[0]);
  const current = activeTab ?? internalTab;
  const setTab = onTabChange ?? setInternalTab;

  return (
    <section className="gp-tools">
      <div className="gp-shell">
        <p className="gp-tools__intro">{intro}</p>

        <div className="gp-tools__layout">
          <nav className="gp-tools__rail">
            {tabs.map((t) => (
              <button
                key={t}
                className={"gp-tools__rail-item" + (t === current ? " is-active" : "")}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </nav>

          {/* Mobile substitute for the tab rail: a native <select> keeps the
              same behavior (and accessibility) as the desktop tabs without
              needing a horizontally-scrolling row of buttons. */}
          <select
            className="gp-tools__rail-select"
            aria-label="Select a section"
            value={current}
            onChange={(e) => setTab(e.target.value)}
          >
            {tabs.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <div className="gp-tools__image">
            <img src={imageUrl} alt="Colleagues collaborating at a whiteboard" />
          </div>

          <div className="gp-tools__list">
            {capabilities.map((c) => (
              <a key={c.title} href={c.href || "#"} className="gp-capability">
                <span className="gp-capability__icon">{ICONS[c.icon]}</span>
                <span>
                  <p className="gp-capability__title">{c.title}</p>
                  <p className="gp-capability__desc">{c.desc}</p>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
