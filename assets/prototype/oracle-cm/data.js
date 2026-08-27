// Shared "Customer Moments" data set.
// Illustration assets are the actual artwork exported from the Figma file.
const MOMENTS = [
  {
    id: 1,
    title: "Plan Your Season",
    type: "video",
    img: "https://www.figma.com/api/mcp/asset/af68552a-9f7e-4ddb-8678-b1cdd64e857b.png",
    badge: "SEASON KICKOFF",
    heading: "Here's to a season full of wins, Jordan!",
    message: "Wishing you a smooth, successful quarter ahead. Thank you for partnering with us.",
  },
  {
    id: 2,
    title: "Happy Diwali!",
    type: "simple",
    img: "https://www.figma.com/api/mcp/asset/44741367-b9be-488d-b4dd-6568571ecee2.png",
    art: "https://www.figma.com/api/mcp/asset/043418d9-7c79-4402-bc81-8117eb4ac5cd.png",
    badge: "DIWALI SPECIAL",
    heading: "Wishing you an abundance of light & prosperity, Jordan!",
    message: "\u201cMay this festival of lights bring happiness, peace, and infinite success to you and your beautiful team this year.\u201d",
  },
  {
    id: 3,
    title: "Saint Patricks' Day!",
    type: "simple",
    img: "https://www.figma.com/api/mcp/asset/ff9e803e-2239-450a-88ab-d1a73f3ac929.png",
    badge: "ST. PATRICK'S SPECIAL",
    heading: "Luck of the Irish to you, Jordan!",
    message: "\u201cWishing you a pot of gold and endless good fortune this St. Patrick's Day.\u201d",
  },
  {
    id: 4,
    title: "The Oracle AI Advantage",
    type: "video",
    img: "https://www.figma.com/api/mcp/asset/80af0f06-65a6-4d95-99b9-8921d1da59e1.png",
    badge: "AI SPOTLIGHT",
    heading: "The future is already in motion, Jordan.",
    message: "Take a look at what AI can unlock for your team this year.",
  },
  {
    id: 5,
    title: "Merry Christmas!",
    type: "simple",
    img: "https://www.figma.com/api/mcp/asset/2aef1857-c8eb-40e2-8a80-1daab4b9ed2d.png",
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
    img: "https://www.figma.com/api/mcp/asset/8857a51b-2174-4020-9a53-5a4fa958c9f2.png",
    badge: "EASTER SPECIAL",
    heading: "Hoppy Easter, Jordan!",
    message: "\u201cWishing you a season of new beginnings and bright surprises.\u201d",
  },
  {
    id: 8,
    title: "Aim Beyond FY26",
    type: "video",
    img: "https://www.figma.com/api/mcp/asset/9c7a2307-aab7-4517-b315-4554c90e3670.png",
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
