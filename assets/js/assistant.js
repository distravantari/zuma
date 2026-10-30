// Zuma Assistant: a rule-based helper for the admin panel.
// It knows every menu in the admin panel and the player app, and reads live
// answers (prices, peak hours, pending bookings, events) from the app's data.
// Anything it can't match gets a hand-off to a real agent.

window.ZumaAssistant = function createAssistant(ctx) {
  const { Z, P, admin, esc, icon, logo, rp, hhmm, fmtLong, fmtDate, openSlotsToday, isFeed } = ctx;
  const HIRE_WA = "6281221520071";
  const HIRE_LINK = `https://wa.me/${HIRE_WA}?text=${encodeURIComponent("Hi Distra, I'd like to hire an agent for the Zuma admin assistant.")}`;

  const link = (label, href, ext = false) => ({ label, href, ext });
  const say = (text, links = []) => ({ text, links });
  const list = (items) => `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;

  // Indonesian and casual words mapped to the words intents use.
  const SYN = {
    pemesanan: "booking", pesanan: "order", pesan: "booking", reservasi: "booking", bookingan: "booking", bookings: "booking", book: "booking",
    harga: "price", tarif: "price", biaya: "price", prices: "price", pricing: "price", cost: "price", rate: "price", rates: "price",
    ramai: "peak", sibuk: "peak", busy: "peak", sepi: "quiet", offpeak: "quiet",
    jam: "hour", hours: "hour", buka: "open", tutup: "close", operasional: "hour", opening: "open",
    pengaturan: "setting", setelan: "setting", settings: "setting", setting: "setting", config: "setting", configuration: "setting", preferences: "setting",
    acara: "event", turnamen: "event", tournament: "event", events: "event", liga: "league",
    pelatih: "coach", coaches: "coach", trainer: "coach", kelas: "class", classes: "class", akademi: "academy", lesson: "class", lessons: "class",
    kode: "code", diskon: "promo", discount: "promo", voucher: "promo", promos: "promo", promotion: "promo",
    ekspor: "export", unduh: "export", download: "export", csv: "export", excel: "export",
    kontak: "contact", contacts: "contact", pelanggan: "contact", customer: "contact", customers: "contact", players: "player", pemain: "player",
    laporan: "report", reports: "report", statistik: "report", stats: "report", analytics: "report",
    batal: "cancel", batalkan: "cancel", cancellation: "cancel", refund: "cancel",
    konfirmasi: "confirm", approve: "confirm", accept: "confirm",
    lapangan: "court", courts: "court", field: "court",
    merchandise: "merch", baju: "merch", kaos: "merch", produk: "merch", product: "merch", products: "merch", shop: "merch", store: "merch", supply: "merch", stock: "merch", stok: "merch",
    sponsors: "sponsor", partner: "sponsor", partners: "sponsor",
    spanduk: "banner", banners: "banner", slider: "banner",
    alamat: "address", lokasi: "address", location: "address", where: "where", dimana: "where", mana: "where",
    fasilitas: "facility", facilities: "facility", amenities: "facility",
    menu: "menu", menus: "menu", navigation: "menu",
    whatsapp: "whatsapp", wa: "whatsapp", nomor: "number", phone: "number",
    bayar: "pay", payment: "pay", pembayaran: "pay", paid: "pay",
    member: "membership", members: "membership", anggota: "membership",
    hi: "hello", halo: "hello", hai: "hello", hey: "hello", pagi: "hello", siang: "hello", sore: "hello", malam: "hello",
    thanks: "thank", makasih: "thank", terima: "thank", kasih: "thank",
    blocks: "block", blokir: "block", maintenance: "block", recurring: "block", rutin: "block",
    scores: "score", skor: "score", hasil: "score", results: "score", bracket: "bracket", brackets: "bracket",
    staf: "staff", karyawan: "staff", role: "staff", roles: "staff", user: "staff", users: "staff", akses: "staff",
    notifikasi: "notification", notifications: "notification", reminder: "notification", reminders: "notification", pengingat: "notification",
    style: "style", tampilan: "style", feed: "style", theme: "style",
    slots: "slot", kosong: "empty", order: "order", orders: "order",
  };
  const words = (q) => q.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(Boolean).map((w) => SYN[w] || w);

  const pending = () => admin.bookings.filter((b) => b.status === "Pending");
  const upcomingEvents = () => Z.events.slice().sort((a, b) => a.date.localeCompare(b.date));
  const openToday = () => Z.courts.reduce((n, c) => n + openSlotsToday(c.id, 99).length, 0);

  // Each intent: words that point to it (weight 1 each, `strong` words 2) and an answer.
  const INTENTS = [
    { id: "hello", strong: ["hello"], only: true, a: () => say(`Hi! I'm the Zuma Assistant. Ask me where something is in the admin panel or the player app, or about prices, peak hours, events and settings.`) },
    { id: "thanks", strong: ["thank"], only: true, a: () => say("You're welcome. Anything else?") },
    { id: "who", re: /(what can you do|who are you|^help$|apa yang bisa|kamu siapa)/, strong: ["assistant", "bot"], words: ["you", "do", "what", "who"], a: () => say(`I know every menu in the admin panel and the player app, plus the club's prices, hours, events, promos, coaches and merch. I can't change anything for you, but I'll point you to the right page.`, [link("Open Settings", "#/admin/settings")]) },

    { id: "menu", strong: ["menu"], words: ["where", "admin", "panel", "list", "all", "page"], a: () => say(`The admin menu is on the left (at the top on a phone):${list(["<b>Today</b>: pending bookings, open hours, quick stats", "<b>Bookings</b>: confirm, cancel, export", "<b>Courts and prices</b>: courts, peak and off-peak prices, blocks", "<b>Content</b>: events, programs, academy, merch, promos, banners, sponsors", "<b>Merch orders</b>: mark pickups", "<b>Contacts and export</b>: player list, tags, CSV", "<b>Reports</b>: busy hours, sponsor clicks", "<b>Settings</b>: club profile, hours, rules, notifications, staff"])}`, [link("Today", "#/admin"), link("Settings", "#/admin/settings")]) },

    { id: "bookings-where", strong: ["booking"], words: ["where", "menu", "find", "see", "list", "page", "open", "manage", "all"], a: () => say(`<b>Bookings</b> is the second item in the left menu. Filter by Pending, Confirmed or Cancelled, confirm or cancel each one, and use <b>Export CSV</b> at the top right.`, [link("Open Bookings", "#/admin/bookings")]) },
    { id: "confirm", strong: ["confirm"], words: ["booking", "how", "pending", "approve"], a: () => { const n = pending().length; return say(`Go to <b>Bookings</b>, filter <b>Pending</b> and press <b>Confirm</b>. The player gets a WhatsApp right away. ${n ? `You have <b>${n}</b> waiting now.` : "Nothing is waiting right now."}`, [link("Review pending", "#/admin/bookings?status=Pending")]); } },
    { id: "pending", strong: ["pending"], words: ["how", "many", "booking", "today", "waiting", "new"], a: () => { const p = pending(); return say(p.length ? `<b>${p.length}</b> booking${p.length > 1 ? "s" : ""} waiting to be confirmed:${list(p.map((b) => `${b.code}, ${esc(b.name)}, ${b.court}, ${fmtDate(b.date)} ${b.time}`))}` : "No bookings are waiting. Everything is confirmed.", [link("Open Bookings", "#/admin/bookings?status=Pending")]); } },
    { id: "cancel-admin", strong: ["cancel"], words: ["booking", "how", "admin", "player", "policy", "rule"], a: () => say(`<b>As admin:</b> Bookings, then <b>Cancel</b> on the row. If the waitlist add-on is on, the next player in line gets a WhatsApp.<br><b>As a player:</b> free cancellation up to 24 hours before start, from <b>More, Check my booking</b> with the booking code. Inside 24 hours they message the front desk. Change the 24 hours in Settings, Booking rules.`, [link("Bookings", "#/admin/bookings"), link("Booking rules", "#/admin/settings")]) },

    { id: "peak", strong: ["peak", "quiet"], words: ["time", "hour", "when", "what", "price", "busy"], a: () => say(`<b>Peak:</b> ${P.peakRule.toLowerCase()}, ${rp(P.peak)} per hour.<br><b>Off-peak:</b> every other hour, ${rp(P.offPeak)} per hour.<br>Weekdays 10:00 to 15:00 also carry the <b>MIDDAY20</b> promo (20% off). The Reports page shows weekday middays are the quietest.`, [link("Change prices", "#/admin/schedule"), link("Busy hours report", "#/admin/reports")]) },
    { id: "price", strong: ["price"], words: ["court", "change", "edit", "set", "update", "how", "much", "where"], a: () => say(`Court prices are under <b>Courts and prices</b>: peak ${rp(P.peak)} and off-peak ${rp(P.offPeak)} per hour. Edit the numbers and press <b>Save changes</b>. The player app shows the new prices right away.`, [link("Courts and prices", "#/admin/schedule")]) },
    { id: "hours", strong: ["hour", "open", "close"], words: ["opening", "time", "when", "club", "change", "what"], a: () => say(`Opening hours:${list(Z.club.hours.map((h) => `${h.days}: ${h.time}`))}Change them in <b>Settings, Opening hours</b>.`, [link("Opening hours", "#/admin/settings")]) },
    { id: "courts", strong: ["court"], words: ["how", "many", "list", "edit", "add", "which", "where"], a: () => say(`Zuma has <b>${Z.courts.length} courts</b>, all indoor and full panoramic: ${Z.courts.map((c) => c.name).join(", ")}. Switch a court on or off for booking under <b>Courts and prices</b>.`, [link("Courts and prices", "#/admin/schedule")]) },
    { id: "blocks", strong: ["block"], words: ["court", "academy", "coaching", "weekly", "add", "how", "where"], a: () => say(`Blocks and recurring weekly bookings are at the bottom of <b>Courts and prices</b>. Current blocks:${list(Z.blocks.map((b) => `${Z.courts.find((c) => c.id === b.court).name}: ${b.label}, ${hhmm(b.from)} to ${hhmm(b.to)}`))}Use <b>Add a block</b> for maintenance, coaching or an AYO booking.`, [link("Blocks", "#/admin/schedule")]) },
    { id: "open-now", strong: ["empty", "free", "available", "availability", "slot"], words: ["court", "today", "slot", "now", "open", "how", "many", "hour"], a: () => say(`There are <b>${openToday()} open court hours</b> left today. Players see them on the home screen court board and can tap to book.`, [link("Today", "#/admin"), link("Player app home", "#/")]) },

    { id: "settings", strong: ["setting"], words: ["where", "menu", "change", "page", "open", "club", "profile"], a: () => say(`<b>Settings</b> is the last item in the left menu. It has:${list(["Club profile: name, address, WhatsApp, email, Instagram", "Opening hours", "Booking rules: cancellation window, no-show release, how far ahead players can book", "Notifications: WhatsApp confirmations and reminders", "Integrations: Google Analytics, Meta Pixel, WhatsApp API, AYO", "Staff and roles"])}Court prices live under Courts and prices.`, [link("Open Settings", "#/admin/settings")]) },
    { id: "notify", strong: ["notification"], words: ["whatsapp", "email", "send", "confirmation", "turn", "off", "on"], a: () => say(`WhatsApp confirmations, the 2-hour reminder and email confirmations are switched on and off in <b>Settings, Notifications</b>.`, [link("Notifications", "#/admin/settings")]) },
    { id: "staff", strong: ["staff"], words: ["add", "invite", "access", "login", "account", "who"], a: () => say(`Staff and roles are in <b>Settings</b>. Owner can change everything, Front desk handles bookings, merch and contacts, and Coach coordinator edits the academy and programs. Use <b>Invite staff</b> to add someone.`, [link("Staff and roles", "#/admin/settings")]) },
    { id: "whatsapp", strong: ["whatsapp", "number"], words: ["club", "change", "what", "our", "contact"], a: () => say(`Players reach the club on WhatsApp +${Z.club.whatsapp} (sample number). Change it in <b>Settings, Club profile</b>.`, [link("Club profile", "#/admin/settings")]) },
    { id: "address", strong: ["address"], words: ["club", "our", "map", "zuma"], a: () => say(`${esc(Z.club.address)}. Players find the map under <b>More, Visit and help</b>. Edit the address in Settings.`, [link("Visit and help (player)", "#/info"), link("Settings", "#/admin/settings")]) },
    { id: "facility", strong: ["facility"], words: ["club", "what", "have", "list"], a: () => say(`Facilities listed in the app:${list(Z.club.facilities)}`, [link("Visit and help (player)", "#/info")]) },

    { id: "events", strong: ["event"], words: ["add", "new", "create", "edit", "where", "upcoming", "next", "list", "what", "league"], a: () => say(`Events are managed under <b>Content, Events</b>. Coming up:${list(upcomingEvents().map((e) => `<b>${esc(e.title)}</b>, ${fmtLong(e.date)}, ${e.filled} of ${e.quota} signed up`))}`, [link("Content, Events", "#/admin/content?tab=events"), link("Event calendar (player)", "#/events")]) },
    { id: "bracket", strong: ["bracket", "score"], words: ["live", "enter", "update", "tournament", "where"], a: () => say(`The live bracket for Smash The Year is at Events, Smash The Year, <b>Bracket and live scores</b> in the player app. Scores are entered from the event in <b>Content, Events</b>.`, [link("Live bracket", "#/events/smash-the-year/bracket"), link("Content, Events", "#/admin/content?tab=events")]) },
    { id: "programs", strong: ["program", "americano", "social"], words: ["add", "edit", "where", "list", "fun", "match", "community"], a: () => say(`Programs are under <b>Content, Programs</b>:${list(Z.programs.map((p) => `<b>${esc(p.title)}</b>, ${esc(p.schedule)}, ${esc(p.price)}`))}`, [link("Content, Programs", "#/admin/content?tab=programs")]) },
    { id: "academy", strong: ["academy", "coach", "class", "trial"], words: ["add", "edit", "where", "list", "who", "schedule", "price"], a: () => say(`Academies and coaches are under <b>Content, Academy and coaches</b>.${list(Z.academies.map((a) => `<b>${esc(a.name)}</b>: ${a.coaches.map((k) => Z.coaches[k].name).join(", ")}`))}Players book a trial class from the Academy page.`, [link("Academy and coaches", "#/admin/content?tab=academy"), link("Academy (player)", "#/academy")]) },
    { id: "merch", strong: ["merch"], words: ["add", "edit", "where", "sold", "out", "price", "list", "catalog"], a: () => { const out = Z.products.filter((p) => p.status === "soldout").map((p) => p.name); return say(`The merch catalog is under <b>Content, Merch</b>: ${Z.products.length} products.${out.length ? ` Sold out: ${out.join(", ")}.` : ""} Players reserve online and pay at the pro shop.`, [link("Content, Merch", "#/admin/content?tab=merch"), link("Zuma Supply (player)", "#/shop")]); } },
    { id: "orders", strong: ["order", "pickup", "picked"], words: ["merch", "where", "mark", "how", "many", "ready"], a: () => { const ready = admin.orders.filter((o) => o.status === "Ready for pickup").length; return say(`<b>Merch orders</b> is in the left menu. Press <b>Mark picked up</b> when a player collects and pays. ${ready} order${ready === 1 ? " is" : "s are"} ready for pickup now.`, [link("Merch orders", "#/admin/orders")]); } },
    { id: "promos", strong: ["promo", "code"], words: ["add", "edit", "where", "list", "active", "which", "what"], a: () => say(`Promos are under <b>Content, Promos</b>. Active codes:${list(Z.promos.map((p) => `<b>${p.code}</b>: ${esc(p.text)} Until ${fmtLong(p.until)}.`))}Players type the code when they book and the front desk applies it at payment.`, [link("Content, Promos", "#/admin/content?tab=promos")]) },
    { id: "banners", strong: ["banner"], words: ["home", "change", "edit", "where", "add"], a: () => say(`Home banners are under <b>Content, Banners</b>. Right now: ${Z.banners.map((b) => esc(b.title)).join(", ")}.`, [link("Content, Banners", "#/admin/content?tab=banners")]) },
    { id: "sponsors", strong: ["sponsor"], words: ["add", "logo", "clicks", "report", "where", "media", "kit"], a: () => say(`Sponsor logos are under <b>Content, Sponsors</b>. Views and clicks per sponsor are in <b>Reports</b>, and the media kit for new partners is in the player app under More.`, [link("Content, Sponsors", "#/admin/content?tab=sponsors"), link("Reports", "#/admin/reports"), link("Media kit", "#/media-kit")]) },

    { id: "export", strong: ["export"], words: ["booking", "contact", "order", "data", "signup", "how", "where"], a: () => say(`Every list exports to CSV:${list(["Bookings: <b>Export CSV</b> on the Bookings page", "Players and event sign-ups: <b>Contacts and export</b>", "Merch orders: <b>Export CSV</b> on Merch orders", "Sponsor numbers: <b>Reports</b>"])}`, [link("Contacts and export", "#/admin/contacts"), link("Bookings", "#/admin/bookings")]) },
    { id: "contacts", strong: ["contact", "broadcast", "tag", "segment"], words: ["player", "list", "where", "message", "consent"], a: () => say(`<b>Contacts and export</b> has every player who booked or signed up, with tags (level, coaching, events) and whether they agreed to hear from Zuma. Only message people with consent.`, [link("Contacts and export", "#/admin/contacts")]) },
    { id: "reports", strong: ["report"], words: ["busy", "quiet", "where", "occupancy", "sponsor"], a: () => say(`<b>Reports</b> shows quiet and busy hours over the last 4 weeks and sponsor views and clicks. It's for deciding promos and coaching slots, not a revenue dashboard.`, [link("Reports", "#/admin/reports")]) },

    { id: "player-book", strong: ["player"], words: ["booking", "how", "court", "app", "steps"], a: () => say(`Players book in 3 steps, no account needed:${list(["Pick a day, a duration and an open time", "Leave a name and WhatsApp number", "Get a booking code on screen and on WhatsApp, then pay at the front desk"])}`, [link("Player booking", "#/book")]) },
    { id: "check-booking", strong: ["check", "change", "reschedule"], words: ["booking", "code", "player", "my"], a: () => say(`Players check, change or cancel with their booking code under <b>More, Check my booking</b> (or <b>Me</b> in the Feed style). Try the code ZM-DEMO1.`, [link("Check my booking", "#/manage")]) },
    { id: "waitlist", strong: ["waitlist"], words: ["how", "work", "full", "booked"], a: () => say(`When a time is booked, players tap it to join the waitlist. If the booking is cancelled, the first person on the list gets a WhatsApp. Full events have a waitlist too.`, [link("Player booking", "#/book")]) },
    { id: "checkin", strong: ["checkin", "check-in"], words: ["code", "reminder"], a: () => say(`After booking, players get a 4-digit check-in code and a WhatsApp reminder 2 hours before. The front desk checks the code on arrival.`) },
    { id: "pay", strong: ["pay"], words: ["online", "how", "player", "where", "qris", "card"], a: () => say(`The app doesn't take payments. Players pay at the front desk by card, QRIS or cash. Merch is paid when collected at the pro shop.`) },
    { id: "membership", strong: ["membership"], words: ["register", "registration", "when", "join"], a: () => say(`Member registration is marked coming soon. Players can join the waiting list from <b>Me</b> in the Feed style. The membership itself isn't designed yet.`, [link("Me (player)", "#/me")]) },
    { id: "ayo", strong: ["ayo"], words: ["sync", "booking", "double"], a: () => say(`AYO isn't synced yet. When a slot sells on AYO, block it under <b>Courts and prices, Blocks</b> so nobody books it twice here. The AYO setting is in Settings, Integrations.`, [link("Blocks", "#/admin/schedule"), link("Integrations", "#/admin/settings")]) },
    { id: "style", strong: ["style"], words: ["club", "switch", "player", "app", "change"], a: () => say(`The player app has two styles: <b>Club</b> (calm, everything one tap from home) and <b>Feed</b> (stories and a swipeable feed). The player app is in the <b>${isFeed() ? "Feed" : "Club"}</b> style in this browser.`, [link("Open Club style", "#/?style=club"), link("Open Feed style", "#/?style=feed")]) },
    { id: "player-app", strong: ["app"], words: ["player", "back", "open", "see", "view"], a: () => say(`Open the player app with <b>Back to player app</b> at the bottom of the left menu.`, [link("Player app", "#/")]) },
  ];

  function answer(q) {
    const w = words(q);
    const set = new Set(w);
    let best = null, bestScore = 0;
    const direct = INTENTS.find((it) => it.re && it.re.test(q.toLowerCase().trim()));
    if (direct) return direct.a();
    for (const it of INTENTS) {
      const strong = (it.strong || []).filter((k) => set.has(k)).length;
      if (!strong) continue;
      if (it.only && w.length > 4) continue;
      const score = strong * 2 + (it.words || []).filter((k) => set.has(k)).length;
      if (score > bestScore) { best = it; bestScore = score; }
    }
    // An event or product named outright beats a generic match.
    const ql = q.toLowerCase();
    const ev = Z.events.find((e) => ql.includes(e.title.toLowerCase().split(",")[0].toLowerCase()));
    if (ev && !/add|edit|where/.test(ql)) {
      return say(`<b>${esc(ev.title)}</b>: ${fmtLong(ev.date)}, ${esc(ev.time)}, ${esc(ev.location)}. ${ev.filled} of ${ev.quota} places taken. Entry ${esc(ev.fee)}, paid at the club.`, [link("Event page", `#/events/${ev.slug}`), link("Edit in Content", "#/admin/content?tab=events")]);
    }
    const prod = Z.products.find((p) => ql.includes(p.name.toLowerCase()));
    if (prod) return say(`<b>${esc(prod.name)}</b>: ${rp(prod.price)}, ${prod.status === "soldout" ? "sold out" : prod.status === "preorder" ? "pre-order" : "in stock"}.`, [link("Product page", `#/shop/${prod.slug}`), link("Edit in Content", "#/admin/content?tab=merch")]);
    const coach = Object.values(Z.coaches).find((c) => ql.includes(c.name.split(" ")[0].toLowerCase()));
    if (coach && !best) return say(`<b>${esc(coach.name)}</b>, ${esc(coach.role)}. ${esc(coach.spec)}. ${coach.years} years coaching.`, [link("Academy and coaches", "#/admin/content?tab=academy")]);
    if (best && bestScore >= 2) return best.a();
    return say(`I'm not a full agent yet, so I can't answer that one. I only know this app's menus, settings and content.<br>For questions like this you need to hire an agent. Ask Distra to hire one for you:`, [link("WhatsApp Distra", HIRE_LINK, true)], true);
  }

  /* ---------- Chat UI ---------- */
  const SUGGEST = ["Where is the booking menu?", "What is our peak time?", "Where is settings?", "How do I confirm a booking?", "Which promo codes are active?", "When is Smash The Year?"];
  const msgs = [];
  let open = false;

  const msgHtml = (m) => m.from === "you"
    ? `<div class="ask-msg you"><p>${esc(m.text)}</p></div>`
    : `<div class="ask-msg bot ${m.miss ? "miss" : ""}"><div class="ask-av" aria-hidden="true">${logo(8)}</div><div class="ask-bubble">${m.typing ? '<span class="ask-typing" aria-label="Typing"><i></i><i></i><i></i></span>' : `<div>${m.text}</div>${(m.links || []).length ? `<div class="ask-links">${m.links.map((l) => `<a class="btn ${l.ext ? "" : "ghost"} sm" href="${l.href}" ${l.ext ? 'target="_blank" rel="noopener"' : 'data-action="ask-link"'}>${l.ext ? icon("wa", 16) + " " : ""}${l.label}</a>`).join("")}</div>` : ""}`}</div></div>`;

  function panel(full = false) {
    return `<section class="ask-panel ${full ? "full" : ""}" aria-label="Zuma Assistant">
      <header class="ask-head">
        <div class="ask-title"><span class="ask-av big" aria-hidden="true">${logo(10)}</span><div><b>Zuma Assistant</b><span>Knows the admin panel and the player app</span></div></div>
        <div class="ask-tools">
          ${full ? "" : `<a class="icon-btn" href="#/admin/assistant" data-action="ask-expand" aria-label="Open as full page">${icon("expand", 18)}</a>`}
          ${full ? "" : `<button class="icon-btn" type="button" data-action="ask-close" aria-label="Close assistant">${icon("close", 18)}</button>`}
        </div>
      </header>
      <div class="ask-log" aria-live="polite">
        ${msgs.length ? msgs.map(msgHtml).join("") : `<div class="ask-empty"><p class="ask-hello">Hi, how can I help?</p><p class="small muted">Ask where something is, or about prices, hours, events and settings.</p></div>`}
      </div>
      <div class="ask-suggest chips">${SUGGEST.map((s) => `<button type="button" class="chip" data-action="ask" data-q="${esc(s)}">${esc(s)}</button>`).join("")}</div>
      <form class="ask-form" data-form="ask">
        <label for="ask-q" class="sr-only">Ask Zuma</label>
        <input id="ask-q" name="q" placeholder="Ask a question" autocomplete="off">
        <button class="btn sm" type="submit" aria-label="Send">${icon("send", 18)}</button>
      </form>
      <p class="ask-note">Answers come from this app's menus and data. It can't make changes for you.</p>
    </section>`;
  }

  function drawerEl() { return document.getElementById("ask-drawer"); }
  function paint() {
    const page = document.querySelector(".ask-page");
    if (page) page.innerHTML = panel(true);
    const d = drawerEl();
    if (d) d.innerHTML = open && !page ? panel(false) : "";
    document.body.classList.toggle("ask-open", open && !page);
    const log = document.querySelector(".ask-log"); if (log) log.scrollTop = log.scrollHeight;
  }
  function mount() {
    if (!drawerEl()) { const d = document.createElement("div"); d.id = "ask-drawer"; document.body.appendChild(d); }
    let fab = document.getElementById("ask-fab");
    const inAdmin = location.hash.startsWith("#/admin");
    if (inAdmin && !fab) {
      fab = document.createElement("button"); fab.id = "ask-fab"; fab.type = "button"; fab.dataset.action = "ask-open";
      fab.innerHTML = `${icon("spark", 20)}<span>Ask Zuma</span>`; document.body.appendChild(fab);
    }
    if (fab) fab.hidden = !inAdmin || open || location.hash.startsWith("#/admin/assistant");
    if (!inAdmin) open = false;
    paint();
  }
  function ask(q) {
    q = (q || "").trim(); if (!q) return;
    if (!document.querySelector(".ask-page")) open = true;
    msgs.push({ from: "you", text: q });
    const typing = { from: "bot", typing: true }; msgs.push(typing);
    mount();
    setTimeout(() => {
      const r = answer(q);
      Object.assign(typing, { typing: false, text: r.text, links: r.links, miss: r.links.some((l) => l.ext) });
      paint();
      document.getElementById("ask-q")?.focus();
    }, 450);
  }

  return {
    answer, panel, mount, ask, suggestions: SUGGEST,
    openDrawer() { open = true; mount(); document.getElementById("ask-q")?.focus(); },
    close() { open = false; mount(); },
    isOpen: () => open,
  };
};
