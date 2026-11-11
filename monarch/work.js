/* Monarch Labs — work view.
   Each service is a category of concept studies. Clicking the current service word (or "See the work") zooms into it:
   the photo showing in its letters grows out of the word to fill the frame while the word itself blows past, and the
   category opens on that photo: the service name, its line, an index, then each study on a frosted glass panel.
   The tabs, or "Next service" at the end, switch category with a crossfade; Back, the X, Escape or the browser's
   Back button zoom out into the word again, on whichever service was open.
   Studies: the concept studies from the earlier Monarch site. Brands, people and situations are fictional;
   results, quotes, client meta and the original figures are deliberately left out. */
(() => {
  "use strict";
  const S = {
    aster: { name: "Aster", field: "Knowledge operations", title: "An AI copilot people can verify.",
      caps: ["AI product strategy", "Retrieval (RAG)", "Experience design"],
      overview: "Aster’s operations teams answered a steady stream of policy and product questions. The answers existed, spread across many tools, but nobody trusted a fast answer they couldn’t check. We designed a copilot whose first job is to show its working.",
      story: ["Knowledge was scattered across many tools, so every answer was slow and hard to trust. Teams re-checked answers by hand, and a few experts became the bottleneck for routine questions.",
        "Confidence came from showing the path to an answer, not from producing one faster. People accepted a slower answer if they could see its sources and who had approved them.",
        "A citation-first AI workspace with role-aware retrieval, human review and plain confidence states. Every answer carries its sources, their freshness and a clear route to an expert when confidence is low."],
      built: [["Citation-first answers", "Every sentence links to the passage it came from, with the source owner and the date it was last reviewed."],
        ["Confidence states", "Three plain states (verified, likely, needs an expert) instead of a misleading single score."],
        ["Role-aware retrieval", "Answers respect permissions and adapt to the asker’s role, region and product line."],
        ["Human review loop", "Experts approve, correct or retire answers, and each approval becomes reusable, trusted knowledge."]] },
    kyma: { name: "Kyma", field: "Travel planning", title: "Trip plans that account for the weather.",
      caps: ["AI prototyping", "Data design", "Product design"],
      overview: "Kyma helps travellers plan island-hopping trips across the Greek islands. Its itineraries ignored ferry timetables and the summer meltemi winds, so plans fell apart on arrival. We designed an assistant that plans around what can actually happen.",
      story: ["Generic itineraries led to refunds and angry reviews whenever ferries were cancelled or ports closed in high winds.",
        "Travellers trusted a plan that showed its backup. Being honest about uncertainty did more than a perfect-looking schedule.",
        "An AI trip planner grounded in live ferry, flight and wind data, which shows a plan B for every leg and flags risky dates before booking."],
      built: [["Grounded in live data", "Plans draw on ferry, flight and wind forecasts, not a fixed template."],
        ["A plan B for every leg", "Each crossing shows its backup before anyone needs it."],
        ["Risky dates, flagged early", "Meltemi weeks and exposed crossings are flagged before booking, not after arrival."],
        ["Honest uncertainty", "The planner says how sure it is, in plain words."]] },
    morrow: { name: "Morrow", field: "Climate materials", title: "Search organised around meaning.",
      caps: ["Search strategy", "Information architecture", "Content systems"],
      overview: "Morrow makes low-carbon concrete in Copenhagen that architects want to specify, if they can find the evidence in time. The expertise was deep, but the site was organised around the company, not the questions specifiers actually ask.",
      story: ["Disconnected pages failed to answer the way specifiers search. Test data sat in PDFs, and product pages never mentioned the standards buyers check against.",
        "The opportunity was a map of entities and decisions, not a longer keyword list. Specifiers search by material, standard and application, and need proof at the moment of choice.",
        "A semantic content system linking products, proof, applications and expert guidance into topic journeys, structured so people and machine readers can both cite it."],
      built: [["Entity map", "One shared model of materials, standards and applications that content, schema and navigation all draw from."],
        ["Topic journeys", "Pages that answer a specifier’s next question, linking product, evidence and guidance."],
        ["Structured proof", "Test data, certifications and case studies published as structured, citable content."],
        ["Editorial system", "Templates, briefs and governance so Morrow’s experts can extend it themselves."]] },
    northwind: { name: "Northwind", field: "Freight and logistics", title: "Search that finds the right freight lane.",
      caps: ["Search strategy", "Information architecture", "Structured data"],
      overview: "Northwind is a Rotterdam freight forwarder moving cargo between northern Europe and Asia. Shippers searched by route, cargo type and deadline; the site answered with service brochures. We rebuilt it around the lanes people actually need.",
      story: ["Route pages were thin duplicates of each other, and the lanes that mattered most barely appeared in search.",
        "Shippers search for a lane, a cargo and a deadline together. Each of those is something the site could model and connect.",
        "A lane-based content system with structured transit times, cargo rules and port guidance, generated from operational data and reviewed by the team."],
      built: [["One page per lane", "Each lane gets a page with what a shipper needs to decide."],
        ["Structured transit data", "Transit times and cut-offs come from operations, not copywriting."],
        ["Cargo rules and port guidance", "The rules for each cargo and port, stated plainly next to the route."],
        ["Team review", "Generated pages are checked by the people who run the lanes."]] },
    "common-ground": { name: "Common Ground", field: "Civic services", title: "A mobile service built for real life.",
      caps: ["Service design", "Mobile UX", "Product engineering"],
      overview: "Common Ground runs housing and benefits support for Manchester. Most applications started on a phone and ended in a phone call, because the service had never been designed for one.",
      story: ["Residents abandoned a fragmented service spread across forms, calls and desktop-only portals. One application could involve several systems and office visits.",
        "Progress had to feel visible and forgiving, even with one hand, weak signal and little time. The biggest drop-off wasn’t difficulty; it was losing work and not knowing what happened next.",
        "One responsive product with saved steps, plain-language guidance and proactive case updates, backed by a shared view for caseworkers."],
      built: [["Saved steps", "Progress saves at every step and works offline, so an interruption never means starting again."],
        ["Plain guidance", "Every question rewritten in plain language, with an example and the reason it’s asked."],
        ["Proactive updates", "Residents see where their case is and what happens next, before they need to call."],
        ["Caseworker view", "A shared picture of each case, so staff can pick up exactly where a resident left off."]] },
    olive: { name: "Olive", field: "Digital savings", title: "A first savings account, one question at a time.",
      caps: ["Product strategy", "Mobile UX", "Design system"],
      overview: "Olive, a Lisbon savings app, wanted to reach first-time savers: students, gig workers and young families. Its onboarding asked for screen after screen of forms before anyone saw a cent. We rebuilt the first five minutes around trust and momentum.",
      story: ["Many applicants dropped out before identity checks, and support tickets showed people didn’t understand why each document was needed.",
        "First-time savers needed to see progress and a clear reason for every question. Trust came from plain language, not from security badges.",
        "A short mobile onboarding with one question per screen, one valid ID, a live progress line, and a savings goal set before the account is even open."],
      built: [["One question per screen", "Each step asks one thing and says why it’s needed."],
        ["One valid ID", "A single document to start, instead of a checklist."],
        ["A live progress line", "Always clear how far along you are and what’s left."],
        ["Goal first", "Savers name what they’re saving for before the account opens."]] },
    rive: { name: "Rive", field: "Clinic network", title: "Clinic booking that speaks French and English.",
      caps: ["AI product design", "Conversation design", "Engineering"],
      overview: "Rive runs neighbourhood clinics across Montréal. Patients booked by phone, in whatever mix of French and English felt natural, and front desks spent their day on hold queues. We designed an assistant that books, reschedules and prepares patients in the language they actually use.",
      story: ["Most calls were routine bookings, but switching between French and English mid-sentence broke every off-the-shelf bot the clinics had tried.",
        "Patients didn’t want a chatbot; they wanted to be booked quickly and told exactly what to bring. The language had to follow them, not the other way round.",
        "A bilingual booking assistant on text messages and the web, with clinic-approved scripts, a clear hand-off to staff, and no medical advice: only logistics and preparation."],
      built: [["Bilingual booking", "Books and reschedules in French, English or both, following the patient’s lead."],
        ["Visit preparation", "Tells patients what to bring and when to arrive."],
        ["Clear hand-off", "Anything medical goes straight to clinic staff."],
        ["Where patients already are", "One assistant on text messages and the web, running on clinic-approved scripts."]] },
    esquina: { name: "Esquina", field: "Neighbourhood retail", title: "Reordering stock between customers.",
      caps: ["Service design", "Workflow automation", "Mobile app"],
      overview: "Esquina supplies New York’s bodegas, the corner shops found on nearly every block. Owners reordered stock by text and paper lists. We designed a reordering app for owners who are also cashiers, parents and delivery drivers.",
      story: ["Owners ran out of best-sellers every week, and orders arrived wrong because lists were copied by hand at the depot.",
        "Owners reorder between customers, one-handed. The app had to be faster than writing a list, and forgive a patchy connection.",
        "A lightweight Android app with one-tap reorders of usual items, offline carts, cash on delivery and delivery windows owners can plan around."],
      built: [["One-tap reorders", "The usual items, ready to send again in one tap."],
        ["Offline carts", "Orders build without signal and send when it returns."],
        ["Cash on delivery", "Pay the way stores already do."],
        ["Delivery windows", "A time owners can plan their day around."]] },
    clara: { name: "Clara", field: "Home solar", title: "Explaining home solar in plain language.",
      caps: ["Content strategy", "Answer design", "Calculators"],
      overview: "Clara installs rooftop solar for homes around Valencia. Buyers searched for cost, payback and what happens to the power they don’t use, and found jargon. We turned the site into a clear, honest explanation of home solar.",
      story: ["Searches about cost and payback landed on spec sheets, and first sales calls were spent on the basics.",
        "Homeowners wanted their own numbers. A good estimate built more trust than any claim about panel efficiency.",
        "Plain-language guides linked to a bill-based savings calculator, surplus explainers and structured answers to the next question."],
      built: [["Plain-language guides", "Cost, payback and installation explained without jargon."],
        ["Bill-based calculator", "An estimate from your own electricity bill."],
        ["Surplus explainers", "What happens to the power you don’t use, step by step, in euros."],
        ["Structured answers", "Each page answers the question buyers ask next."]] },
    anadl: { name: "Anadl", field: "Mental wellbeing", title: "A calmer front door to mental health care.",
      caps: ["Naming and identity", "Product design", "AI journaling"],
      overview: "Most people who struggle with their mental health never speak to anyone about it. Cost, stigma and distance all play a part, but so does the first step, which usually asks too much. With a group of counsellors and clinics in Wales, we named, designed and built Anadl (Welsh for breath): a gentle, bilingual front door that starts with a breath, not a form.",
      story: ["Partner clinics had capacity, but people weren’t booking. Intake forms were long, English-only and clinical, in a country where many people would rather start in Welsh, and nothing existed for the days before someone felt ready to talk.",
        "People don’t start with therapy; they start with a feeling they can’t yet name. A short check-in in their own language earned more trust than any promise of help.",
        "A calm, bilingual app and site: mood check-ins, AI-assisted journaling prompts reviewed by counsellors, guided breathing, and a clear path to licensed care or crisis support."],
      built: [["Short check-ins", "Pick a feeling and what’s behind it. No streaks, no scores, no guilt for missing a day."],
        ["AI journaling, with guardrails", "Gentle prompts in Welsh or English, written with counsellors. The assistant never diagnoses, and hands off the moment risk appears."],
        ["Counsellor booking", "Accredited counsellors, Welsh-speaking or not, online or nearby, with the cost shown upfront."],
        ["Crisis support, always visible", "Samaritans and Shout are one tap away on every screen."]] }
  };
  /* the approach, where the earlier site had one (figures left out) */
  const STEPS = {
    aster: ["Mapped the recurring questions to the tools, owners and risks behind them, and agreed what a verified answer means.",
      "Shadowed operations and compliance teams, then tested three trust models on paper before any model work.",
      "Built retrieval, citation and review flows together, tuning confidence thresholds against real questions.",
      "Rolled out team by team, watching accepted answers, escalations and time to a verified answer."],
    kyma: ["Read a season of refunds and reviews to find where plans broke: cancelled crossings, closed ports, missed flights.",
      "Rode the ferries with travellers and the island agents who rebook them, and mapped which legs fail in which winds.",
      "Prototyped the planner on live ferry, flight and wind data, testing how a plan B is shown before anyone needs it.",
      "Launched for one island group first, watching rebookings, refunds and trips that kept their islands."],
    morrow: ["Audited the site and its search data against the decisions specifiers actually make.",
      "Interviewed architects and specifiers, and modelled what they search by: materials, standards, applications, proof.",
      "Designed the topic architecture and a structured content model, then rebuilt the templates around it.",
      "Published in topic clusters, watched qualified visits and specification requests, and pruned what didn’t help."],
    northwind: ["Mapped a year of quote requests and search data to the lanes, cargo and deadlines shippers actually ask about.",
      "Sat with lane managers and the customer desk in Rotterdam to learn which rules and cut-offs cause missed sailings.",
      "Modelled lanes, cargo rules and ports as structured data from operations, and built the page templates on it.",
      "Launched the busiest Asia lanes first, watching quote requests, missed cut-offs and pages waiting for review."],
    "common-ground": ["Traced real applications end to end to find exactly where and why residents dropped out.",
      "Tested with residents in libraries, community centres and on the bus: often one-handed, with weak signal.",
      "Designed and built one responsive product and design system, piloting each step with caseworkers.",
      "Launched service by service, watching completed journeys, avoided calls and time to decision."],
    rive: ["Listened to a week of front-desk calls at three clinics and sorted them: routine bookings, changes, and anything medical.",
      "Wrote the booking scripts with nurses and the front desks, in the French and English patients actually mix.",
      "Built the assistant on text messages and the web, with a hand-off to a nurse for anything medical, tested on real conversations first.",
      "Opened it one clinic at a time, watching time on hold, hand-offs and missed appointments."],
    esquina: ["Rode the morning routes and stood behind the counter to see when owners actually have a minute to order.",
      "Compared paper lists with what arrived at the depot, to find where orders went wrong.",
      "Built the app around the usual order, offline first, with cash on delivery and windows owners choose.",
      "Rolled it out route by route, watching wrong orders, stock-outs of best-sellers and time spent ordering."],
    clara: ["Read a year of sales calls and site searches to list the questions buyers asked before they would book a visit.",
      "Sat in on roof visits around Valencia, and tested estimates built from real bills against the old brochure figures.",
      "Rewrote the guides in plain language and built the calculator on the same tariff data the installers quote from.",
      "Published guide by guide, watching roof-visit bookings, calls about the basics and how often the estimate held."],
    olive: ["Read a month of abandoned sign-ups and support tickets to find the questions people stopped at, and why.",
      "Tested the flow with students, couriers and young parents in Lisbon and Porto, on their own phones.",
      "Cut onboarding to five questions and one document, and moved the savings goal before the account opens.",
      "Released to a share of new sign-ups first, watching completed accounts, first deposits and goals still funded after three months."],
    anadl: ["Agreed success with clinicians: returning users and booked sessions, never time in the app.",
      "Listened to people across Cardiff, Swansea and Gwynedd, and to the counsellors who would receive them.",
      "Named the brand, built the identity, and prototyped check-ins and journaling with counsellors reviewing every AI prompt.",
      "Launched with partner clinics, watching return visits, bookings and safety escalations every week."]
  };
  const PHASE = ["Frame", "Find", "Form", "Field"];
  /* product screens: recreated interfaces with sample data, captured to work/*.webp (sources are kept outside the live site).
     views + phone = the screen viewer (see viewHTML) */
  const SHOT = {
    aster: { h: "The answer, with its working shown.", site: "app.aster.io",
      /* the viewer: [file, path, tab, caption, callouts [n, x %, y %]]; each callout's number matches "What we built" */
      views: [["aster-1", "/ask", "Answer", "The answer, with its sources in the margin", [[1, 74.5, 15], [2, 15.75, 35.2], [3, 26.4, 35.2], [4, 62.3, 79.6]]],
        ["aster-2", "/reviews", "Confidence", "Three plain states, and the questions waiting for a person", [[2, 12, 49.4], [4, 79, 15]]],
        ["aster-3", "/library/finance-approval-matrix", "Source", "A citation opened at its source, with its owner", [[1, 57.5, 39.8], [4, 70.75, 31.6]]]],
      phone: ["aster-m", "The same answer, on a phone", [[2, 48.7, 31], [1, 30, 52.1]]] },
    morrow: { h: "Pages that answer the next question.", site: "morrow.dk",
      views: [["morrow-1", "/applications/structural-slabs", "Topic journey", "A slab page that answers the specifier’s next question", [[1, 35, 36.5], [3, 70.4, 13.8], [2, 66.1, 38.9], [4, 72.4, 92.5]]],
        ["morrow-2", "/proof/m30-strength", "Proof", "Lab data published as a chart, and as structured data", [[1, 76.8, 14.3], [3, 86.5, 46.4], [2, 81.9, 83]]],
        ["morrow-3", "/studio/entity-map", "Studio", "The entity map, and how much of it is answered", [[1, 26, 33.4], [2, 84.8, 14.3], [4, 80.8, 45.7]]]],
      phone: ["morrow-m", "The slab page, on a phone", [[3, 52, 59.2], [2, 44.9, 82.2]]] },
    "common-ground": { h: "Built for one hand, weak signal and little time.", site: "commonground.manchester.gov.uk",
      views: [["common-ground-1", "/my-claim", "Your claim", "Where the claim is, who has it and what happens next", [[3, 77.9, 79.5]]],
        ["common-ground-2", "/apply/housing/rent", "A step", "One question, why it’s asked, and saved as you go", [[1, 17.9, 68.1], [2, 82.4, 19.2]]],
        ["common-ground-3", "/staff/cases/hs-20431", "Caseworkers", "Picking up exactly where a resident stopped", [[4, 12.7, 13.3], [1, 41.2, 30.9]]]],
      phone: ["common-ground-m", "The same step on a phone, with no signal", [[1, 45.8, 16.3], [2, 34.6, 72.5]]] },
    rive: { h: "Booking in the language people actually use.", site: "rive.clinic",
      views: [["rive-1", "/book", "Booking", "Booked in the patient’s own mix of French and English", [[1, 81.5, 13], [3, 82.9, 69.7], [4, 50.4, 11.8]]],
        ["rive-2", "/visits/rv-2041", "Visit prep", "What to bring, when to come, and reminders by text", [[2, 15.4, 32.5], [4, 82.3, 14.7]]],
        ["rive-3", "/team/hand-offs", "Hand-offs", "Anything medical goes straight to a nurse", [[3, 87.5, 14.7], [1, 16.7, 36.9]]]],
      phone: ["rive-m", "The same booking, by text message", [[4, 31.6, 6.5], [1, 77.2, 28.6]]] },
    olive: { h: "From sign-up to a first savings goal, one step at a time.", site: "olive.pt",
      views: [["olive-1", "/open/nif", "One question", "One question per screen, with the reason beside it", [[1, 78.2, 30.3], [3, 72, 15]]],
        ["olive-2", "/open/id", "One document", "One document is enough to open the account", [[2, 44.4, 30.3], [3, 25.3, 15]]],
        ["olive-3", "/open/goal", "Goal first", "The goal set before the account opens", [[4, 43.2, 30.3], [3, 24.7, 15]]]],
      phone: ["olive-m", "The goal, after the first two months", [[4, 48.2, 10.9], [3, 16.8, 26.3]]] },
    kyma: { h: "A plan that shows its plan B.", site: "kyma.travel",
      views: [["kyma-1", "/plan/cyclades-august", "The plan", "Five days, with the wind and a plan B for every crossing", [[4, 25.5, 54.4], [1, 45.5, 50.5], [2, 78.5, 50.5]]],
        ["kyma-2", "/alerts/thu-14", "Plan B live", "The morning a crossing is cancelled: the day already rebuilt", [[1, 18.5, 50.5], [2, 45, 50.5], [4, 94.5, 68.4]]],
        ["kyma-3", "/plan/new", "Choosing dates", "Risky weeks flagged before anything is booked", [[3, 17.5, 50.5], [1, 46.5, 50.5]]]],
      phone: ["kyma-m", "The plan, one-handed", [[1, 44.5, 41.8], [2, 47, 71.2]]] },
    northwind: { h: "One page per lane, with the answers shippers need.", site: "northwind.nl",
      views: [["northwind-1", "/lanes/nlrtm-sgsin", "Lane page", "One lane: its transit record, next sailings, rules and a price", [[1, 21.7, 45.1], [2, 22.4, 56.5], [3, 57.6, 80.5], [4, 92.9, 93.2]]],
        ["northwind-2", "/lanes/nlrtm-sgsin/cargo/lithium-batteries", "Cargo rules", "The rules for one cargo, with the deadlines worked out", [[3, 49.3, 34.8], [2, 27.1, 56.1], [4, 92, 58.2]]],
        ["northwind-3", "/review/nlrtm-sgsin", "Review", "A change from operations, waiting for the person who runs the lane", [[2, 51.2, 28.7], [4, 81.4, 86.4]]]],
      phone: ["northwind-m", "The lane page, on a phone", [[1, 60, 46], [2, 64.4, 54.7]]] },
    esquina: { h: "Faster than writing the list by hand.", site: "esquina.nyc",
      views: [["esquina-1", "/order", "The usual", "Last week’s order, ready to send again", [[1, 51, 13], [2, 76.2, 80.8], [3, 53, 89.5]]],
        ["esquina-2", "/deliveries/es-58213", "Delivery", "A window the owner picks, and cash counted at the door", [[4, 13.6, 32.6], [3, 84.1, 17]]],
        ["esquina-3", "/depot/orders", "Depot", "Orders that arrive as sent, no copying by hand", [[1, 90.3, 49.5]]]],
      phone: ["esquina-m", "The usual order, on the owner’s phone", [[2, 61.1, 9.3], [1, 60, 93.8]]] },
    clara: { h: "Your numbers first, jargon never.", site: "clara.solar",
      views: [["clara-1", "/savings", "Calculator", "An estimate worked out from the buyer’s own bill", [[2, 14.4, 21.2]]],
        ["clara-2", "/guides/surplus", "Surplus", "What happens to the power you don’t use, on a real day", [[1, 37.6, 23.8], [3, 29.9, 37.2], [4, 14.2, 81.9]]],
        ["clara-3", "/guides/cost", "Cost", "The cost line by line, with the next questions answered", [[1, 49.2, 20.8], [4, 84.8, 14.9]]]],
      phone: ["clara-m", "The estimate, on a phone", [[2, 31.6, 49.9]]] },
    anadl: { h: "Start with a breath, not a form.", site: "anadl.cymru",
      views: [["anadl-1", "/", "Check in", "A first step with no account, in Welsh or English", [[1, 65.7, 75.8]]],
        ["anadl-2", "/journal", "Journal", "A prompt written with counsellors, and four weeks without scores", [[1, 29.6, 21.3], [2, 55.7, 72.2], [4, 49.9, 96]]],
        ["anadl-3", "/talk", "Talk", "Counsellors this week, Welsh-speaking first, with the cost upfront", [[3, 18.7, 48.4], [4, 49.9, 96]]]],
      phone: ["anadl-m", "A breathing pause, on the phone", [[4, 87.4, 93.5]]] }
  };
  const img = (f, w, h, alt) => `<img src="work/${f}" width="${w}" height="${h}" alt="${alt}" loading="lazy" decoding="async">`;
  /* the viewer: one large frame, tabs that crossfade between whole views, a Desktop / Phone toggle, and numbered
     callouts on each view that match the numbers in "What we built" (hovering either lights both) */
  const pins = (p, alt) => p.map(c => `<span class="s-pin" data-n="${c[0]}" style="left:${c[1]}%;top:${c[2]}%" aria-hidden="true">${c[0]}</span>`).join("");
  const viewHTML = (id, x) => `<div class="s-view" data-view>
      <div class="s-vbar">
        <div class="s-vtabs" role="group" aria-label="${S[id].name} screens">${x.views.map((v, n) => `<button type="button" data-v="${n}" aria-pressed="${n ? "false" : "true"}"><small>${pad(n + 1)}</small>${v[2]}</button>`).join("")}</div>
        ${x.phone ? `<div class="s-dev" role="group" aria-label="Device"><button type="button" data-dev="desk" aria-pressed="true">Desktop</button><button type="button" data-dev="phone" aria-pressed="false">Phone</button></div>` : ""}
      </div>
      <div class="s-frame">
        <div class="s-win s-desk"><span><i></i><i></i><i></i><em>${x.site}<b>${x.views[0][1]}</b></em></span>
          <div class="s-panes">${x.views.map((v, n) => `<div class="s-pane${n ? "" : " on"}" data-path="${v[1]}" data-cap="${v[3]}">${img(v[0] + ".webp", 1200, 750, v[3])}${pins(v[4])}</div>`).join("")}</div></div>
        ${x.phone ? `<div class="s-mob" hidden><div class="s-phone">${img(x.phone[0] + ".webp", 390, 844, x.phone[1])}${pins(x.phone[2])}</div></div>` : ""}
      </div>
      <p class="s-cap" aria-live="polite">${x.views[0][3]}</p>
    </div>`;
  const stageHTML = id => {
    const x = SHOT[id]; if (!x) return "";
    return `<div class="s-stage s-stage-v rv">
        <div class="s-stage-h"><small>The product</small><p>${x.h}</p></div>
        ${viewHTML(id, x)}
        <p class="s-note">Interfaces recreated for illustration, with sample data. Numbers match “What we built”.</p>
      </div>`;
  };
  /* service → studies (a study can belong to more than one) */
  const BY = [["morrow", "northwind"], ["common-ground", "olive"], ["kyma", "aster"], ["aster", "clara"], ["rive", "esquina"], ["anadl"]];
  const STORY = ["Challenge", "Insight", "Solution"];

  const root = document.documentElement, work = document.getElementById("work");
  if (!work) return;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pad = n => String(n).padStart(2, "0");
  const words = $$(".reel>span"), descs = $$(".desc span"), see = $(".see"), word = $(".word");
  const scroll = $(".work-scroll", work), inner = $(".work-in", work), tabs = $(".work-tabs", work);
  const layers = $$(".work-bg i", work);
  /* everything about a service comes from the hero itself: name, side bearing, photos, line */
  const cut = b => getComputedStyle(b).getPropertyValue("--img").trim();   /* the photo cut this device uses (see .t>b in styles.css) */
  const SV = words.map((w, k) => {
    const t = $(".t", w);
    return { name: t.firstChild.textContent.trim(), lsb: t.style.getPropertyValue("--lsb"),
      imgs: $$(".t>b", w).map(cut), desc: descs[k] ? descs[k].textContent : "" };
  });
  const slug = k => SV[k].name.toLowerCase();
  const hi = img => img.replace(/w=\d+/, "w=2400");       /* full-frame backdrop: a sharper copy, swapped in once loaded */
  const urlOf = img => (img.match(/url\(['"]?([^'")]+)/) || [])[1];

  /* ---------- render ---------- */
  tabs.innerHTML = SV.map((s, k) => `<button type="button" role="tab" data-k="${k}">${s.name}</button>`).join("");
  const studyHTML = (id, j, k) => {
    const d = S[id];
    return `<article class="w-study" id="s-${id}" aria-labelledby="h-${id}">
      <div class="s-head rv"><span class="s-idx">${pad(j + 1)}<i class="dot" aria-hidden="true"></i>Concept study</span><span class="s-caps">${d.caps.join(" · ")}</span></div>
      <h3 class="s-name rv" id="h-${id}">${d.name}</h3>
      <p class="s-field rv">${d.field}</p>
      <p class="s-title rv">${d.title}</p>
      ${stageHTML(id)}
      <div class="s-row rv"><h4>Overview</h4><p class="s-lead">${d.overview}</p></div>
      <ol class="s-story">${d.story.map((p, n) => `<li class="rv" style="--d:${n}"><small>${pad(n + 1)}</small><h4>${STORY[n]}</h4><p>${p}</p></li>`).join("")}</ol>
      ${STEPS[id] ? `<div class="s-row rv"><h4>Approach</h4><ol class="s-steps">${STEPS[id].map((t, n) => `<li><small>${pad(n + 1)}</small><h5>${PHASE[n]}</h5><p>${t}</p></li>`).join("")}</ol></div>` : ""}
      <div class="s-row rv"><h4>What we built</h4><ul class="s-built">${d.built.map((b, n) => `<li${SHOT[id] && SHOT[id].views ? ` data-n="${n + 1}"><span class="s-num" aria-hidden="true">${n + 1}</span>` : ">"}<b>${b[0]}</b><p>${b[1]}</p></li>`).join("")}</ul></div>
    </article>`;
  };
  const render = k => {
    const ids = BY[k], nx = (k + 1) % SV.length, s = SV[k];
    inner.innerHTML = `<div class="w-intro">
        <p class="w-eye" style="--d:0"><i class="dot" aria-hidden="true"></i>${pad(k + 1)} / ${pad(SV.length)} &nbsp;·&nbsp; ${pad(ids.length)} concept ${ids.length > 1 ? "studies" : "study"}</p>
        <h2 class="w-word" id="w-title" style="--d:1;--lsb:${s.lsb}">${s.name}</h2>
        <div class="w-under" style="--d:2">
          <p class="w-desc">${s.desc}</p>
          <ol class="w-index">${ids.map((id, j) => `<li><button type="button" data-to="s-${id}"><small>${pad(j + 1)}</small><b>${S[id].name}</b><span>${S[id].title}</span><i aria-hidden="true">↓</i></button></li>`).join("")}</ol>
        </div>
      </div>
      ${ids.map((id, j) => studyHTML(id, j, k)).join("")}
      <footer class="w-foot rv">
        <button class="w-next" type="button" data-k="${nx}"><small>Next service</small><span>${SV[nx].name}</span><i aria-hidden="true">→</i></button>
        <div class="w-foot-row">
          <p class="w-note">Concept studies. The brands, people and situations are fictional; each shows how we would approach the brief.</p>
          <a class="btn dark" href="contact.html">Start a project <i aria-hidden="true">↗</i></a>
        </div>
      </footer>`;
    $$("[role=tab]", tabs).forEach(b => { const on = +b.dataset.k === k; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; });
    work.setAttribute("aria-label", s.name + " work");
    scroll.scrollTop = 0;
    /* on a phone, studies open on their phone screen: the desktop view is too small to read there */
    if (innerWidth < 700) $$("[data-view]", inner).forEach(v => { if ($(".s-mob", v)) viewer(v, null, "phone"); });
    watch();
  };

  /* panels rise into place as they scroll in */
  let io;
  const watch = () => {
    if (io) io.disconnect();
    const els = $$(".rv", inner);
    if (still || !("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("seen")); return; }
    io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("seen"); io.unobserve(e.target); } }),
      { root: scroll, threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    els.forEach(e => io.observe(e));
  };

  /* ---------- backdrop: two layers so a category switch crossfades ---------- */
  let front = 0;
  const setBg = (img, fade) => {
    const L = fade ? layers[1 - front] : layers[front];
    L.style.setProperty("--img", img);
    if (fade) { layers[front].classList.remove("on"); L.classList.add("on"); front = 1 - front; }
    else { L.classList.add("on"); layers[1 - front].classList.remove("on"); }
    const u = urlOf(hi(img));                                /* upgrade to the sharp copy when it arrives */
    if (u) { const im = new Image(); im.onload = () => { if (L.style.getPropertyValue("--img") === img) L.style.setProperty("--img", `url('${u}')`); }; im.src = u; }
    return L;
  };

  /* ---------- open / switch / close ---------- */
  let cur = -1, busy = false, pushed = false;
  const isOpen = () => root.classList.contains("work-open");
  const tOf = k => $(".t", words[k]);
  const shownImg = k => { const b = $(".t>b.on", words[k]); return b ? cut(b) : SV[k].imgs[0]; };
  /* the word's box relative to the frame, as a clip-path inset, and the backdrop transform that sits the photo
     on the word (scaled to the word's width, centred on it) */
  const geo = r => {
    const f = work.getBoundingClientRect(), s = r.width / f.width;
    return { clip: `inset(${r.top - f.top}px ${f.right - r.right}px ${f.bottom - r.bottom}px ${r.left - f.left}px round 0px)`,
      tf: `translate(${r.left - f.left}px,${r.top - f.top + r.height / 2 - f.height * s / 2}px) scale(${s})` };
  };
  const full = () => "inset(0px 0px 0px 0px round 0px)";
  const loading = () => { const p = document.getElementById("pre"); return p && !p.classList.contains("done"); };

  const open = (k, direct) => {
    if (busy || isOpen() || (loading() && !direct)) return;
    busy = true; cur = k;
    if (window.MLHero) MLHero.stop();
    render(k);
    work.hidden = false;
    const L = setBg(shownImg(k), false);
    root.classList.add("work-open");
    const done = () => { work.classList.add("ready"); busy = false; scroll.focus({ preventScroll: true }); };
    if (still) { work.style.clipPath = ""; L.style.transform = ""; work.classList.add("full"); done(); return; }
    /* landing straight on a service (a refresh): no zoom in, but leave the same end state the zoom leaves, so closing
       can zoom back out of it (a clip-path of none can't animate to the word's box; the hero must already be blown past) */
    if (direct) { work.style.clipPath = full(); L.style.transform = "none"; work.classList.add("full"); root.classList.add("zoom"); done(); return; }
    /* clicked while the hero is still assembling: end that intro first, or its transitions replace the word's
       zoom transition and the word jumps instead of blowing past */
    if (root.classList.contains("pre-intro")) {
      root.classList.remove("pre-intro", "in");
      document.querySelectorAll("[style*='--in']").forEach(el => el.style.removeProperty("--in"));
      void word.offsetWidth;
    }
    const r = tOf(k).getBoundingClientRect(), g = geo(r), w = word.getBoundingClientRect();
    word.style.transformOrigin = `${r.left + r.width / 2 - w.left}px ${r.top + r.height / 2 - w.top}px`;
    work.classList.add("snap"); L.classList.add("snap");
    work.style.clipPath = g.clip; L.style.transform = g.tf;
    void work.offsetWidth;                                     /* commit the start before zooming */
    work.classList.remove("snap"); L.classList.remove("snap");
    work.classList.add("full"); root.classList.add("zoom");
    work.style.clipPath = full(); L.style.transform = "none";
    setTimeout(done, 760);                                   /* the sheet opens as the photo lands */
  };

  const switchTo = k => {
    if (busy || k === cur) return;
    busy = true; cur = k;
    const L = setBg(SV[k].imgs[0], true);
    L.style.transform = "";
    work.classList.add("swap");                               /* the sheet stays; only its content crossfades */
    setTimeout(() => {
      render(k);
      void work.offsetWidth;
      work.classList.remove("swap"); busy = false;
      scroll.focus({ preventScroll: true });
    }, still ? 0 : 380);
    if (pushed) history.replaceState({ work: k }, "", "#work-" + slug(k));
  };

  const close = () => {
    if (busy || !isOpen()) return;
    busy = true;
    const k = cur, L = layers[front];
    if (window.MLHero && MLHero.i !== k) MLHero.jump(k);
    work.classList.remove("ready");
    const end = () => {
      work.hidden = true;
      work.classList.remove("full", "swap");
      work.style.clipPath = ""; L.style.transform = "";
      root.classList.remove("work-open", "zoom");
      word.style.transformOrigin = "";
      busy = false;
      if (/^#work-/.test(location.hash)) history.replaceState(null, "", location.pathname + location.search);
      if (window.MLHero) MLHero.start();
      if (see) see.focus({ preventScroll: true });
    };
    if (still) { end(); return; }
    /* measure the word at rest (the zoom transform switched off for one read) */
    root.classList.add("measure");
    const r = tOf(k).getBoundingClientRect(), w = word.getBoundingClientRect();
    word.style.transformOrigin = `${r.left + r.width / 2 - w.left}px ${r.top + r.height / 2 - w.top}px`;
    void word.offsetWidth;
    root.classList.remove("measure");
    const g = geo(r);
    setTimeout(() => {                                       /* the sheet closes first, then the photo zooms back into the word */
      work.style.clipPath = g.clip; L.style.transform = g.tf;
      root.classList.remove("zoom");
      setTimeout(() => work.classList.remove("full"), 700);   /* the photo melts back into the letters at the end */
      setTimeout(end, 1150);
    }, 520);
  };

  /* ---------- wiring ---------- */
  const openHere = () => {
    const k = window.MLHero ? MLHero.i : 0;
    if (!isOpen()) { history.pushState({ work: k }, "", "#work-" + slug(k)); pushed = true; }
    open(k);
  };
  const leave = () => { if (pushed) history.back(); else close(); };
  addEventListener("popstate", () => { if (isOpen() && !/^#work-/.test(location.hash)) { pushed = false; close(); } });

  /* the word itself: only the letters of the current service count as the target */
  const onWord = e => { const r = tOf(window.MLHero ? MLHero.i : 0).getBoundingClientRect(); return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; };
  word.addEventListener("click", e => { if (onWord(e)) openHere(); });
  word.addEventListener("mousemove", e => root.classList.toggle("hot", onWord(e) && !loading()));
  word.addEventListener("mouseleave", () => root.classList.remove("hot"));
  if (see) see.addEventListener("click", openHere);
  /* the button's count follows the service on screen */
  const count = k => { if (see) { $("b", see).textContent = pad(BY[k].length); see.setAttribute("aria-label", `See the ${SV[k].name} work: ${BY[k].length} concept ${BY[k].length > 1 ? "studies" : "study"}`); } };
  count(0);
  document.addEventListener("ml:service", e => count(e.detail));

  $(".work-back", work).addEventListener("click", leave);
  $(".work-x", work).addEventListener("click", leave);
  tabs.addEventListener("click", e => { const b = e.target.closest("[data-k]"); if (b) switchTo(+b.dataset.k); });
  tabs.addEventListener("keydown", e => {                    /* arrow keys move along the tabs */
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const k = (cur + (e.key === "ArrowRight" ? 1 : -1) + SV.length) % SV.length;
    switchTo(k); setTimeout(() => $(`[data-k="${k}"]`, tabs).focus(), 20);
  });
  inner.addEventListener("click", e => {
    const to = e.target.closest("[data-to]"), nx = e.target.closest(".w-next");
    if (to) { const el = document.getElementById(to.dataset.to); if (el) scroll.scrollTo({ top: el.offsetTop - 12, behavior: still ? "auto" : "smooth" }); }
    if (nx) switchTo(+nx.dataset.k);
    const v = e.target.closest("[data-v]"), dev = e.target.closest("[data-dev]");
    if (v || dev) viewer(e.target.closest("[data-view]"), v ? +v.dataset.v : null, dev ? dev.dataset.dev : null);
  });
  /* the viewer: switch view (crossfade) or device; the address bar and caption follow */
  const viewer = (box, n, dev) => {
    if (!box) return;
    const panes = $$(".s-pane", box), desk = $(".s-desk", box), mob = $(".s-mob", box), cap = $(".s-cap", box);
    if (dev) {
      $$("[data-dev]", box).forEach(b => b.setAttribute("aria-pressed", String(b.dataset.dev === dev)));
      const phone = dev === "phone";
      desk.hidden = phone; if (mob) mob.hidden = !phone;
      box.classList.toggle("is-phone", phone);
      cap.textContent = phone ? $("img", mob).alt : panes.find(p => p.classList.contains("on")).dataset.cap;
      return;
    }
    $$("[data-v]", box).forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.v === n)));
    panes.forEach((p, k) => p.classList.toggle("on", k === n));
    $(".s-desk em b", box).textContent = panes[n].dataset.path;
    cap.textContent = panes[n].dataset.cap;
  };
  /* a callout and its line in "What we built" light up together */
  const hot = (e, on) => {
    const t = e.target.closest && e.target.closest(".s-pin, .s-built li[data-n]"); if (!t) return;
    $$('[data-n="' + t.dataset.n + '"]', t.closest(".w-study")).forEach(el => el.classList.toggle("hot", on));
  };
  inner.addEventListener("mouseover", e => hot(e, true));
  inner.addEventListener("mouseout", e => hot(e, false));
  work.addEventListener("keydown", e => {
    if (e.key === "Escape") { e.preventDefault(); leave(); return; }
    if (e.key !== "Tab") return;                             /* keep focus inside while open */
    const f = $$("button,[href],[tabindex='0']", work).filter(el => el.offsetParent !== null);
    if (!f.length) return;
    const a = f[0], z = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === a || document.activeElement === scroll)) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  });
  /* the top bar turns to a darker glass once the studies scroll under it */
  scroll.addEventListener("scroll", () => work.classList.toggle("under", scroll.scrollTop > 4), { passive: true });

  /* a link straight to #work-intelligence (or a refresh there) lands on the work view already open, with no zoom:
     the loader panel just wipes off it (html.direct, set by preload.js, holds the opening transitions back) */
  const m = location.hash.match(/^#work-(\w+)/), dk = m ? SV.findIndex(s => s.name.toLowerCase() === m[1]) : -1;
  if (dk >= 0) { if (window.MLHero) MLHero.jump(dk); open(dk, true); }
})();
