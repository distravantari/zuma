// Sample content for the Zuma web app mockup.
// Every name, price and date here is placeholder data for the client demo.

window.ZUMA = {
  // Club facts from Instagram @zumapadelcourt and the AYO venue page (Oct 2026).
  // Hours, prices and the WhatsApp number are still placeholders.
  club: {
    name: "Zuma Padel Court",
    tagline: "Redefining padel as a lifestyle of elegance, competition, and shared moments.",
    group: "Jose Pratama Group",
    address: "Jl. Pajajaran, Bantarjati, Kota Bogor, Jawa Barat",
    mapsUrl: "https://maps.google.com/?q=Zuma+Padel+Court+Jl.+Pajajaran+Bantarjati+Bogor",
    instagram: "https://www.instagram.com/zumapadelcourt/",
    whatsapp: "6281200000000",
    email: "pratamasportentertainment@email.com",
    hours: [
      { days: "Monday to Friday", time: "06:00 – 23:00" },
      { days: "Saturday and Sunday", time: "06:00 – 23:00" },
      { days: "Public holidays", time: "07:00 – 22:00" },
    ],
    facilities: [
      "4 indoor full-panoramic courts",
      "Premium synthetic turf",
      "Café and resto",
      "Hot showers",
      "Snacks and drinks",
      "Musholla",
      "Car parking",
      "Pro shop and merch pickup",
    ],
  },

  courts: [
    { id: "c1", name: "Court 1", kind: "Panoramic" },
    { id: "c2", name: "Court 2", kind: "Panoramic" },
    { id: "c3", name: "Court 3", kind: "Panoramic" },
    { id: "c4", name: "Court 4", kind: "Panoramic" },
  ],

  // Lines from the club's own Instagram captions, used as feed copy.
  voice: [
    "More than a game. More than a moment.",
    "The pleasure of play, beyond the game.",
    "Every point starts with a decision.",
    "Good rallies, good food, good company.",
    "What starts as a game becomes the best part of your day.",
  ],

  // Prices per hour, in rupiah. Sample rates in line with premium indoor
  // venues in Bogor (Oct 2026). Peak = weekday evenings, weekend mornings and evenings.
  pricing: {
    peak: 350000,
    offPeak: 200000,
    peakRule: "Weekdays from 17:00, weekends 07:00 to 11:00 and from 17:00",
    open: 6,
    close: 23,
    durations: [60, 90, 120],
  },

  // Recurring court blocks (add-on): coaching and maintenance.
  blocks: [
    { court: "c3", weekday: [1, 3, 5], from: 7, to: 9, label: "Academy" },
    { court: "c4", weekday: [2, 4], from: 18, to: 20, label: "Academy" },
    { court: "c2", weekday: [0], from: 6, to: 8, label: "Maintenance" },
  ],

  banners: [
    {
      id: "b1",
      kind: "event",
      title: "Smash The Year",
      text: "Our year-end tournament. 48 pairs, three divisions, one night final.",
      cta: "See the event",
      href: "#/events/smash-the-year",
    },
    {
      id: "b2",
      kind: "promo",
      title: "Midday rally",
      text: "20% off weekday courts between 10:00 and 15:00.",
      cta: "Book a midday court",
      href: "#/book",
    },
    {
      id: "b3",
      kind: "academy",
      title: "First time holding a racket?",
      text: "A 60-minute trial class with a coach, racket included.",
      cta: "Try a class",
      href: "#/beginners",
    },
    {
      id: "b4",
      kind: "sponsor",
      ad: true,
      title: "Northline Water",
      text: "Official water of Smash The Year. A cold bottle with every evening booking this week.",
      cta: "See the tournament",
      href: "#/events/smash-the-year",
    },
  ],

  sponsors: [
    { name: "Northline Water", tier: "Main partner" },
    { name: "Vela Sportswear", tier: "Apparel" },
    { name: "Kopi Rally", tier: "Café" },
    { name: "Arka Motors", tier: "Event partner" },
    { name: "Palma Rackets", tier: "Equipment" },
  ],

  events: [
    {
      slug: "smash-the-year",
      title: "Smash The Year",
      kind: "Tournament",
      date: "2026-12-12",
      endDate: "2026-12-13",
      time: "08:00 – 22:00",
      location: "All courts",
      categories: ["Men's open", "Women's open", "Mixed beginner"],
      quota: 48,
      filled: 37,
      fee: "IDR 600,000 per pair",
      blurb:
        "Two days of group stages and knockouts, with the finals under lights on Court 1. Every pair plays at least four matches.",
      sponsor: "Arka Motors",
      hasBracket: true,
      merch: ["smash-tee", "smash-towel"],
    },
    {
      slug: "rally-jolly",
      title: "Rally Jolly",
      kind: "Community",
      date: "2026-12-20",
      time: "16:00 – 21:00",
      location: "Courts 3 and 4, café terrace",
      categories: ["All levels"],
      quota: 64,
      filled: 22,
      fee: "IDR 150,000 per person, dinner included",
      blurb:
        "A year-end social. Short Americano rounds, a raffle and food from the café. Come solo, we pair you up.",
      sponsor: "Kopi Rally",
      hasBracket: false,
      merch: ["jolly-cap"],
    },
    {
      slug: "americano-friday",
      title: "Americano Friday",
      kind: "Fun match",
      date: "2026-11-06",
      time: "19:00 – 21:00",
      location: "Courts 1 and 2",
      categories: ["Intermediate"],
      quota: 16,
      filled: 16,
      fee: "IDR 175,000 per person",
      blurb:
        "Rotating partners, 15-minute rounds, points add up across the night. Full this week; join the waitlist.",
      hasBracket: false,
    },
    {
      slug: "ladies-league-r3",
      title: "Ladies League, round 3",
      kind: "League",
      date: "2026-11-15",
      time: "09:00 – 13:00",
      location: "Courts 1 to 4",
      categories: ["Women's B", "Women's C"],
      quota: 24,
      filled: 18,
      fee: "IDR 400,000 per pair for the season",
      blurb: "Round three of the season. Standings update after every match day.",
      hasBracket: false,
    },
  ],

  // Live bracket for Smash The Year, Men's open quarterfinals onward (add-on).
  bracket: {
    event: "smash-the-year",
    division: "Men's open",
    rounds: [
      {
        name: "Quarterfinals",
        matches: [
          { a: "Rizal / Bima", b: "Tomas / Arif", score: "6-3 6-4", winner: "a" },
          { a: "Dimas / Yoga", b: "Kevin / Fajar", score: "4-6 7-5 10-8", winner: "a" },
          { a: "Andre / Luthfi", b: "Hendra / Joe", score: "6-2 6-1", winner: "a" },
          { a: "Sam / Nico", b: "Raka / Ilham", score: "3-6 6-7", winner: "b" },
        ],
      },
      {
        name: "Semifinals",
        matches: [
          { a: "Rizal / Bima", b: "Dimas / Yoga", score: "6-4 3-2", live: true },
          { a: "Andre / Luthfi", b: "Raka / Ilham", score: "Court 2, 20:30" },
        ],
      },
      {
        name: "Final",
        matches: [{ a: "To be decided", b: "To be decided", score: "Court 1, 21:30" }],
      },
    ],
  },

  programs: [
    {
      slug: "americano-nights",
      title: "Americano nights",
      kind: "Fun match",
      levels: ["Beginner", "Intermediate"],
      schedule: "Tuesdays and Fridays, 19:00 – 21:00",
      price: "IDR 175,000 per person",
      blurb:
        "Sign up alone, play with a new partner every round. The fastest way to meet people at your level.",
    },
    {
      slug: "king-of-the-court",
      title: "King of the court",
      kind: "Fun match",
      levels: ["Intermediate", "Advanced"],
      schedule: "Wednesdays, 20:00 – 22:00",
      price: "IDR 200,000 per person",
      blurb: "Winners stay on, challengers rotate in. Short games, high tempo.",
    },
    {
      slug: "ladies-morning",
      title: "Ladies morning",
      kind: "Community",
      levels: ["Beginner", "Intermediate"],
      schedule: "Saturdays, 08:00 – 10:00",
      price: "IDR 150,000 per person",
      blurb: "Drills for the first half hour, games for the rest. A coach runs every session.",
    },
    {
      slug: "sunday-social",
      title: "Sunday social",
      kind: "Community",
      levels: ["Beginner", "Intermediate", "Advanced"],
      schedule: "Sundays, 16:00 – 18:00",
      price: "IDR 125,000 per person",
      blurb: "Mixed-level doubles and coffee after. Bring a friend who has never played.",
    },
  ],

  academies: [
    {
      slug: "zuma-academy",
      name: "Zuma Academy",
      focus: "The club's own academy, for adults from first lesson to league play.",
      levels: ["Beginner", "Intermediate", "Advanced"],
      coaches: ["Adit", "Maya", "Carlos"],
      schedule: [
        { kind: "Group", level: "Beginner", when: "Mon & Wed 07:00", size: "4 players" },
        { kind: "Group", level: "Intermediate", when: "Tue & Thu 18:00", size: "4 players" },
        { kind: "Group", level: "Advanced", when: "Fri 07:00", size: "4 players" },
        { kind: "Private", level: "All levels", when: "By appointment", size: "1–2 players" },
      ],
      packages: [
        { name: "Single group session", price: "IDR 250,000" },
        { name: "8 group sessions", price: "IDR 1,800,000" },
        { name: "Private, 1 hour", price: "IDR 600,000" },
        { name: "Private, 5 hours", price: "IDR 2,750,000" },
      ],
    },
    {
      slug: "junior-squad",
      name: "Junior Squad",
      focus: "After-school padel for ages 8 to 16, with a match day each month.",
      levels: ["Beginner", "Intermediate"],
      coaches: ["Nadia", "Adit"],
      schedule: [
        { kind: "Group", level: "Ages 8–11", when: "Tue & Thu 15:30", size: "6 players" },
        { kind: "Group", level: "Ages 12–16", when: "Mon & Wed 16:00", size: "6 players" },
      ],
      packages: [
        { name: "Monthly, 8 sessions", price: "IDR 1,400,000" },
        { name: "Holiday camp, 5 days", price: "IDR 1,250,000" },
      ],
    },
    {
      slug: "performance-lab",
      name: "Performance Lab",
      focus: "Video analysis and match tactics for tournament players.",
      levels: ["Advanced"],
      coaches: ["Carlos"],
      schedule: [
        { kind: "Private", level: "Advanced", when: "Sat 13:00 – 17:00", size: "1–2 players" },
        { kind: "Group", level: "Advanced", when: "Sun 07:00", size: "4 players" },
      ],
      packages: [
        { name: "Video review session", price: "IDR 750,000" },
        { name: "Tournament prep, 4 weeks", price: "IDR 3,900,000" },
      ],
    },
  ],

  coaches: {
    Adit: { name: "Adit Pratama", role: "Head coach", spec: "Technique foundations, volleys", years: 7 },
    Maya: { name: "Maya Lestari", role: "Coach", spec: "Beginner groups, ladies programs", years: 4 },
    Carlos: { name: "Carlos Ruiz", role: "Performance coach", spec: "Tactics, video analysis, the bandeja", years: 12 },
    Nadia: { name: "Nadia Putri", role: "Junior coach", spec: "Kids footwork and coordination", years: 5 },
  },

  products: [
    { slug: "court-polo", name: "Court polo", price: 389000, cat: "Apparel", variants: ["Forest", "Ivory"], sizes: ["S", "M", "L", "XL"], status: "available" },
    { slug: "smash-tee", name: "Smash The Year tee", price: 249000, cat: "Event", variants: ["Charcoal"], sizes: ["S", "M", "L", "XL"], status: "preorder", event: "smash-the-year" },
    { slug: "smash-towel", name: "Smash The Year towel", price: 129000, cat: "Event", variants: ["Gold"], sizes: [], status: "available", event: "smash-the-year" },
    { slug: "jolly-cap", name: "Rally Jolly cap", price: 179000, cat: "Event", variants: ["Ivory", "Forest"], sizes: [], status: "available", event: "rally-jolly" },
    { slug: "club-cap", name: "Club cap", price: 199000, cat: "Accessories", variants: ["Forest", "Charcoal"], sizes: [], status: "soldout" },
    { slug: "wristband-set", name: "Wristband set", price: 89000, cat: "Accessories", variants: ["Forest / Gold"], sizes: [], status: "available" },
    { slug: "match-shorts", name: "Match shorts", price: 329000, cat: "Apparel", variants: ["Charcoal"], sizes: ["S", "M", "L", "XL"], status: "available" },
    { slug: "ball-tube", name: "Ball tube, 3 balls", price: 135000, cat: "Equipment", variants: [], sizes: [], status: "available" },
  ],

  promos: [
    {
      code: "MIDDAY20",
      title: "Midday rally",
      text: "20% off court rental on weekdays, 10:00 to 15:00.",
      terms: ["Weekdays only, excluding public holidays", "Booking must start between 10:00 and 15:00", "One code per booking", "The discount is applied when you pay at the club"],
      until: "2026-12-31",
    },
    {
      code: "FIRSTSERVE",
      title: "First serve",
      text: "Your first trial class at Zuma Academy for IDR 150,000.",
      terms: ["New players only", "Book through the trial class form", "Racket and balls included"],
      until: "2026-12-31",
    },
    {
      code: "BRINGAFRIEND",
      title: "Bring a friend",
      text: "Book with a first-timer and get a free racket rental for both of you.",
      terms: ["Tell the front desk who the first-timer is", "Valid on all courts", "One free rental per player"],
      until: "2026-11-30",
    },
  ],

  faq: [
    { q: "Do I need an account to book?", a: "No. Leave your name and WhatsApp number and you get a booking code. Use that code to check, change or cancel." },
    { q: "How do I pay?", a: "At the front desk when you arrive, by card, QRIS or cash. The app does not take payments." },
    { q: "What is the cancellation policy?", a: "Cancel free of charge up to 24 hours before your start time. Inside 24 hours, message us on WhatsApp and we will see what we can do." },
    { q: "Can I rent a racket?", a: "Yes, IDR 50,000 per racket per booking. Balls are sold at the front desk." },
    { q: "How many players per court?", a: "Padel is played in pairs, so four players. You can book with two for drills." },
    { q: "Where do I pick up merch I ordered?", a: "At the pro shop next to the front desk. Show your pickup code and pay there." },
  ],

  // Demo data for the admin panel.
  adminBookings: [
    { code: "ZM-7Q2KD", name: "Rina Wijaya", wa: "0812•••4410", court: "Court 1", date: "2026-10-30", time: "19:00", dur: 90, players: 4, promo: "", status: "Pending" },
    { code: "ZM-3HX9A", name: "Budi Santoso", wa: "0813•••2271", court: "Court 2", date: "2026-10-30", time: "20:00", dur: 60, players: 4, promo: "", status: "Confirmed" },
    { code: "ZM-P81LM", name: "Kevin Tan", wa: "0817•••9032", court: "Court 3", date: "2026-10-31", time: "11:00", dur: 120, players: 4, promo: "MIDDAY20", status: "Pending" },
    { code: "ZM-WW4RT", name: "Sari Halim", wa: "0811•••5509", court: "Court 1", date: "2026-10-31", time: "08:00", dur: 60, players: 2, promo: "", status: "Confirmed" },
    { code: "ZM-K0P3S", name: "Ahmad Fauzi", wa: "0819•••7783", court: "Court 4", date: "2026-11-01", time: "17:00", dur: 90, players: 4, promo: "", status: "Cancelled" },
    { code: "ZM-Z9VBN", name: "Lisa Gunawan", wa: "0812•••0018", court: "Court 2", date: "2026-11-01", time: "09:00", dur: 60, players: 4, promo: "BRINGAFRIEND", status: "Confirmed" },
  ],
  adminOrders: [
    { code: "MR-1042", name: "Dewi Anggraini", items: "Court polo (Forest, M)", total: 389000, status: "Ready for pickup" },
    { code: "MR-1043", name: "Rizal Hakim", items: "Smash The Year tee (L) × 2", total: 498000, status: "Pre-order" },
    { code: "MR-1044", name: "Maria Chen", items: "Wristband set, Ball tube", total: 224000, status: "Picked up" },
  ],
  adminContacts: [
    { name: "Rina Wijaya", wa: "0812•••4410", email: "rina@…", source: "Booking", tags: ["Intermediate", "Event"], consent: true },
    { name: "Kevin Tan", wa: "0817•••9032", email: "", source: "Booking", tags: ["Advanced"], consent: true },
    { name: "Putri Ayu", wa: "0856•••1290", email: "putri@…", source: "Trial class", tags: ["Beginner", "Coaching"], consent: true },
    { name: "Johan Lim", wa: "0878•••3341", email: "", source: "Smash The Year", tags: ["Advanced", "Event"], consent: false },
    { name: "Dewi Anggraini", wa: "0813•••6620", email: "dewi@…", source: "Merch order", tags: ["Beginner"], consent: true },
  ],
};
