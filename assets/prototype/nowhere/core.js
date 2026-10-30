/* Nowhere — shared data, maths and storage for every page. Concept prototype; listings, people and travel times are samples. */
(function () {
  "use strict";

  /* ---------- places ---------- */
  var TOWNS = {
    "Toa Payoh": [1.3343, 103.8563], "Bishan": [1.3508, 103.8485], "Tiong Bahru": [1.2862, 103.8270], "Punggol": [1.4043, 103.9022], "Tampines": [1.3540, 103.9453],
    "Queenstown": [1.2942, 103.8060], "Joo Chiat": [1.3127, 103.9010], "Bukit Timah": [1.3294, 103.8021], "Sengkang": [1.3917, 103.8760],
    "Clementi": [1.3151, 103.7652], "Kallang": [1.3138, 103.8628], "Woodlands": [1.4370, 103.7865], "Pasir Ris": [1.3721, 103.9474]
  };
  var FAMILY = Object.assign({ "Ang Mo Kio": [1.3691, 103.8454], "Yishun": [1.4304, 103.8354], "Bedok": [1.3236, 103.9273], "Jurong West": [1.3404, 103.7090], "Hougang": [1.3612, 103.8863], "Serangoon": [1.3554, 103.8679] }, TOWNS);
  var WORK = { "Raffles Place": [1.2840, 103.8514], "Marina Bay": [1.2797, 103.8540], "one-north": [1.2995, 103.7872], "Jurong East": [1.3331, 103.7423], "Changi Business Park": [1.3343, 103.9636], "Paya Lebar": [1.3177, 103.8926], "Novena": [1.3204, 103.8438], "Mapletree Business City": [1.2745, 103.7995], "Woodlands Regional Centre": [1.4360, 103.7880] };
  var SCHOOL = { "Ai Tong School": [1.3606, 103.8335], "Catholic High School": [1.3547, 103.8445], "Nan Hua Primary": [1.3196, 103.7608], "Henry Park Primary": [1.3175, 103.7887], "Rosyth School": [1.3725, 103.8745], "Tao Nan School": [1.3059, 103.9118], "Fernvale Primary": [1.3905, 103.8768], "Tampines Primary": [1.3496, 103.9536], "Maris Stella High": [1.3424, 103.8770], "Punggol Green Primary": [1.4022, 103.9049] };
  var ROLES = {
    work: { label: "Work", letter: "W", icon: "M4 8h16v11H4zM9 8V5h6v3M4 13h16", c: "#3D5A8A", places: WORK, note: "The rings on the map count minutes from here." },
    parents: { label: "Parents", letter: "P", icon: "M4 11l8-7 8 7M6 9.5V20h12V9.5M10 20v-5h4v5", c: "#A0522D", places: FAMILY, note: "Homes within <b>4 km</b> qualify for the Proximity Housing Grant." },
    school: { label: "School", letter: "S", icon: "M2 9l10-5 10 5-10 5zM6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5", c: "#6A5590", places: SCHOOL, note: "Homes within <b>1 km</b> get priority in the Primary 1 ballot." },
    other: { label: "Other", letter: "+", icon: "M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5", c: "#3F7470", places: Object.assign({}, WORK, TOWNS), note: "A gym, a partner's office, a place of worship." }
  };
  var MRT = {
    "Braddell": [1.3405, 103.8470], "Toa Payoh": [1.3327, 103.8474], "Bishan": [1.3509, 103.8485], "Ang Mo Kio": [1.3700, 103.8495], "Yio Chu Kang": [1.3817, 103.8449],
    "Yishun": [1.4295, 103.8350], "Woodlands": [1.4369, 103.7865], "Admiralty": [1.4406, 103.8009], "Sembawang": [1.4491, 103.8201], "Jurong East": [1.3331, 103.7423],
    "Clementi": [1.3151, 103.7652], "Dover": [1.3114, 103.7786], "Buona Vista": [1.3071, 103.7903], "Commonwealth": [1.3024, 103.7983], "Queenstown": [1.2943, 103.8061],
    "Redhill": [1.2896, 103.8168], "Tiong Bahru": [1.2862, 103.8270], "Outram Park": [1.2803, 103.8395], "Tanjong Pagar": [1.2765, 103.8455], "Raffles Place": [1.2840, 103.8514],
    "City Hall": [1.2931, 103.8520], "Bugis": [1.3008, 103.8559], "Lavender": [1.3073, 103.8630], "Kallang": [1.3114, 103.8714], "Aljunied": [1.3164, 103.8829],
    "Paya Lebar": [1.3177, 103.8926], "Eunos": [1.3196, 103.9030], "Kembangan": [1.3210, 103.9130], "Bedok": [1.3240, 103.9300], "Tanah Merah": [1.3272, 103.9465],
    "Simei": [1.3433, 103.9533], "Tampines": [1.3540, 103.9453], "Pasir Ris": [1.3730, 103.9493], "Serangoon": [1.3498, 103.8737], "Kovan": [1.3602, 103.8851],
    "Hougang": [1.3712, 103.8923], "Buangkok": [1.3829, 103.8932], "Sengkang": [1.3917, 103.8954], "Punggol": [1.4052, 103.9024], "Woodleigh": [1.3393, 103.8709],
    "Potong Pasir": [1.3313, 103.8688], "Boon Keng": [1.3195, 103.8617], "Farrer Park": [1.3124, 103.8543], "Novena": [1.3204, 103.8438], "Newton": [1.3127, 103.8380],
    "Orchard": [1.3043, 103.8318], "Marine Parade": [1.3027, 103.9056], "Bendemeer": [1.3138, 103.8628], "Beauty World": [1.3412, 103.7759], "Holland Village": [1.3118, 103.7962],
    "Botanic Gardens": [1.3224, 103.8152], "Tampines East": [1.3562, 103.9554], "Bukit Panjang": [1.3784, 103.7618], "Choa Chu Kang": [1.3854, 103.7444], "Boon Lay": [1.3386, 103.7058], "Lakeside": [1.3442, 103.7210]
  };

  /* ---------- people ---------- */
  var LISTERS = {
    priya: { id: "priya", kind: "agent", name: "Priya Nair", initials: "PN", firm: "Harbourline Realty", reg: "CEA R000000A (sample)", reply: "Usually replies within an hour" },
    darren: { id: "darren", kind: "agent", name: "Darren Lim", initials: "DL", firm: "Northpoint Homes", reg: "CEA R000000B (sample)", reply: "Usually replies the same day" },
    tan: { id: "tan", kind: "owner", name: "Tan Boon Huat", initials: "TB", firm: "Owner, selling directly", reg: "Ownership checked with Singpass", reply: "Usually replies in the evening" }
  };

  /* ---------- listings ---------- */
  var SEED = [
    { id: 1, town: "Toa Payoh", street: "Blk 108 Lorong 1", type: "HDB", beds: 3, sqm: 92, floor: "14 of 25", mrt: "Braddell", min: 4, lease: 1998, price: 598000, photos: ["unit-01", "in-bto-living", "kitchen", "home-01"], lister: "tan", lat: 1.3392, lng: 103.8452 },
    { id: 2, town: "Bishan", street: "Blk 152 Street 13", type: "HDB", beds: 4, sqm: 110, floor: "11 of 16", mrt: "Bishan", min: 6, lease: 1992, price: 868000, photos: ["unit-02", "living", "bed-1", "home-02"], lister: "priya", lat: 1.3520, lng: 103.8480 },
    { id: 3, town: "Tiong Bahru", street: "Blk 55 Seng Poh Road", type: "HDB", beds: 2, sqm: 68, floor: "3 of 4", mrt: "Tiong Bahru", min: 5, lease: 1973, price: 720000, photos: ["unit-03", "in-cosy-living", "in-dry-pantry", "home-03"], lister: "priya", lat: 1.2855, lng: 103.8312 },
    { id: 4, town: "Punggol", street: "Blk 268 Waterway Terraces", type: "HDB", beds: 3, sqm: 93, floor: "9 of 18", mrt: "Punggol", min: 5, lease: 2016, price: 612000, photos: ["unit-04", "living-2", "bed-2", "home-04"], lister: "darren", lat: 1.4065, lng: 103.9050 },
    { id: 5, town: "Queenstown", street: "Dawson Road", type: "Condo", beds: 2, sqm: 70, floor: "22 of 40", mrt: "Queenstown", min: 7, lease: 2023, price: 1380000, photos: ["unit-05", "in-armchairs", "in-kitchen-dark", "home-05"], lister: "darren", lat: 1.2945, lng: 103.8090 },
    { id: 6, town: "Joo Chiat", street: "Joo Chiat Place", type: "Shophouse", beds: 4, sqm: 210, floor: "3 storeys", mrt: "Marine Parade", min: 8, lease: 0, price: 4200000, photos: ["unit-06", "living-3", "bed-3", "home-06"], lister: "priya", lat: 1.3128, lng: 103.9025 },
    { id: 7, town: "Tampines", street: "Tampines Street 86", type: "EC", beds: 3, sqm: 101, floor: "8 of 14", mrt: "Tampines East", min: 6, lease: 2019, price: 1250000, photos: ["unit-07", "in-dining", "kitchen", "home-07"], lister: "darren", lat: 1.3585, lng: 103.9560 },
    { id: 8, town: "Bukit Timah", street: "Toh Tuck Road", type: "Landed", beds: 5, sqm: 320, floor: "Semi-detached", mrt: "Beauty World", min: 9, lease: 0, price: 5800000, photos: ["unit-08", "in-bungalow", "bed-1", "home-08"], lister: "darren", lat: 1.3395, lng: 103.7650 },
    { id: 9, town: "Sengkang", street: "Blk 431 Fernvale Lane", type: "HDB", beds: 3, sqm: 93, floor: "16 of 17", mrt: "Layar LRT", min: 3, lease: 2012, price: 585000, photos: ["unit-09", "in-study", "in-dry-pantry", "home-09"], lister: "priya", lat: 1.3920, lng: 103.8778 },
    { id: 10, town: "Kallang", street: "Bendemeer Road", type: "Condo", beds: 3, sqm: 98, floor: "31 of 36", mrt: "Bendemeer", min: 2, lease: 2024, price: 2150000, photos: ["unit-10", "sunroom", "bed-2", "home-10"], lister: "darren", lat: 1.3150, lng: 103.8630 },
    { id: 11, town: "Clementi", street: "Blk 321 Clementi Avenue 4", type: "HDB", beds: 2, sqm: 67, floor: "6 of 12", mrt: "Clementi", min: 4, lease: 1980, price: 438000, photos: ["unit-11", "living", "in-kitchen-dark", "home-11"], lister: "priya", lat: 1.3165, lng: 103.7660 },
    { id: 12, town: "Pasir Ris", street: "Flora Drive", type: "Condo", beds: 3, sqm: 108, floor: "5 of 12", mrt: "Pasir Ris", min: 10, lease: 1999, price: 1490000, photos: ["unit-12", "in-bto-living", "bed-3", "home-12"], lister: "darren", lat: 1.3620, lng: 103.9600 },
    { id: 13, town: "Woodlands", street: "Blk 682 Woodlands Drive 16", type: "HDB", beds: 4, sqm: 121, floor: "10 of 15", mrt: "Woodlands", min: 7, lease: 1997, price: 640000, photos: ["unit-13", "living", "kitchen", "home-13"], lister: "priya", lat: 1.4310, lng: 103.7950 },
    { id: 14, town: "Queenstown", street: "Holland Close", type: "Landed", beds: 4, sqm: 240, floor: "Terrace", mrt: "Holland Village", min: 8, lease: 0, price: 4650000, photos: ["unit-14", "in-cosy-living", "bed-1", "home-14"], lister: "darren", lat: 1.3077, lng: 103.7967 },
    { id: 15, town: "Toa Payoh", street: "Bidadari Park Drive", type: "Condo", beds: 2, sqm: 66, floor: "18 of 24", mrt: "Woodleigh", min: 4, lease: 2025, price: 1560000, photos: ["unit-15", "living-2", "in-dry-pantry", "home-15"], lister: "priya", lat: 1.3398, lng: 103.8720 },
    { id: 16, town: "Tampines", street: "Blk 478 Tampines Street 45", type: "HDB", beds: 3, sqm: 104, floor: "7 of 12", mrt: "Tampines", min: 5, lease: 1985, price: 560000, photos: ["unit-16", "in-armchairs", "bed-2", "home-16"], lister: "tan", lat: 1.3592, lng: 103.9535 },
    { id: 17, town: "Ang Mo Kio", street: "Blk 405 Ang Mo Kio Avenue 10", type: "HDB", beds: 3, sqm: 92, floor: "12 of 13", mrt: "Ang Mo Kio", min: 6, lease: 1979, price: 618000, photos: ["unit-17", "living-3", "in-kitchen-dark", "home-17"], lister: "tan", lat: 1.3625, lng: 103.8540 },
    { id: 18, town: "Yishun", street: "Blk 763 Yishun Street 72", type: "HDB", beds: 3, sqm: 93, floor: "8 of 12", mrt: "Yishun", min: 7, lease: 1987, price: 498000, photos: ["unit-18", "in-dining", "bed-3", "home-18"], lister: "priya", lat: 1.4270, lng: 103.8350 },
    { id: 19, town: "Bedok", street: "Blk 538 Bedok North Street 3", type: "HDB", beds: 2, sqm: 68, floor: "5 of 12", mrt: "Bedok", min: 9, lease: 1979, price: 398000, photos: ["unit-19", "living-4", "kitchen", "home-19"], lister: "tan", lat: 1.3330, lng: 103.9240 },
    { id: 20, town: "Jurong East", street: "Blk 287 Toh Guan Road", type: "HDB", beds: 4, sqm: 121, floor: "15 of 16", mrt: "Jurong East", min: 10, lease: 1998, price: 668000, photos: ["unit-20", "in-study", "bed-1", "home-20"], lister: "darren", lat: 1.3410, lng: 103.7460 },
    { id: 21, town: "Hougang", street: "Blk 680 Hougang Avenue 8", type: "HDB", beds: 3, sqm: 104, floor: "9 of 12", mrt: "Hougang", min: 8, lease: 1999, price: 620000, photos: ["unit-21", "sunroom", "in-dry-pantry", "home-21"], lister: "priya", lat: 1.3700, lng: 103.8890 },
    { id: 22, town: "Serangoon", street: "Serangoon Avenue 3", type: "Condo", beds: 3, sqm: 95, floor: "12 of 18", mrt: "Serangoon", min: 8, lease: 2014, price: 1650000, photos: ["unit-22", "living", "bed-2", "home-22"], lister: "darren", lat: 1.3530, lng: 103.8710 },
    { id: 23, town: "Bukit Panjang", street: "Blk 512 Jelapang Road", type: "HDB", beds: 4, sqm: 112, floor: "10 of 14", mrt: "Bukit Panjang", min: 9, lease: 1999, price: 598000, photos: ["unit-23", "in-bto-living", "in-kitchen-dark", "home-23"], lister: "tan", lat: 1.3860, lng: 103.7640 },
    { id: 24, town: "Novena", street: "Moulmein Rise", type: "Condo", beds: 2, sqm: 74, floor: "20 of 28", mrt: "Novena", min: 6, lease: 0, price: 1890000, photos: ["unit-24", "living", "bed-3", "home-24"], lister: "darren", lat: 1.3195, lng: 103.8460 },
    { id: 25, town: "Marine Parade", street: "Blk 63 Marine Drive", type: "HDB", beds: 2, sqm: 73, floor: "10 of 15", mrt: "Marine Parade", min: 4, lease: 1975, price: 498000, photos: ["unit-25", "in-cosy-living", "kitchen", "home-25"], lister: "priya", lat: 1.3030, lng: 103.9080 },
    { id: 26, town: "Punggol", street: "Sumang Walk", type: "EC", beds: 3, sqm: 98, floor: "11 of 17", mrt: "Punggol", min: 9, lease: 2021, price: 1320000, photos: ["unit-26", "living-2", "bed-1", "home-26"], lister: "darren", lat: 1.4080, lng: 103.8980 },
    { id: 27, town: "Toa Payoh", street: "Blk 79C Toa Payoh Central", type: "HDB", beds: 4, sqm: 110, floor: "35 of 40", mrt: "Toa Payoh", min: 3, lease: 2012, price: 1080000, photos: ["unit-27", "in-armchairs", "in-dry-pantry", "home-27"], lister: "tan", lat: 1.3330, lng: 103.8500 },
    { id: 28, town: "Bukit Timah", street: "Jalan Jurong Kechil", type: "Condo", beds: 3, sqm: 115, floor: "4 of 5", mrt: "Beauty World", min: 6, lease: 0, price: 2380000, photos: ["unit-28", "living-3", "bed-2", "home-28"], lister: "darren", lat: 1.3420, lng: 103.7730 },
    { id: 29, town: "Kallang", street: "Blk 34 Whampoa West", type: "HDB", beds: 2, sqm: 67, floor: "7 of 12", mrt: "Boon Keng", min: 5, lease: 1973, price: 448000, photos: ["unit-29", "in-dining", "in-kitchen-dark", "home-29"], lister: "priya", lat: 1.3220, lng: 103.8630 },
    { id: 30, town: "Tampines", street: "Blk 860 Tampines Avenue 5", type: "HDB", beds: 4, sqm: 122, floor: "6 of 12", mrt: "Tampines", min: 9, lease: 1988, price: 698000, photos: ["unit-30", "living-4", "bed-3", "home-30"], lister: "tan", lat: 1.3530, lng: 103.9380 },
    { id: 31, town: "Clementi", street: "Clementi Avenue 1", type: "Condo", beds: 3, sqm: 90, floor: "16 of 24", mrt: "Clementi", min: 8, lease: 2022, price: 1780000, photos: ["unit-31", "in-study", "kitchen", "home-31"], lister: "priya", lat: 1.3090, lng: 103.7700 },
    { id: 32, town: "Sengkang", street: "Blk 307 Anchorvale Road", type: "HDB", beds: 4, sqm: 112, floor: "13 of 16", mrt: "Sengkang", min: 9, lease: 2004, price: 668000, photos: ["unit-32", "sunroom", "bed-1", "home-32"], lister: "darren", lat: 1.3930, lng: 103.8870 },
    { id: 33, town: "Bishan", street: "Blk 223 Bishan Street 23", type: "HDB", beds: 3, sqm: 104, floor: "18 of 25", mrt: "Bishan", min: 8, lease: 1993, price: 828000, photos: ["unit-33", "living", "in-dry-pantry", "home-33"], lister: "tan", lat: 1.3580, lng: 103.8470 },
    { id: 34, town: "Woodlands", street: "Blk 868 Woodlands Street 83", type: "HDB", beds: 2, sqm: 68, floor: "4 of 12", mrt: "Admiralty", min: 6, lease: 1993, price: 368000, photos: ["unit-34", "in-bto-living", "bed-2", "home-34"], lister: "priya", lat: 1.4390, lng: 103.7990 },
    { id: 35, town: "Pasir Ris", street: "Blk 571 Pasir Ris Street 53", type: "HDB", beds: 4, sqm: 123, floor: "7 of 12", mrt: "Pasir Ris", min: 10, lease: 1995, price: 708000, photos: ["unit-35", "living", "in-kitchen-dark", "home-35"], lister: "darren", lat: 1.3740, lng: 103.9570 },
    { id: 36, town: "Queenstown", street: "Blk 88 Dawson Road", type: "HDB", beds: 3, sqm: 93, floor: "28 of 41", mrt: "Queenstown", min: 7, lease: 2016, price: 1050000, photos: ["unit-36", "in-cosy-living", "bed-3", "home-36"], lister: "priya", lat: 1.2950, lng: 103.8100 },
    { id: 37, town: "Yishun", street: "Yishun Avenue 1", type: "Condo", beds: 2, sqm: 63, floor: "9 of 15", mrt: "Yishun", min: 9, lease: 2015, price: 868000, photos: ["unit-37", "living-2", "kitchen", "home-37"], lister: "darren", lat: 1.4190, lng: 103.8390 },
    { id: 38, town: "Hougang", street: "Upper Serangoon View", type: "Condo", beds: 1, sqm: 46, floor: "6 of 14", mrt: "Buangkok", min: 10, lease: 2014, price: 720000, photos: ["unit-38", "in-armchairs", "bed-1", "home-38"], lister: "priya", lat: 1.3800, lng: 103.8920 },
    { id: 39, town: "Jurong East", street: "Jurong East Street 13", type: "EC", beds: 3, sqm: 96, floor: "10 of 18", mrt: "Jurong East", min: 8, lease: 2018, price: 1180000, photos: ["unit-39", "living-3", "in-dry-pantry", "home-39"], lister: "darren", lat: 1.3460, lng: 103.7350 },
    { id: 40, town: "Bedok", street: "Blk 18D Bedok South Road", type: "HDB", beds: 3, sqm: 92, floor: "21 of 30", mrt: "Tanah Merah", min: 8, lease: 2019, price: 688000, photos: ["unit-40", "in-dining", "bed-2", "home-40"], lister: "tan", lat: 1.3220, lng: 103.9420 },
    { id: 41, town: "Serangoon", street: "Blk 244 Serangoon Avenue 2", type: "HDB", beds: 2, sqm: 67, floor: "3 of 12", mrt: "Serangoon", min: 6, lease: 1978, price: 418000, photos: ["unit-41", "living-4", "in-kitchen-dark", "home-41"], lister: "priya", lat: 1.3540, lng: 103.8720 },
    { id: 42, town: "Joo Chiat", street: "Joo Chiat Lane", type: "Condo", beds: 2, sqm: 72, floor: "3 of 5", mrt: "Eunos", min: 9, lease: 0, price: 1280000, photos: ["unit-42", "in-study", "bed-3", "home-42"], lister: "darren", lat: 1.3150, lng: 103.9020 },
    { id: 43, town: "Choa Chu Kang", street: "Blk 465 Choa Chu Kang Avenue 4", type: "HDB", beds: 3, sqm: 104, floor: "11 of 12", mrt: "Choa Chu Kang", min: 7, lease: 1996, price: 548000, photos: ["unit-43", "sunroom", "kitchen", "home-43"], lister: "tan", lat: 1.3790, lng: 103.7400 },
    { id: 44, town: "Kallang", street: "Blk 97A Geylang Bahru", type: "HDB", beds: 3, sqm: 93, floor: "24 of 30", mrt: "Kallang", min: 7, lease: 2015, price: 868000, photos: ["unit-44", "living", "bed-1", "home-44"], lister: "priya", lat: 1.3200, lng: 103.8700 },
    { id: 45, town: "Sembawang", street: "Sembawang Road", type: "Landed", beds: 4, sqm: 180, floor: "Terrace", mrt: "Sembawang", min: 12, lease: 1990, price: 2650000, photos: ["unit-45", "in-bto-living", "in-dry-pantry", "home-45"], lister: "darren", lat: 1.4420, lng: 103.8200 },
    { id: 46, town: "Ang Mo Kio", street: "Blk 609 Ang Mo Kio Avenue 4", type: "HDB", beds: 2, sqm: 67, floor: "9 of 12", mrt: "Yio Chu Kang", min: 8, lease: 1979, price: 418000, photos: ["unit-46", "living", "bed-2", "home-46"], lister: "priya", lat: 1.3790, lng: 103.8440 },
    { id: 47, town: "Tiong Bahru", street: "Blk 17 Eng Hoon Street", type: "HDB", beds: 3, sqm: 92, floor: "2 of 4", mrt: "Tiong Bahru", min: 7, lease: 1954, price: 788000, photos: ["unit-47", "in-cosy-living", "in-kitchen-dark", "home-47"], lister: "tan", lat: 1.2850, lng: 103.8340 },
    { id: 48, town: "Woodlands", street: "Blk 512D Woodlands Drive 14", type: "HDB", beds: 3, sqm: 93, floor: "13 of 16", mrt: "Woodlands", min: 9, lease: 2001, price: 528000, photos: ["unit-48", "living-2", "bed-3", "home-48"], lister: "darren", lat: 1.4320, lng: 103.7920 },
    { id: 49, town: "Punggol", street: "Blk 309B Punggol Walk", type: "HDB", beds: 3, sqm: 93, floor: "6 of 17", mrt: "Punggol", min: 8, lease: 2013, price: 578000, photos: ["unit-49", "in-armchairs", "kitchen", "home-49"], lister: "priya", lat: 1.4050, lng: 103.9000 },
    { id: 50, town: "Clementi", street: "Blk 446 Clementi Avenue 3", type: "HDB", beds: 3, sqm: 91, floor: "10 of 12", mrt: "Clementi", min: 5, lease: 1979, price: 588000, photos: ["unit-50", "living-3", "bed-1", "home-50"], lister: "tan", lat: 1.3180, lng: 103.7680 },
    { id: 51, town: "Bukit Panjang", street: "Blk 266 Bangkit Road", type: "HDB", beds: 2, sqm: 68, floor: "7 of 12", mrt: "Bukit Panjang", min: 11, lease: 1988, price: 378000, photos: ["unit-51", "in-dining", "in-dry-pantry", "home-51"], lister: "darren", lat: 1.3800, lng: 103.7720 },
    { id: 52, town: "Tampines", street: "Tampines Street 62", type: "EC", beds: 3, sqm: 97, floor: "12 of 15", mrt: "Tampines East", min: 8, lease: 2017, price: 1190000, photos: ["unit-52", "living-4", "bed-2", "home-52"], lister: "priya", lat: 1.3500, lng: 103.9530 },
    { id: 53, town: "Kallang", street: "Kallang Riverside", type: "Condo", beds: 2, sqm: 69, floor: "26 of 36", mrt: "Kallang", min: 4, lease: 2020, price: 1620000, photos: ["unit-53", "in-study", "in-kitchen-dark", "home-53"], lister: "darren", lat: 1.3080, lng: 103.8680 },
    { id: 54, town: "Sengkang", street: "Blk 186C Rivervale Crescent", type: "HDB", beds: 2, sqm: 68, floor: "15 of 17", mrt: "Sengkang", min: 9, lease: 2004, price: 458000, photos: ["unit-54", "sunroom", "bed-3", "home-54"], lister: "tan", lat: 1.3880, lng: 103.9050 }
  ];
  var STATS = { 1: [412, 38, 3], 2: [688, 61, 5], 3: [930, 74, 4], 4: [356, 22, 2], 5: [520, 33, 1], 6: [1210, 96, 2], 7: [301, 18, 1], 8: [240, 11, 0], 9: [377, 29, 2], 10: [640, 41, 1], 11: [298, 21, 2], 12: [210, 9, 0], 13: [188, 12, 1], 14: [402, 20, 0], 15: [575, 44, 2], 16: [266, 17, 1], 17: [344, 26, 1], 18: [281, 19, 0], 19: [198, 11, 1], 20: [412, 30, 2], 21: [356, 24, 1], 22: [720, 52, 3], 23: [233, 14, 0], 24: [880, 63, 2], 25: [490, 37, 2], 26: [610, 45, 1], 27: [1340, 112, 4], 28: [530, 31, 1], 29: [260, 18, 0], 30: [377, 27, 1], 31: [655, 48, 2], 32: [318, 22, 1], 33: [612, 47, 2], 34: [205, 13, 0], 35: [390, 28, 1], 36: [1120, 91, 3], 37: [430, 29, 1], 38: [366, 24, 1], 39: [508, 36, 1], 40: [455, 33, 2], 41: [240, 15, 0], 42: [590, 41, 1], 43: [276, 18, 1], 44: [720, 55, 2], 45: [310, 19, 0], 46: [288, 20, 1], 47: [940, 77, 3], 48: [301, 21, 0], 49: [420, 31, 1], 50: [366, 27, 1], 51: [190, 10, 0], 52: [505, 38, 1], 53: [690, 49, 2], 54: [254, 17, 0] };

  var BUYERS = [
    { id: "couple", label: "First home", sub: "Citizen couple", absd: 0, grants: 1 },
    { id: "single", label: "Single, 35+", sub: "Citizen", absd: 0, grants: 0.5 },
    { id: "pr", label: "PR household", sub: "First home", absd: 0.05, grants: 0 },
    { id: "upgrade", label: "Second home", sub: "Citizen", absd: 0.2, grants: 0 }
  ];

  /* sample buyers searching this week, used for lister insight and seeded enquiries */
  var POOL = [
    { name: "Wei Ming & Hui Wen", tag: "First-home couple", buyer: "couple", income: 9800, cpf: 82000, cash: 60000, work: "Raffles Place", parents: "Bishan", school: "Catholic High School" },
    { name: "Arif & Nadia", tag: "First-home couple", buyer: "couple", income: 8200, cpf: 64000, cash: 40000, work: "Paya Lebar", parents: "Tampines" },
    { name: "Kavitha R.", tag: "Single, 35+", buyer: "single", income: 6200, cpf: 98000, cash: 45000, work: "one-north", parents: "Clementi" },
    { name: "Jonathan & Grace", tag: "Upgrading family", buyer: "upgrade", income: 21000, cpf: 240000, cash: 380000, work: "Marina Bay", school: "Henry Park Primary" },
    { name: "Mei Ling & Daniel", tag: "First-home couple", buyer: "couple", income: 11400, cpf: 120000, cash: 75000, work: "Novena", parents: "Toa Payoh" },
    { name: "Suresh & Anita", tag: "PR household", buyer: "pr", income: 13500, cpf: 150000, cash: 110000, work: "Changi Business Park", parents: "Pasir Ris" },
    { name: "Hafiz", tag: "Single, 35+", buyer: "single", income: 5600, cpf: 70000, cash: 30000, work: "Woodlands Regional Centre", parents: "Woodlands" },
    { name: "Clara & Ben", tag: "First-home couple", buyer: "couple", income: 12800, cpf: 96000, cash: 90000, work: "Raffles Place", parents: "Queenstown" }
  ];

  /* ---------- storage ---------- */
  var KEY = "thathome:v1", store = null;
  function freshStore() {
    return {
      anchors: [
        { id: 1, role: "work", place: "Raffles Place", freq: "daily" },
        { id: 2, role: "parents", place: "Bishan", freq: "weekly" },
        { id: 3, role: "school", place: "Catholic High School", freq: "daily" }
      ].map(function (a) { var p = ROLES[a.role].places[a.place]; a.lat = p[0]; a.lng = p[1]; return a; }),
      money: { income: 9800, cpf: 82000, cash: 60000, buyer: "couple" },
      saved: {}, published: [], status: {}, enquiries: [], offers: [], buyerSeeded: false, uid: 100, me: "priya"
    };
  }
  function load() {
    if (store) return store;
    store = freshStore();
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { var got = JSON.parse(raw); Object.keys(store).forEach(function (k) { if (got[k] != null) store[k] = got[k]; }); }
    } catch (e) { /* storage unavailable; run on defaults */ }
    if (!store.enquiries.length) store.enquiries = seedEnquiries();
    if (!store.buyerSeeded) { store.enquiries = seedMine().concat(store.enquiries); store.buyerSeeded = true; }
    return store;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* ignore */ } }
  function reset() { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } store = null; return load(); }

  /* ---------- listings with derived fields ---------- */
  function decorate(h) {
    h.public = h.type === "HDB" || h.type === "EC";
    h.rooms = h.type === "HDB" ? (h.beds + 1) + "-room HDB" : h.type === "EC" ? "Executive condo" : h.type;
    var st = STATS[h.id] || h.stats || [0, 0, 0];
    h.views = st[0]; h.saves = st[1];
    h.status = (load().status[h.id]) || h.status || "live";
    return h;
  }
  function listings(all) {
    var s = load();
    return SEED.map(function (h) { return Object.assign({}, h); }).concat(s.published.map(function (h) { return Object.assign({}, h); }))
      .map(decorate).filter(function (h) { return all || (h.status !== "draft" && h.status !== "sold"); });
  }
  function byId(id) { return listings(true).filter(function (h) { return h.id === +id; })[0]; }
  function img(p) { return /^(data:|https?:)/.test(p) ? p : "images/" + p + ".webp"; }

  /* ---------- maths ---------- */
  function fmt(n) { return "$" + Math.round(n).toLocaleString("en-SG"); }
  function short(n) { return n >= 1e6 ? "$" + (+(n / 1e6).toFixed(2)) + "m" : "$" + Math.round(n / 1e3) + "k"; }
  function pmt(p, rate, yrs) { var r = rate / 1200, n = yrs * 12; return p <= 0 ? 0 : p * r / (1 - Math.pow(1 + r, -n)); }
  function bsd(p) {
    var tiers = [[180000, .01], [180000, .02], [640000, .03], [500000, .04], [1500000, .05], [Infinity, .06]], t = 0, left = p;
    for (var i = 0; i < tiers.length && left > 0; i++) { var a = Math.min(left, tiers[i][0]); t += a * tiers[i][1]; left -= a; }
    return t;
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function km(a, b) {
    var r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
    var q = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 12742 * Math.asin(Math.sqrt(q));
  }
  function nearestOf(set, pt) {
    var best = null, bd = Infinity;
    Object.keys(set).forEach(function (n) { var d = km(pt, { lat: set[n][0], lng: set[n][1] }); if (d < bd) { bd = d; best = n; } });
    return { name: best, km: bd };
  }
  function yearsLeft(h) { return h.lease ? 99 - (2026 - h.lease) : null; }
  function buyerOf(id) { return BUYERS.filter(function (b) { return b.id === id; })[0] || BUYERS[0]; }
  function trips(a) { return a.freq === "daily" ? 10 : 2; }

  function trip(h, a) {
    var d = km(h, a);
    if (d < 1.2) return { min: Math.round(d * 13 + 3), km: d, walk: true };
    return { min: Math.round(h.min + 4 + d * 1.9 + 4), km: d, walk: false };
  }

  /* ctx = { anchors: [...], money: { income, cpf, cash, buyer } } */
  function grants(h, ctx) {
    var M = ctx.money, b = buyerOf(M.buyer), out = [];
    if (h.type !== "HDB" || !b.grants) return out;
    var k = b.grants, inc = M.income;
    if (inc <= 14000 * k) out.push({ name: "CPF Housing Grant", v: (h.beds <= 3 ? 80000 : 50000) * k });
    if (inc <= 9000 * k) out.push({ name: "Enhanced Housing Grant", v: Math.max(5000, Math.round((120000 - (inc / k - 1500) / 7500 * 115000) / 5000) * 5000) * k });
    var par = ctx.anchors.filter(function (a) { return a.role === "parents"; })[0];
    if (par && km(h, par) <= 4) out.push({ name: "Proximity Housing Grant", v: 20000 * k, phg: true });
    return out;
  }

  function money(h, ctx, noGrants) {
    var M = ctx.money, g = noGrants ? [] : grants(h, ctx), gt = g.reduce(function (s, x) { return s + x.v; }, 0);
    var duty = bsd(h.price) + h.price * buyerOf(M.buyer).absd;
    var funds = M.cpf + M.cash + gt, need = h.price + duty;
    var loan = Math.max(0, need - funds), cap = h.price * 0.75, shortfall = 0;
    if (loan > cap) { shortfall = loan - cap; loan = cap; }
    var inst = pmt(loan, 2.6, 25), limit = M.income * (h.public ? 0.3 : 0.55);
    var overLimit = pmt(loan, 4, 25) > limit;
    var oa = Math.min(M.income, 16000) * 0.23;
    return { grants: g, gt: gt, duty: duty, loan: loan, inst: inst, oa: oa, cpfPays: Math.min(inst, oa), cash: Math.max(0, inst - oa), upfront: need - gt - loan, shortfall: shortfall, overLimit: overLimit, over: shortfall > 0 || overLimit };
  }

  function reach(pub, ctx) {
    var lo = 100000, hi = 12000000, stub = { type: pub ? "HDB" : "Condo", public: pub, beds: 3 };
    for (var i = 0; i < 30; i++) { var mid = (lo + hi) / 2; stub.price = mid; if (money(stub, ctx, true).over) hi = mid; else lo = mid; }
    return Math.floor(lo / 5000) * 5000;
  }

  function score(h, ctx) {
    var A = ctx.anchors, m = money(h, ctx), t = A.map(function (a) { return trip(h, a); });
    var hours = t.reduce(function (s, x, i) { return s + x.min * trips(A[i]); }, 0) / 60;
    var commute = clamp(100 - Math.max(0, hours - 2.5) * 8, 0, 100);
    var cost = m.over ? 15 : clamp(100 - m.cash / (ctx.money.income * 0.2) * 55, 25, 100);
    var phg = m.grants.some(function (g) { return g.phg; });
    var schoolNear = A.some(function (a, i) { return a.role === "school" && t[i].km <= 1; });
    var fit = clamp(Math.round(0.55 * commute + 0.45 * cost + (phg ? 5 : 0) + (schoolNear ? 6 : 0)), 1, 99);
    return { h: h, m: m, t: t, hours: hours, fit: fit, phg: phg, schoolNear: schoolNear, tone: m.over ? "over" : fit >= 70 ? "good" : "ok" };
  }

  /* a sample buyer from POOL as a scoring context */
  function poolCtx(p) {
    var A = [];
    function add(role, place, freq) { var c = ROLES[role].places[place]; if (c) A.push({ id: A.length + 1, role: role, place: place, freq: freq, lat: c[0], lng: c[1] }); }
    add("work", p.work, "daily"); if (p.parents) add("parents", p.parents, "weekly"); if (p.school) add("school", p.school, "daily");
    return { anchors: A, money: { income: p.income, cpf: p.cpf, cash: p.cash, buyer: p.buyer } };
  }
  /* how a listing lands with this week's buyers: rank among the homes each one can afford */
  function audience(h) {
    var all = listings().filter(function (x) { return x.id !== h.id; }).concat([h]);
    return POOL.map(function (p) {
      var ctx = poolCtx(p), mine = score(h, ctx);
      var ok = all.map(function (x) { return score(x, ctx); }).filter(function (s) { return !s.m.over; }).sort(function (a, b) { return b.fit - a.fit; });
      var rank = ok.map(function (s) { return s.h.id; }).indexOf(h.id) + 1;
      return { p: p, s: mine, rank: rank };
    });
  }

  /* ---------- enquiries ---------- */
  var DAY = 86400000;
  function slot(daysAhead, hour) { var d = new Date(); d.setHours(hour, 0, 0, 0); return d.getTime() + daysAhead * DAY; }
  function seedEnquiries() {
    var rows = [
      [0, 1, "Hi Mr Tan, we're a first-home couple. Could we see the flat this weekend? We'd like to check the morning light in the kitchen.", 2, 10, "new", -0.1],
      [4, 2, "Hello Priya, is the seller open to an extension of stay? We're also keen to know if the windows were replaced.", 1, 19, "new", -0.3],
      [7, 3, "Hi, the Seng Poh walk-up looks lovely. Are pets allowed in this block?", 3, 11, "confirmed", -1],
      [2, 9, "Can we view after work on Thursday? It ranks first for my commute to one-north.", 2, 19, "new", -0.6],
      [5, 13, "We'd like to view with my parents, who live nearby. Any day after 6pm works.", 4, 18, "confirmed", -2],
      [1, 16, "Is the HDB valuation done? We're comparing this with a unit in Pasir Ris.", 1, 20, "declined", -3]
    ];
    return rows.map(function (r, i) {
      return { id: i + 1, pool: r[0], listing: r[1], msg: r[2], at: slot(r[3], r[4]), state: r[5], sent: Date.now() + r[6] * DAY, share: true };
    });
  }
  /* your own requests (pool -1), so the buyer side starts with a real conversation */
  function seedMine() {
    var H = 3600000;
    return [
      { id: 91, pool: -1, listing: 4, at: slot(-2, 11), state: "confirmed", sent: Date.now() - 5 * DAY, share: true,
        msg: "Hi Darren, we're a first-home couple. Could we view the Punggol flat this weekend?",
        thread: [{ from: "lister", text: "Hi Robert, Saturday 11 am works. I'll meet you at the void deck of Blk 268.", t: Date.now() - 4 * DAY }] },
      { id: 92, pool: -1, listing: 3, at: slot(3, 19), state: "proposed", sent: Date.now() - DAY, share: true,
        msg: "Hello Priya, could we see the Seng Poh flat after work one evening?",
        thread: [{ from: "lister", text: "Hi Robert, the owners are out on the evening you asked for. Would " + new Date(slot(3, 19)).toLocaleDateString("en-SG", { weekday: "long" }) + " at 7 pm work instead?", t: Date.now() - 3 * H }] },
      { id: 93, pool: -1, listing: 9, at: slot(5, 10), state: "new", sent: Date.now() - 2 * H, share: true,
        msg: "Hi Priya, is the Fernvale flat still available? We'd love a morning viewing.", thread: [] }
    ];
  }
  function say(e, from, text) { (e.thread = e.thread || []).push({ from: from, text: text, t: Date.now() }); }
  function addOffer(o) { var s = load(); o.id = ++s.uid; o.sent = Date.now(); o.state = "sent"; o.done = 0; o.history = [{ from: "buyer", amount: o.amount, t: o.sent }]; s.offers.unshift(o); save(); return o; }
  function needsYou() { var s = load(); return s.enquiries.filter(function (e) { return e.pool === -1 && e.state === "proposed"; }).length + s.offers.filter(function (o) { return o.state === "countered"; }).length; }
  function offerFor(listing) { return load().offers.filter(function (o) { return o.listing === listing && o.state !== "withdrawn"; })[0] || null; }

  function addEnquiry(e) { var s = load(); e.id = ++s.uid; e.sent = Date.now(); e.state = "new"; e.thread = []; s.enquiries.unshift(e); save(); return e; }

  function roleIcon(r) { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + r.icon + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }

  // every MRT station as a small marker; names show once you zoom in, the home's own station always
  function mrtLayer(LF, map, own) {
    var g = LF.layerGroup();
    Object.keys(MRT).forEach(function (n) {
      var me = n === own;
      LF.marker(MRT[n], { icon: LF.divIcon({ className: "mrt-ic", html: '<span class="mrt' + (me ? " is-own" : "") + '"><i></i><em>' + n + "</em></span>", iconSize: null }),
        interactive: false, keyboard: false, zIndexOffset: me ? -100 : -1000 }).addTo(g);
    });
    function names() { map.getContainer().classList.toggle("mrt-names", map.getZoom() >= 14); }
    map.on("zoomend", names); names();
    return g.addTo(map);
  }

  window.AH = {
    TOWNS: TOWNS, FAMILY: FAMILY, WORK: WORK, SCHOOL: SCHOOL, ROLES: ROLES, MRT: MRT, LISTERS: LISTERS, BUYERS: BUYERS, POOL: POOL,
    load: load, save: save, reset: reset, listings: listings, byId: byId, img: img, roleIcon: roleIcon, mrtLayer: mrtLayer,
    fmt: fmt, short: short, pmt: pmt, bsd: bsd, clamp: clamp, km: km, nearestOf: nearestOf, yearsLeft: yearsLeft, buyerOf: buyerOf, trips: trips,
    trip: trip, grants: grants, money: money, reach: reach, score: score, poolCtx: poolCtx, audience: audience, addEnquiry: addEnquiry, say: say, addOffer: addOffer, offerFor: offerFor, needsYou: needsYou,
    ctx: function () { var s = load(); return { anchors: s.anchors, money: s.money }; }
  };
})();
