import "./tokens.css";
import "./base.css";
import "./NewsroomCarousel.css";

/**
 * NewsroomCarousel — featured story + up to three secondary headlines,
 * with the dot/arrow dial the Home page carousel uses beneath the
 * whole top strip (this component only renders the dial's markup;
 * wire `activeSlide`/`onPrev`/`onNext` to your own carousel state).
 *
 * @param {{eyebrow?: string, posted: string, title: string, imageUrl?: string, href?: string}} featured
 * @param {{posted: string, title: string, imageUrl?: string, href?: string}[]} stories
 * @param {number} [slideCount=3]
 * @param {number} [activeSlide=0]
 */
export default function NewsroomCarousel({
  featured,
  stories = [],
  slideCount = 3,
  activeSlide = 0,
  onPrev,
  onNext,
}) {
  return (
    <section className="gp-newsroom">
      <div className="gp-newsroom__header">
        <div className="gp-newsroom__heading-group">
          <h2>Newsroom</h2>
          <a href="#" className="gp-newsroom__viewall">
            View all
          </a>
        </div>
        <div className="gp-newsroom__dial">
          <button className="gp-newsroom__arrow" aria-label="Previous" onClick={onPrev}>
            <svg viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <div className="gp-newsroom__dots">
            {Array.from({ length: slideCount }).map((_, i) => (
              <span key={i} className={i === activeSlide ? "is-active" : ""} />
            ))}
          </div>
          <button className="gp-newsroom__arrow" aria-label="Next" onClick={onNext}>
            <svg viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>

      <div className="gp-newsroom__grid">
        <a href={featured?.href || "#"} className="gp-story--featured">
          <img className="gp-story--featured__art" src={featured?.imageUrl} alt="" />
          <div className="gp-story--featured__scrim" />
          <div className="gp-story--featured__body">
            <span className="gp-story__posted">Posted {featured?.posted}</span>
            <p className="gp-story--featured__title">{featured?.title}</p>
          </div>
        </a>

        <div className="gp-newsroom__side">
          {stories.map((s, i) => (
            <a key={i} href={s.href || "#"} className="gp-story--compact">
              <div className="gp-story--compact__art">
                <img src={s.imageUrl} alt="" />
              </div>
              <div>
                <p className="gp-story--compact__title">{s.title}</p>
                <span className="gp-story__posted gp-story--compact__posted">
                  Posted {s.posted}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
