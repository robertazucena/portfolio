/* Aurora Airlines demonstration data.
   Everything here is illustrative: a fictional network, schedule, fares and bookings that make the
   prototype work end to end. No live inventory, pricing or ticketing. Replace AuroraData with an API
   layer to connect real services; the app only reads through these functions. */
(function () {
  "use strict";

  var AIRPORTS = [
    { code: "SIN", city: "Singapore", name: "Changi Airport", country: "Singapore", lat: 1.36, lon: 103.99, tz: 8, region: "Asia" },
    { code: "HND", city: "Tokyo", name: "Haneda Airport", country: "Japan", lat: 35.55, lon: 139.78, tz: 9, region: "Asia" },
    { code: "KIX", city: "Osaka", name: "Kansai International", country: "Japan", lat: 34.43, lon: 135.24, tz: 9, region: "Asia" },
    { code: "HKG", city: "Hong Kong", name: "Hong Kong International", country: "Hong Kong SAR", lat: 22.31, lon: 113.91, tz: 8, region: "Asia" },
    { code: "MNL", city: "Manila", name: "Ninoy Aquino International", country: "Philippines", lat: 14.51, lon: 121.02, tz: 8, region: "Asia" },
    { code: "BKK", city: "Bangkok", name: "Suvarnabhumi Airport", country: "Thailand", lat: 13.69, lon: 100.75, tz: 7, region: "Asia" },
    { code: "DPS", city: "Bali", name: "Ngurah Rai International", country: "Indonesia", lat: -8.75, lon: 115.17, tz: 8, region: "Asia" },
    { code: "SYD", city: "Sydney", name: "Kingsford Smith Airport", country: "Australia", lat: -33.94, lon: 151.18, tz: 11, region: "Oceania" },
    { code: "ZQN", city: "Queenstown", name: "Queenstown Airport", country: "New Zealand", lat: -45.02, lon: 168.74, tz: 13, region: "Oceania" },
    { code: "DXB", city: "Dubai", name: "Dubai International", country: "United Arab Emirates", lat: 25.25, lon: 55.36, tz: 4, region: "Middle East" },
    { code: "LHR", city: "London", name: "Heathrow Airport", country: "United Kingdom", lat: 51.47, lon: -0.45, tz: 1, region: "Europe" },
    { code: "CDG", city: "Paris", name: "Charles de Gaulle", country: "France", lat: 49.01, lon: 2.55, tz: 2, region: "Europe" },
    { code: "LIS", city: "Lisbon", name: "Humberto Delgado Airport", country: "Portugal", lat: 38.77, lon: -9.13, tz: 1, region: "Europe" },
    { code: "KEF", city: "Reykjavík", name: "Keflavík International", country: "Iceland", lat: 63.99, lon: -22.62, tz: 0, region: "Europe" },
    { code: "JFK", city: "New York", name: "John F. Kennedy International", country: "United States", lat: 40.64, lon: -73.78, tz: -4, region: "Americas" },
    { code: "CPT", city: "Cape Town", name: "Cape Town International", country: "South Africa", lat: -33.97, lon: 18.6, tz: 2, region: "Africa" }
  ];
  var BY_CODE = {}; AIRPORTS.forEach(function (a) { BY_CODE[a.code] = a; });

  /* Network: Singapore is the hub; a few long-haul gateways fly direct to each other. */
  var DIRECT = ["LHR-JFK", "CDG-JFK", "LIS-JFK", "KEF-JFK", "KEF-LHR", "DXB-LHR", "DXB-CDG", "DXB-CPT", "LHR-CPT", "HND-SYD", "SYD-ZQN", "HKG-HND", "MNL-HND", "LHR-LIS", "CDG-KEF"];
  var HUBS = ["SIN", "DXB", "LHR", "SYD", "HND"];
  function isDirect(a, b) { return a === "SIN" || b === "SIN" || DIRECT.indexOf(a + "-" + b) > -1 || DIRECT.indexOf(b + "-" + a) > -1; }

  function km(a, b) {
    var A = BY_CODE[a], B = BY_CODE[b], r = Math.PI / 180;
    var d = Math.sin((B.lat - A.lat) * r / 2), e = Math.sin((B.lon - A.lon) * r / 2);
    return 2 * 6371 * Math.asin(Math.sqrt(d * d + Math.cos(A.lat * r) * Math.cos(B.lat * r) * e * e));
  }
  function blockMinutes(a, b) { return Math.round((km(a, b) / 860) * 60 + 32); }   // cruise plus taxi and climb

  /* deterministic pseudo-random from a string */
  function seed(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return function () { h += 0x6D2B79F5; var t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  var CABINS = [
    { id: "economy", name: "Economy", mult: 1 },
    { id: "premium", name: "Premium Economy", mult: 1.85 },
    { id: "business", name: "Business", mult: 4.1 },
    { id: "first", name: "First", mult: 6.8 }
  ];
  var FARES = [
    { id: "essential", name: "Essential", mult: 1, bags: { cabin: "1 × 7 kg", checked: "None" }, seat: "Fee applies", changes: "Not permitted", refund: "Not refundable", miles: "50%" },
    { id: "classic", name: "Classic", mult: 1.2, bags: { cabin: "1 × 7 kg", checked: "1 × 25 kg" }, seat: "Standard seats included", changes: "SGD 150 per change", refund: "SGD 250 fee", miles: "100%" },
    { id: "flex", name: "Flex", mult: 1.48, bags: { cabin: "2 × 7 kg", checked: "2 × 30 kg" }, seat: "Any seat included", changes: "Free", refund: "Fully refundable", miles: "125%" }
  ];
  var AIRCRAFT = { "35K": "Airbus A350-1000", "789": "Boeing 787-9" };

  function legFlightNo(a, b) { var r = seed(a + b)(); return "AU " + (100 + Math.floor(r * 880)); }

  /* Build the itineraries for one origin, destination and date. Times are local to each airport. */
  function search(q) {
    if (!BY_CODE[q.from] || !BY_CODE[q.to]) return { error: "unknown-airport" };
    if (q.from === q.to) return { error: "same-airport" };
    var rnd = seed(q.from + q.to + q.date), routes = [];
    if (isDirect(q.from, q.to)) routes.push([q.from, q.to]);
    HUBS.forEach(function (h) {
      if (h === q.from || h === q.to) return;
      if (isDirect(q.from, h) && isDirect(h, q.to)) {
        var detour = (km(q.from, h) + km(h, q.to)) / km(q.from, q.to);
        if (detour < 1.32) routes.push([q.from, h, q.to]);
      }
    });
    if (!routes.length) return { flights: [] };
    var cabin = CABINS.filter(function (c) { return c.id === q.cabin; })[0] || CABINS[0];
    var out = [];
    routes.forEach(function (path, ri) {
      var departures = path.length === 2 ? 3 + Math.floor(rnd() * 2) : 2;
      for (var k = 0; k < departures; k++) {
        var dep = Math.round((6 * 60 + k * (16 * 60 / departures) + rnd() * 90) / 5) * 5;   // minutes after midnight, local
        var legs = [], t = dep, total = 0;
        for (var i = 0; i < path.length - 1; i++) {
          var a = path[i], b = path[i + 1], blk = blockMinutes(a, b);
          var arrLocal = t - BY_CODE[a].tz * 60 + blk + BY_CODE[b].tz * 60;
          legs.push({ from: a, to: b, dep: t, arr: arrLocal, mins: blk, flightNo: legFlightNo(a, b), aircraft: km(a, b) > 6000 ? "35K" : "789" });
          total += blk;
          if (i < path.length - 2) { var lay = 75 + Math.round(rnd() * 14) * 10; t = arrLocal + lay; total += lay; legs[legs.length - 1].layover = lay; }
        }
        var arr = legs[legs.length - 1].arr, dayShift = Math.floor(arr / 1440) - Math.floor(dep / 1440);
        var base = (km(q.from, q.to) * 0.071 + 120) * cabin.mult * (0.86 + rnd() * 0.36) * (path.length === 2 ? 1.08 : 0.94);
        out.push({
          id: q.from + q.to + q.date + "-" + ri + k,
          from: q.from, to: q.to, date: q.date, dep: dep, arr: ((arr % 1440) + 1440) % 1440, dayShift: dayShift, mins: total,
          stops: path.length - 2, via: path.slice(1, -1), legs: legs, cabin: cabin.id,
          prices: FARES.map(function (f) { return Math.round(base * f.mult / 5) * 5; }),
          seatsLeft: rnd() < 0.25 ? 2 + Math.floor(rnd() * 5) : null
        });
      }
    });
    out.sort(function (a, b) { return a.dep - b.dep; });
    return { flights: out };
  }
  function cheapestFor(from, to, date, cabin) {
    var r = search({ from: from, to: to, date: date, cabin: cabin || "economy" });
    if (!r.flights || !r.flights.length) return null;
    return Math.min.apply(null, r.flights.map(function (f) { return f.prices[0]; }));
  }
  function findFlight(id, cabin) {
    var m = /^([A-Z]{3})([A-Z]{3})(\d{4}-\d{2}-\d{2})-/.exec(id || "");
    if (!m) return null;
    var r = search({ from: m[1], to: m[2], date: m[3], cabin: cabin || "economy" });
    return (r.flights || []).filter(function (f) { return f.id === id; })[0] || null;
  }

  /* Taxes and fees: a fixed airport component plus a percentage, per passenger (infants pay 10%). */
  function priceFor(fareAdult, pax) {
    var fare = fareAdult * pax.adt + Math.round(fareAdult * 0.75) * pax.chd + Math.round(fareAdult * 0.1) * pax.inf;
    var taxes = Math.round((pax.adt + pax.chd) * 64 + fare * 0.08 + pax.inf * 12);
    return { fare: fare, taxes: taxes, total: fare + taxes };
  }

  /* Destination stories. highlights: [icon, title, detail]; weather is typical for the best season. */
  var DESTINATIONS = [
    { code: "KEF", photo: "media/dest-reykjavik.webp?v=2", title: "Reykjavík", kicker: "Iceland", season: "September to March", weather: "−2 to 4°C, crisp and dry",
      line: "Where our name comes from. A small, bright capital of snow-white rooftops, warm pools and long winter nights made for the northern lights.",
      highlights: [["sparkle", "Northern lights", "Clear nights from September to March, often minutes from town."], ["drop", "Geothermal lagoons", "Steam-warm water outdoors, even in the middle of winter."], ["mountains", "Golden Circle", "Geysers, waterfalls and a rift valley in one day trip."]] },
    { code: "HND", photo: "media/dest-tokyo.webp?v=2", title: "Tokyo", kicker: "Japan", season: "March to May, October to February", weather: "5 to 12°C in winter, clear skies",
      line: "On a clear winter morning Mount Fuji floats over the bay. Below it, a city of quiet side streets, late counters and trains that leave on the second.",
      highlights: [["mountains", "Fuji from the city", "Winter air is clearest; look west from the bay at sunrise."], ["fork-knife", "Counter dining", "Sushi, ramen and yakitori at counters of eight seats or fewer."], ["train", "Day trips by rail", "Hakone, Kamakura and Nikko are each under two hours away."]] },
    { code: "LIS", photo: "media/dest-lisbon.webp?v=2", title: "Lisbon", kicker: "Portugal", season: "April to June, September to October", weather: "18 to 26°C, sunny and breezy",
      line: "Whitewashed streets dressed in blue azulejo tiles, stepping down seven hills to the wide, bright Tagus.",
      highlights: [["squares-four", "Azulejo streets", "Walk the Alfama and Graça, where whole façades are tiled."], ["coffee", "Pastéis de nata", "Still warm from the oven, with a bica espresso."], ["waves", "Atlantic coast", "Cascais and Sintra are a short train ride west."]] },
    { code: "ZQN", photo: "media/dest-queenstown.webp?v=2", title: "Queenstown", kicker: "New Zealand", season: "June to August for snow, December to February", weather: "−1 to 9°C in winter",
      line: "Snow on the Remarkables, mirrored in the still blue of Lake Wakatipu. Ski in the morning, eat by the water at night.",
      highlights: [["snowflake", "Four ski fields", "Coronet Peak and the Remarkables are 25 minutes from town."], ["boat", "Lake Wakatipu", "Glass-calm mornings, best seen from the lakefront or a steamer."], ["mountains", "Milford Sound", "A fiord of sheer cliffs and waterfalls, by road or by air."]] },
    { code: "KIX", photo: "media/dest-kyoto.webp?v=2", title: "Kyoto", kicker: "Japan, via Osaka", season: "December to February, November", weather: "1 to 9°C, rare and quiet snow",
      line: "Temple gardens at their most still: raked gravel under fresh snow and pines bent white. Land at Kansai and you are an hour from the first gate.",
      highlights: [["tree", "Zen gardens", "Ryōan-ji and Daitoku-ji are calmest on winter mornings."], ["bowl-food", "Kaiseki dining", "Seasonal tasting menus in old machiya townhouses."], ["train", "Easy from Kansai", "The Haruka express reaches Kyoto Station in about 75 minutes."]] },
    { code: "CPT", photo: "media/dest-capetown.webp?v=2", title: "Cape Town", kicker: "South Africa", season: "November to March", weather: "18 to 27°C, sunny and windy",
      line: "Table Mountain under its white tablecloth of cloud, white sand, cold blue Atlantic. Wine country by lunch, two oceans before sunset.",
      highlights: [["mountains", "Table Mountain", "Take the cableway up, or hike Platteklip Gorge in two hours."], ["waves", "Atlantic beaches", "Camps Bay and Clifton, with the Twelve Apostles behind."], ["wine", "Winelands", "Stellenbosch and Franschhoek are under an hour away."]] },
    { code: "JFK", photo: "media/dest-newyork.webp?v=2", title: "New York", kicker: "United States", season: "September to December", weather: "−2 to 8°C in winter",
      line: "Central Park the morning after snow, Midtown towers bright above it. The city is at its quietest and most beautiful in winter light.",
      highlights: [["tree", "Central Park", "843 acres; the Bow Bridge and the Mall are best after snowfall."], ["paint-brush", "World-class museums", "The Met, MoMA and the Guggenheim within a short walk."], ["buildings", "Skyline views", "Top of the Rock faces the park and the Empire State at once."]] },
    { code: "SYD", photo: "media/dest-sydney.webp?v=2", title: "Sydney", kicker: "Australia", season: "September to November, March to May", weather: "18 to 25°C, mild and sunny",
      line: "White sails on a deep blue harbour. Ferries are the commute and the ocean beaches are a bus ride from the city.",
      highlights: [["music-notes", "Opera House", "Take a tour by day, a performance by night."], ["boat", "Harbour ferries", "The Manly ferry is the best 30-minute view in the city."], ["waves", "Ocean pools", "Bondi to Coogee on the coastal walk, with a swim at Bronte."]] }
  ];

  var CABIN_STORIES = [
    { id: "business", title: "Business", sub: "A suite with a door on every long-haul aircraft", photo: "media/cabin-suite.webp?v=2", points: ["Fully flat bed in a 1-2-1 layout, so every seat has the aisle", "A sliding door and a wide, quiet window", "Dine when you like, from a menu that follows the route"] },
    { id: "premium", title: "Premium Economy", sub: "More room, and a real night of rest", photo: "media/cabin-premium.webp?v=2", points: ["Wider seats with a calf rest and deeper recline", "Two checked bags on every fare", "Priority boarding and a dedicated cabin"] },
    { id: "economy", title: "Economy", sub: "Considered, all the way to the back", photo: "media/cabin-economy.webp?v=2", points: ["Adjustable headrests and USB-C power at every seat", "Free messaging Wi-Fi on every flight", "Hot meals on flights longer than three hours"] }
  ];

  /* Demonstration bookings for Manage Booking. Reference plus last name, case-insensitive. */
  function demoBooking(ref, last, from, to, dateOffset, cabin, fareIdx, pax) {
    var d = new Date(); d.setDate(d.getDate() + dateOffset);
    var date = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
    var r = search({ from: from, to: to, date: date, cabin: cabin }), f = r.flights && r.flights[0];
    return f ? { ref: ref, last: last, demo: true, trip: "oneway", cabin: cabin, segments: [{ id: f.id, fare: fareIdx }], passengers: pax, contact: { email: "traveller@example.com" }, total: priceFor(f.prices[fareIdx], { adt: pax.length, chd: 0, inf: 0 }).total } : null;
  }
  var DEMO_BOOKINGS = [
    demoBooking("AUR7QX", "Tan", "SIN", "KEF", 21, "business", 2, [{ title: "Ms", first: "Mei Lin", last: "Tan", type: "adt" }]),
    demoBooking("AUK3PD", "Santos", "SIN", "HND", 9, "economy", 1, [{ title: "Mr", first: "Paolo", last: "Santos", type: "adt" }, { title: "Ms", first: "Ana", last: "Santos", type: "adt" }]),
    demoBooking("AUC4NX", "Lim", "SIN", "SYD", 1, "economy", 1, [{ title: "Mr", first: "Daniel", last: "Lim", type: "adt" }, { title: "Ms", first: "Grace", last: "Lim", type: "adt" }, { title: "Miss", first: "Chloe", last: "Lim", type: "chd" }])
  ].filter(Boolean);

  window.AuroraData = {
    airports: AIRPORTS, airport: function (c) { return BY_CODE[c] || null; }, cabins: CABINS, fares: FARES, aircraft: AIRCRAFT,
    destinations: DESTINATIONS, cabinStories: CABIN_STORIES, demoBookings: DEMO_BOOKINGS,
    search: search, cheapestFor: cheapestFor, findFlight: findFlight, priceFor: priceFor, seed: seed, currency: "SGD"
  };
})();
