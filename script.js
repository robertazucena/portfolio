(() => {
"use strict";
document.documentElement.classList.add("js");
const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
const FINE = matchMedia("(hover:hover) and (pointer:fine)").matches;
var SH = { scroll: 0 };
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* =========================================================
   CONTENT — edit projects here. Visuals are placeholder mockups.
   ========================================================= */
const PROJECTS = [
  {
    slug: "sulyap", title: "Sulyap", short: "Sulyap",
    client: "Own product", role: "Lead Product Designer", sector: "Web App · Philippine News Platform", scope: "Top stories, story briefs, regions, sections, sources and search",
    status: "In development · 2026", deliverables: "Product Design, Design System, Prototype",
    overview: "Sulyap brings news from every corner of the Philippines into one place. Each story is a short brief that shows which outlets covered it, then sends readers to the publisher to read it in full. Briefs are drafted by AI and approved by human editors, and the whole product wears a refined metallic-black identity.",
    cat: ["web"], mock: "portal",
    live: "https://robertazucena.com/assets/prototype/sulyap/index.html",
    proto: { base: "assets/prototype/sulyap/",
      desktop: [["Top stories","index.html",10396],["Story brief","index.html#/story/1",4339],["Regions","index.html#/regions/Luzon",1784],["Business","index.html#/business",1651],["Weather & disasters","index.html#/weather",2469],["Our sources","index.html#/sources",2921],["How Sulyap works","index.html#/about",1597]],
      interactive: true,
      heroMobile: [["Top stories","index.html",0]] },
    summary: "Philippine news in one place: short briefs from every corner of the country, each linking back to the publishers who reported it.",
    metric: ["7", "Sections"],
    tags: ["Product design", "News UX", "AI-assisted editorial"],
    stats: [["1 place","National, regional and government outlets, side by side"],["7 sections","Top stories, Nation, Regions, Business, Weather, Sports and Entertainment"],["⌘K","Search every story, place and section from anywhere"]],
    challenge: "Philippine news is spread across dozens of national, regional and government outlets, and following a story means hopping between sites.",
    insight: "Readers want <em>the whole picture</em> fast, and publishers still deserve the click.",
    approach: [["Sources","Mapped national, regional and government outlets into one source registry."],["Pipeline","Designed a supervised flow: AI drafts each brief, an editor approves it."],["Structure","Organised the site into clear sections and regions, inspired by how sports sites handle live, dense content."],["Identity","Set a refined metallic-black brand with editorial type and illustrated fallbacks."]],
    solution: "Short, trusted briefs that always link back to the source.",
    features: [["Right now","A live ticker for weather signals, earthquakes, class suspensions, markets and transit."],["Story briefs","Who covered it, when it was updated, and a link to read it in full."],["Search anywhere","A ⌘K palette across stories, places and sections."],["Reader touches","Saved stories, a print edition, dark mode and a morning briefing."]],
    outcomes: ["One place to follow Philippine news across outlets","Every brief credits and links to its publishers","A prototype ready for testing with real readers"],
    reflection: "An aggregator only earns trust if it is generous to its sources. Showing who reported each story became the core of the design."
  },
  {
    slug: "kahera", title: "Kahera", short: "Kahera",
    client: "Own product", role: "Lead Product Designer", sector: "Web App · Store System for Sari-sari Stores", scope: "Landing, sell, products, restock, dashboard and settings",
    status: "In development · 2026", deliverables: "Product Design, Design System, Prototype",
    overview: "Kahera is a modern store system for sari-sari stores in the Philippines. Owners ring up sales and give the right sukli, keep track of stock, log restocks bought from retail and grocery shops, and see how the store is doing today, this month and this year. Stores register to get access, the platform supports many stores, and the whole app works in Tagalog and English.",
    cat: ["web"], mock: "portal",
    live: "https://robertazucena.com/assets/prototype/kahera/index.html",
    proto: { base: "assets/prototype/kahera/",
      desktop: [["Landing","index.html#landing/en",5112],["Sell","index.html#demo/sell/en",3356],["Products","index.html#demo/products/en",2329],["Restock","index.html#demo/restock/en",900],["Dashboard","index.html#demo/reports/en",2387],["Settings","index.html#demo/settings/en",900]],
      interactive: true,
      heroMobile: [["Sell","index.html#demo/sell/en",0]] },
    summary: "A simple, beautiful store system for sari-sari stores: sell, give sukli, restock and see your sales, in Tagalog or English.",
    metric: ["5", "Store tools"],
    tags: ["Product design", "Retail POS", "Bilingual UX"],
    stats: [["5 tools","Sell, Products, Restock, Dashboard and Settings"],["TL / EN","Every screen in Tagalog and English"],["Multi-store","Stores register for access, with an admin view to add more"]],
    challenge: "Most sari-sari stores still run on memory and a notebook, so stock runs out unnoticed and nobody knows the day’s real profit.",
    insight: "A store system only works if it is <em>faster than the notebook</em>.",
    approach: [["Listen","Started from how owners actually work: quick sales, exact change, and restocking from retail and grocery shops."],["Flow","Made selling the home screen: tap products, see the total and sukli, complete the sale."],["Clarity","Turned sales into a plain-language dashboard: today, this month and best sellers."],["Access","Designed a register-and-sign-in flow with store codes and PINs, built for many stores."]],
    solution: "Selling, stock and sales in one friendly app.",
    features: [["Sell","Tap products, see the total and the exact sukli, done."],["Products & stock","Stock levels at a glance, with alerts when items run low."],["Restock","Log what you bought from retail or grocery shops, no supplier flow needed."],["Dashboard","Sales, customers and estimated profit, with trends and best sellers."]],
    outcomes: ["A sales flow faster than writing in a notebook","Low-stock warnings before shelves run empty","A bilingual product ready for testing with real store owners"],
    reflection: "Designing for sari-sari stores meant designing for one hand, a busy counter and a customer waiting. Every extra tap had to earn its place."
  },
  {
    slug: "great-eastern-claims", title: "Great Eastern Claims AI Portal", short: "Claims AI Portal",
    client: "Great Eastern", role: "Lead Product Designer", sector: "Web App · AI Insurance Claims Platform", scope: "11-page platform, AI anomaly detection UX",
    cat: ["ai","enterprise"], mock: "claims",
    live: "https://robertazucena.com/assets/prototype/great-eastern/index.html",
    proto: { base: "assets/prototype/great-eastern/",
      desktop: [["Claims Control Room","index.html",900],["Auto Worklist","claims.html",900],["Claim Detail","claim-detail.html",955],["AI Assessment","ai-progress.html#still",900],["AI Results","ai-results.html",900],["Final Report","final-report.html",1030]],
      interactive: true,
      heroMobile: [["Claims Control Room","index.html",0]] },
    summary: "An AI-powered claims control centre for faster, smarter insurance processing.",
    status: "Shipped · 2026", deliverables: "Modern Dashboard, Design System, Prototypes",
    overview: "An AI-powered insurance claims dashboard that centralises claim intake, review and resolution. It gives real-time insight into claim volumes, processing status and AI-assisted outcomes, so claims teams can prioritise cases and work more efficiently. A submission queue tracks every claim’s progress and keeps case management moving.",
    metric: ["11", "Pages designed"],
    tags: ["AI-assisted review", "Enterprise UX", "Prototyping"],
    stats: [["11","Pages, from the control room to the final report"],["4","Claim types: vehicle, homeowner, building owner and manufacturer"],["Explainable AI","Every flag shows severity, confidence and estimated cost"]],
    challenge: "Suspicious claims were hard to spot in long queues across four claim types.",
    insight: "Assessors need AI to <em>point</em> at what matters, not decide for them.",
    approach: [["Model","Mapped each claim type’s journey and the evidence assessors check."],["Signal design","Designed how anomaly scores and reasons appear in queues and claim detail."],["Build","Prototyped all 11 pages in high fidelity for stakeholder demos."],["Refine","Iterated on wording and thresholds so flags felt helpful, not alarming."]],
    solution: "One portal with risk-sorted queues and explainable AI flags.",
    features: [["Claims control room","Live queue, AI-handled counts and status across the portfolio."],["Claim worklists","One worklist per claim type, with evidence counts and status."],["AI assessment","Damage found per part, with severity, confidence and estimated cost."],["Final report","Itemised findings and an adjuster sign-off, ready to approve."]],
    outcomes: ["One consistent workflow across four claim types","Anomalies visible at queue level instead of buried in documents","A demo-ready prototype for stakeholder buy-in"],
    reflection: "Explainability is a UX problem. The words around an AI score decide whether people act on it."
  },
  {
    slug: "oracle-autonomous-db", title: "Oracle Autonomous Database", short: "Autonomous Database",
    client: "Oracle · OCI", role: "Creative Technologist", sector: "Web Experience · Enterprise Software Campaign", scope: "Launch campaign site and OCI dashboards",
    cat: ["enterprise","web"], mock: "dashboard",
    live: "https://robertazucena.com/assets/prototype/oracle-ad/index.html",
    proto: { base: "assets/prototype/oracle-ad/",
      desktop: [["Self-Patching","index.html#s1",900],["No Human Error","index.html#s3",900],["Explore Database","index.html#explore",900],["Talk to Expert","index.html#chat",900]],
      interactive: true,
      heroMobile: [["Autonomous Database","index.html#s1",0]] },
    summary: "Experience the power of autonomous innovation. An interactive campaign for Oracle Autonomous Database, and the OCI dashboards DBAs use every day.",
    status: "Live · 2023", deliverables: "Web Experience, Motion 3D Experience",
    overview: "An interactive campaign presenting Oracle Autonomous Database as intelligent, self-managing and always secure. I led UI/UX and delivered the campaign web app from concept to launch in collaboration with Larry Ellison’s team, using an “autonomous driving” concept to turn complex technology into a simple story. I then worked on the OCI admin and monitoring dashboards for enterprise DBAs: a restructured information architecture, at-a-glance status cards and guided setup flows.",
    metric: ["30%", "Faster first insight"],
    tags: ["WebGL campaign", "Enterprise UX", "Data visualisation"],
    stats: [["30%","Faster time-to-first-insight for enterprise DBAs"],["20%","Fewer navigation-related support tickets"],["5 scenes","An immersive WebGL launch, one scene per capability"]],
    challenge: "The launch had to make a self-driving database feel real, while DBAs still dug through dense consoles to check basic health.",
    insight: "Show the promise as an <em>experience</em>, then make the console answer one question first: what needs me?",
    approach: [["Story","Turned each capability into its own scene: self-patching, vigilance, no human error, machine learning, time."],["Build","Built the campaign site in WebGL, with layered parallax, an Explore brief and an expert chat."],["Restructure","Reorganised the OCI console around tasks, with status cards and guided setup."],["Validate","Tested navigation with admins and tracked support ticket themes after release."]],
    solution: "An immersive campaign site, and a monitoring home DBAs can read at a glance.",
    features: [["Immersive scenes","Five WebGL scenes, one per capability, with swipe and keyboard navigation."],["Explore & expert chat","A capabilities brief and a “Talk to Expert” chat preview."],["Status cards","Health, performance, storage and alerts up front in the console."],["Guided setup","Step-by-step provisioning for first-time admins."]],
    outcomes: ["30% faster time-to-first-insight","20% fewer navigation-related support tickets","A launch that showed the product instead of describing it"],
    reflection: "In infrastructure tools, density only works when it’s ordered. Deciding what comes first mattered more than any single visual choice."
  },
  {
    slug: "oracle-ai-email", title: "Oracle AI Email Generator", short: "AI Email Generator",
    client: "Oracle · Marketing & CX", role: "Lead Product Designer", sector: "Web & Mobile · AI Email Platform", scope: "5 views: Home, Templates, Editor, Analytics, API",
    cat: ["ai","enterprise"], mock: "email",
    live: "https://robertazucena.com/assets/prototype/oracle-eg/index.html",
    proto: { base: "assets/prototype/oracle-eg/",
      desktop: [["Home","index.html#/",1098],["Templates","index.html#/templates",1180],["Analytics","index.html#/analytics",1768],["Editor","index.html#/editor",1226],["API Docs","index.html#/docs",906]],
      interactive: true,
      heroMobile: [["Home","index.html#/",0],["Templates","index.html#/templates",0],["Analytics","index.html#/analytics",0],["Editor","index.html#/editor",0]] },
    shots: {
      url: "oracle-ai-email-gen / home",
      hero: "assets/case/oracle-eg/hero.jpg",
      desktop: [["Home","assets/case/oracle-eg/home-desktop.jpg"],["Templates","assets/case/oracle-eg/templates-desktop.jpg"],["Analytics","assets/case/oracle-eg/analytics-desktop.jpg"],["Editor","assets/case/oracle-eg/editor-desktop.jpg"],["API Docs","assets/case/oracle-eg/docs-desktop.jpg"]]
    },
    summary: "Create personalised email templates effortlessly. An AI platform that turns simple prompts into professional, ready-to-send HTML emails.",
    status: "Shipped · 2024", deliverables: "Design System, Prototypes, Modern Dashboard",
    overview: "Oracle AI Email Generator transforms simple prompts into professional, ready-to-send HTML email templates. Users can customise tone, add contextual data and generate personalised content in seconds. Built for enterprise teams, it streamlines email creation while keeping every message consistent and on brand.",
    metric: ["Prompt → HTML", "Brief to send-ready"],
    tags: ["AI / LLM product design", "Prompt UX", "Design systems"],
    stats: [["Prompt → HTML","One plain-language brief becomes a send-ready, on-brand email"],["5 views","Home, Templates, Editor, Analytics and API, one connected flow"],["AI in the loop","Refine prompts, a suggested send time and predicted open and click rates"]],
    challenge: "Every campaign email needed a designer, a developer and days of back-and-forth, even the simple ones.",
    insight: "Marketers wanted to <em>describe</em> an email and trust what came back.",
    approach: [["Map","Traced the brief-to-send journey with marketers, CX leads and email developers to find where time was lost."],["Guardrails","Defined approved modules, brand tokens and tone options the AI had to compose from."],["Prototype","Built the full flow as a coded prototype: prompt, template, live editor, scheduling and analytics."],["Test","Tested with marketing and CX teams and reworked the editing and review steps around their feedback."]],
    solution: "A prompt-first app: write a brief, refine, schedule and track, on-brand by default.",
    features: [["Prompt-first home","Describe the email, attach data context and pick a tone, then generate."],["Template library","Starting points filtered by Marketing, Newsletter, Welcome, Promo, Product Update and Onboarding."],["Live editor with AI refine","Preview the email and refine it with one-tap prompts like “Make it formal” or “Shorter”."],["Smart scheduling","Recipients, send time and an AI-suggested slot, with predicted open and click rates."],["Analytics","Sends, opens, clicks and bounce rate over 30 days, plus top templates and campaign results."],["API","Endpoints to generate, dispatch and measure emails from other systems."]],
    outcomes: ["Teams create routine campaign emails without waiting on design or development","Faster campaign turnaround across business units","Design team freed to focus on high-value creative work"],
    reflection: "With enterprise AI, the interface’s main job is to make output trustworthy. Guardrails built into the system did more for adoption than any single prompt feature."
  },
  {
    slug: "changi-oracle-cloud", title: "Changi Airport Group × Oracle Cloud", short: "Changi × Oracle Cloud",
    client: "Changi Airport Group · Oracle", role: "Lead Product Designer", sector: "Web App · Cloud Pricing Comparison Dashboard", scope: "4 views: pricing, ROI, configure, optimizer",
    cat: ["enterprise","web"], mock: "pricing",
    live: "https://robertazucena.com/assets/prototype/changi/index.html",
    proto: { base: "assets/prototype/changi/",
      desktop: [["Pricing Comparison","index.html#pricing",1883],["ROI Summary","index.html#roi",1708],["Configure Stack","index.html#configure",1783],["Cloud Optimizer","index.html#dashboard",2025]],
      interactive: true,
      heroMobile: [["Pricing Comparison","index.html",0]] },
    summary: "Compare cloud infrastructure costs across leading providers, side by side.",
    status: "Shipped · 2025", deliverables: "Calculator Dashboard, Design System, Prototypes",
    overview: "A cloud pricing comparison dashboard that helps organisations evaluate infrastructure costs across leading cloud providers. It compares compute, storage and other services side by side, highlighting cost differences and potential savings, so teams can make cloud adoption and optimisation decisions with clear, data-driven insight.",
    metric: ["5-yr", "TCO model"],
    tags: ["Data visualisation", "Co-branding", "Coded prototype"],
    stats: [["4 clouds","Oracle, AWS, Azure and Google Cloud on one scale"],["5-year","TCO model with annual savings and payback period"],["4 views","Pricing, ROI, configure and a co-branded optimizer"]],
    challenge: "Cloud cost comparisons lived in spreadsheets that were hard to explain.",
    insight: "People trust a number more when they can <em>change the inputs</em>.",
    approach: [["Align","Agreed the cost model and assumptions with sales and solution engineers."],["Visualise","Designed comparisons that stay readable across four clouds and five years."],["Configure","Built a live configurator so inputs could change in the meeting."],["Brand","Created a co-branded look, down to a flight-themed loader."]],
    solution: "A co-branded tool comparing four clouds over five years, live.",
    features: [["Pricing comparison","Product-by-product prices across four clouds."],["ROI summary","Annual savings, five-year TCO and payback at a glance."],["Configure stack","Change compute, storage and network and watch the estimate update."],["Cloud optimizer","An executive view for Changi, personalised by industry."]],
    outcomes: ["A spreadsheet argument turned into an interactive conversation","Sales could adjust assumptions live with the client","A reusable pattern for future cloud value tools"],
    reflection: "Interactivity creates trust. Letting a client change the inputs did more for credibility than any chart styling."
  },
  {
    slug: "tata-motors-ai", title: "Tata Motors AI Workspace", short: "Tata Motors AI Workspace",
    client: "Tata Motors · Oracle", role: "Lead Product Designer", sector: "Web App · Enterprise AI Model Discovery Platform", scope: "9 pages: AI home, search, library, analytics and more",
    cat: ["ai","enterprise"], mock: "workspace",
    live: "https://robertazucena.com/assets/prototype/tata-motors/index.html",
    proto: { base: "assets/prototype/tata-motors/",
      desktop: [["AI Home","index.html",900],["Search & Synthesis","search-results.html",1470],["Asset Detail","asset-detail.html",1652],["Asset Library","library.html",1130],["Analytics","analytics.html",1098],["Projects","projects.html",900]],
      interactive: true,
      heroMobile: [["AI Home","index.html",0]] },
    summary: "An AI-powered workspace for discovering, evaluating and deploying machine learning models across Tata Motors’ engineering teams.",
    status: "Shipped · 2026", deliverables: "AI Workspace, Design System, Prototypes",
    overview: "One AI workspace where engineering and data teams search, evaluate and deploy models. A conversational home lets people ask in plain language to find assets, analyse data or generate reports. AI-assisted search surfaces production-ready models with a synthesised recommendation, each asset page combines a generated summary, performance metrics and related assets, and a library lets teams browse the catalogue by category and status.",
    metric: ["9", "Pages designed"],
    tags: ["AI / LLM product design", "Search UX", "Prototyping"],
    stats: [["9","Pages, from AI home and search to library, analytics and upload"],["Plain language","Ask for what you need instead of learning where it lives"],["AI synthesis","Every search comes with a summary and a recommended asset"]],
    challenge: "Assets were spread across systems, each with its own search.",
    insight: "People know <em>what</em> they need, not where it lives.",
    approach: [["Inventory","Mapped asset types, metadata and the questions teams asked about them."],["Converse","Designed natural-language search with answers backed by sources."],["Workspace","Combined search, library, detail and analytics in one shell."],["Demo","Delivered a coded prototype to show Oracle Cloud and AI capabilities."]],
    solution: "One AI workspace to ask, find, manage and analyse assets.",
    features: [["Conversational home","Ask in plain language or jump straight to search, analyse, report or summarise."],["AI search & synthesis","Results arrive with a summary and a recommended asset."],["Library & asset detail","Browse by category; each asset shows performance, datasets, API and logs."],["Analytics & projects","Track deployments, accuracy and in-flight builds across teams."]],
    outcomes: ["One entry point instead of several search tools","A prototype that helped sales show Oracle Cloud and AI in context","A reusable pattern for AI assistants on enterprise data"],
    reflection: "An AI answer is only as useful as its sources. Linking every response back to real assets is what made the assistant credible."
  },
  {
    slug: "mufg-asia-pacific", title: "MUFG Asia Pacific", short: "MUFG Asia Pacific",
    client: "MUFG Asia Pacific", role: "UI/UX Designer and Creative Technologist", sector: "Web App · Financial Services", scope: "5 pages: What’s New, Services, Sustainability, Locations, About",
    cat: ["web"], mock: "corporate", wide: true,
    live: "https://robertazucena.com/assets/prototype/mufg/index.html",
    proto: { base: "assets/prototype/mufg/",
      desktop: [["What’s New","index.html",7925],["Our Services","services.html",3499],["Sustainability","sustainability.html",7139],["Locations","locations.html",3788],["About Us","about.html",3062]],
      interactive: true,
      heroMobile: [["What’s New","index.html",0]] },
    summary: "An intuitive and trustworthy experience for MUFG Asia Pacific, designed and hand-built for desktop and mobile.",
    status: "Beta · 2023", deliverables: "Web App, Mobile Responsive",
    overview: "A financial services experience led by a prominent hero banner that highlights key business initiatives with strong imagery. A clean navigation bar and card-based layout present services with clear icons and short descriptions, and bold red accents give it an institutional yet trustworthy feel.",
    metric: ["5", "Pages designed & built"],
    tags: ["Frontend development", "Responsive design", "Design systems"],
    stats: [["5","Pages: What’s New, Our Services, Sustainability, Locations and About Us"],["Pixel-accurate","Hand-built in HTML, CSS and JavaScript to match the design"],["Desktop → mobile","Responsive layouts at 1180, 900 and 640px breakpoints"]],
    challenge: "Dense banking content had to feel calm and match the design on every screen.",
    insight: "For a bank, <em>precision</em> is part of the brand.",
    approach: [["Structure","Organised the content into five clear destinations: What’s New, Our Services, Sustainability, Locations and About Us."],["System","Designed one card system, with icon tiles, tag chips and a red accent rail, and reused it across every page."],["Build","Hand-built all five pages from one shared stylesheet and a small script for navigation, sliders and header state."],["QA","Checked every page against the design at desktop, tablet and mobile breakpoints and tuned the details until they matched."]],
    solution: "Five hand-built pages on one shared card system.",
    features: [["What’s New","Hero, featured service cards, announcements and a newsroom feed."],["Our Services","Capability cards, ESG lending and key figures for corporate clients."],["Sustainability","Three ESG pillars, a milestones slider and leadership quotes."],["Locations","Every regional office, with live opening hours across Asia Pacific."],["About Us","Heritage, group figures and the regional network across Asia Pacific."],["Shared system","One stylesheet and one script, responsive from desktop to mobile."]],
    outcomes: ["Five pages delivered at pixel-accurate fidelity across desktop and mobile","No design-to-development gap: designed and built by the same person","A reusable card and content system for future pages"],
    reflection: "Designing and building it myself removed the handoff completely. That’s why I still prototype in code."
  },
  {
    slug: "grab-employee-portal", title: "Grab Employee Portal", short: "Grab Employee Portal",
    client: "Grab · Oracle", role: "Lead Designer", sector: "Product Design · Employee Portal", scope: "5 pages: home, analytics, team, resources, tools",
    cat: ["enterprise","web"], mock: "portal",
    live: "https://robertazucena.com/assets/prototype/grab/index.html",
    proto: { base: "assets/prototype/grab/",
      desktop: [["Home","index.html",2594],["Analytics","analytics.html",2145],["My Team","team.html",1828],["Resources","resources.html",2092],["Tools","tools.html",3872]],
      interactive: true,
      heroMobile: [["Home","index.html",0]] },
    summary: "A card-based company-wide portal that brings scattered internal tools, news and resources into one place.",
    status: "Shipped · 2024", deliverables: "Design System, Prototypes, Motion",
    overview: "An employee portal built for accessibility and efficiency. A card-based layout groups personal tasks, announcements, company news and workplace resources into clear sections. Grab’s green branding and straightforward navigation help employees stay informed and connected.",
    metric: ["1", "Portal for everything"],
    tags: ["Information architecture", "Design systems", "Intranet UX"],
    stats: [["5","Pages: home, analytics, team, resources and tools"],["1 front door","Tools, news and resources in one place"],["Cards","A modular system that grows with the company"]],
    challenge: "Employees jumped between scattered tools, links and channels.",
    insight: "An intranet should open with <em>what you need today</em>.",
    approach: [["Audit","Catalogued internal tools, content types and how often people used them."],["Structure","Grouped everything into a clear, task-based information architecture."],["System","Designed one card system for tools, news and resources."],["Prototype","Built a coded prototype across home, analytics, team, resources and tools."]],
    solution: "A card-based portal: tools up front, news alongside.",
    features: [["Personal home","Top actions, to-dos and the newsroom on arrival."],["Tools hub","Every self-service tool, grouped by My Grab, Team, Learning, Help and Procurement."],["Team directory","Find colleagues across departments and countries."],["Analytics & resources","Company KPIs, plus templates, policies and training in one place."]],
    outcomes: ["One front door instead of scattered links","A card system that scales with new tools","A clear structure every team could use"],
    reflection: "Consolidation is mostly an information architecture job. The cards were the easy part."
  },
  {
    slug: "oracle-customer-moments", title: "Oracle Customer Moments", short: "Customer Moments (myDash)",
    client: "Oracle", role: "Lead Designer", sector: "Systems Design · Customer Engagement", scope: "7 pages: gallery, editor, dashboard, team, reports",
    cat: ["ai","enterprise"], mock: "ecard",
    live: "https://robertazucena.com/assets/prototype/oracle-cm/index.html",
    proto: { base: "assets/prototype/oracle-cm/",
      desktop: [["Moments Gallery","index.html",1214],["Moment Editor","moment.html",1202],["Moments Dashboard","dashboard.html",1277],["Team Activity","team-activity.html",1515]],
      interactive: true,
      heroMobile: [["Moments Gallery","index.html",0]] },
    summary: "A clean, modern and engaging way for employees to discover and share personalised customer moments.",
    status: "In deployment · 2025", deliverables: "UX Framework, UI Design, Research",
    overview: "Customer Moments is an internal Oracle platform for recognising and celebrating people, from a quick “job well done” to birthdays and milestones, with appreciation flowing across peers and up to executives. A card layout showcases e-cards and videos with search, filters and categories. Paired with Oracle’s minimalist styling and clear hierarchy, it makes sending a moment quick and effortless.",
    metric: ["7", "Pages designed"],
    tags: ["Product design", "Editor UX", "Analytics"],
    stats: [["7","Pages: gallery, editor, dashboard, team activity, reports, help and settings"],["AI-assisted","“Rewrite with AI” for every personal message"],["Team view","A leaderboard and live activity feed for managers"]],
    challenge: "Personal customer outreach needed design help every time.",
    insight: "A personal touch only scales if it takes <em>minutes</em>.",
    approach: [["Moments","Listed the customer milestones sales teams cared about most."],["Editor","Designed a two-step editor: personalise, then preview and send."],["Measure","Added delivery and open analytics for every moment sent."],["Report","Built team activity and reports so managers could see what was working."]],
    solution: "Pick a moment, personalise a card or video, send and track it.",
    features: [["Moments gallery","E-cards and videos for every occasion, searchable by category."],["Moment editor","Personalise the recipient and message, rewrite with AI, preview and send."],["Moments dashboard","Sent, opened and open rate, with a delivery funnel and recent activity."],["Team activity","A leaderboard and live feed of what the team is sending."]],
    outcomes: ["Personal outreach without a design request","Visibility into which moments customers responded to","Team-level reporting for sales managers"],
    reflection: "Small gestures need a fast tool. Removing steps from the editor mattered more than adding template options."
  },
  {
    slug: "courtly", title: "Courtly", short: "Courtly",
    client: null, role: "Lead Product Designer", sector: "Product Design · Sports Court Booking", scope: "6 pages: dashboard, court details, booking, community, profile, edit profile",
    cat: ["web"], mock: "portal",
    live: "https://robertazucena.com/assets/prototype/courtly/index.html",
    proto: { base: "assets/prototype/courtly/",
      desktop: [["Dashboard","index.html",1174],["Court Details","court-details.html",2200],["Booking","booking.html",1600],["Community Games","community.html",1800],["Profile","profile.html",2400],["Edit Profile","edit-profile.html",2200]],
      interactive: true,
      heroMobile: [["Dashboard","index.html",0]] },
    summary: "Your all-in-one platform for sports court bookings.",
    status: "Shipped · 2025", deliverables: "Product Design, Design System, Prototypes",
    overview: "Courtly helps people discover nearby venues, reserve courts and manage their bookings in one place. The dashboard offers personalised recommendations, upcoming schedules, booking history and activity streaks that encourage regular play. With a clean, intuitive interface, users can quickly find courts, join community matches and stay active.",
    metric: ["6", "Pages designed & built"],
    tags: ["Product design", "Booking UX", "Frontend development"],
    stats: [["6","Pages, from discovery to checkout to profile"],["5 sports","Basketball, volleyball, tennis, badminton and futsal"],["375–1440px","Responsive and checked at every width"]],
    challenge: "Booking a court usually means calls, chat groups and guesswork about what’s free.",
    insight: "People don’t want a court. They want <em>a game tonight</em>.",
    approach: [["Flow","Mapped the shortest path from “I want to play” to a confirmed slot."],["System","Built a green and slate token system in Geist, shared across every page."],["Design","Designed in Figma with auto layout so every screen translated cleanly to code."],["Build","Hand-built six pages in HTML, CSS and JavaScript, with one stylesheet and one script."]],
    solution: "Discovery, booking and community in one calm flow.",
    features: [["Dashboard","Favourite-sport filters, nearby courts with ratings and prices, and your upcoming and past bookings."],["Slot booking","Facilities, today’s open slots and a clear checkout."],["Community games","Join open games like a basketball run tonight or a futsal league."],["Profile","Stats, achievements, activity, payment methods and notifications."]],
    outcomes: ["A booking flow that gets to a confirmed slot in a few taps","One token system across six pages","Clean layouts from 375 to 1440px, verified in the browser"],
    reflection: "Small touches, like a preloader of bouncing sports balls, give a utility app its personality."
  },
  {
    slug: "steady", title: "Steady", short: "Steady",
    client: null, role: "Lead Product Designer", sector: "Product Design · Health & Wellness", scope: "5 pages: Today, Health, Sleep, Circle, Rhythm",
    cat: ["web"], mock: "portal",
    live: "https://robertazucena.com/assets/prototype/steady/index.html",
    proto: { base: "assets/prototype/steady/",
      desktop: [["Today","index.html",2200],["Health","health.html",2200],["Sleep","sleep.html",2200],["Circle","circle.html",2200],["Rhythm","rhythm.html",2200]],
      interactive: true,
      heroMobile: [["Today","index.html",0]] },
    summary: "A calmer, smarter way to stay on top of your wellbeing.",
    status: "Shipped · 2026", deliverables: "Product Design, Design System, Prototypes",
    overview: "Steady brings daily health habits into one calm view, tracking heart rate, sleep, steps, nutrition and hydration at a glance. Personalised insights and gentle reminders help people build routines that last, and a warm visual language keeps health tracking approachable and motivating.",
    metric: ["5", "Pages designed & built"],
    tags: ["Product design", "Data visualisation", "AI companion"],
    stats: [["5","Pages: Today, Health, Sleep, Circle and Rhythm"],["1 tap","AI companion on every page"],["1 source","Shared components built once and reused everywhere"]],
    challenge: "Health apps tend to shout numbers at you. Most people just want to know how they’re doing today.",
    insight: "Wellness data should feel <em>reassuring</em>, not clinical.",
    approach: [["Tone","Set a calm visual voice with soft surfaces and warm amber charts."],["Structure","Split the day into five spaces: Today, Health, Sleep, Circle and Rhythm."],["Components","Defined the nav, footer, preloader, AI widget and modals once and reused them on every page."],["Build","Compiled self-contained pages from shared CSS and JavaScript, so they open anywhere."]],
    solution: "Five calm spaces, one steady companion.",
    features: [["Today","A daily overview of how you’re doing, at a glance."],["Nourish log","Mindful eating, logged with a single “Log food” action."],["Sleep & routine","Sleep goals with a simple trend line and a morning routine."],["Wellness circle","Friends, peers and wellness pros, with peer chat built in."]],
    outcomes: ["Five pages built on one shared component set","A gentle chart language people can read at a glance","An AI companion that’s present without getting in the way"],
    reflection: "Removing things, like a hydration log that never earned its place, made the app calmer."
  },
  {
    slug: "on-engineers", title: "ON Engineers", short: "ON Engineers",
    client: "ON Engineers · Singapore", role: "Lead Product Designer", sector: "Website · Electrical Asset Sensing & Analytics", scope: "7 pages: home, ASA, other services, case studies, papers, about, contact",
    cat: ["web"], mock: "corporate",
    live: "https://robertazucena.com/assets/prototype/on-engineers/index.html",
    proto: { base: "assets/prototype/on-engineers/",
      desktop: [["Home","index.html",4200],["ASA Services","asa-services.html",4200],["Other Services","other-services.html",3600],["Case Studies","case-studies.html",3000],["Technical Papers","technical-papers.html",3600],["About","about.html",4200],["Contact","contact.html",1800]],
      interactive: true,
      heroMobile: [["Home","index.html",0]] },
    summary: "A corporate and field-assessment platform for ON Engineers’ non-intrusive condition monitoring of switchgear, transformers, cables, motors and generators.",
    status: "Shipped · 2026", deliverables: "Web Design, Design System, Prototypes",
    overview: "ON Engineers is a Singapore electrical consultancy formed from the JMPS and QPM merger and now part of the SWTS Asia group. It specialises in ASA: non-intrusive monitoring that reads partial discharge, thermal, acoustic and dissolved-gas signals without a shutdown. The site is organised around four pillars (ASA Services, Other Services, Case Studies and Technical Papers), with the merger story, leadership and staff strength on About, and a filterable archive of field assessments on ASA Services.",
    metric: ["7", "Pages designed & built"],
    tags: ["Website design", "Technical content", "Frontend development"],
    stats: [["7","Pages, from services to field case studies"],["111","Licensed engineers presented across every voltage tier"],["20+","Technical papers and videos, organised by topic"]],
    challenge: "Partial discharge testing is hard to explain, and it sells best when facility owners can see the evidence.",
    insight: "A fault doesn’t announce itself. <em>Partial discharge does.</em>",
    approach: [["Story","Led with one idea: see inside your switchgear before it fails."],["Structure","Organised the firm around four pillars: ASA services, other services, case studies and papers."],["Evidence","Turned field assessments into visual case studies with real equipment."],["Build","Hand-built seven pages in HTML, CSS and JavaScript, with a shared stylesheet and script."]],
    solution: "Technical depth made easy to scan.",
    features: [["ASA explained","What ASA is, with the diagnostic techniques shown at work."],["Field case studies","Assessments across switchgear, transformers, cables and busbars."],["Technical library","Papers and video playlists on partial discharge, transformers, cables and fault current."],["LEW training","Seven modules toward the Licensed Electrical Worker qualification."]],
    outcomes: ["A clear story for a highly technical service","Field evidence turned into scannable case studies","One consultation call to action on every page"],
    reflection: "With engineers as the audience, showing the evidence works better than marketing copy."
  }
];

const XP = [
  { yr: "2026 — Now", title: "Independent UX & AI Design Consultant", co: "Monarch Studio", where: "Singapore and Manila",
    pts: ["Designed and built the studio’s flagship WebGL website.","UX direction and design-to-code delivery for the studio and its clients."] },
  { yr: "2016 — 2026", title: "UX & Digital Experience Leader (Senior Manager)", co: "Oracle", where: "Singapore · 3 business units · 5 countries",
    pts: ["Led a team of ~30 designers, frontend developers and UX specialists.","Led AI Email Generator and Autonomous Database (~30% faster time-to-insight)."] },
  { yr: "2015 — 2016", title: "Interactive / Digital Art Director", co: "Ace:Daytons Communications", where: "Digital creative direction", pts: [] },
  { yr: "2014 — 2015", title: "UI/UX Designer & Frontend Developer", co: "Clubvivre", where: "Singapore", pts: [] },
  { yr: "2010 — 2014", title: "Interactive Designer / Frontend Developer", co: "Vocanic", where: "Singapore", pts: [] }
];

const CLIENTS = ["Oracle","Changi Airport Group","Tata Motors","Great Eastern","MUFG","Grab","Monarch Studio","Oracle Cloud Infrastructure"];

/* =========================================================
   MOCK UI GENERATORS (placeholder imagery)
   ========================================================= */
const L = (w, c = "") => `<i class="ln ${c}" style="width:${w}%"></i>`;
const chrome = (u) => `<div class="mk-chrome"><b></b><b></b><b></b><span>${u}</span></div>`;
const side = (n = 6, on = 1) => `<div class="side"><div class="cap" style="margin-bottom:1.4cqw">Menu</div>${Array.from({length:n},(_,i)=>`<div class="ni ${i===on?"on":""}"><i></i>${L(60+((i*17)%35))}</div>`).join("")}</div>`;
function spark(seed = 1, h = 60, fill = true) {
  let pts = [], y = 30;
  for (let i = 0; i <= 24; i++) { y += Math.sin(i * .9 + seed) * 6 + Math.cos(i * .37 * seed) * 4; y = Math.max(8, Math.min(h - 6, y)); pts.push([i * (300 / 24), y]); }
  const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  return `<svg viewBox="0 0 300 ${h}" preserveAspectRatio="none">${fill ? `<path d="${d} L300 ${h} L0 ${h}Z" fill="#f1f2f4"/>` : ""}<path d="${d}" fill="none" stroke="#16191c" stroke-width="1.6"/><circle cx="${pts[24][0]}" cy="${pts[24][1]}" r="3.2" fill="#16191c"/></svg>`;
}
const MOCKS = {
  email: () => `<div class="mk">${chrome("email-studio / new campaign")}<div class="mk-body">
    <div class="main" style="flex:.85;border-right:1px solid #eef0f1;gap:1.4cqw">
      <div class="cap">Brief</div>
      <div class="bubble">Launch email for a cloud summit in Singapore. Warm tone, about 120 words, CTA to register.</div>
      <div class="bubble ai"><span class="spark"></span>Drafted 3 on-brand variants from approved modules.</div>
      <div class="row" style="gap:.8cqw;flex-wrap:wrap"><span class="pill-s">Shorter headline</span><span class="pill-s">Add speaker block</span><span class="pill-s ok">Brand check passed</span></div>
      <div class="input">Refine this email…<i></i></div>
    </div>
    <div class="main" style="background:#f6f7f8;align-items:center">
      <div style="width:78%;background:#fff;border-radius:1.2cqw;padding:2cqw;display:flex;flex-direction:column;gap:1cqw;box-shadow:0 1cqw 3cqw -1.5cqw rgba(0,0,0,.18)">
        <div class="row" style="justify-content:space-between;align-items:center"><span style="width:7cqw;height:1.6cqw;background:#16191c;border-radius:.4cqw"></span><span class="cap">Variant B</span></div>
        <div style="aspect-ratio:16/7;border-radius:1cqw;background:radial-gradient(120% 140% at 80% 0%,#5b6168,#16191c 70%)"></div>
        <div class="t-l" style="font-size:2.7cqw">See what’s next in cloud.</div>
        ${L(96)}${L(88)}${L(64)}
        <div style="align-self:flex-start;background:#16191c;color:#fff;font-size:1.4cqw;padding:1cqw 2.2cqw;border-radius:99px;margin-top:.6cqw">Register now</div>
      </div>
    </div></div></div>`,
  dashboard: () => `<div class="mk">${chrome("cloud console / autonomous database")}<div class="mk-body">${side(7,1)}
    <div class="main">
      <div class="row" style="justify-content:space-between;align-items:center"><div class="t-l">Overview</div><span class="pill-s ok">All systems healthy</span></div>
      <div class="row">
        <div class="box"><div class="cap">Status</div><div class="t" style="margin-top:1cqw">Available</div></div>
        <div class="box"><div class="cap">CPU</div><div class="t" style="margin-top:1cqw">Normal</div><div class="meter" style="margin-top:1cqw"><i style="width:42%"></i></div></div>
        <div class="box"><div class="cap">Storage</div><div class="t" style="margin-top:1cqw">In range</div><div class="meter" style="margin-top:1cqw"><i style="width:63%"></i></div></div>
        <div class="box ink"><div class="cap">Alerts</div><div class="t" style="margin-top:1cqw">Review</div></div>
      </div>
      <div class="row" style="flex:1;min-height:0">
        <div class="box" style="flex:1.6;display:flex;flex-direction:column"><div class="row" style="justify-content:space-between"><div class="cap">Performance · 24h</div><div class="cap">Live</div></div><div style="margin-top:auto">${spark(1.3,70)}</div></div>
        <div class="box fill"><div class="cap">Guided setup</div>${[1,1,0,0].map((d,i)=>`<div class="row" style="align-items:center;gap:1cqw;margin-top:1.2cqw"><span style="width:2cqw;height:2cqw;border-radius:50%;${d?"background:#16191c":"border:1px solid #c3c7cc"};flex:none"></span>${L(70-i*8, d?"dk":"")}</div>`).join("")}</div>
      </div>
    </div></div></div>`,
  claims: () => `<div class="mk">${chrome("claims / review queue")}<div class="mk-body">
    <div class="main" style="flex:1.25;border-right:1px solid #eef0f1">
      <div class="row" style="justify-content:space-between;align-items:center"><div class="t-l">Queue</div><div class="row" style="gap:.6cqw"><span class="pill-s hot">All</span><span class="pill-s">Flagged</span></div></div>
      <div class="tbl">${[["Vehicle","warn",1],["Homeowner","ok",0],["Building owner","warn",0],["Manufacturer","ok",0],["Vehicle","ok",0],["Homeowner","warn",0]].map(([t,s,on],i)=>`<div class="tr ${on?"on":""}">${L(70-i*5,"dk")}<span>${t}</span><span class="pill-s ${s}">${s==="warn"?"Flag":"Clear"}</span>${L(60)}</div>`).join("")}</div>
    </div>
    <div class="main">
      <div class="cap">Claim detail</div><div class="t">Vehicle · Collision</div>
      <div class="box ink"><div class="cap">AI anomaly score</div><div class="t-l" style="margin:1cqw 0">High</div><div class="meter" style="background:#2c3136"><i style="width:82%;background:#fff"></i></div></div>
      <div class="cap">Why it was flagged</div>
      ${["Repair estimate above typical range","Similar claim filed recently","Photo metadata mismatch"].map(s=>`<div class="row" style="align-items:center;gap:1cqw;font-size:1.45cqw;color:#555b61"><span style="width:1.2cqw;height:1.2cqw;background:#16191c;transform:rotate(45deg);flex:none"></span>${s}</div>`).join("")}
      <div class="row" style="margin-top:auto"><span class="pill-s hot" style="flex:1;justify-content:center">Request info</span><span class="pill-s" style="flex:1;justify-content:center">Escalate</span></div>
    </div></div></div>`,
  pricing: () => `<div class="mk">${chrome("cloud value tool / 5-year TCO")}<div class="mk-body">
    <div class="main" style="flex:.7;border-right:1px solid #eef0f1;background:#fbfbfc">
      <div class="cap">Configure stack</div>
      ${["Compute","Storage","Database","Network","Support"].map((s,i)=>`<div><div style="font-size:1.4cqw;margin-bottom:.8cqw">${s}</div><div class="slider"><div class="tr"><i style="left:${[64,40,78,30,55][i]}%"></i></div></div></div>`).join("")}
      <div class="box ink" style="margin-top:auto;flex:none"><div class="cap">Projected savings</div><div class="t-l" style="margin-top:.8cqw">Over 5 yrs</div></div>
    </div>
    <div class="main">
      <div class="row" style="justify-content:space-between;align-items:center"><div class="t-l">Total cost of ownership</div><div class="row" style="gap:.6cqw"><span class="pill-s hot">5 yr</span><span class="pill-s">3 yr</span></div></div>
      <div style="flex:1;padding-bottom:3cqw;min-height:0"><div class="bar"><div class="k" style="height:46%"><span>Oracle</span></div><div style="height:78%"><span>AWS</span></div><div style="height:72%"><span>Azure</span></div><div style="height:84%"><span>GCP</span></div></div></div>
      <div class="row">${[1,2,3,4,5].map(y=>`<div class="box fill" style="padding:1.2cqw"><div class="cap">Y${y}</div>${L(80-y*6,"dk")}</div>`).join("")}</div>
    </div></div></div>`,
  workspace: () => `<div class="mk">${chrome("ai workspace / assets")}<div class="mk-body">${side(6,0)}
    <div class="main">
      <div class="t-l">Ask about any asset</div>
      <div class="input" style="margin-top:0;border-color:#16191c;color:#16191c">Which plant assets are due for maintenance this quarter?<i></i></div>
      <div class="box fill" style="flex:none"><div class="row" style="align-items:center;gap:1cqw"><span class="spark"></span><span class="cap">Answer · 4 sources</span></div>${L(92,"dk")}${L(84)}${L(56)}</div>
      <div class="row" style="flex:1;min-height:0">${["Line A","Robotics","Paint","Logistics"].map(t=>`<div class="tile" style="flex:1;aspect-ratio:auto"><i></i><div style="font-size:1.45cqw;font-weight:500">${t}</div>${L(70)}</div>`).join("")}</div>
    </div></div></div>`,
  ecard: () => `<div class="mk">${chrome("mydash / new moment")}<div class="mk-body">
    <div class="main" style="flex:1.3">
      <div class="row" style="gap:.6cqw"><span class="pill-s hot">E-card</span><span class="pill-s">Video</span><span class="pill-s">Templates</span></div>
      <div class="ecard"><i class="ring"></i><i class="ring"></i><div class="cap" style="margin-bottom:1cqw">To: Priya, Acme Corp</div><div class="ser">Happy 5th<br>anniversary.</div></div>
    </div>
    <div class="main" style="border-left:1px solid #eef0f1;background:#fbfbfc">
      <div class="cap">Video greeting</div>
      <div style="aspect-ratio:16/10;border-radius:1.2cqw;background:linear-gradient(160deg,#d9dce0,#aeb3b9);display:grid;place-items:center"><span class="play"></span></div>
      <div class="cap">Engagement</div><div>${spark(2.4,50,true)}</div>
      <div class="row" style="margin-top:auto"><span class="pill-s ok" style="flex:1;justify-content:center">Opened</span><span class="pill-s" style="flex:1;justify-content:center">Replied</span></div>
    </div></div></div>`,
  portal: () => `<div class="mk">${chrome("people portal / home")}<div class="mk-body">
    <div class="main">
      <div class="row" style="justify-content:space-between;align-items:flex-end"><div><div class="cap">Thursday</div><div class="t-l" style="margin-top:.6cqw">Good morning</div></div><div class="input" style="margin:0;width:40%">Search tools &amp; docs<i></i></div></div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1.4cqw">${["Leave","Payroll","IT help","Learning","Benefits","Travel","Directory","Analytics"].map((t,i)=>`<div class="tile" style="${i===7?"background:#16191c;color:#fff":""}"><i style="${i===7?"background:#fff":""}"></i><div style="font-size:1.45cqw;font-weight:500">${t}</div></div>`).join("")}</div>
      <div class="row"><div class="box fill"><div class="cap">Company news</div>${L(90,"dk")}${L(70)}</div><div class="box fill"><div class="cap">For your team</div>${L(80,"dk")}${L(60)}</div></div>
    </div></div></div>`,
  corporate: () => `<div class="mk">${chrome("apac.bank / home")}<div class="mk-body" style="padding:2.4cqw;gap:2.4cqw;align-items:flex-start;background:#f6f7f8">
    <div style="flex:1;display:flex;flex-direction:column;gap:1.6cqw;background:#fff;border-radius:1.2cqw;padding:1.8cqw;min-width:0">
      <div class="row" style="justify-content:space-between;align-items:center"><span style="width:8cqw;height:1.8cqw;background:#16191c;border-radius:.4cqw"></span><div class="row" style="gap:1.6cqw;width:40%">${L(30)}${L(30)}${L(30)}</div></div>
      <div class="site-hero"><i class="glow"></i><div class="cap" style="color:#8f969d">Asia Pacific</div><div class="t-l" style="color:#fff;max-width:70%;font-size:3cqw">Committed to the region’s growth.</div>${L(50)}</div>
      <div class="row">${[1,2,3].map(()=>`<div class="box">${L(40,"dk")}${L(90)}${L(70)}</div>`).join("")}</div>
    </div>
    <div class="phone"><span style="width:50%;height:1.2cqw;background:#16191c;border-radius:.3cqw"></span><div style="background:#16191c;border-radius:1cqw;aspect-ratio:1;display:flex;align-items:flex-end;padding:1cqw">${L(70)}</div>${L(90,"dk")}${L(70)}${L(80)}${L(50)}<div style="height:5cqw;background:#f2f3f5;border-radius:.8cqw"></div></div>
  </div></div>`
};


/* real screenshots in a browser frame */
const shot = (p) => `<div class="mk shot">${chrome(p.shots.url)}<div class="shot-view"><img src="${p.shots.hero}" alt="${p.title}, home page" decoding="async"></div></div>`;
const visual = (p) => p.shots ? shot(p) : MOCKS[p.mock]();
/* live prototype frames: the real HTML, rendered at true width and scaled down */
const liveIframe = (src, label, vw, vh, inter) => inter
  ? `<div class="lv"><iframe src="${src}" title="${label} (live prototype)" data-vw="${vw}" data-vh="${vh}"></iframe></div>`
  : `<div class="lv"><iframe src="${src}" title="${label}" scrolling="no" tabindex="-1" aria-hidden="true" data-vw="${vw}" data-vh="${vh}"></iframe></div>`;
const liveInter = (base, [l, file], dev) => dev === "web"
  ? `<div class="mk shot live inter">${chrome(l)}<div class="shot-view loading" data-lenis-prevent>${liveIframe(base + file, l, 1440, 900, true)}</div></div>`
  : dev === "tablet"
  ? `<div class="tablet-f live inter"><div class="shot-view loading" data-lenis-prevent>${liveIframe(base + file, l, 1180, 820, true)}</div></div>`
  : `<div class="phone-f live inter"><div class="shot-view loading" data-lenis-prevent>${liveIframe(base + file, l, 390, 844, true)}</div></div>`;
const liveDesk = (base, [l, file, h], pan = true) => `<div class="mk shot live ${pan ? "scroll" : ""}" data-h="${h}">${chrome(l)}<div class="shot-view loading" data-lenis-prevent>${liveIframe(base + file, l, 1440, 900)}</div></div>`;
const liveMob = (base, [l, file, h]) => `<div class="phone-f scroll live" data-h="${h}"><div class="shot-view loading" data-lenis-prevent>${liveIframe(base + file, l, 390, 844)}</div></div>`;
const caseVisual = (p) => p.proto ? liveDesk(p.proto.base, p.proto.desktop[0], false) : visual(p);
function bindViewer(root, p) {
  const v = $(".viewer", root); if (!v || !p.proto) return;
  const panes = { web: $('[data-pane="web"]', v), tablet: $('[data-pane="tablet"]', v), mobile: $('[data-pane="mobile"]', v) };
  const page = { tablet: p.proto.heroTablet ? p.proto.heroTablet[0] : p.proto.desktop[0], mobile: p.proto.heroMobile[0] };
  v.addEventListener("click", (e) => {
    const b = e.target.closest(".seg button"); if (!b) return;
    const dev = b.dataset.dev;
    $$(".seg button", v).forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    Object.entries(panes).forEach(([k, el]) => { if (el) el.hidden = k !== dev; });
    const pane = panes[dev];
    if (dev !== "web" && pane && !pane.childElementCount) pane.innerHTML = liveInter(p.proto.base, page[dev], dev);
    requestAnimationFrame(() => { bindLive(pane); dispatchEvent(new Event("resize")); lenis && lenis.resize(); });
  });
}
function bindLive(root) {
  $$(".live", root).forEach(fr => {
    const view = fr.querySelector(".shot-view"), lv = fr.querySelector(".lv"), ifr = fr.querySelector("iframe");
    const W = +ifr.dataset.vw, VH = +ifr.dataset.vh; let H = fr.classList.contains("scroll") ? +fr.dataset.h : VH;
    const inter = fr.classList.contains("inter");
    const layout = () => {
      const s = view.clientWidth / W; if (!s) return;
      if (inter) { const hv = view.clientHeight / s; ifr.style.width = W + "px"; ifr.style.height = hv + "px"; ifr.style.transform = `scale(${s})`; lv.style.height = view.clientHeight + "px"; return; }
      ifr.style.width = W + "px"; ifr.style.height = H + "px"; ifr.style.transform = `scale(${s})`;
      lv.style.height = (H * s) + "px";
      const d = Math.max(0, H * s - view.clientHeight);
      lv.style.setProperty("--shift", -d + "px"); lv.style.setProperty("--dur", Math.max(2, d / 320) + "s");
    };
    layout();
    if (fr._bound) return; fr._bound = 1;
    const measure = () => { if (inter) return; try { const dh = ifr.contentDocument.documentElement.scrollHeight; if (dh > 200 && fr.classList.contains("scroll")) H = dh; } catch (e) {} layout(); };
    /* always start each live page at its top (browsers restore old scroll positions on reload) */
    const toTop = () => { try { const w = ifr.contentWindow; if (w.history && "scrollRestoration" in w.history) w.history.scrollRestoration = "manual"; w.scrollTo(0, 0); const se = w.document.scrollingElement; if (se) se.scrollTop = 0; } catch (e) {} };
    ifr.addEventListener("load", () => { const cur = ifr.getAttribute("src"); if (!cur || cur === "about:blank") return; view.classList.remove("loading"); if (!inter) view.scrollTop = 0; toTop(); setTimeout(toTop, 300); setTimeout(() => { toTop(); measure(); }, 900); if (!inter) [1800, 3000].forEach(t => setTimeout(toTop, t)); });
    addEventListener("resize", layout);
  });
}

function galleryHTML(p) {
  if (p.proto) { const g = p.proto; return `<div class="gal">
    <div class="gal-head"><span class="mono">Desktop · 1440px · live HTML</span><span class="mono hint">Hover to scroll each page</span></div>
    <div class="gal-desk">${g.desktop.map(d => `<figure class="scr">${liveDesk(g.base, d)}<figcaption>${d[0]}</figcaption></figure>`).join("")}</div>
    ${g.mobile && g.mobile.length ? `<div class="gal-head"><span class="mono">Mobile · 390px · live HTML</span></div>
    <div class="gal-mob">${g.mobile.map(m => `<figure class="scr">${liveMob(g.base, m)}<figcaption>${m[0]}</figcaption></figure>`).join("")}</div>` : ""}
  </div>`; }
  const g = p.shots;
  return `<div class="gal">
    <div class="gal-head"><span class="mono">Desktop · 1440px</span><span class="mono hint">Hover to scroll each page</span></div>
    <div class="gal-desk">${g.desktop.map(([l,src]) => `<figure class="scr"><div class="mk shot scroll">${chrome(l)}<div class="shot-view" data-lenis-prevent><img src="${src}" alt="${p.title}, ${l} page on desktop" decoding="async"></div></div><figcaption>${l}</figcaption></figure>`).join("")}</div>
    ${g.mobile && g.mobile.length ? `<div class="gal-head"><span class="mono">Mobile · 390px</span></div>
    <div class="gal-mob">${g.mobile.map(([l,src]) => `<figure class="scr"><div class="phone-f scroll"><div class="shot-view" data-lenis-prevent><img src="${src}" alt="${p.title}, ${l} page on mobile" decoding="async"></div></div><figcaption>${l}</figcaption></figure>`).join("")}</div>` : ""}
  </div>`;
}
function bindScrollers(root) {
  $$(".scroll .shot-view img", root).forEach(img => {
    const set = () => { const v = img.parentElement; const d = Math.max(0, img.offsetHeight - v.clientHeight); img.style.setProperty("--shift", -d + "px"); img.style.setProperty("--dur", Math.max(2, d / 320) + "s"); };
    img.complete ? set() : img.addEventListener("load", set);
    addEventListener("resize", set);
  });
}

function watchImgs(root) {
  $$(".shot-view img", root).forEach(img => {
    if (img.complete && img.naturalWidth) return;
    const v = img.parentElement; v.classList.add("loading");
    const f = () => v.classList.remove("loading");
    img.addEventListener("load", f, { once: true }); img.addEventListener("error", f, { once: true });
  });
}
const whenLoaded = (imgs, max) => Promise.race([
  Promise.all(imgs.map(i => (i.complete && i.naturalWidth) ? 1 : new Promise(r => { i.addEventListener("load", r, { once: true }); i.addEventListener("error", r, { once: true }); }))),
  new Promise(r => setTimeout(r, max))
]);

/* =========================================================
   RENDER
   ========================================================= */
const pad = (n) => String(n).padStart(2, "0");

// work cards
/* prototypes live in assets/prototype/ on robertazucena.com (and locally); the claude.ai preview host
   reserves that folder name, so the preview serves the same files from assets/proto/ */
const PROTO_DIR = (/(^|\.)robertazucena\.com$/.test(location.hostname) || /^(localhost|127\.0\.0\.1|)$/.test(location.hostname) || location.protocol === "file:") ? "assets/prototype/" : "assets/proto/";
if (PROTO_DIR !== "assets/prototype/") PROJECTS.forEach(p => { if (p.proto) p.proto.base = p.proto.base.replace("assets/prototype/", PROTO_DIR); });

/* the first 8 projects are Selected work; anything after the 8th moves to More work automatically */
const SELECTED_MAX = 8;
const SELECTED = PROJECTS.slice(0, SELECTED_MAX), MORE_P = PROJECTS.slice(SELECTED_MAX);
const workCard = (p, i) => `
  <article class="work rv">
    <a class="work-link" href="#${p.slug}" data-case="${p.slug}" aria-label="Read the ${p.title} case study">
      <div class="work-media"><div class="stage">${caseVisual(p)}</div></div>
      <div class="work-meta"><span class="n num">${pad(i+1)}</span><div><h3>${p.title}</h3><p>${p.sector} · ${p.role}</p></div><span class="view">( View <i>→</i> )</span></div>
    </a>
  </article>`;
$("#workCount").textContent = "(" + pad(SELECTED.length) + ")";
$("#workGrid").innerHTML = SELECTED.map((p, i) => workCard(p, PROJECTS.indexOf(p))).join("");
$("#moreGrid").innerHTML = MORE_P.map((p, k) => `
  <a class="mrow rv" href="#${p.slug}" data-case="${p.slug}" data-k="${k}" aria-label="Read the ${p.title} case study">
    <span class="n num">${pad(PROJECTS.indexOf(p)+1)}</span>
    <span class="t">${p.title}</span>
    <span class="d">${p.sector}</span>
    <span class="s">${p.proto ? p.proto.desktop.length + " pages" : (p.status || "")}</span>
    <span class="go" aria-hidden="true">→</span>
  </a>`).join("");
$("#mfTrack").innerHTML = MORE_P.map(p => `<div class="mf-item">${p.proto ? liveDesk(p.proto.base, [p.title, p.proto.desktop[0][1], 900], false) : caseVisual(p)}</div>`).join("");
if (!MORE_P.length) $(".more").hidden = true;
$("#moreCount").textContent = "(" + pad(MORE_P.length) + ")";

watchImgs($("#workGrid")); bindLive($("#workGrid"));
/* live-frame manager: only prototypes near the viewport run; far-away ones are unloaded and reload on approach */
const LIVE = (() => {
  const io = "IntersectionObserver" in window;
  const load = (f) => { const s = f.dataset.live; if (s && f.getAttribute("src") !== s) f.src = s; };
  const unload = (f) => { const s = f.getAttribute("src"); if (s && s !== "about:blank") { f.src = "about:blank"; const v = f.closest(".shot-view"); if (v) v.classList.add("loading"); } };
  const near = io && new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) load(e.target); }), { rootMargin: "700px 0px" });
  const far = io && new IntersectionObserver((es) => es.forEach(e => { if (!e.isIntersecting) unload(e.target); }), { rootMargin: "1800px 0px" });
  return {
    manage(frames, eager = 0) {
      frames.forEach((f, i) => {
        if (f._mg) return; f._mg = 1; f.dataset.live = f.getAttribute("src");
        if (!io) return;
        if (i >= eager) f.removeAttribute("src");
        near.observe(f); far.observe(f);
      });
    },
    release(frames) { if (io) frames.forEach(f => { near.unobserve(f); far.unobserve(f); f._mg = 0; }); },
  };
})();
LIVE.manage($$("#workGrid iframe"), 2);

// more work: list rows with a live preview that follows the cursor
(() => {
  const list = $("#moreGrid"), fl = $("#mfloat"), track = $("#mfTrack");
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  if (!fine) { fl.remove(); return; }
  document.body.appendChild(fl);
  bindLive(fl);
  const fs = $$("iframe", fl);
  fs.forEach(f => { f.dataset.live = f.getAttribute("src"); f.removeAttribute("src"); });
  /* previews load on first hover of the list and sleep again once the list scrolls away */
  const loadAll = () => fs.forEach(f => { if (f.getAttribute("src") !== f.dataset.live) f.src = f.dataset.live; });
  const sleepAll = () => fs.forEach(f => { const s = f.getAttribute("src"); if (s && s !== "about:blank") { f.src = "about:blank"; const v = f.closest(".shot-view"); if (v) v.classList.add("loading"); } });
  list.addEventListener("pointerenter", loadAll);
  if ("IntersectionObserver" in window) new IntersectionObserver((e) => { if (!e[0].isIntersecting) sleepAll(); }, { rootMargin: "300px 0px" }).observe(list);
  let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y, sc = .82, on = false, raf = 0;
  const tick = () => {
    const fw = fl.offsetWidth, tx = Math.min(x + 36, innerWidth - fw - 24);
    cx += (tx - cx) * 0.14; cy += (y - cy) * 0.14; sc += ((on ? 1 : .82) - sc) * 0.16;
    const tilt = Math.max(-5, Math.min(5, (tx - cx) * 0.035));
    fl.style.transform = `translate3d(${cx}px,${cy}px,0) translate(0,-50%) rotate(${tilt}deg) scale(${sc})`;
    raf = (Math.abs(tx - cx) > .3 || Math.abs(y - cy) > .3 || Math.abs((on ? 1 : .82) - sc) > .002) ? requestAnimationFrame(tick) : 0;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
  list.addEventListener("pointermove", (e) => { x = e.clientX; y = e.clientY; kick(); });
  list.addEventListener("pointerover", (e) => {
    const r = e.target.closest(".mrow"); if (!r) return;
    if (!on) { x = e.clientX; y = e.clientY; cx = Math.min(x + 36, innerWidth - fl.offsetWidth - 24); cy = y; }
    track.style.transform = `translateY(${-100 * +r.dataset.k}%)`;
    on = true; fl.classList.add("on"); kick();
  });
  list.addEventListener("pointerleave", () => { on = false; fl.classList.remove("on"); kick(); });
  addEventListener("scroll", () => { if (on && !list.matches(":hover")) { on = false; fl.classList.remove("on"); } }, { passive: true });
})();

// expertise
const EXPERTISE = [
  ["UX strategy","Direction for products and teams."],
  ["Design leadership","Hiring and growing multidisciplinary teams."],
  ["Enterprise UX","Complex workflows made learnable."],
  ["AI / LLM product design","AI output people can trust."],
  ["Design systems","Shared components that scale."],
  ["Prototyping in code","Coded prototypes, ready to test."],
  ["Frontend development","Responsive HTML, CSS, JS and WebGL."],
  ["Stakeholder management","Launches across countries and teams."]
];
$("#expList").innerHTML = EXPERTISE.map((e, i) => `<li class="rv"><span class="n num">${pad(i+1)}</span><h3>${e[0]}</h3><p>${e[1]}</p></li>`).join("");

// experience
$("#xpList").innerHTML = XP.map(x => `
  <div class="xp-row rv"><span class="yr num">${x.yr}</span><div><h3>${x.title} <em>· ${x.co}</em></h3><div class="where">${x.where}</div></div></div>`).join("");

// stat figure: number (counts up) + unit in italic serif; words set fully in serif
function statValue(v) {
  const m = v.match(/^(\d[\d.,]*(?:–\d+)?[%+]?)(.*)$/);
  if (!m) return `<div class="cs-v word">${v}</div>`;
  const unit = m[2].replace(/^[\s-]+/, "");
  const n = m[1], plain = /^\d+$/.test(n.replace(/[%+]$/, ""));
  return `<div class="cs-v"><span ${plain ? `data-count="${n}"` : ""}>${n}</span>${unit ? `<em>${unit}</em>` : ""}</div>`;
}
function bindStats(root) {
  const box = $(".case-stats", root); if (!box) return;
  box.addEventListener("pointermove", (e) => { const c = e.target.closest(".cs"); if (!c) return; const r = c.getBoundingClientRect(); c.style.setProperty("--mx", (e.clientX - r.left) + "px"); c.style.setProperty("--my", (e.clientY - r.top) + "px"); });
  const run = () => {
    box.classList.add("in");
    if (RM) return;
    $$("[data-count]", box).forEach((el, k) => {
      const raw = el.dataset.count, suf = raw.replace(/^\d+/, ""), to = parseInt(raw, 10), t0 = performance.now() + k * 120, D = 1300;
      el.textContent = "0" + suf;
      const f = (now) => { const t = Math.min(1, Math.max(0, (now - t0) / D)); el.textContent = Math.round(to * (1 - Math.pow(1 - t, 4))) + suf; if (t < 1) requestAnimationFrame(f); };
      requestAnimationFrame(f);
    });
  };
  if (!("IntersectionObserver" in window)) { run(); return; }
  const o = new IntersectionObserver((ents) => { if (ents.some(e => e.isIntersecting)) { o.disconnect(); setTimeout(run, 250); } }, { threshold: .35 });
  o.observe(box);
}

// case study
function caseHTML(p) {
  const i = PROJECTS.indexOf(p), next = PROJECTS[(i + 1) % PROJECTS.length];
  return `<div class="wrap">
    <div class="case-top" data-toc="Overview">
      <a class="back" href="#work" data-sec="work"><span>←</span> All work</a>
      <div class="case-top-r">${p.live ? `<a class="btn ghost" href="${p.live}" target="_blank" rel="noopener">View live prototype <span class="arr">↗</span></a>` : ""}<span class="eyebrow num"><i class="sq"></i>Case study ${pad(i+1)} / ${pad(PROJECTS.length)}</span></div>
    </div>
    <span class="eyebrow" style="margin-bottom:22px">${p.sector}</span>
    <h1 class="case-title">${p.title}</h1>
    <p class="case-sum">${p.summary}</p>
    <div class="meta">
      ${p.client ? `<div><span class="mono">Client</span><b>${p.client}</b></div>` : `<div><span class="mono">Scope</span><b>${p.scope}</b></div>`}
      <div><span class="mono">Role</span><b>${p.role}</b></div>
      <div><span class="mono">Status</span><b>${p.status}</b></div>
      <div><span class="mono">Deliverables</span><b>${p.deliverables}</b></div>
    </div>
    ${(p.proto && p.proto.interactive) ? `<div class="case-hero viewer">
      <div class="vw-bar"><div class="seg" role="group" aria-label="Device"><button type="button" id="dev-web" data-dev="web" aria-pressed="true">Web</button><button type="button" id="dev-tablet" data-dev="tablet" aria-pressed="false">iPad</button><button type="button" id="dev-mobile" data-dev="mobile" aria-pressed="false">Mobile</button></div><span class="mono hint">Scroll and click inside</span></div>
      <div class="stage" data-pane="web">${liveInter(p.proto.base, p.proto.desktop[0], "web")}</div>
      <div class="tablet-stage" data-pane="tablet" hidden></div>
      <div class="phone-stage" data-pane="mobile" hidden></div>
    </div>` : `<div class="case-hero"><div class="stage">${caseVisual(p)}</div></div>`}
    <div class="case-stats">${p.stats.map((s,k)=>`<div class="cs ${k===0?"ink":""}" style="--rd:${k*0.12}s">${k===0?'<span class="cs-grid" aria-hidden="true"></span>':""}<div class="cs-top"><span>${pad(k+1)} / ${pad(p.stats.length)}</span><i aria-hidden="true"></i></div><div>${statValue(s[0])}<p class="cs-d">${s[1]}</p></div></div>`).join("")}</div>

    <section class="chapter" data-toc="Challenge"><div class="lbl"><span class="mono">01 — Context</span><h2>The challenge</h2></div>
      <div class="ct"><p class="big">${p.challenge}</p><p class="insight"><span class="mono">Insight</span><span>${p.insight}</span></p></div></section>

    <section class="chapter" data-toc="Approach"><div class="lbl"><span class="mono">02 — Process</span><h2>Approach</h2></div>
      <div class="ct"><div class="proc">${p.approach.map((a,k)=>`<div><span class="mono">Step ${pad(k+1)}</span><b>${a[0]}</b><p>${a[1]}</p></div>`).join("")}</div></div></section>

    <section class="chapter" data-toc="Solution"><div class="lbl"><span class="mono">03 — Product</span><h2>The solution</h2></div>
      <div class="ct">
        <p class="big">${p.solution}</p>
        ${p.overview ? `<p class="ov">${p.overview}</p>` : ""}
        <ul class="feat">${p.features.slice(0,4).map(f=>`<li><b>${f[0]}</b><span>${f[1]}</span></li>`).join("")}</ul>
        ${(p.shots || p.proto) ? "" : `<div class="ph"><div class="mono">Image placeholder<b>Key screen, full width</b>2880 × 1620 · replace with final UI</div></div>
        <div class="ph-row">
          <div class="ph"><div class="mono">Image placeholder<b>Detail or flow</b>1200 × 1500</div></div>
          <div class="ph"><div class="mono">Image placeholder<b>Mobile or component</b>1200 × 1500</div></div>
        </div>`}
      </div></section>

    ${(p.shots || p.proto) ? `<section class="chapter gal-ch" data-toc="Screens"><div class="lbl"><span class="mono">Screens</span><h2>${((p.proto || p.shots).mobile || []).length ? "Every page, web &amp; mobile" : "Every page"}</h2></div><div class="ct">${galleryHTML(p)}</div></section>` : ""}

    <section class="chapter" data-toc="Outcomes"><div class="lbl"><span class="mono">04 — Impact</span><h2>Outcomes</h2></div>
      <div class="ct"><ul class="outc">${p.outcomes.map(o=>`<li>${o}</li>`).join("")}</ul></div></section>

    <section class="chapter" data-toc="Reflection" style="border-bottom:0"><div class="lbl"><span class="mono">05 — Reflection</span><h2>What I’d carry forward</h2></div>
      <div class="ct"><p class="big"><em>${p.reflection}</em></p></div></section>

    <a class="next" href="#${next.slug}" data-case="${next.slug}"><span class="mono">Next case study · ${pad(PROJECTS.indexOf(next)+1)}</span><h2>${next.title} <span class="arr">→</span></h2></a>
  </div>`;
}

/* =========================================================
   SMOOTH SCROLL
   ========================================================= */
let lenis = null;
if (!RM && typeof window.Lenis === "function") {
  try {
    lenis = new window.Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  } catch (e) { lenis = null; }
}
const scrollToY = (y, immediate) => { if (lenis) lenis.scrollTo(y, { immediate: !!immediate, duration: 1.4 }); else window.scrollTo({ top: y, behavior: immediate || RM ? "auto" : "smooth" }); };
const scrollToEl = (el, immediate) => { if (!el) return; const y = el.getBoundingClientRect().top + window.scrollY - (el.id === "top" ? 0 : 70); scrollToY(Math.max(0, y), immediate); };

/* =========================================================
   PAGE FADE
   ========================================================= */
const fade = $("#fade");
let busy = false;
function transition(label, mid) {
  if (RM) { mid(); return; }
  if (busy) return; busy = true;
  fade.classList.add("on");
  setTimeout(() => { Promise.resolve(mid()).then(() => requestAnimationFrame(() => { fade.classList.remove("on"); setTimeout(() => { busy = false; }, 360); })); }, 360);
}

/* case study preloader: same loader as the intro, waits for the page's live prototype */
function runLoader(name, cap, work, minMs = 900) {
  const L = $("#loader"), root = document.documentElement;
  return new Promise(res => {
    const end = () => { root.classList.add("ready"); L && L.classList.add("done"); res(); };
    if (!L || RM) { Promise.resolve(work()).then(end, end); return; }
    $(".ld-name", L).innerHTML = name; $(".ld-cap", L).textContent = cap;
    const num = $("#ldNum"), bar = $("#ldBar"); num.textContent = "0"; bar.style.width = "0%";
    root.classList.remove("ready"); L.classList.remove("done");
    let done = false, shown = 0, last = performance.now(); const t0 = last;
    setTimeout(() => Promise.resolve(work()).then(() => { done = true; }, () => { done = true; }), 380);
    setTimeout(() => { done = true; }, 6000);
    const step = () => {
      const now = performance.now(), dt = Math.min(250, now - last); last = now;
      const target = Math.min(done ? 100 : 90, (now - t0) / minMs * 100);
      shown = Math.min(target, shown + Math.max((target - shown) * Math.min(1, dt / 120), dt * .06));
      num.textContent = Math.round(shown); bar.style.width = shown + "%";
      if (shown >= 100 && performance.now() - t0 > minMs) { setTimeout(end, 150); return; }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

/* =========================================================
   ROUTER (#slug opens a case study; section links scroll)
   ========================================================= */
const home = $("#home"), caseEl = $("#case");
let view = "home";
/* ---------- SEO: keep title / description / share URL in step with the current view ---------- */
const SITE = { title: document.title, description: (document.querySelector('meta[name="description"]') || {}).content || "", url: (document.querySelector('link[rel="canonical"]') || {}).href || location.href };
function setMeta(desc, url) {
  const set = (sel, attr, val) => { const el = document.querySelector(sel); if (el && val) el.setAttribute(attr, val); };
  set('meta[name="description"]', "content", desc); set('meta[property="og:description"]', "content", desc); set('meta[name="twitter:description"]', "content", desc);
  set('meta[property="og:title"]', "content", document.title); set('meta[name="twitter:title"]', "content", document.title);
  set('meta[property="og:url"]', "content", url);
}

function showCase(p, immediate) {
  const go = () => {
    LIVE.release($$("iframe", caseEl));
    caseEl.innerHTML = caseHTML(p);
    /* gallery screens load as they approach, so the hero gets the bandwidth first */
    LIVE.manage($$(".gal-ch iframe", caseEl), 0);
    home.hidden = true; caseEl.hidden = false; view = p.slug;
    document.title = p.title + " · Case study · Robert Azucena";
    setMeta(p.summary, location.href);
    scrollToY(0, true); observeReveals(); bindCursorTargets(); watchImgs(caseEl); bindScrollers(caseEl); bindLive(caseEl); bindViewer(caseEl, p); bindStats(caseEl); TOC.build(caseEl); lenis && lenis.resize();
    const hero = $(".case-hero iframe, .case-hero img", caseEl);
    if (!hero) return null;
    if (hero.tagName === "IFRAME") return Promise.race([new Promise(r => hero.addEventListener("load", r, { once: true })), new Promise(r => setTimeout(r, 2500))]);
    return whenLoaded([hero], 2500);
  };
  if (immediate) { go(); return; }
  const i = PROJECTS.indexOf(p);
  runLoader(p.short, `Case study ${pad(i + 1)} / ${pad(PROJECTS.length)}`, go, 2000);
}


/* ---------- playful headline: letters repel on hover, shatter on click, spring back ---------- */
(() => {
  const h1 = $(".intro .intro-h"); if (!h1 || RM) return;
  h1.setAttribute("aria-label", h1.textContent.replace(/\s+/g, " ").trim());
  // split every text node into words (no mid-word breaks) and letters
  const chars = [];
  const split = (node) => {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
          const w = document.createElement("span"); w.className = "w"; w.setAttribute("aria-hidden", "true");
          [...part].forEach(c => { const e = document.createElement("span"); e.className = "lt"; e.textContent = c; w.appendChild(e); chars.push({ e, x: 0, y: 0, vx: 0, vy: 0, r: 0, vr: 0, s: 1, vs: 0, bx: 0, by: 0 }); });
          frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) split(n);
    });
  };
  split(h1);
  h1.classList.add("play");
  // release the rise-animation clip once the lines have risen, so letters can fly freely
  let risen = 0; const free = () => h1.classList.add("free");
  h1.addEventListener("animationend", () => { if (++risen >= $$(".ln>span", h1).length) free(); });
  setTimeout(free, 4500);

  const hint = $("#playHint");
  if (hint && !matchMedia("(hover:hover) and (pointer:fine)").matches) $("span", hint).textContent = "Tap the words to shatter";
  setTimeout(() => hint && hint.classList.add("on"), 2600);
  let px = -9999, py = -9999, inside = false, raf = 0, last = performance.now(), used = false;
  const R = 120;
  const measure = () => { // letter centres in page space, minus current offsets
    chars.forEach(c => { const r = c.e.getBoundingClientRect(); c.bx = r.left + r.width / 2 - c.x + scrollX; c.by = r.top + r.height / 2 - c.y + scrollY; });
  };
  const step = (now) => {
    raf = 0;
    let dt = Math.min(48, now - last) / 16.67; last = now;
    let moving = false;
    const sub = Math.ceil(dt), h = dt / sub;
    for (let k = 0; k < sub; k++) chars.forEach(c => {
      let tx = 0, ty = 0, ts = 1;
      if (inside) {
        const dx = c.bx - scrollX - px, dy = c.by - scrollY - py, d = Math.hypot(dx, dy);
        if (d < R) { const f = Math.pow(1 - d / R, 2); tx = dx / (d || 1) * f * 30; ty = dy / (d || 1) * f * 24; ts = 1 + f * .22; }
      }
      // springs: a little under-damped so letters wobble back like jelly
      c.vx += ((tx - c.x) * .14 - c.vx * .16) * h; c.vy += ((ty - c.y) * .14 - c.vy * .16) * h;
      c.vr += ((0 - c.r) * .1 - c.vr * .14) * h;   c.vs += ((ts - c.s) * .2 - c.vs * .22) * h;
      c.x += c.vx * h; c.y += c.vy * h; c.r += c.vr * h; c.s += c.vs * h;
    });
    chars.forEach(c => {
      if (Math.abs(c.vx) + Math.abs(c.vy) + Math.abs(c.vr) + Math.abs(c.vs) > .02 || Math.abs(c.x) + Math.abs(c.y) + Math.abs(c.r) > .05 || Math.abs(c.s - 1) > .002) moving = true;
      c.e.style.transform = `translate3d(${c.x.toFixed(2)}px,${c.y.toFixed(2)}px,0) rotate(${c.r.toFixed(2)}deg) scale(${c.s.toFixed(3)})`;
    });
    if (moving || inside) raf = requestAnimationFrame(step);
  };
  const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); } };
  const shatter = (x, y) => {
    measure();
    chars.forEach(c => {
      const dx = c.bx - scrollX - x, dy = c.by - scrollY - y, d = Math.hypot(dx, dy) || 1;
      const p = 26 * Math.min(1.6, 260 / (d + 80));
      c.vx += dx / d * p + (Math.random() - .5) * 10; c.vy += dy / d * p - Math.random() * 8;
      c.vr += (Math.random() - .5) * 46; c.vs += .25;
    });
    if (hint && !used) { used = true; hint.classList.remove("on"); }
    kick();
  };
  h1.addEventListener("pointerenter", (e) => { if (e.pointerType !== "mouse") return; measure(); inside = true; kick(); });
  h1.addEventListener("pointermove", (e) => { if (e.pointerType !== "mouse") return; px = e.clientX; py = e.clientY; if (!inside) { measure(); inside = true; } kick(); });
  h1.addEventListener("pointerleave", () => { inside = false; px = py = -9999; kick(); });
  h1.addEventListener("click", (e) => shatter(e.clientX, e.clientY));
  addEventListener("scroll", () => { if (inside) measure(); }, { passive: true });
  addEventListener("resize", () => { inside = false; });
})();

/* ---------- hero text parallax: each line moves at its own pace ---------- */
(() => {
  const intro = $("#top"); if (!intro || RM) return;
  const L = [
    [$(".intro .hello"),            -.17, 6, 3],
    [$(".intro .intro-h .ln:nth-child(1)"), -.12, 10, 5],
    [$(".intro .intro-h .ln:nth-child(2)"), -.07, 18, 8],
    [$(".intro .intro-h .it"),      0,   14, 0],
    [$(".intro .facts"),            0, 0, 0],
    [$(".intro .intro-cta"),        -.035, 0, 0],
  ].filter(x => x[0]);
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  let mx = 0, my = 0, cx = 0, cy = 0, sy = scrollY, csy = scrollY, last = performance.now(), vis = true, raf = 0;
  const frame = (now) => {
    raf = 0; if (!vis || view !== "home") return;
    const dt = Math.min(100, now - last); last = now;
    const a1 = 1 - Math.exp(-dt / 260), a2 = 1 - Math.exp(-dt / 110);
    cx += (mx - cx) * a1; cy += (my - cy) * a1; csy += (sy - csy) * a2;
    L.forEach(([el, sp, ax, ay]) => { el.style.transform = `translate3d(${(-cx * ax).toFixed(2)}px,${(csy * sp - cy * ay).toFixed(2)}px,0)`; });
    if (Math.abs(sy - csy) > .2 || Math.abs(mx - cx) > .0005 || Math.abs(my - cy) > .0005) kick();
  };
  const kick = () => { if (!raf && vis) raf = requestAnimationFrame(frame); };
  if (fine) addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; kick(); }, { passive: true });
  addEventListener("scroll", () => { sy = scrollY; kick(); }, { passive: true });
  if ("IntersectionObserver" in window) new IntersectionObserver(([e]) => { vis = e.isIntersecting; kick(); }).observe(intro);
  addEventListener("hashchange", () => setTimeout(() => { last = performance.now(); kick(); }, 60));
  kick();
})();


/* ---------- case table of contents: rail on desktop, floating pill on smaller screens ---------- */
const TOC = (() => {
  let nav = null, secs = [], cur = -1, onS = null, onK = null, onDoc = null;
  const destroy = () => {
    if (onS) removeEventListener("scroll", onS); if (onK) removeEventListener("keydown", onK); if (onDoc) document.removeEventListener("click", onDoc);
    nav && nav.remove(); nav = null; secs = []; cur = -1;
  };
  const build = (root) => {
    destroy();
    secs = $$("[data-toc]", root); if (secs.length < 3) return;
    nav = document.createElement("nav"); nav.className = "toc"; nav.setAttribute("aria-label", "Case study sections");
    nav.innerHTML = `<button type="button" class="toc-pill" aria-expanded="false"><span class="tn"></span><span class="lb"></span><span class="bar"><b></b></span><span class="cv" aria-hidden="true">▾</span></button>
      <ol class="toc-list">${secs.map((el, i) => `<li><button type="button" data-i="${i}"><span class="tl">${el.dataset.toc}</span><span class="tn">${pad(i + 1)}</span><i aria-hidden="true"></i></button></li>`).join("")}</ol>`;
    document.body.appendChild(nav);
    const pill = $(".toc-pill", nav), btns = $$(".toc-list button", nav);
    const setOpen = (o) => { nav.classList.toggle("open", o); pill.setAttribute("aria-expanded", String(o)); };
    pill.addEventListener("click", (e) => { e.stopPropagation(); setOpen(!nav.classList.contains("open")); });
    btns.forEach(b => b.addEventListener("click", (e) => { e.stopPropagation(); setOpen(false); const k = +b.dataset.i; if (k === 0) scrollToY(0); else scrollToEl(secs[k]); }));
    onDoc = () => setOpen(false); document.addEventListener("click", onDoc);
    onK = (e) => { if (e.key === "Escape") setOpen(false); }; addEventListener("keydown", onK);
    let ticking = false;
    const update = () => {
      ticking = false; if (!nav) return;
      const line = innerHeight * .38; let i = 0;
      secs.forEach((el, k) => { if (el.getBoundingClientRect().top <= line) i = k; });
      const doc = document.documentElement, max = doc.scrollHeight - innerHeight;
      if (scrollY >= max - 4) i = secs.length - 1;
      nav.classList.toggle("show", scrollY > Math.min(420, innerHeight * .45));
      if (i !== cur) {
        cur = i; btns.forEach((b, k) => { b.classList.toggle("on", k === i); if (k === i) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
        $(".tn", pill).textContent = `${pad(i + 1)}/${pad(secs.length)}`; $(".lb", pill).textContent = secs[i].dataset.toc;
      }
      $(".bar", pill).style.setProperty("--p", (Math.min(1, scrollY / Math.max(1, max)) * 100).toFixed(1) + "%");
    };
    onS = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    addEventListener("scroll", onS, { passive: true });
    update();
  };
  return { build, destroy };
})();

function showHome(sec, immediate) {
  const target = () => document.getElementById(sec || "top");
  if (view === "home") { scrollToEl(target(), immediate); return; }
  const go = () => {
    TOC.destroy(); LIVE.release($$("iframe", caseEl));
    home.hidden = false; caseEl.hidden = true; caseEl.innerHTML = ""; view = "home";
    requestAnimationFrame(() => dispatchEvent(new Event("resize")));
    document.title = SITE.title;
    setMeta(SITE.description, SITE.url);
    lenis && lenis.resize(); scrollToEl(target(), true); bindCursorTargets(); observeReveals();
  };
  immediate ? go() : transition(`Robert <em>Azucena</em>`, go);
}
function setHash(h) { try { history.pushState(null, "", "#" + h); } catch (e) { try { location.hash = h; } catch (_) {} } }
function route(immediate) {
  let h = ""; try { h = decodeURIComponent(location.hash.slice(1)); } catch (e) {}
  const p = PROJECTS.find(x => x.slug === h);
  if (p) { if (view !== p.slug) showCase(p, immediate); }
  else showHome(h && document.getElementById(h) ? h : "top", immediate || view === "home");
}
document.addEventListener("click", (e) => {
  const a = e.target.closest("a[href^='#']"); if (!a) return;
  e.preventDefault();
  document.body.classList.remove("menu-open"); $("#menuBtn").setAttribute("aria-expanded", "false");
  if (a.dataset.case) { const p = PROJECTS.find(x => x.slug === a.dataset.case); setHash(p.slug); showCase(p); }
  else { const s = a.dataset.sec || a.getAttribute("href").slice(1); setHash(s); showHome(s); }
});
addEventListener("popstate", () => route(false));
addEventListener("hashchange", () => route(false));

/* =========================================================
   MOBILE MENU
   ========================================================= */
$("#menuBtn").addEventListener("click", () => {
  const open = document.body.classList.toggle("menu-open");
  $("#menuBtn").setAttribute("aria-expanded", String(open));
});

/* =========================================================
   REVEALS (transform only)
   ========================================================= */
let io;
function observeReveals() {
  $$("#case .case-top, #case .case-title, #case .case-sum, #case .meta, #case .case-hero, #case .cs, #case .chapter .lbl, #case .chapter:not(.gal-ch) .ct > *, #case .scr, #case .next").forEach(el => el.classList.add("rv"));
  if (!("IntersectionObserver" in window)) { $$(".rv").forEach(el => el.classList.add("in")); return; }
  io && io.disconnect();
  io = new IntersectionObserver((ents) => {
    let k = 0;
    ents.forEach(en => { if (en.isIntersecting) { en.target.style.setProperty("--rd", Math.min(k++, 6) * 0.08 + "s"); en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { rootMargin: "0px 0px -6% 0px" });
  $$(".rv:not(.in)").forEach(el => io.observe(el));
}
observeReveals();

/* =========================================================
   CLOCK
   ========================================================= */
function tick() {
  let t = "";
  try { t = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Singapore" }).format(new Date()); } catch (e) { t = ""; }
  $$(".clock").forEach(c => c.textContent = t);
}
tick(); setInterval(tick, 20000);

/* =========================================================
   COPY EMAIL
   ========================================================= */
$("#copyEmail").addEventListener("click", () => {
  const b = $("#copyEmail"), v = $("#emailV").textContent.trim();
  const done = (msg) => { b.textContent = msg; setTimeout(() => b.textContent = "Copy", 1800); };
  const fallback = () => { const r = document.createRange(); r.selectNodeContents($("#emailV")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); done("Selected"); };
  try { navigator.clipboard.writeText(v).then(() => done("Copied"), fallback); } catch (e) { fallback(); }
});

/* =========================================================
   SCROLL PROGRESS + NAV STATE
   ========================================================= */
const prog = $("#progress");
const navLinks = $$(".pill a");
function onScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  prog.style.width = (view === "home" ? 0 : Math.min(100, (scrollY / Math.max(1, max)) * 100)) + "%";
  if (view === "home") {
    let cur = "";
    ["work","leadership","expertise","process","experience"].forEach(id => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < innerHeight * .4) cur = id; });
    navLinks.forEach(a => a.classList.toggle("on", a.dataset.sec === cur));
  } else navLinks.forEach(a => a.classList.remove("on"));
  SH.scroll = scrollY;
}
addEventListener("scroll", onScroll, { passive: true });

function bindCursorTargets() {}

/* =========================================================
   GRADIENT GRID SHADER (fixed background)
   ========================================================= */
(function shader() {
  const cv = $("#bg");
  let gl = null;
  try { gl = cv.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: "low-power" }); } catch (e) {}
  if (!gl) { cv.remove(); const f = document.createElement("div"); f.className = "bg-fallback"; document.body.prepend(f); return; }

  const vs = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
  const fs = `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform float uHover;
uniform float uDpr; uniform float uScroll; uniform vec3 uRip;

float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x), mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x), u.y); }
float fbm(vec2 p){ float v=0., a=.5; mat2 r=mat2(.8,.6,-.6,.8);
  for(int i=0;i<5;i++){ v+=a*noise(p); p=r*p*2.03; a*=.5; } return v; }
float field(vec2 uv, float t){
  vec2 q = vec2(fbm(uv*1.1 + vec2(0., t)), fbm(uv*1.1 + vec2(5.2, -t*.8)));
  vec2 r = vec2(fbm(uv*1.3 + q*1.6 + vec2(1.7, 9.2) + t*.5), fbm(uv*1.3 + q*1.6 + vec2(8.3, 2.8) - t*.4));
  return fbm(uv*.9 + r*1.4);
}
vec3 grey(float v){
  vec3 a=vec3(.993,.994,.996), b=vec3(.895,.902,.913), c=vec3(.785,.795,.812);
  vec3 col=mix(a,b,smoothstep(0.,.55,v)); return mix(col,c,smoothstep(.55,1.,v));
}
float ringAt(vec2 p){
  float age=uTime-uRip.z; if(age<=0. || age>=2.4) return 0.;
  float d=distance(p,uRip.xy*uDpr)/uRes.y; return exp(-pow((d-age*.55)*14.,2.))*(1.-age/2.4);
}

void main(){
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  float D = uDpr; float t = uTime*.04;
  vec2 off = vec2(0., uScroll*D*.00035);
  vec2 uv = px/uRes.y;
  float dm = distance(px, uMouse*D)/uRes.y;
  float glow = exp(-dm*dm*9.)*uHover;
  float ring = ringAt(px);
  // the cursor gently pushes the gradient
  vec2 push = (uv - uMouse*D/uRes.y) * exp(-dm*dm*6.) * .12 * uHover;
  float v = smoothstep(.2,.8,field(uv + off + push, t));
  vec3 col = grey(v);
  col = mix(col, vec3(1.), glow*.4 + ring*.25);
  float top = 1.-smoothstep(0., .22, px.y/uRes.y);
  col = mix(col, vec3(.993,.994,.996), top*.3);
  col += (hash(px + fract(uTime)*91.) - .5)*.01;
  gl_FragColor = vec4(col,1.);
}`;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; } return s; };
  const v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs);
  if (!v || !f) { cv.remove(); const d = document.createElement("div"); d.className = "bg-fallback"; document.body.prepend(d); return; }
  const pr = gl.createProgram(); gl.attachShader(pr, v); gl.attachShader(pr, f); gl.linkProgram(pr); gl.useProgram(pr);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {}; ["uRes","uTime","uMouse","uHover","uDpr","uScroll","uRip"].forEach(k => U[k] = gl.getUniformLocation(pr, k));

  let dpr = 1, W = 0, H = 0;
  const resize = () => {
    dpr = .5; /* soft gradient: render at half resolution and let the browser upscale */
    W = Math.floor(innerWidth * dpr); H = Math.floor(innerHeight * dpr);
    cv.width = W; cv.height = H; gl.viewport(0, 0, W, H);
    gl.uniform2f(U.uRes, W, H); gl.uniform1f(U.uDpr, dpr);
    if (RM) draw(performance.now());
  };
  let tx = innerWidth * .7, ty = innerHeight * .35, sx = tx, sy = ty, hover = FINE ? 0 : .0, hT = FINE ? 0 : 0;
  let rip = [-999, -999, -999];
  const t0 = performance.now();
  addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; hT = 1; if (RM) draw(performance.now()); }, { passive: true });
  document.addEventListener("pointerleave", () => { hT = 0; });
  addEventListener("pointerdown", (e) => { rip = [e.clientX, e.clientY, (performance.now() - t0) / 1000]; }, { passive: true });

  function draw(now) {
    const time = (now - t0) / 1000;
    sx += (tx - sx) * .08; sy += (ty - sy) * .08; hover += (hT - hover) * .05;
    gl.uniform1f(U.uTime, RM ? 12.0 : time);
    gl.uniform2f(U.uMouse, sx, sy);
    gl.uniform1f(U.uHover, hover);
    gl.uniform1f(U.uScroll, SH.scroll || 0);
    gl.uniform3f(U.uRip, rip[0], rip[1], RM ? -999 : rip[2]);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  let running = true;
  let lastDraw = 0;
  const loop = (now) => { if (running && now - lastDraw > 31) { draw(now); lastDraw = now; } requestAnimationFrame(loop); };
  document.addEventListener("visibilitychange", () => { running = !document.hidden; });
  addEventListener("resize", resize);
  resize();
  if (RM) { hover = 0; draw(performance.now()); } else requestAnimationFrame(loop);
})();
/* intro loader: waits for fonts and project images (max 3s) */
route(true);
(function boot() {
  const L = $("#loader"); if (!L) return;
  const finish = () => { document.documentElement.classList.add("ready"); L.classList.add("done"); };
  if (RM) { finish(); return; }
  const bootCase = PROJECTS.find(p => p.slug === decodeURIComponent(location.hash.slice(1)));
  const minMs = bootCase ? 2000 : 900;
  if (bootCase) { $(".ld-name", L).innerHTML = bootCase.short; $(".ld-cap", L).textContent = `Case study ${pad(PROJECTS.indexOf(bootCase) + 1)} / ${pad(PROJECTS.length)}`; }
  const imgs = bootCase ? $$("#case .case-hero iframe") : $$("#workGrid img, #workGrid iframe[src]");
  const total = imgs.length + 1; let done = 0, shown = 0, last = performance.now(); const t0 = last;
  const tick = () => { done = Math.min(total, done + 1); };
  imgs.forEach(i => (i.tagName === "IMG" && i.complete && i.naturalWidth) ? tick() : (i.addEventListener("load", tick, { once: true }), i.addEventListener("error", tick, { once: true })));
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(tick, tick);
  setTimeout(() => { done = total; }, 3000);
  const num = $("#ldNum"), bar = $("#ldBar");
  const step = () => {
    const now = performance.now(), dt = Math.min(250, now - last); last = now;
    const target = Math.min(done / total * 100, (now - t0) / minMs * 100);
    shown = Math.min(target, shown + Math.max((target - shown) * Math.min(1, dt / 120), dt * .06));
    num.textContent = Math.round(shown); bar.style.width = shown + "%";
    if (shown >= 100 && performance.now() - t0 > minMs) { setTimeout(finish, 150); return; }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
})();
onScroll();
})();
