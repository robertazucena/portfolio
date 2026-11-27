/* Howely resources: editorial rewrites of the articles on howely.com.sg/resource.
   Loaded as a plain script so the site keeps working from file:// (no fetch). */
window.HW_ARTICLES = [
  {
    slug: 'customs-clearance', topic: 'Customs', date: '2023-11-30', img: 'media/port.webp',
    alt: 'Aerial view of a container yard with rows of stacked shipping containers',
    title: 'Effortless customs clearance in Singapore',
    lead: 'Customs clearance is the step that turns cargo at the border into stock you can sell. It is paperwork-heavy, but when it is done right your goods arrive on time, legally, and without surprise costs.',
    sections: [
      { h: 'What clearance actually involves', p: ['Every import or export is checked against its declaration. Customs verifies what is in the shipment, assesses the duties and taxes owed, and confirms the documentation matches. Only then are the goods released.'],
        list: ['A customs declaration that describes the goods accurately', 'The right tariff classification for each product', 'Supporting documents such as invoices, packing lists and permits'] },
      { h: 'Where shipments get stuck', p: ['Most delays come from small things: a missing permit, a vague product description, a value that does not match the invoice. Each one can hold a shipment at the port, add storage charges, or in serious cases lead to fines or seized goods.'] },
      { h: 'How long it takes in Singapore', p: ['Singapore runs one of the most streamlined clearance systems in the world. With complete, correct documents, many shipments clear quickly. Complex tariff classifications or controlled goods take longer, so it pays to prepare before the cargo lands.'] },
      { h: 'Clearance for e-commerce sellers', p: ['Online brands move many small consignments rather than a few big ones. Automated declarations and a partner who knows your product range keep that volume flowing, so orders are not waiting at the border while customers wait at home.'] },
      { h: 'Why a clearing partner helps', p: ['A clearing agent or customs broker handles the declaration, duty payment and port clearance, and keeps you compliant as rules change. Digitised filing and real-time tracking mean you can see where every shipment stands.', 'At Howely, clearance hands straight over to our warehouse, so goods move from port to shelf without a second booking.'] }
    ]
  },
  {
    slug: 'warehouse-cross-docking', topic: 'Warehousing', date: '2023-10-31', img: 'media/aisle.webp',
    alt: 'A warehouse aisle lined with tall shelves',
    title: 'Warehouse cross-docking, explained',
    lead: 'Cross-docking skips the shelf. Goods arrive, get sorted by destination and leave on an outbound vehicle, often within hours. Less storage, less handling, faster delivery.',
    sections: [
      { h: 'What cross-docking is', p: ['Inbound goods are unloaded and moved directly to outbound trucks with little or no time in storage. Because stock barely stops, you save on handling, space and the cost of holding inventory.'] },
      { h: 'Cross-docking versus warehousing', p: ['Traditional warehousing keeps goods until they are needed. Cross-docking keeps them moving. One is not better than the other: steady, predictable flows suit cross-docking, while seasonal or slow-moving stock usually needs a shelf.'] },
      { h: 'The two main types', list: ['Pre-distribution: goods from several suppliers are sorted and merged for each destination before they leave', 'Post-distribution: goods are sorted and consolidated on arrival, matched to delivery routes'] },
      { h: 'How it works, step by step', p: ['Unload, sort by destination, consolidate onto outbound vehicles. It sounds simple, but it depends on tight coordination between suppliers, carriers and the dock, and on real-time tracking so every pallet is where it should be.'] },
      { h: 'Is it right for your business?', p: ['Businesses of every size can benefit, from a small brand restocking a few outlets to retail, automotive and healthcare supply chains. Watch fulfilment time, inventory turnover, transport cost and error rates to see whether it is working.', 'Less storage and fewer touches also means a smaller carbon footprint. Talk to us about running part of your flow across the dock.'] }
    ]
  },
  {
    slug: 'supply-chain-solutions', topic: 'Supply chain', date: '2023-10-03', img: 'media/sea.webp',
    alt: 'A container ship docked at a port, seen from above',
    title: 'Tools for supply chain visibility',
    lead: 'You cannot fix what you cannot see. The right tools give manufacturers, distributors and retailers a live picture of stock, shipments and disruptions, so decisions get made on facts.',
    sections: [
      { h: 'What supply chain solutions do', p: ['They are the systems and services that plan, track and run the flow of goods. Done well, they improve visibility, shorten lead times and cut costs across the chain.'] },
      { h: 'The core toolkit', list: ['Inventory management software: accurate stock levels in every location', 'Transportation management systems (TMS): plan, book and track freight', 'Demand forecasting tools: buy and position stock ahead of demand', 'Supplier relationship management: keep vendors aligned and accountable'] },
      { h: 'A note on the IGM', p: ['The Import General Manifest lists the cargo on a vessel arriving at port. Customs uses it to plan clearance, which is why accurate manifest data upstream speeds everything downstream.'] },
      { h: 'Choosing and rolling out tools', p: ['Start with the bottleneck that costs you most, check the tool works with the systems you already run, and measure the result: lead time, stock accuracy and cost per order are good places to start. Most tools suit small businesses as well as large ones.'] },
      { h: 'What we put in place', list: ['Real-time tracking and monitoring of shipments', 'Integrated supply chain software instead of disconnected spreadsheets', 'Automation where it removes errors', 'Vendor-managed inventory for steady replenishment', 'A contingency plan for when a link breaks', 'Clear communication between everyone in the chain'] }
    ]
  },
  {
    slug: 'warehousing-services', topic: 'Warehousing', date: '2023-09-02', img: 'media/hero.webp',
    alt: 'A forklift moving down a tall warehouse aisle stacked with wrapped pallets',
    title: "A guide to Singapore's warehousing services",
    lead: 'Warehousing is the backbone of logistics. Pick the right kind of space and the right partner, and storage stops being a cost centre and starts speeding up delivery.',
    sections: [
      { h: 'What a warehousing service covers', p: ['Secure storage, monitored around the clock with controlled access, plus the people and systems to receive, count and release your stock. Outsourcing it to a third-party provider turns a fixed cost into one that scales with you.'] },
      { h: 'The main types of warehouse', list: ['Public warehousing: shared space you rent as you need it', 'Private warehousing: space run for one business', 'Bonded warehousing: duties and taxes are deferred until goods are sold or exported', 'Temperature-controlled warehousing: for perishables, healthcare and beauty products'] },
      { h: 'Options for smaller businesses', p: ['Not every brand needs a full facility. 3PL warehouses, mini warehouses and co-warehousing let small businesses share space and staff, and pay only for what they use.'] },
      { h: 'What good warehousing gives you', list: ['Better inventory management, with fewer stockouts and less overstock', 'Faster delivery, because stock sits close to your customers', 'Lower costs than running your own space'] },
      { h: 'Beyond storage', p: ['The best warehouses also handle returns, forecast demand, automate picking and connect to freight forwarding. Ask about those when you compare providers, along with location, security and reporting.'] }
    ]
  },
  {
    slug: 'third-party-logistics', topic: 'Transport', date: '2023-08-01', img: 'media/van.webp',
    alt: 'Boxes being loaded into a delivery van',
    title: 'Understanding third-party logistics transportation',
    lead: 'A 3PL runs the parts of your supply chain you would rather not: transport, warehousing, distribution and fulfilment. Here is what that looks like in practice, and how to choose one.',
    sections: [
      { h: 'Why businesses use a 3PL', list: ['Cost savings, because you share infrastructure instead of building it', 'Expertise and specialised services on tap', 'Room to scale up for peaks and down when it is quiet'] },
      { h: 'What a 3PL handles', list: ['Supply chain and inventory management', 'Reverse logistics for returns', 'Cold chain for temperature-sensitive goods', 'Intermodal transport across sea, air and road'] },
      { h: 'How the partnership works', p: ['It starts with the right provider, then shared information: forecasts, orders and stock levels. From there the 3PL books, tracks and monitors every shipment, and handles exceptions before they reach your customer.'] },
      { h: 'Where it is heading', p: ['Connected devices, AI and data analytics are making transport more predictable, while e-commerce has made last-mile delivery the part customers notice most.'] },
      { h: 'Choosing a provider', p: ['Look at experience in your industry, the infrastructure they actually own or control, how they price, and how easily their systems talk to yours. Ask how they handle disruption, because every supply chain meets some.'] }
    ]
  },
  {
    slug: 'warehouse-packing', topic: 'Fulfilment', date: '2023-07-04', img: 'media/handover.webp',
    alt: 'A person handing over a cardboard box',
    title: 'How fulfilment services simplify warehouse packing',
    lead: 'Packing is where an order becomes a parcel, and where many returns begin. A fulfilment partner turns it into a repeatable process that protects goods and saves time.',
    sections: [
      { h: 'What fulfilment services are', p: ['You outsource storage, picking, packing and shipping to a partner who does it every day. Your team gets its time back, and orders go out faster and more consistently.'] },
      { h: 'Packing techniques that protect goods', list: ['Box-in-box for fragile items', 'Bubble wrap and void fill so nothing moves in transit', 'Clear, correct labelling', 'Stacking and stabilising pallets'] },
      { h: 'Running a better packing floor', list: ['Organised storage and smart product placement', 'Streamlined packing stations with standard packaging', 'A checklist: stock accuracy, product inspection, packaging, labels, quality control', 'Training, feedback and performance tracking'] },
      { h: 'Where automation helps', p: ['Barcode scanning cuts picking errors, automated packing stations and robotic palletisers speed up volume, and a warehouse management system ties it together.'] },
      { h: 'The common challenges', p: ['Product variety, tight cut-offs, labour-intensive work and limited space. A fulfilment partner brings the experience and scale to absorb them, with fewer errors and faster order processing.'] }
    ]
  },
  {
    slug: 'door-to-door-delivery', topic: 'Transport', date: '2023-06-03', img: 'media/courier.webp',
    alt: 'A courier in an orange jacket cycling through a city street at night',
    title: 'Door-to-door delivery made easy',
    lead: 'One booking, from pickup to doorstep. Door-to-door delivery takes the handoffs out of shipping, so your customer simply receives what they ordered.',
    sections: [
      { h: 'What door-to-door means', p: ['Pickup, transport and delivery are handled by one partner under one booking. There is no separate carrier for each leg and no gap where a parcel can go missing.'] },
      { h: 'Who it suits', list: ['Online brands shipping orders to homes', 'Businesses dropping stock to outlets and partners', 'Bulky items that need careful handling'] },
      { h: 'What to look for', p: ['Clear tracking at every step, reliable delivery windows, careful handling and a team you can reach when plans change.'] },
      { h: 'How Howely runs it', p: ['Because we also store and pack your stock, door-to-door delivery can start on our own shelves. Orders are often out the door the same day, and delivered islandwide.'] }
    ]
  }
];
