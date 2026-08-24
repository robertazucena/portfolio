import "./tokens.css";
import "./base.css";
import "./TodoPanel.css";

const Chevron = () => (
  <svg className="gp-todo__chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * TodoPanel — "Your to-dos" card. Pass a list of items; each item's
 * `tone` ("reminder" | "alert") controls the tag color and hover state.
 *
 * @param {{tone: "reminder"|"alert", tag: string, text: string, href?: string}[]} items
 * @param {() => void} [onViewAll]
 */
export default function TodoPanel({ items = [], onViewAll }) {
  return (
    <aside className="gp-card gp-todo">
      <div className="gp-todo__head">
        <h3>Your to-dos</h3>
        <a href="#" className="gp-link" onClick={onViewAll}>
          View all
        </a>
      </div>
      <ul className="gp-todo__list">
        {items.map((item, i) => (
          <li key={i}>
            <a
              href={item.href || "#"}
              className={
                "gp-todo__item" +
                (item.tone === "alert" ? " gp-todo__item--alert" : "")
              }
            >
              <span className="gp-todo__body">
                <span className="gp-todo__tag">{item.tag}</span>
                <span className="gp-todo__text">{item.text}</span>
              </span>
              <Chevron />
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
