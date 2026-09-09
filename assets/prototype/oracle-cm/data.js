// Shared "Customer Moments" data set.
// Illustration assets are the actual artwork exported from the Figma file.
const MOMENTS = [
  {
    id: 1,
    title: "Plan Your Season",
    type: "video",
    img: "assets/plan-your-season.jpg",
    badge: "SEASON KICKOFF",
    heading: "Here's to a season full of wins, Jordan!",
    message: "Wishing you a smooth, successful quarter ahead. Thank you for partnering with us.",
  },
  {
    id: 2,
    title: "Happy Diwali!",
    type: "simple",
    img: "assets/happy-diwali.jpg",
    art: "assets/happy-diwali.jpg",
    badge: "DIWALI SPECIAL",
    heading: "Wishing you an abundance of light & prosperity, Jordan!",
    message: "\u201cMay this festival of lights bring happiness, peace, and infinite success to you and your beautiful team this year.\u201d",
  },
  {
    id: 3,
    title: "Saint Patricks' Day!",
    type: "simple",
    img: "assets/st-pat-day.jpg",
    badge: "ST. PATRICK'S SPECIAL",
    heading: "Luck of the Irish to you, Jordan!",
    message: "\u201cWishing you a pot of gold and endless good fortune this St. Patrick's Day.\u201d",
  },
  {
    id: 4,
    title: "The Oracle AI Advantage",
    type: "video",
    img: "assets/oracle-ai-advantage.jpg",
    badge: "AI SPOTLIGHT",
    heading: "The future is already in motion, Jordan.",
    message: "Take a look at what AI can unlock for your team this year.",
  },
  {
    id: 5,
    title: "Merry Christmas!",
    type: "simple",
    img: "assets/merry-christmas.jpg",
    badge: "HOLIDAY SPECIAL",
    heading: "Merry Christmas & Happy Holidays, Jordan!",
    message: "\u201cWishing you warmth, joy, and wonderful memories this holiday season.\u201d",
  },
  {
    id: 6,
    title: "Deal Sealed!",
    type: "video",
    img: "assets/deal-sealed.jpg",
    badge: "DEAL SPECIAL",
    heading: "Another deal sealed together, Jordan!",
    message: "Wishing you continued success as we celebrate this incredible partnership.",
  },
  {
    id: 7,
    title: "Happy Easter!",
    type: "simple",
    img: "assets/happy-easter.jpg",
    badge: "EASTER SPECIAL",
    heading: "Hoppy Easter, Jordan!",
    message: "\u201cWishing you a season of new beginnings and bright surprises.\u201d",
  },
  {
    id: 8,
    title: "Aim Beyond FY26",
    type: "video",
    img: "assets/aim-beyond.jpg",
    badge: "FY26 SPECIAL",
    heading: "Big. Bold. Boundless, Jordan.",
    message: "Aim beyond with us as we kick off an ambitious new year together.",
  },
];

const DEFAULT_RECIPIENT = { name: "Jordan Doe", email: "jordan.doe@acme-corp.com" };
const DEFAULT_SIGNATURE = "From your partners at myDash";

function getMomentById(id) {
  return MOMENTS.find((m) => String(m.id) === String(id));
}
