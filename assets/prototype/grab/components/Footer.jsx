import "./tokens.css";
import "./base.css";
import "./Footer.css";

const GRAB_LOGO = "./assets/logo/grab-logo.png";
const SKYLINE = "./assets/footer/singapore-skyline.webp";

const DEFAULT_COLUMNS = [
  {
    heading: "About Grab",
    links: [
      "About Us",
      "Inside Grab",
      "Investor Relations",
      "Locations",
      "Grab Financial Group",
      "Compliance and Ethics",
      "Financial services",
      "Financial resources",
    ],
  },
  {
    heading: "News",
    links: [
      "What's New",
      "Newsroom",
      "People",
      "Business",
      "Tech & Product",
      "Consumers & Drivers",
      "Social Impact & Safety",
    ],
  },
  {
    heading: "Top Actions",
    links: ["Travel", "Expenses", "Connections", "My Help", "Self-Service Apps", "Procurement"],
  },
  {
    heading: "Social Impact",
    links: ["Sustainability", "Grab Stories", "Global Events", "GrabForGood Fund", "Food Blog"],
  },
  {
    heading: "Quick Links",
    links: ["Help Centre", "Developer Portal", "Open Positions", "Issues & Feedback"],
  },
];

/** The brand's Singapore skyline illustration, with a green baseline strip beneath it. */
function Skyline() {
  return (
    <>
      <img className="gp-footer__skyline" src={SKYLINE} alt="" />
      <div className="gp-footer__skyline-strip" />
    </>
  );
}

/**
 * Footer — sitemap columns + skyline + legal bar. Reused, unchanged,
 * on every page of the portal.
 *
 * @param {{heading: string, links: string[]}[]} [columns]
 * @param {string} [year]
 */
export default function Footer({ columns = DEFAULT_COLUMNS, year = "2010 - 2024" }) {
  return (
    <footer className="gp-footer">
      <div className="gp-shell gp-footer__top">
        <div>
          <img className="gp-footer__brand-logo" src={GRAB_LOGO} alt="Grab" />
          <p className="gp-footer__tagline">Forward Together</p>
          <p className="gp-footer__address">
            3 Media Close,
            <br />
            Singapore 138498
          </p>
        </div>

        {columns.map((col) => (
          <div className="gp-footer__col" key={col.heading}>
            <h4>{col.heading}</h4>
            <ul>
              {col.links.map((l) => (
                <li key={l}>
                  <a href="#">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Skyline />

      <div className="gp-shell gp-footer__legal">
        <div className="gp-footer__legal-left">
          <span>© Grab {year}</span>
          <span>Confidential - Grab Internal</span>
        </div>
        <div className="gp-footer__legal-right">
          <a href="#">Terms and Policies</a>
          <a href="#">Privacy Notice</a>
        </div>
      </div>
    </footer>
  );
}
