// Zuma web app mockup: hash router, views and demo interactions.
// No backend. Bookings and orders made in the demo live in this browser only.

(() => {
  const Z = window.ZUMA;
  const root = document.getElementById("root");

  /* ---------- Utilities ---------- */
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const rp = (n) => "IDR " + Math.round(n).toLocaleString("en-US");
  const pad = (n) => String(n).padStart(2, "0");
  const hhmm = (h) => `${pad(Math.floor(h))}:${h % 1 ? "30" : "00"}`;
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseISO = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const fmtDate = (s) => { const d = parseISO(s); return `${DOW[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`; };
  const fmtLong = (s) => { const d = parseISO(s); return `${d.getDate()} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`; };
  const code = (prefix) => prefix + "-" + Array.from({ length: 5 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");
  const waLink = (text) => `https://wa.me/${Z.club.whatsapp}?text=${encodeURIComponent(text)}`;
  const shareWa = (text) => `https://wa.me/?text=${encodeURIComponent(text)}`;

  // Per-browser storage with an in-memory fallback.
  const mem = {};
  const store = {
    get(k, fallback) {
      try { const v = localStorage.getItem("zuma." + k); return v ? JSON.parse(v) : fallback; }
      catch { return k in mem ? mem[k] : fallback; }
    },
    set(k, v) {
      mem[k] = v;
      try { localStorage.setItem("zuma." + k, JSON.stringify(v)); } catch {}
    },
  };

  /* ---------- Icons (hand-drawn set, 24px, 1.8 stroke) ---------- */
  const I = {
    home: '<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z"/>',
    court: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M12 5v14M7 5v14M17 5v14M7 12h10"/>',
    cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    more: '<path d="M4 7h16M4 12h16M4 17h10"/>',
    back: '<path d="M15 5 8 12l7 7"/>',
    wa: '<path d="M5 19l1.2-3.6A7.5 7.5 0 1 1 9 18.6z"/><path d="M9.5 9.5c.3 1.8 1.7 3.6 3.8 4.4l1.2-1.1 1.8.9"/>',
    share: '<path d="M12 4v11M8 8l4-4 4 4M5 13v6h14v-6"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    pin: '<path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>',
    download: '<path d="M12 4v11M8 11l4 4 4-4M5 19h14"/>',
    bag: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    ig: '<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.5"/><circle cx="16.8" cy="7.2" r="0.6"/>',
  };
  const LOGO = "assets/brand/zuma-logo-white.png";
  const logo = (h = 22, dark = false) => `<img class="logo ${dark ? "dark" : ""}" src="${LOGO}" alt="Zuma" style="height:${h}px">`;
  const icon = (name, size = 22) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[name]}</svg>`;

  const PRODUCT_ART = {
    shirt: '<path d="M8 3 3 6l2 4 3-1v12h8V9l3 1 2-4-5-3c-.5 1.5-2 2.5-4 2.5S8.5 4.5 8 3z"/>',
    cap: '<path d="M3 15c0-5 4-9 9-9s8 4 8 9H3z"/><path d="M12 15h9c0 1.5-1 2-3 2h-6"/><circle cx="11.5" cy="6" r="1"/>',
    towel: '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M5 16h14M5 18h14"/>',
    shorts: '<path d="M5 4h14l1 15h-6l-2-8-2 8H4z"/><path d="M5 7h14"/>',
    band: '<ellipse cx="12" cy="12" rx="8" ry="5"/><ellipse cx="12" cy="12" rx="5" ry="2.5"/>',
    balls: '<rect x="8" y="2" width="8" height="20" rx="4"/><circle cx="12" cy="7" r="2.3"/><circle cx="12" cy="12" r="2.3"/><circle cx="12" cy="17" r="2.3"/>',
  };
  const productArt = (p) => {
    const k = /tee|polo/.test(p.slug) ? "shirt" : /cap/.test(p.slug) ? "cap" : /towel/.test(p.slug) ? "towel" : /shorts/.test(p.slug) ? "shorts" : /band/.test(p.slug) ? "band" : "balls";
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" aria-hidden="true">${PRODUCT_ART[k]}</svg>`;
  };

  // Top-down padel court, 20m x 10m, with service lines 6.95m from the net.
  const courtSvg = (inUse) => `
    <svg viewBox="0 0 200 100" aria-hidden="true">
      <rect x="2" y="2" width="196" height="96" rx="4" fill="none" stroke="#DFCC8A" stroke-width="3"/>
      <line x1="100" y1="2" x2="100" y2="98" stroke="#F5F1E6" stroke-width="2.5" stroke-dasharray="3 3"/>
      <line x1="30.5" y1="2" x2="30.5" y2="98" stroke="#F5F1E6" stroke-width="1.4"/>
      <line x1="169.5" y1="2" x2="169.5" y2="98" stroke="#F5F1E6" stroke-width="1.4"/>
      <line x1="30.5" y1="50" x2="169.5" y2="50" stroke="#F5F1E6" stroke-width="1.4"/>
      ${inUse ? `<g fill="#DFCC8A"><circle cx="60" cy="28" r="6"/><circle cx="66" cy="72" r="6"/><circle cx="138" cy="30" r="6"/><circle cx="142" cy="70" r="6"/></g>` : ""}
    </svg>`;

  /* ---------- Availability model ---------- */
  const P = Z.pricing;
  const now = () => new Date();
  const isWeekend = (d) => d.getDay() === 0 || d.getDay() === 6;
  const isPeak = (d, h) => h >= 17 || (isWeekend(d) && h >= 7 && h < 11);
  const isPromo = (d, h) => !isWeekend(d) && h >= 10 && h < 15;
  const hash = (s) => {
    let h = 2166136261;
    for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
    return (h >>> 0) / 4294967295;
  };

  const blockFor = (court, d, h) => Z.blocks.find((b) => b.court === court && b.weekday.includes(d.getDay()) && h >= b.from && h < b.to);

  function myBookings() { return store.get("bookings", {}); }

  // Status of one half-hour unit on one court.
  function unit(courtId, dateStr, h) {
    const d = parseISO(dateStr);
    const b = blockFor(courtId, d, h);
    if (b) return { state: "block", label: b.label };
    const mine = Object.values(myBookings()).find((x) => x.status !== "Cancelled" && x.court === courtId && x.date === dateStr && h >= x.start && h < x.start + x.dur / 60);
    if (mine) return { state: "taken", mine: true };
    const hour = Math.floor(h);
    const p = isPeak(d, hour) ? 0.58 : 0.22;
    if (hash(courtId + dateStr + hour) < p) return { state: "taken" };
    return { state: "open" };
  }

  function canStart(courtId, dateStr, start, dur) {
    if (start + dur / 60 > P.close) return false;
    for (let h = start; h < start + dur / 60; h += 0.5) if (unit(courtId, dateStr, h).state !== "open") return false;
    return true;
  }

  function priceFor(dateStr, start, dur) {
    const d = parseISO(dateStr);
    let total = 0;
    for (let h = start; h < start + dur / 60; h += 0.5) total += (isPeak(d, Math.floor(h)) ? P.peak : P.offPeak) / 2;
    return total;
  }

  function isPast(dateStr, h) {
    const n = now();
    if (dateStr !== iso(n)) return false;
    return h <= n.getHours() + n.getMinutes() / 60;
  }

  function openSlotsToday(courtId, limit = 3) {
    const today = iso(now());
    const out = [];
    for (let h = P.open; h < P.close && out.length < limit; h++) {
      if (!isPast(today, h) && canStart(courtId, today, h, 60)) out.push(h);
    }
    return out;
  }

  /* ---------- Presenter notes (desktop side panel) ---------- */
  const NOTES = {
    home: ["Home", [["HM-01", "Promo and event banners"], ["HM-02", "Booking shortcut"], ["Add-on", "Live court board with today's open slots"], ["HM-03", "Upcoming events and open programs"], ["HM-04", "Club info, hours, WhatsApp"], ["HM-05", "Sponsor and partner logos"]]],
    book: ["Court booking", [["BK-01", "Date, duration, court and time with live availability"], ["BK-02", "Peak and off-peak prices shown as info"], ["Add-on", "Off-peak promo marks on the grid"], ["Add-on", "Court blocks for academy and maintenance"], ["Add-on", "Waitlist when a slot is taken"], ["BK-03", "Short form, no account needed"], ["PM-02", "Promo code recorded for the front desk"], ["MK-01", "Contact consent"]]],
    confirm: ["Booking confirmed", [["BK-04", "Booking code on screen, sent by WhatsApp or email"], ["Add-on", "Check-in code and WhatsApp reminder"], ["BK-06", "Rules and cancellation policy"]]],
    manage: ["Manage a booking", [["BK-05", "Check, change or cancel with the booking code"], ["BK-06", "Cancellation policy enforced"]]],
    events: ["Event calendar", [["EV-01", "Calendar and list of events and tournaments"], ["EV-02", "Date, time, category and quota at a glance"]]],
    event: ["Event page", [["EV-02", "Full event detail, fee as info only"], ["EV-03", "Registration form, no payment"], ["Add-on", "Campaign landing: countdown and quota"], ["PM-03", "Sponsor slot on the event page"], ["MK-03", "Share to WhatsApp and Instagram, own link"], ["MERCH", "Event merch"]]],
    bracket: ["Bracket and results", [["EV-04", "Bracket and results page"], ["Add-on", "Live scores during the tournament"]]],
    programs: ["Club programs", [["PG-01", "Fun match and community programs"], ["PG-02", "Description, level, schedule, price"], ["PG-04", "Sign up by form or WhatsApp"]]],
    academy: ["Academy", [["AC", "Separate page for every academy at Zuma"], ["AC", "Coaches per academy, photo and specialty"], ["AC", "Levels, class schedule, packages"], ["AC", "Trial class sign-up"]]],
    beginners: ["For beginners", [["Add-on", "Basic rules, short video, trial class button"]]],
    shop: ["Merch and brand", [["MERCH", "Separate catalog, can run as its own brand"], ["MERCH", "Brand story and lookbook"], ["MERCH", "Available, sold out and pre-order labels"], ["MERCH", "Event merch"]]],
    product: ["Product", [["MERCH", "Variants, sizes, price"], ["MERCH", "Reserve now, pay and pick up at the club"]]],
    promos: ["Promos", [["PM-01", "Promos with terms and validity"], ["PM-02", "Code carried into the booking form"]]],
    info: ["Info and help", [["SP-01", "FAQ and how to book"], ["SP-02", "Map, hours, facilities"], ["SP-03", "WhatsApp customer service"]]],
    more: ["Menu", [["", "Everything that doesn't fit in the four tabs"]]],
    feed: ["Feed home", [["HM-01", "Stories carry promos and events"], ["HM-02", "Book button always in the middle of the tab bar"], ["Add-on", "Open-now court story and feed card"], ["HM-03", "Events, programs and coaches as swipeable cards"], ["MK-03", "Every card shares to WhatsApp"], ["", "Save cards to Me, like Instagram"]]],
    explore: ["Explore", [["EV-01", "Events, programs, academy and shop in one grid"], ["SP-01", "Search across everything"]]],
    me: ["Me", [["BK-05", "Your bookings on this phone, no account needed"], ["", "Saved cards"], ["", "Member registration, coming soon (from the club's Linktree)"]]],
    mediakit: ["Media kit", [["Add-on", "Club profile, capacity, sponsor slots, event calendar"]]],
    admin: ["Admin panel", [["AD-01", "Courts, schedule, peak/off-peak prices"], ["AD-02", "View, confirm, cancel bookings"], ["AD-03", "Events, programs, academy, merch, promos, banners, sponsors"], ["AD-04", "View and export bookings, sign-ups, orders"], ["Add-on", "Quiet and busy hours, sponsor clicks"]]],
  };

  function presenter(key, isAdmin) {
    const [title, items] = NOTES[key] || NOTES.home;
    const hidden = document.body.classList.contains("hide-addons");
    const feed = isFeed();
    return `
      <aside class="presenter" aria-label="About this mockup">
        ${logo(30)}
        <p class="lede" style="margin-top:14px">Web app mockup for Zuma Padel Court, Bogor. Everything is clickable with sample data. Nothing is paid or sent.</p>
        <h2>Pick a player app style</h2>
        <div class="style-cards" role="group" aria-label="Player app style">
          <button type="button" data-action="style" data-style="club" aria-pressed="${!feed}"><b>Club</b><span>Calm, editorial, everything one tap from home</span></button>
          <button type="button" data-action="style" data-style="feed" aria-pressed="${feed}"><b>Feed</b><span>Stories and a swipeable feed, like Instagram and TikTok</span></button>
        </div>
        <div class="switch" role="group" aria-label="View">
          <a href="#/" class="${isAdmin ? "" : "active"}">Player app</a>
          <a href="#/admin" class="${isAdmin ? "active" : ""}">Admin panel</a>
        </div>
        <h2>On this screen: ${esc(title)}</h2>
        <ul>${items.map(([id, t]) => `<li><b>${esc(id)}</b><span>${esc(t)}</span></li>`).join("")}</ul>
        <div class="switch">
          <button type="button" data-action="toggle-addons" aria-pressed="${!hidden}">Show add-on tags</button>
        </div>
        <p class="foot">Codes match the client brief (HM, BK, EV, PG, PM, SP, MK, AD). AC = Academy, MERCH = Merchandise. Items tagged Add-on are optional extras.</p>
      </aside>`;
  }

  /* ---------- Chrome ---------- */
  function topbar(back) {
    if (back === "#/more" && isFeed()) back = "#/explore";
    return `<header class="topbar">
      ${back ? `<a class="back" href="${back}" data-action="back">${icon("back", 20)} Back</a>` : `<a href="#/" aria-label="Zuma home">${logo(22)}</a>`}
      <a class="icon-btn" href="${waLink("Hi Zuma, I have a question.")}" target="_blank" rel="noopener" aria-label="Chat with Zuma on WhatsApp">${icon("wa", 20)}</a>
    </header>`;
  }

  function tabbar(active) {
    const tab = (href, key, label, ic) => `<a href="${href}" ${active === key ? 'aria-current="page"' : ""}>${icon(ic)}<span>${label}</span></a>`;
    if (isFeed()) {
      const inShop = /^#\/(shop|pickup)/.test(location.hash);
      const k = inShop ? "shop" : { events: "explore", more: "me" }[active] || active;
      return `<nav class="tabbar five" aria-label="Main">
        ${tab("#/", "home", "Home", "home")}${tab("#/explore", "explore", "Explore", "search")}
        <a class="book-fab" href="#/book" ${k === "book" ? 'aria-current="page"' : ""}><span class="fab">${icon("court")}</span><span>Book</span></a>
        ${tab("#/shop", "shop", "Shop", "bag")}${tab("#/me", "me", "Me", "user")}
      </nav>`;
    }
    return `<nav class="tabbar" aria-label="Main">${tab("#/", "home", "Home", "home")}${tab("#/book", "book", "Book", "court")}${tab("#/events", "events", "Events", "cal")}${tab("#/more", "more", "More", "more")}</nav>`;
  }

  const addon = '<span class="addon">Add-on</span>';

  /* ---------- Views: home ---------- */
  function viewHome() {
    const today = iso(now());
    const h = now().getHours();
    const tiles = Z.courts.map((c) => {
      const inUse = unit(c.id, today, h).state !== "open";
      const open = openSlotsToday(c.id, 4);
      return `<a class="court-tile" href="#/book?court=${c.id}${open[0] ? "&start=" + open[0] : ""}">
        ${courtSvg(inUse)}
        <div class="row"><span class="name">${c.name}</span><span class="small" style="color:var(--ivory-3)">${c.kind}</span></div>
        <div class="row">${open.length ? `<span class="next">${hhmm(open[0])}</span>` : `<span class="next none">Full today</span>`}</div>
        ${open.length > 1 ? `<div class="slots">${open.slice(1).map((x) => `<span>${hhmm(x)}</span>`).join("")}</div>` : ""}
      </a>`;
    }).join("");
    const openCount = Z.courts.reduce((n, c) => n + openSlotsToday(c.id, 99).length, 0);

    const upcoming = Z.events.slice().sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
    return `
      ${topbar()}
      <section class="board" aria-labelledby="board-h">
        <h1 id="board-h">${openCount ? `${openCount} open hours left today` : "Fully booked today"}</h1>
        <p class="sub">Next free time on each court. Tap a court to book it. ${addon}</p>
        <div class="board-grid">${tiles}</div>
        <a class="btn gold block" href="#/book">Book a court</a>
      </section>

      <section class="section" style="padding-left:0;padding-right:0">
        <div class="banner-rail" aria-label="Promos and events">
          ${Z.banners.map((b, i) => `
            <a class="banner" href="${b.href}">
              <div class="art halftone ${i === 0 ? "forest" : i === 1 ? "gold" : ""}"><strong>${esc(b.title)}</strong></div>
              <div class="body"><p class="small">${esc(b.text)}</p><span>${esc(b.cta)}</span></div>
            </a>`).join("")}
        </div>
      </section>

      <section class="section">
        <div class="section-head"><h2>Coming up</h2><a href="#/events">All events</a></div>
        <div class="stack-16" style="margin-top:14px">${upcoming.map(eventRow).join("")}</div>
      </section>

      <section class="section">
        <h2>Play, learn, shop</h2>
        <div class="cats" style="margin-top:14px">
          <a class="cat" href="#/academy"><div><h3>Academy</h3><p>3 academies, 4 coaches</p></div><span class="chips"><span class="chip">Beginner</span><span class="chip">Advanced</span></span></a>
          <a class="cat" href="#/programs"><div><h3>Fun match</h3><p>Americano, King of the court</p></div><span class="chip solid">From IDR 175k</span></a>
          <a class="cat" href="#/programs"><div><h3>Community</h3><p>Ladies morning, Sunday social</p></div><span class="chip">All levels</span></a>
          <a class="cat" href="#/shop"><div><h3>Zuma Supply</h3><p>Club merch, pick up at the shop</p></div><span class="chip">New drop</span></a>
          <a class="cat" href="#/beginners"><div><h3>New to padel</h3><p>Rules, video, trial class</p></div>${addon}</a>
        </div>
      </section>

      <section class="section">
        <h2>The club</h2>
        <div class="club-info" style="margin-top:14px">
          <div class="card flat small"><div class="stack-8">${icon("clock")}<b>Open daily</b><span>06:00 – 23:00</span></div></div>
          <a class="card flat small" href="#/info" style="text-decoration:none"><div class="stack-8">${icon("pin")}<b>Find us</b><span>Map and parking</span></div></a>
          <div class="card flat small" style="grid-column: span 2"><b>Facilities</b><p class="muted" style="margin-top:4px">${Z.club.facilities.join(", ")}.</p></div>
        </div>
        <a class="btn ghost block" style="margin-top:12px" href="${waLink("Hi Zuma, I have a question.")}" target="_blank" rel="noopener">${icon("wa", 20)} Chat with us on WhatsApp</a>
      </section>

      <section class="section">
        <h2>Partners</h2>
        <div class="sponsors" style="margin-top:14px">
          ${Z.sponsors.map((s) => `<a class="sponsor" href="#/" data-action="sponsor" data-name="${esc(s.name)}">${esc(s.name)}<small>${esc(s.tier)}</small></a>`).join("")}
          <a class="sponsor" href="#/media-kit" style="border-style:dashed">Your brand here<small>See the media kit</small></a>
        </div>
      </section>
      ${tabbar("home")}`;
  }

  function eventRow(e) {
    const d = parseISO(e.date);
    const pct = Math.round((e.filled / e.quota) * 100);
    const full = e.filled >= e.quota;
    return `<a class="event-card" href="#/events/${e.slug}">
      <div class="datebadge"><b>${d.getDate()}</b><span>${MONTHS[d.getMonth()]}</span></div>
      <div>
        <div class="chips"><span class="chip">${esc(e.kind)}</span>${full ? '<span class="chip brick">Full</span>' : ""}</div>
        <h3 style="margin-top:6px">${esc(e.title)}</h3>
        <p class="meta">${esc(e.time)}, ${esc(e.location)}</p>
        <div class="quota ${full ? "full" : ""}" role="img" aria-label="${e.filled} of ${e.quota} places taken"><i style="width:${pct}%"></i></div>
        <p class="small muted" style="margin-top:4px">${full ? "Waitlist open" : `${e.quota - e.filled} of ${e.quota} places left`}</p>
      </div>
    </a>`;
  }

  /* ---------- Views: booking ---------- */
  function bookingState(q) {
    const s = store.get("draft", {});
    const today = iso(now());
    const st = {
      date: q.date || s.date || today,
      dur: Number(q.dur || s.dur || 60),
      court: q.court || s.court || "",
      start: q.start !== undefined ? Number(q.start) : s.start ?? null,
      promo: q.promo || s.promo || "",
      change: q.change || "",
    };
    if (st.date < today) st.date = today;
    return st;
  }

  function viewBook(q) {
    const st = bookingState(q);
    store.set("draft", st);
    const days = Array.from({ length: 14 }, (_, i) => { const d = now(); d.setDate(d.getDate() + i); return d; });
    const date = parseISO(st.date);
    const hours = [];
    for (let h = P.open; h < P.close; h++) hours.push(h);

    const valid = st.court && st.start !== null && canStart(st.court, st.date, st.start, st.dur) && !isPast(st.date, st.start);
    const court = Z.courts.find((c) => c.id === st.court);
    const total = valid ? priceFor(st.date, st.start, st.dur) : 0;

    const rows = hours.map((h) => {
      const cells = Z.courts.map((c) => {
        const past = isPast(st.date, h);
        const u = unit(c.id, st.date, h);
        if (u.state === "block") return `<td><button class="slot block" disabled aria-label="${c.name} ${hhmm(h)} blocked for ${u.label}">${u.label}</button></td>`;
        if (past) return `<td><button class="slot past" disabled aria-label="${c.name} ${hhmm(h)} has passed">–</button></td>`;
        if (u.state === "taken") return `<td><button class="slot taken" data-action="waitlist" data-court="${c.id}" data-h="${h}" aria-label="${c.name} ${hhmm(h)} booked, join waitlist">${u.mine ? "Yours" : "Booked"}</button></td>`;
        const ok = canStart(c.id, st.date, h, st.dur);
        const sel = st.court === c.id && st.start === h;
        const kind = isPromo(date, h) ? "promo" : isPeak(date, h) ? "peak" : "offpeak";
        const label = kind === "promo" ? "−20%" : kind === "peak" ? "Peak" : "Open";
        return `<td><button class="slot ${kind}" data-action="pick" data-court="${c.id}" data-h="${h}" aria-pressed="${sel}" ${ok ? "" : 'disabled title="Not enough time for this duration"'} aria-label="${c.name} ${hhmm(h)} ${label}">${ok ? label : "Short"}</button></td>`;
      }).join("");
      return `<tr><th class="t" scope="row">${hhmm(h)}</th>${cells}</tr>`;
    }).join("");

    return `
      ${topbar("#/")}
      <div class="steps" aria-label="Step 1 of 3"><span class="on"></span><span></span><span></span></div>
      <section class="section">
        <h1 style="font-size:var(--t-3xl)">${st.change ? "Change your booking" : "Book a court"}</h1>
        <p class="muted small" style="margin-top:6px">Pick a day and a start time. You pay at the front desk when you arrive.</p>
      </section>

      <section class="section">
        <div class="days" role="group" aria-label="Date">
          ${days.map((d) => `<button class="day" data-action="date" data-date="${iso(d)}" aria-pressed="${iso(d) === st.date}"><span>${iso(d) === iso(now()) ? "Today" : DOW[d.getDay()]}</span><b>${d.getDate()}</b><span>${MONTHS[d.getMonth()]}</span></button>`).join("")}
        </div>
      </section>

      <section class="section">
        <div class="field"><span class="label">How long?</span>
          <div class="seg" role="group" aria-label="Duration">
            ${P.durations.map((m) => `<button data-action="dur" data-dur="${m}" aria-pressed="${st.dur === m}">${m === 60 ? "1 hour" : m === 90 ? "1.5 hours" : "2 hours"}</button>`).join("")}
          </div>
        </div>
      </section>

      <section class="section">
        <div class="card flat small">
          <div style="display:flex;justify-content:space-between;gap:12px"><span><b>Peak</b> ${rp(P.peak)} / hour</span><span><b>Off-peak</b> ${rp(P.offPeak)} / hour</span></div>
          <p class="muted" style="margin-top:4px">Peak: ${P.peakRule.toLowerCase()}. Prices are for information; you pay at the club.</p>
        </div>
        <div class="legend" style="margin-top:12px">
          <span><i style="background:#fffdf7;border:1.5px solid var(--forest)"></i>Open</span>
          <span><i style="background:#fffdf7;box-shadow:inset 0 -3px 0 var(--gold);border:1.5px solid var(--forest)"></i>Promo ${addon}</span>
          <span><i style="background:var(--ivory-3)"></i>Booked, tap for waitlist ${addon}</span>
          <span><i style="background:repeating-linear-gradient(-45deg,var(--ivory-3) 0 3px,var(--ivory-2) 3px 6px)"></i>Blocked ${addon}</span>
        </div>
      </section>

      ${isFeed() ? `<section class="section">${Z.courts.map((c) => `
        <div class="court-row">
          <div class="h"><b>${c.name}</b><span class="small muted">${c.kind}, indoor</span></div>
          <div class="times" role="group" aria-label="${c.name} start times">
            ${hours.map((h) => {
              const u = unit(c.id, st.date, h);
              if (isPast(st.date, h) || u.state === "block") return "";
              if (u.state === "taken") return `<button class="taken" data-action="waitlist" data-court="${c.id}" data-h="${h}" aria-label="${c.name} ${hhmm(h)} booked, join waitlist">${hhmm(h)}<small>Waitlist</small></button>`;
              if (!canStart(c.id, st.date, h, st.dur)) return "";
              const kind = isPromo(date, h) ? "promo" : isPeak(date, h) ? "peak" : "offpeak";
              return `<button class="${kind === "promo" ? "promo" : ""}" data-action="pick" data-court="${c.id}" data-h="${h}" aria-pressed="${st.court === c.id && st.start === h}">${hhmm(h)}<small>${kind === "promo" ? "−20%" : kind === "peak" ? rp(P.peak / 1000) .replace("IDR ", "") + "k" : rp(P.offPeak / 1000).replace("IDR ", "") + "k"}</small></button>`;
            }).join("") || '<span class="small muted">No open times left.</span>'}
          </div>
        </div>`).join("")}
        <p class="small muted" style="margin-top:8px">Swipe each row for more times. Booked times let you join the waitlist. ${addon}</p>
      </section>` : `
      <section class="section">
        <div class="grid-wrap">
          <table class="avail">
            <thead><tr><th class="t"><span class="sr-only">Time</span></th>${Z.courts.map((c) => `<th scope="col">${c.name}</th>`).join("")}</tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <p class="small muted" style="margin-top:8px">Availability refreshes live. If two people pick the same slot, the first to confirm gets it.</p>
      </section>`}

      <div class="summary-bar" aria-live="polite">
        ${valid
          ? `<div><b>${rp(total)}</b><small>${court.name}, ${fmtDate(st.date)}, ${hhmm(st.start)}–${hhmm(st.start + st.dur / 60)}</small></div><a class="btn gold sm" href="#/book/details">Continue</a>`
          : `<div><b>Pick a time</b><small>${st.dur} minutes, ${fmtDate(st.date)}</small></div><button class="btn gold sm" disabled>Continue</button>`}
      </div>
      ${tabbar("book")}`;
  }

  function viewBookDetails() {
    const st = bookingState({});
    if (!st.court || st.start === null) { location.hash = "#/book"; return ""; }
    const court = Z.courts.find((c) => c.id === st.court);
    const total = priceFor(st.date, st.start, st.dur);
    return `
      ${topbar("#/book")}
      <div class="steps" aria-label="Step 2 of 3"><span class="on"></span><span class="on"></span><span></span></div>
      <section class="section">
        <h1 style="font-size:var(--t-3xl)">Your details</h1>
        <div class="card" style="margin-top:14px">
          <dl class="kv">
            <dt>Court</dt><dd>${court.name}, ${court.kind}</dd>
            <dt>Date</dt><dd>${fmtDate(st.date)}</dd>
            <dt>Time</dt><dd>${hhmm(st.start)} – ${hhmm(st.start + st.dur / 60)}</dd>
            <dt>Price, paid at the club</dt><dd>${rp(total)}</dd>
          </dl>
        </div>
      </section>
      <form class="section stack-16" data-form="booking" novalidate>
        <div class="field"><label for="f-name">Name</label><input class="input" id="f-name" name="name" autocomplete="name" required></div>
        <div class="field"><label for="f-wa">WhatsApp number</label><input class="input" id="f-wa" name="wa" inputmode="tel" autocomplete="tel" placeholder="0812 3456 7890" required><span class="hint">We send your booking code and a reminder here.</span></div>
        <div class="field"><label for="f-email">Email, optional</label><input class="input" id="f-email" name="email" type="email" autocomplete="email"></div>
        <div class="field"><span class="label">Players</span>
          <div class="seg" role="radiogroup" aria-label="Players">
            ${[2, 3, 4].map((n) => `<label style="flex:none"><input type="radio" name="players" value="${n}" ${n === 4 ? "checked" : ""} class="sr-only"><span class="seg-pill">${n} players</span></label>`).join("")}
          </div>
        </div>
        <div class="field"><label for="f-promo">Promo code, optional</label><input class="input" id="f-promo" name="promo" value="${esc(st.promo)}" style="text-transform:uppercase"><span class="hint">The front desk applies the discount when you pay.</span></div>
        <details class="card flat small"><summary style="cursor:pointer;font-weight:600">Booking rules and cancellation</summary>
          <ul style="margin:8px 0 0;padding-left:18px" class="muted">
            <li>Arrive 10 minutes early to check in and pay.</li>
            <li>Free cancellation up to 24 hours before your start time.</li>
            <li>Inside 24 hours, contact us on WhatsApp.</li>
            <li>Bookings not checked in 15 minutes after start are released.</li>
          </ul>
        </details>
        <label class="check"><input type="checkbox" name="rules" required><span>I have read the booking rules.</span></label>
        <label class="check"><input type="checkbox" name="consent" checked><span>Send me Zuma promos and event news on WhatsApp. You can stop any time.</span></label>
        <p class="error" id="form-error" role="alert" hidden></p>
        <button class="btn block" type="submit">${st.change ? "Save the new time" : "Confirm booking"}</button>
      </form>
      ${tabbar("book")}`;
  }

  function viewConfirmed(c) {
    const b = myBookings()[c] || (c === "ZM-DEMO1" ? demoBooking() : null);
    if (!b) return viewNotFound("We couldn't find that booking code.");
    const court = Z.courts.find((x) => x.id === b.court);
    const checkin = b.code.slice(-4).split("").map((ch) => (ch.charCodeAt(0) % 10)).join("");
    const msg = `Zuma booking ${b.code}\n${court.name}, ${fmtDate(b.date)}, ${hhmm(b.start)}–${hhmm(b.start + b.dur / 60)}\n${b.players} players${b.promo ? ", promo " + b.promo : ""}`;
    return `
      ${topbar("#/")}
      <div class="steps" aria-label="Step 3 of 3"><span class="on"></span><span class="on"></span><span class="on"></span></div>
      <section class="section">
        <h1 style="font-size:var(--t-3xl)">${b.status === "Cancelled" ? "Booking cancelled" : "You're booked"}</h1>
        <p class="muted small" style="margin-top:6px">${b.status === "Cancelled" ? "This court time is free again." : `We sent this to ${esc(b.wa)} on WhatsApp${b.email ? " and to your email" : ""}.`}</p>
      </section>
      <section class="section">
        <div class="ticket">
          <p class="small" style="color:var(--ivory-3)">Booking code</p>
          <p class="code">${b.code}</p>
          <div class="perf"></div>
          <dl class="kv">
            <dt>Name</dt><dd>${esc(b.name)}</dd>
            <dt>Court</dt><dd>${court.name}</dd>
            <dt>When</dt><dd>${fmtDate(b.date)}, ${hhmm(b.start)}–${hhmm(b.start + b.dur / 60)}</dd>
            <dt>Players</dt><dd>${b.players}</dd>
            ${b.promo ? `<dt>Promo code</dt><dd>${esc(b.promo)}</dd>` : ""}
            <dt>Pay at the club</dt><dd>${rp(priceFor(b.date, b.start, b.dur))}</dd>
            <dt>Status</dt><dd>${b.status}</dd>
          </dl>
        </div>
      </section>
      ${b.status !== "Cancelled" ? `
      <section class="section">
        <div class="notice gold"><h3>Check-in code ${checkin} ${addon}</h3><p class="small" style="margin-top:4px">Show this at the front desk. We'll remind you on WhatsApp 2 hours before you play.</p></div>
      </section>
      <section class="section stack-12">
        <a class="btn block" href="${shareWa(msg)}" target="_blank" rel="noopener">${icon("wa", 20)} Send to my players</a>
        <div class="btn-row"><a class="btn ghost" href="#/manage?code=${b.code}">Change or cancel</a><a class="btn ghost" href="#/book">Book another</a></div>
      </section>` : `<section class="section"><a class="btn block" href="#/book">Book a new time</a></section>`}
      ${tabbar("book")}`;
  }

  function demoBooking() {
    const d = now(); d.setDate(d.getDate() + 3);
    return { code: "ZM-DEMO1", name: "Demo Player", wa: "0812 0000 0000", court: "c1", date: iso(d), start: 19, dur: 90, players: 4, promo: "", status: "Confirmed" };
  }

  function viewManage(q) {
    const c = (q.code || "").toUpperCase();
    const b = c ? myBookings()[c] || (c === "ZM-DEMO1" ? demoBooking() : null) : null;
    let body = "";
    if (b) {
      const court = Z.courts.find((x) => x.id === b.court);
      const startAt = parseISO(b.date); startAt.setHours(Math.floor(b.start), (b.start % 1) * 60);
      const hoursLeft = (startAt - now()) / 36e5;
      const freeCancel = hoursLeft >= 24;
      body = `
        <div class="card stack-12">
          <div style="display:flex;justify-content:space-between;align-items:center"><b class="price">${b.code}</b><span class="status ${b.status}">${b.status}</span></div>
          <dl class="kv"><dt>Court</dt><dd>${court.name}</dd><dt>When</dt><dd>${fmtDate(b.date)}, ${hhmm(b.start)}–${hhmm(b.start + b.dur / 60)}</dd><dt>Name</dt><dd>${esc(b.name)}</dd></dl>
        </div>
        ${b.status === "Cancelled" ? "" : freeCancel ? `
          <div class="btn-row">
            <a class="btn" href="#/book?change=${b.code}&date=${b.date}&dur=${b.dur}">Change time</a>
            <button class="btn danger" data-action="cancel-booking" data-code="${b.code}">Cancel booking</button>
          </div>
          <p class="small muted">Free cancellation until ${fmtDate(b.date)} ${hhmm(b.start)} minus 24 hours.</p>` : `
          <div class="notice"><h3>Less than 24 hours to go</h3><p class="small" style="margin-top:4px">Changes and cancellations now go through the front desk.</p></div>
          <a class="btn block" href="${waLink(`Hi Zuma, I need to change booking ${b.code}.`)}" target="_blank" rel="noopener">${icon("wa", 20)} Message the front desk</a>`}`;
    } else if (c) {
      body = `<p class="error" role="alert">No booking found for ${esc(c)}. Check the code in your WhatsApp message, it starts with ZM.</p>`;
    }
    return `
      ${topbar("#/more")}
      <section class="section">
        <h1 style="font-size:var(--t-3xl)">Check my booking</h1>
        <p class="muted small" style="margin-top:6px">Enter the code from your confirmation. Try <b>ZM-DEMO1</b> in this mockup.</p>
      </section>
      <form class="section stack-12" data-form="manage">
        <div class="field"><label for="m-code">Booking code</label><input class="input" id="m-code" name="code" value="${esc(c)}" placeholder="ZM-XXXXX" style="text-transform:uppercase" required></div>
        <button class="btn block" type="submit">${icon("search", 20)} Find booking</button>
      </form>
      <section class="section stack-12">${body}</section>
      ${tabbar("more")}`;
  }

  /* ---------- Views: events ---------- */
  function viewEvents(q) {
    const mode = q.view || "list";
    const kind = q.kind || "All";
    const kinds = ["All", ...new Set(Z.events.map((e) => e.kind))];
    const list = Z.events.filter((e) => kind === "All" || e.kind === kind).sort((a, b) => a.date.localeCompare(b.date));
    const month = q.m ? parseISO(q.m + "-01") : (() => { const d = parseISO(list[0]?.date || iso(now())); return new Date(d.getFullYear(), d.getMonth(), 1); })();
    return `
      ${topbar()}
      <section class="section">
        <h1 style="font-size:var(--t-3xl)">Events</h1>
        <p class="muted small" style="margin-top:6px">Tournaments, leagues and socials. Sign up here, pay at the club.</p>
      </section>
      <section class="section stack-12">
        <div class="seg" role="group" aria-label="View"><a href="#/events?view=list&kind=${kind}" aria-current="${mode === "list"}">List</a><a href="#/events?view=cal&kind=${kind}" aria-current="${mode === "cal"}">Calendar</a></div>
        <div class="seg" role="group" aria-label="Type">${kinds.map((k) => `<a href="#/events?view=${mode}&kind=${encodeURIComponent(k)}" aria-current="${k === kind}">${k}</a>`).join("")}</div>
      </section>
      ${mode === "cal" ? calendar(month, list, kind) : ""}
      <section class="section stack-16">${list.length ? list.map(eventRow).join("") : '<p class="muted">No events of this type yet.</p>'}</section>
      ${tabbar("events")}`;
  }

  function calendar(month, list, kind) {
    const y = month.getFullYear(), m = month.getMonth();
    const first = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();
    const prev = new Date(y, m - 1, 1), next = new Date(y, m + 1, 1);
    const ym = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
    const byDay = {};
    list.forEach((e) => { const d = parseISO(e.date); if (d.getFullYear() === y && d.getMonth() === m) byDay[d.getDate()] = e; });
    let cells = DOW.map((d) => `<span class="dow">${d[0]}</span>`).join("");
    for (let i = 0; i < first; i++) cells += "<span></span>";
    for (let d = 1; d <= days; d++) {
      const e = byDay[d];
      const isToday = iso(new Date(y, m, d)) === iso(now());
      cells += e ? `<a class="d has ${isToday ? "today" : ""}" href="#/events/${e.slug}" aria-label="${d} ${MONTHS[m]}: ${esc(e.title)}">${d}</a>` : `<span class="d ${isToday ? "today" : ""}">${d}</span>`;
    }
    return `<section class="section">
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <a class="btn ghost sm" href="#/events?view=cal&kind=${kind}&m=${ym(prev)}" aria-label="Previous month">${icon("back", 16)}</a>
          <b class="price">${MONTHS_LONG[m]} ${y}</b>
          <a class="btn ghost sm" href="#/events?view=cal&kind=${kind}&m=${ym(next)}" aria-label="Next month" style="transform:scaleX(-1)">${icon("back", 16)}</a>
        </div>
        <div class="cal">${cells}</div>
      </div></section>`;
  }

  function countdownParts(dateStr) {
    const t = parseISO(dateStr); t.setHours(8);
    let s = Math.max(0, (t - now()) / 1000);
    const d = Math.floor(s / 86400); s -= d * 86400;
    const h = Math.floor(s / 3600); s -= h * 3600;
    const m = Math.floor(s / 60);
    return [d, h, m, Math.floor(s - m * 60)];
  }

  function viewEvent(slug) {
    const e = Z.events.find((x) => x.slug === slug);
    if (!e) return viewNotFound("That event isn't listed any more.");
    const full = e.filled >= e.quota;
    const pct = Math.round((e.filled / e.quota) * 100);
    const merch = (e.merch || []).map((s) => Z.products.find((p) => p.slug === s)).filter(Boolean);
    const [d, h, m, s] = countdownParts(e.date);
    const url = location.href.split("#")[0] + "#/events/" + e.slug;
    return `
      ${topbar("#/events")}
      <section class="poster">
        <div class="art halftone ${e.kind === "Tournament" ? "forest" : "gold"}"><h1>${esc(e.title)}</h1></div>
      </section>
      <section class="section stack-12">
        <div class="chips"><span class="chip solid">${esc(e.kind)}</span>${e.categories.map((c) => `<span class="chip">${esc(c)}</span>`).join("")}</div>
        <p>${esc(e.blurb)}</p>
      </section>
      <section class="section">
        <div class="countdown" aria-label="Time until the event">
          <div><b data-cd="d">${d}</b><span>days</span></div><div><b data-cd="h">${pad(h)}</b><span>hours</span></div><div><b data-cd="m">${pad(m)}</b><span>min</span></div><div><b data-cd="s">${pad(s)}</b><span>sec</span></div>
        </div>
        <p class="small muted" style="margin-top:6px">Campaign countdown ${addon}</p>
      </section>
      <section class="section">
        <div class="card">
          <dl class="kv">
            <dt>Date</dt><dd>${fmtLong(e.date)}${e.endDate ? " – " + fmtLong(e.endDate) : ""}</dd>
            <dt>Time</dt><dd>${esc(e.time)}</dd>
            <dt>Where</dt><dd>${esc(e.location)}</dd>
            <dt>Entry</dt><dd>${esc(e.fee)}</dd>
          </dl>
          <div class="quota ${full ? "full" : ""}" style="margin-top:14px"><i style="width:${pct}%"></i></div>
          <p class="small" style="margin-top:6px"><b>${e.filled} of ${e.quota}</b> places taken. Entry is paid at the club.</p>
        </div>
      </section>
      <section class="section stack-12">
        ${full
          ? `<button class="btn block" data-action="event-waitlist" data-slug="${e.slug}">Join the waitlist</button>`
          : `<button class="btn block" data-action="register" data-slug="${e.slug}">Sign up</button>`}
        ${e.hasBracket ? `<a class="btn ghost block" href="#/events/${e.slug}/bracket"><span class="live-dot" aria-hidden="true"></span>Bracket and live scores</a>` : ""}
        <div class="share">
          <a class="btn ghost sm" style="flex:1" href="${shareWa(`${e.title}, ${fmtLong(e.date)} at Zuma. Sign up: ${url}`)}" target="_blank" rel="noopener">${icon("wa", 18)} WhatsApp</a>
          <button class="btn ghost sm" style="flex:1" data-action="copy" data-text="${esc(url)}">${icon("link", 18)} Copy link for Instagram</button>
        </div>
      </section>
      ${e.sponsor ? `<section class="section"><div class="sponsor" style="min-height:80px;border:var(--line)"><span><small>Presented by</small>${esc(e.sponsor)}</span></div></section>` : ""}
      ${merch.length ? `<section class="section"><div class="section-head"><h2>Event merch</h2><a href="#/shop">All merch</a></div><div class="products" style="margin-top:14px">${merch.map(productCard).join("")}</div></section>` : ""}
      <section class="section"><h2>Gallery ${addon}</h2>
        <div class="lookbook" style="margin-top:12px"><div class="halftone forest"></div><div class="halftone"></div><div class="halftone gold"></div></div>
        <p class="small muted" style="margin-top:8px">Photos and the after-movie appear here after the event.</p>
      </section>
      ${tabbar("events")}`;
  }

  function viewBracket(slug) {
    const e = Z.events.find((x) => x.slug === slug);
    const br = Z.bracket;
    if (!e || br.event !== slug) return viewNotFound("No bracket for this event yet.");
    return `
      ${topbar("#/events/" + slug)}
      <section class="section">
        <p class="chips"><span class="chip forest"><span class="live-dot" aria-hidden="true"></span>Live</span>${addon}</p>
        <h1 style="font-size:var(--t-3xl);margin-top:10px">${esc(e.title)}</h1>
        <p class="muted small" style="margin-top:6px">${esc(br.division)}. Scores update as the umpire enters them.</p>
      </section>
      <section class="section">
        <div class="bracket">
          ${br.rounds.map((r) => `<div class="round"><h3>${r.name}</h3><div class="ms">${r.matches.map((mt) => `
            <div class="match ${mt.live ? "live" : ""}">
              <div class="p ${mt.winner === "a" ? "win" : ""}"><span>${esc(mt.a)}</span></div>
              <div class="p ${mt.winner === "b" ? "win" : ""}"><span>${esc(mt.b)}</span></div>
              <div class="s">${mt.live ? '<span class="live-dot" aria-hidden="true"></span>Live: ' : ""}${esc(mt.score)}</div>
            </div>`).join("")}</div></div>`).join("")}
        </div>
        <p class="small muted" style="margin-top:8px">Swipe sideways for later rounds.</p>
      </section>
      <section class="section"><div class="sponsor" style="min-height:72px;border:var(--line)"><span><small>Live scores presented by</small>${esc(e.sponsor || "Your brand")}</span></div></section>
      ${tabbar("events")}`;
  }

  /* ---------- Views: programs, academy, beginners ---------- */
  function viewPrograms() {
    const groups = ["Fun match", "Community"];
    return `
      ${topbar("#/more")}
      <section class="section">
        <h1 style="font-size:var(--t-3xl)">Programs</h1>
        <p class="muted small" style="margin-top:6px">Weekly sessions you can join alone. Looking for lessons? See the <a href="#/academy">Academy</a>.</p>
      </section>
      ${groups.map((g) => `
        <section class="section"><h2>${g}</h2><div class="stack-12" style="margin-top:12px">
          ${Z.programs.filter((p) => p.kind === g).map((p) => `
            <article class="card stack-12">
              <div class="chips">${p.levels.map((l) => `<span class="chip">${l}</span>`).join("")}</div>
              <h3 style="font-size:var(--t-xl)">${esc(p.title)}</h3>
              <p class="small">${esc(p.blurb)}</p>
              <dl class="kv"><dt>When</dt><dd>${esc(p.schedule)}</dd><dt>Price</dt><dd>${esc(p.price)}</dd></dl>
              <div class="btn-row">
                <button class="btn sm" data-action="interest" data-what="${esc(p.title)}">I'm interested</button>
                <a class="btn ghost sm" href="${waLink(`Hi Zuma, I'd like to join ${p.title}.`)}" target="_blank" rel="noopener">${icon("wa", 18)} Ask on WhatsApp</a>
              </div>
              <div class="share"><button class="btn ghost sm" data-action="copy" data-text="${esc(location.href.split("#")[0] + "#/programs")}">${icon("link", 16)} Copy link</button></div>
            </article>`).join("")}
        </div></section>`).join("")}
      ${tabbar("more")}`;
  }

  function viewAcademy() {
    return `
      ${topbar("#/more")}
      <section class="section">
        <h1 style="font-size:var(--t-4xl);line-height:.95">Academy</h1>
        <p class="muted" style="margin-top:8px">Coaching for every level, from your first rally to tournament prep. Every academy offers a trial class.</p>
      </section>
      <section class="section">
        <div class="cats">
          ${Z.academies.map((a) => `
            <a class="cat" href="#/academy/${a.slug}">
              <div><h3>${esc(a.name)}</h3><p>${esc(a.focus)}</p></div>
              <span class="chip">${a.coaches.length} coach${a.coaches.length > 1 ? "es" : ""}</span>
            </a>`).join("")}
        </div>
      </section>
      <section class="section">
        <div class="notice gold stack-8">
          <h3>Never played?</h3>
          <p class="small">Start with a 60-minute trial class. Racket and balls included.</p>
          <a class="btn sm" href="#/beginners">New to padel</a>
        </div>
      </section>
      ${tabbar("more")}`;
  }

  function viewAcademyDetail(slug) {
    const a = Z.academies.find((x) => x.slug === slug);
    if (!a) return viewNotFound("That academy isn't listed.");
    const LV = ["Beginner", "Intermediate", "Advanced"];
    const desc = { Beginner: "Grip, serve, rally", Intermediate: "Walls, volleys, lob", Advanced: "Bandeja, vibora, tactics" };
    return `
      ${topbar("#/academy")}
      <section class="board" style="padding-top:24px">
        <h1>${esc(a.name)}</h1>
        <p class="sub" style="font-size:var(--t-md)">${esc(a.focus)}</p>
      </section>
      <section class="section">
        <h2>Levels</h2>
        <div class="level-strip" style="margin-top:12px">${LV.map((l) => `<div class="${a.levels.includes(l) ? "on" : ""}"><b>${l}</b>${a.levels.includes(l) ? desc[l] : "Not offered"}</div>`).join("")}</div>
      </section>
      <section class="section">
        <h2>Coaches</h2>
        <div class="stack-12" style="margin-top:12px">
          ${a.coaches.map((k) => { const c = Z.coaches[k]; return `
            <button class="coach card" style="width:100%;text-align:left;cursor:pointer" data-action="coach" data-coach="${k}">
              <div class="portrait">${c.name[0]}</div>
              <div><b>${esc(c.name)}</b><p class="small muted">${esc(c.role)}, ${c.years} years coaching</p><p class="small">${esc(c.spec)}</p></div>
            </button>`; }).join("")}
        </div>
      </section>
      <section class="section">
        <h2>Class schedule</h2>
        <table class="table" style="margin-top:12px">
          <thead><tr><th>Class</th><th>Level</th><th>When</th></tr></thead>
          <tbody>${a.schedule.map((s) => `<tr><td><b>${s.kind}</b><br><span class="muted">${s.size}</span></td><td>${s.level}</td><td>${s.when}</td></tr>`).join("")}</tbody>
        </table>
      </section>
      <section class="section">
        <h2>Prices and packages</h2>
        <div class="stack-8" style="margin-top:12px">
          ${a.packages.map((p) => `<div class="card flat" style="display:flex;justify-content:space-between;align-items:center;gap:12px"><span>${esc(p.name)}</span><span class="price">${esc(p.price)}</span></div>`).join("")}
        </div>
        <p class="small muted" style="margin-top:8px">Prices are for information. You pay at the club.</p>
      </section>
      <section class="section stack-12">
        <button class="btn block" data-action="trial" data-what="${esc(a.name)}">Book a trial class</button>
        <a class="btn ghost block" href="${waLink(`Hi Zuma, I'd like to join ${a.name}.`)}" target="_blank" rel="noopener">${icon("wa", 20)} Ask a coach on WhatsApp</a>
      </section>
      ${tabbar("more")}`;
  }

  function viewBeginners() {
    return `
      ${topbar("#/more")}
      <section class="section">
        <p>${addon}</p>
        <h1 style="font-size:var(--t-4xl);line-height:.95;margin-top:8px">New to padel</h1>
        <p class="muted" style="margin-top:8px">Padel is doubles tennis in a glass box. Most people rally on their first day.</p>
      </section>
      <section class="section">
        <div class="halftone forest" style="aspect-ratio:16/9;border-radius:var(--r-card);display:grid;place-items:center;color:var(--ivory)">
          <button class="btn gold" data-action="toast" data-msg="The 90-second rules video plays here.">Play the 90-second video</button>
        </div>
      </section>
      <section class="section">
        <h2>The basics</h2>
        <div class="stack-12" style="margin-top:12px">
          ${[
            ["Always doubles", "Two against two on a court about a third the size of tennis."],
            ["Serve underhand", "Bounce the ball, hit it below the waist, diagonally into the box."],
            ["Walls are in play", "Let the ball bounce once, then it can hit the glass before you return it."],
            ["Tennis scoring", "15, 30, 40, game. Six games win a set."],
          ].map(([t, d]) => `<div class="card flat"><b>${t}</b><p class="small muted" style="margin-top:2px">${d}</p></div>`).join("")}
        </div>
      </section>
      <section class="section">
        <h2>Your first visit</h2>
        <ol class="ordered" style="margin-top:12px">
          <li>Book a trial class. A coach meets you on court.</li>
          <li>Wear sports shoes with flat soles. We lend you a racket.</li>
          <li>Play a Sunday social when you can rally, to meet other beginners.</li>
        </ol>
      </section>
      <section class="section stack-12">
        <button class="btn block" data-action="trial" data-what="Trial class">Book a trial class, IDR 150,000</button>
        <a class="btn ghost block" href="#/promos">See the first serve promo</a>
      </section>
      ${tabbar("more")}`;
  }

  /* ---------- Views: shop ---------- */
  const STATUS_LABEL = { available: "In stock", soldout: "Sold out", preorder: "Pre-order" };

  function productCard(p) {
    return `<a class="product" href="#/shop/${p.slug}">
      <div class="img halftone ${p.cat === "Event" ? "gold" : p.slug === "court-polo" ? "forest" : ""}">${productArt(p)}</div>
      <div><span class="chip ${p.status === "soldout" ? "brick" : p.status === "preorder" ? "gold" : ""}">${STATUS_LABEL[p.status]}</span></div>
      <h3>${esc(p.name)}</h3>
      <span class="p">${rp(p.price)}</span>
    </a>`;
  }

  function viewShop(q) {
    const cat = q.cat || "All";
    const cats = ["All", ...new Set(Z.products.map((p) => p.cat))];
    const list = Z.products.filter((p) => cat === "All" || p.cat === cat);
    return `
      ${topbar("#/more")}
      <section class="brand-hero">
        <h1>Zuma<br>Supply</h1>
        <p>Kit made for the club, worn off court too. Reserve here, try it on and pay at the pro shop.</p>
        <div class="lookbook" aria-label="Lookbook, autumn drop"><div class="halftone forest"></div><div class="halftone gold"></div><div class="halftone"></div></div>
        <p class="small" style="margin-top:8px">Autumn drop lookbook</p>
      </section>
      <section class="section">
        <div class="seg" role="group" aria-label="Category">${cats.map((c) => `<a href="#/shop?cat=${encodeURIComponent(c)}" aria-current="${c === cat}">${c}</a>`).join("")}</div>
      </section>
      <section class="section"><div class="products">${list.map(productCard).join("")}</div></section>
      <section class="section">
        <div class="card flat small stack-8">
          <b>How ordering works</b>
          <ol class="ordered"><li>Pick your item and size, then reserve it.</li><li>We WhatsApp you when it's ready.</li><li>Pay and collect at the pro shop with your pickup code.</li></ol>
        </div>
      </section>
      ${tabbar("more")}`;
  }

  function viewProduct(slug, q) {
    const p = Z.products.find((x) => x.slug === slug);
    if (!p) return viewNotFound("That product isn't in the catalog.");
    const v = q.v || p.variants[0] || "";
    const s = q.s || "";
    const ev = p.event && Z.events.find((e) => e.slug === p.event);
    const needsSize = p.sizes.length > 0;
    return `
      ${topbar("#/shop")}
      <section>
        <div class="product"><div class="img halftone ${p.cat === "Event" ? "gold" : "forest"}" style="border-radius:0;border-width:0 0 2px;aspect-ratio:1">${productArt(p)}</div></div>
      </section>
      <section class="section stack-12">
        <div class="chips"><span class="chip ${p.status === "soldout" ? "brick" : p.status === "preorder" ? "gold" : ""}">${STATUS_LABEL[p.status]}</span>${ev ? `<a class="chip" href="#/events/${ev.slug}">${esc(ev.title)}</a>` : ""}</div>
        <h1 style="font-size:var(--t-3xl)">${esc(p.name)}</h1>
        <p class="price" style="font-size:var(--t-xl)">${rp(p.price)}</p>
        ${p.status === "preorder" ? '<p class="small muted">Ships to the pro shop by 5 December. We message you when it lands.</p>' : ""}
      </section>
      ${p.variants.length ? `<section class="section"><div class="field"><span class="label">Colour</span><div class="swatches">${p.variants.map((x) => `<button data-action="variant" data-href="#/shop/${p.slug}?v=${encodeURIComponent(x)}&s=${encodeURIComponent(s)}" aria-pressed="${x === v}">${esc(x)}</button>`).join("")}</div></div></section>` : ""}
      ${needsSize ? `<section class="section"><div class="field"><span class="label">Size</span><div class="swatches">${p.sizes.map((x) => `<button data-action="variant" data-href="#/shop/${p.slug}?v=${encodeURIComponent(v)}&s=${x}" aria-pressed="${x === s}" ${x === "XL" && p.slug === "court-polo" ? "disabled" : ""}>${x}</button>`).join("")}</div>${p.slug === "court-polo" ? '<span class="hint">XL is sold out in this colour.</span>' : ""}</div></section>` : ""}
      <section class="section stack-12">
        ${p.status === "soldout"
          ? `<button class="btn block" data-action="restock" data-what="${esc(p.name)}">Tell me when it's back</button>`
          : `<button class="btn block" data-action="reserve" data-slug="${p.slug}" data-v="${esc(v)}" data-s="${esc(s)}" ${needsSize && !s ? "disabled" : ""}>${needsSize && !s ? "Pick a size" : p.status === "preorder" ? "Pre-order for pickup" : "Reserve for pickup"}</button>`}
        <p class="small muted">No payment now. Pay at the pro shop when you collect.</p>
      </section>
      ${tabbar("more")}`;
  }

  function viewPickup(c) {
    const o = store.get("orders", {})[c];
    if (!o) return viewNotFound("We couldn't find that order.");
    return `
      ${topbar("#/shop")}
      <section class="section"><h1 style="font-size:var(--t-3xl)">Reserved</h1><p class="muted small" style="margin-top:6px">We'll WhatsApp ${esc(o.wa)} when it's ready at the pro shop.</p></section>
      <section class="section"><div class="ticket">
        <p class="small" style="color:var(--ivory-3)">Pickup code</p><p class="code">${o.code}</p><div class="perf"></div>
        <dl class="kv"><dt>Item</dt><dd>${esc(o.item)}</dd><dt>Pay at pickup</dt><dd>${rp(o.total)}</dd><dt>Status</dt><dd>${o.pre ? "Pre-order" : "Being prepared"}</dd></dl>
      </div></section>
      <section class="section"><a class="btn ghost block" href="#/shop">Back to the shop</a></section>
      ${tabbar("more")}`;
  }

  /* ---------- Views: promos, info, more ---------- */
  function viewPromos() {
    return `
      ${topbar("#/more")}
      <section class="section"><h1 style="font-size:var(--t-3xl)">Promos</h1><p class="muted small" style="margin-top:6px">Add the code when you book. The front desk applies it when you pay.</p></section>
      <section class="section stack-16">
        ${Z.promos.map((p) => `
          <article class="card stack-12">
            <h2 style="font-size:var(--t-xl)">${esc(p.title)}</h2>
            <p>${esc(p.text)}</p>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;border:2px dashed var(--charcoal);border-radius:14px;padding:10px 14px">
              <span class="price">${p.code}</span>
              <button class="btn ghost sm" data-action="copy" data-text="${p.code}">Copy code</button>
            </div>
            <p class="small muted">Valid until ${fmtLong(p.until)}</p>
            <details class="small"><summary style="cursor:pointer;font-weight:600">Terms</summary><ul style="margin:8px 0 0;padding-left:18px" class="muted">${p.terms.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></details>
            ${p.code === "FIRSTSERVE" ? `<a class="btn block" href="#/beginners">Book a trial class</a>` : `<a class="btn block" href="#/book?promo=${p.code}">Book with this code</a>`}
          </article>`).join("")}
      </section>
      ${tabbar("more")}`;
  }

  function viewInfo() {
    return `
      ${topbar("#/more")}
      <section class="section"><h1 style="font-size:var(--t-3xl)">Visit and help</h1></section>
      <section class="section">
        <div class="map" role="img" aria-label="Map showing the club"><span class="pin">Zuma Padel Court</span></div>
        <p style="margin-top:10px">${esc(Z.club.address)}</p>
        <a class="btn ghost block" style="margin-top:10px" href="${Z.club.mapsUrl}" target="_blank" rel="noopener">${icon("pin", 20)} Open in Google Maps</a>
      </section>
      <section class="section">
        <h2>Opening hours</h2>
        <dl class="kv" style="margin-top:12px">${Z.club.hours.map((h) => `<dt>${h.days}</dt><dd>${h.time}</dd>`).join("")}</dl>
      </section>
      <section class="section">
        <h2>Facilities</h2>
        <div class="chips" style="margin-top:12px">${Z.club.facilities.map((f) => `<span class="chip">${f}</span>`).join("")}</div>
      </section>
      <section class="section">
        <h2>How to book</h2>
        <ol class="ordered" style="margin-top:12px">
          <li>Pick a day, a duration and an open time on any court.</li>
          <li>Leave your name and WhatsApp number. No account needed.</li>
          <li>Get your booking code on screen and on WhatsApp.</li>
          <li>Arrive 10 minutes early, check in and pay at the front desk.</li>
        </ol>
      </section>
      <section class="section">
        <h2>Questions</h2>
        <div style="margin-top:8px">${Z.faq.map((f) => `<details class="faq"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div>
      </section>
      <section class="section">
        <div class="card forest stack-8">
          <h3 style="font-size:var(--t-xl)">Still stuck?</h3>
          <p class="small">The front desk answers on WhatsApp from 06:00 to 23:00.</p>
          <a class="btn gold" href="${waLink("Hi Zuma, I need help with")}" target="_blank" rel="noopener">${icon("wa", 20)} Chat with the front desk</a>
        </div>
      </section>
      ${tabbar("more")}`;
  }

  function viewMore() {
    const item = (href, t, s, extra = "") => `<a href="${href}"><span>${t}<small>${s}</small></span>${extra}</a>`;
    return `
      ${topbar()}
      <section class="section">
        <nav class="menu-list" aria-label="More">
          ${item("#/manage", "Check my booking", "Change or cancel with your code")}
          ${item("#/academy", "Academy", "Coaches, classes, trial class")}
          ${item("#/programs", "Programs", "Fun match and community")}
          ${item("#/shop", "Zuma Supply", "Merch, reserve and pick up")}
          ${item("#/promos", "Promos", "Codes to use when booking")}
          ${item("#/beginners", "New to padel", "Rules and your first visit", addon)}
          ${item("#/info", "Visit and help", "Map, hours, FAQ, WhatsApp")}
          ${item("#/media-kit", "Partner with Zuma", "Media kit for sponsors", addon)}
        </nav>
      </section>
      <section class="section">
        <button class="btn block" data-action="style" data-style="feed">Try the Feed style</button>
        <a class="btn ghost block" style="margin-top:10px" href="#/admin">Open the admin panel (demo)</a>
        <button class="btn ghost block" style="margin-top:10px" data-action="reset">Reset demo data</button>
      </section>
      ${tabbar("more")}`;
  }

  function viewNotFound(msg) {
    return `${topbar("#/")}<section class="section stack-12"><h1 style="font-size:var(--t-3xl)">Not found</h1><p>${esc(msg)}</p><a class="btn" href="#/">Go to home</a></section>${tabbar("")}`;
  }

  /* ---------- Feed style (second player app) ---------- */
  const isFeed = () => store.get("style", "club") === "feed";
  const greeting = () => { const h = now().getHours(); return h < 11 ? "Good morning" : h < 15 ? "Good afternoon" : h < 19 ? "Good evening" : "Good night"; };
  const saved = () => store.get("saved", {});

  function stories() {
    const today = iso(now());
    const open = Z.courts.map((c) => ({ c, h: openSlotsToday(c.id, 1)[0] })).filter((x) => x.h !== undefined);
    const smash = Z.events[0];
    const [days] = countdownParts(smash.date);
    return [
      { id: "open", label: "Open now", initial: String(open.length), ring: "", slides: open.length
        ? open.map((x) => ({ bg: "forest", art: courtSvg(false), title: `<span class="script">Open</span> ${hhmm(x.h)}`, text: `${x.c.name}, full panoramic. ${rp(priceFor(today, x.h, 60))} for the hour, paid at the club.`, cta: { label: `Book ${hhmm(x.h)}`, href: `#/book?court=${x.c.id}&start=${x.h}&date=${today}` } }))
        : [{ bg: "forest", title: "Full today", text: "Tomorrow still has room.", cta: { label: "See tomorrow", href: "#/book" } }] },
      { id: "smash", label: "Smash", initial: "S", ring: "gold", slides: [
        { bg: "", title: `<span class="script">Smash</span> the year`, text: smash.blurb, cta: { label: "See the event", href: `#/events/${smash.slug}` } },
        { bg: "forest", title: `${days} days to go`, text: `${smash.quota - smash.filled} of ${smash.quota} places left. ${smash.fee}, paid at the club.`, cta: { label: "Sign up", href: `#/events/${smash.slug}` } },
        { bg: "gold", art: productArt(Z.products[1]), title: "The tee", text: "Pre-order the Smash The Year tee and collect it on finals day.", cta: { label: "Pre-order", href: "#/shop/smash-tee" } },
      ] },
      { id: "academy", label: "Coaches", initial: "A", ring: "ivory", slides: Object.values(Z.coaches).map((c) => ({ bg: "forest", title: `<span class="script">Meet</span> ${c.name.split(" ")[0]}`, text: `${c.role}. ${c.spec}. ${c.years} years coaching.`, cta: { label: "Book a trial class", href: "#/academy" } })) },
      { id: "supply", label: "Supply", initial: "Z", ring: "gold", slides: Z.products.filter((p) => p.status !== "soldout").slice(0, 4).map((p) => ({ bg: "gold", art: productArt(p), title: esc(p.name), text: `${rp(p.price)}. ${STATUS_LABEL[p.status]}. Reserve now, pay when you pick it up.`, cta: { label: "Reserve", href: `#/shop/${p.slug}` } })) },
      { id: "promos", label: "Promos", initial: "%", ring: "", slides: Z.promos.map((p) => ({ bg: "", title: p.code, text: p.text, cta: { label: "Use this code", href: p.code === "FIRSTSERVE" ? "#/beginners" : `#/book?promo=${p.code}` } })) },
      { id: "new", label: "New here", initial: "?", ring: "ivory", slides: [
        { bg: "forest", title: `<span class="script">Always</span> doubles`, text: "Two against two, on a court a third the size of tennis.", cta: { label: "Learn the basics", href: "#/beginners" } },
        { bg: "", title: `<span class="script">Walls</span> are in play`, text: "Let it bounce once, then it can hit the glass before you return it.", cta: { label: "Learn the basics", href: "#/beginners" } },
        { bg: "gold", title: "Try a class", text: "60 minutes with a coach, racket included.", cta: { label: "Book a trial class", href: "#/beginners" } },
      ] },
    ];
  }

  let storyTimer;
  function showStory(id, idx = 0) {
    clearTimeout(storyTimer);
    const all = stories();
    const si = all.findIndex((s) => s.id === id);
    const s = all[si];
    if (!s) return closeStory();
    if (idx >= s.slides.length) return all[si + 1] ? showStory(all[si + 1].id, 0) : closeStory();
    if (idx < 0) return si > 0 ? showStory(all[si - 1].id, all[si - 1].slides.length - 1) : showStory(id, 0);
    const seen = store.get("seen", []); if (!seen.includes(id)) store.set("seen", [...seen, id]);
    const sl = s.slides[idx];
    let el = document.querySelector(".story-view");
    if (!el) { el = document.createElement("div"); el.className = "story-view"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", "Story"); (document.querySelector(".device") || document.body).appendChild(el); }
    el.dataset.id = id; el.dataset.idx = idx;
    el.innerHTML = `
      <div class="bars">${s.slides.map((_, i) => `<i class="${i < idx ? "done" : i === idx ? "on" : ""}"><b></b></i>`).join("")}</div>
      <div class="top"><div class="who"><span class="av">${logo(9)}</span>zumapadelcourt <span style="opacity:.6;font-weight:400">${s.label}</span></div>
        <button class="icon-btn" style="background:transparent" data-action="story-close" aria-label="Close">${icon("close", 22)}</button></div>
      <div class="slide ${sl.bg}">
        ${sl.art ? `<div class="art" aria-hidden="true">${sl.art}</div>` : ""}
        <button class="tap prev" data-action="story-prev" aria-label="Previous"></button>
        <button class="tap next" data-action="story-next" aria-label="Next"></button>
        <h2 style="position:relative;z-index:2">${sl.title}</h2>
        <p style="position:relative;z-index:2">${sl.text}</p>
        <a class="btn ${sl.bg === "gold" ? "" : "gold"} block swipe" href="${sl.cta.href}" data-action="story-go">${sl.cta.label}</a>
      </div>`;
    storyTimer = setTimeout(() => showStory(id, idx + 1), 5000);
  }
  function closeStory() { clearTimeout(storyTimer); document.querySelectorAll(".story-view").forEach((x) => x.remove()); if (!location.hash || location.hash === "#/") rerender(); }

  function reel(r) {
    const isSaved = !!saved()[r.id];
    const base = 20 + Math.floor(hash(r.id) * 140);
    return `<article class="reel ${r.cls || ""} ${r.head ? "first" : ""}" aria-label="${esc(r.label)}">
      ${r.head || ""}
      ${r.art ? `<div class="art" aria-hidden="true">${r.streak ? '<div class="streak"></div>' : ""}${r.art}</div>` : ""}

      <div class="body">
        ${r.kicker ? `<div class="kicker chips">${r.kicker}</div>` : ""}
        <h2>${r.title}</h2>
        ${r.text ? `<p>${r.text}</p>` : ""}
        ${r.extra || ""}
        ${r.meta ? `<p class="meta">${r.meta}</p>` : ""}
        ${r.cta}
      </div>
      <div class="rail">
        <button data-action="save" data-id="${r.id}" data-title="${esc(r.label)}" data-href="${r.more || "#/"}" aria-pressed="${isSaved}" aria-label="Save"><span class="dot">${icon("heart", 22)}</span><span data-count="${base}">${base + (isSaved ? 1 : 0)}</span></button>
        <a href="${shareWa(`${r.label} at Zuma Padel Court, Bogor: ${location.href.split("#")[0]}${r.more || "#/"}`)}" target="_blank" rel="noopener" aria-label="Share on WhatsApp"><span class="dot">${icon("share", 22)}</span><span>Share</span></a>
        ${r.more ? `<a href="${r.more}" aria-label="More info"><span class="dot">${icon("more", 22)}</span><span>Info</span></a>` : ""}
      </div>
    </article>`;
  }

  function viewFeed() {
    const today = iso(now());
    const openCount = Z.courts.reduce((n, c) => n + openSlotsToday(c.id, 99).length, 0);
    const next = Z.courts.map((c) => ({ c, h: openSlotsToday(c.id, 1)[0] })).filter((x) => x.h !== undefined).sort((a, b) => a.h - b.h)[0];
    const smash = Z.events[0];
    const [d, h] = countdownParts(smash.date);
    const seen = store.get("seen", []);
    const ams = Z.programs[0];
    const carlos = Z.coaches.Carlos;
    const polo = Z.products[0];
    const semi = Z.bracket.rounds[1].matches[0];

    const cards = [
      next
        ? { id: "r-open", label: `${next.c.name} at ${hhmm(next.h)}`, cls: "", hint: true, streak: true, art: courtSvg(false),
            kicker: `<span class="chip gold">Open today</span>${addon}`, title: `<span class="script">Open</span> at ${hhmm(next.h)}`,
            text: `${next.c.name}, full panoramic, indoor. ${rp(priceFor(today, next.h, 60))} for the hour, paid at the club.`,
            meta: `${openCount} open court hours left today`, more: `#/book?court=${next.c.id}&start=${next.h}&date=${today}`,
            cta: `<a class="btn gold cta" href="#/book?court=${next.c.id}&start=${next.h}&date=${today}">Book ${hhmm(next.h)}</a>` }
        : { id: "r-full", label: "Fully booked today", hint: true, title: "Full today", text: "Tomorrow still has open courts.", cta: `<a class="btn gold cta" href="#/book">See tomorrow</a>` },
      { id: "r-smash", label: smash.title, cls: "charcoal", streak: true, art: `<div style="font-family:var(--serif);font-weight:700;font-size:8.5rem;line-height:.8;color:var(--gold);opacity:.9">12.12</div>`, kicker: `<span class="chip">Tournament</span><span class="chip">${fmtLong(smash.date)}</span>`,
        title: `<span class="script">Smash</span><span class="caps">The Year</span>`, text: smash.blurb,
        extra: `<div class="count"><div><b>${d}</b><span>days</span></div><div><b>${pad(h)}</b><span>hours</span></div><div><b>${smash.quota - smash.filled}</b><span>places left</span></div></div>`,
        meta: smash.fee + ", paid at the club", more: `#/events/${smash.slug}`, cta: `<a class="btn gold cta" href="#/events/${smash.slug}">Sign up</a>` },
      { id: "r-voice", label: "More than a game", cls: "", streak: true, title: "", extra: `<p class="quote">${esc(Z.voice[0])}</p>`, meta: "@zumapadelcourt",
        cta: `<a class="btn on-dark cta" href="${Z.club.instagram}" target="_blank" rel="noopener">${icon("ig", 18)} Follow on Instagram</a>` },
      { id: "r-coach", label: `Meet ${carlos.name}`, cls: "ivory", art: `<div class="portrait" style="width:58%;font-size:6rem">C</div>`,
        kicker: `<span class="chip">Performance Lab</span><span class="chip">Advanced</span>`, title: `<span class="script">Meet</span> Carlos`,
        text: `${carlos.spec}. ${carlos.years} years coaching.`, more: "#/academy/performance-lab", cta: `<a class="btn cta" href="#/academy/performance-lab">Book a session</a>` },
      { id: "r-ams", label: ams.title, cls: "charcoal", streak: true, art: courtSvg(true), kicker: ams.levels.map((l) => `<span class="chip">${l}</span>`).join(""),
        title: `<span class="script">Americano</span><span class="caps">nights</span>`, text: ams.blurb, meta: `${ams.schedule}. ${ams.price}.`, more: "#/programs",
        cta: `<button class="btn gold cta" data-action="interest" data-what="${esc(ams.title)}">Join the next one</button>` },
      { id: "r-polo", label: polo.name, cls: "gold", art: `<div style="width:62%;color:var(--charcoal)">${productArt(polo)}</div>`,
        kicker: `<span class="chip">Zuma Supply</span><span class="chip">${STATUS_LABEL[polo.status]}</span>`, title: "Court polo",
        text: `${rp(polo.price)}. Forest or ivory. Reserve it here, try it on and pay at the pro shop.`, more: `#/shop/${polo.slug}`,
        cta: `<a class="btn cta" href="#/shop/${polo.slug}">Reserve for pickup</a>` },
      { id: "r-midday", label: "MIDDAY20", cls: "forest", art: `<div style="font-family:var(--serif);font-weight:700;font-size:8.5rem;line-height:.8;color:var(--gold);opacity:.9">−20%</div>`, kicker: `<span class="chip gold">Promo</span>${addon}`, title: "MIDDAY20",
        text: Z.promos[0].text, meta: `Valid until ${fmtLong(Z.promos[0].until)}`, more: "#/promos", cta: `<a class="btn gold cta" href="#/book?promo=MIDDAY20">Book a midday court</a>` },
      { id: "r-live", label: "Live bracket", cls: "charcoal", streak: true, art: courtSvg(true), kicker: `<span class="chip gold"><span class="live-dot" style="background:var(--charcoal)"></span>Live</span>${addon}`,
        title: `<span class="script">Semifinal</span>`, text: `${esc(semi.a)} against ${esc(semi.b)}. ${esc(semi.score)}.`, meta: "Smash The Year, Men's open", more: "#/events/smash-the-year/bracket",
        cta: `<a class="btn gold cta" href="#/events/smash-the-year/bracket">Open the bracket</a>` },
      { id: "r-end", label: "All caught up", cls: "ivory", title: "You're all caught up", text: "New courts, events and drops show up here first.",
        cta: `<div class="btn-row cta" style="width:100%"><a class="btn" href="#/book">Book a court</a><a class="btn ghost" href="#/explore">Explore</a></div>` },
    ];

    cards[0].head = `
      <header class="feed-head">
        <div class="row">${logo(24)}<a class="icon-btn" style="background:var(--charcoal-2)" href="${waLink("Hi Zuma, I have a question.")}" target="_blank" rel="noopener" aria-label="Chat with Zuma on WhatsApp">${icon("wa", 20)}</a></div>
        <p class="hello">${greeting()}.<small>${openCount} open court hours left today in Bogor</small></p>
        <div class="stories" aria-label="Stories">
          ${stories().map((s) => `<button class="story-btn ${seen.includes(s.id) ? "seen" : ""}" data-action="story" data-id="${s.id}"><span class="ring"><span class="${s.ring}">${s.initial}</span></span>${s.label}</button>`).join("")}
        </div>
      </header>`;
    return `
      ${cards.map(reel).join("")}
      ${tabbar("home")}`;
  }

  function viewExplore(q) {
    const tile = (href, t, s, cls, size = "") => `<a href="${href}" class="halftone ${cls} ${size}" data-search="${esc((t + " " + s).toLowerCase())}"><span><b>${t}</b><small>${s}</small></span></a>`;
    return `
      ${topbar()}
      <section class="section stack-12">
        <label class="search">${icon("search", 18)}<span class="sr-only">Search</span><input type="search" placeholder="Search events, coaches, merch" data-action="search"></label>
      </section>
      <section class="section" style="padding-left:0;padding-right:0">
        <div class="explore">
          ${tile("#/events/smash-the-year", "Smash The Year", "Tournament, 12 Dec", "forest", "tall")}
          ${tile("#/book", "Book a court", "4 panoramic courts", "gold")}
          ${tile("#/academy", "Academy", "3 academies", "ivory")}
          ${tile("#/events", "Event calendar", "All events", "forest", "wide")}
          ${tile("#/programs", "Americano nights", "Tue and Fri", "")}
          ${tile("#/events/rally-jolly", "Rally Jolly", "Year-end social", "gold", "tall")}
          ${tile("#/shop", "Zuma Supply", "Merch, pick up at the club", "forest")}
          ${tile("#/promos", "Promos", "3 codes", "ivory")}
          ${tile("#/beginners", "New to padel", "Rules and trial class", "forest", "wide")}
          ${tile("#/events/ladies-league-r3", "Ladies League", "Round 3, 15 Nov", "ivory")}
          ${tile("#/events/smash-the-year/bracket", "Live bracket", "Smash The Year", "gold")}
          ${tile("#/info", "Visit and help", "Map, hours, FAQ", "forest")}
          ${tile("#/media-kit", "Media kit", "For sponsors", "ivory")}
          ${tile("#/manage", "Check my booking", "By booking code", "gold")}
        </div>
        <p class="muted small section" data-empty hidden>Nothing matches. Try "coach", "event" or "polo".</p>
      </section>
      ${tabbar("explore")}`;
  }

  function viewMe() {
    const mine = Object.values(myBookings()).filter((b) => b.status !== "Cancelled" && b.date >= iso(now())).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
    const sv = Object.entries(saved());
    const name = mine[0]?.name || "Guest";
    return `
      ${topbar()}
      <section class="section stack-16">
        <div class="profile-head"><div class="av">${esc(name[0])}</div>
          <div><h1 style="font-size:var(--t-2xl)">${esc(name)}</h1><p class="small muted">No account needed. Bookings you make on this phone show up here.</p></div></div>
        <div class="profile-stats card flat"><div><b>${mine.length}</b><span>Upcoming</span></div><div><b>${sv.length}</b><span>Saved</span></div><div><b>${Object.keys(store.get("orders", {})).length}</b><span>Orders</span></div></div>
      </section>
      <section class="section stack-12">
        <div class="section-head"><h2>Upcoming</h2><a href="#/manage">Find by code</a></div>
        ${mine.length ? mine.map((b) => `<a class="mini-ticket" href="#/booking/${b.code}"><span><span class="small" style="color:var(--ivory-3)">${Z.courts.find((c) => c.id === b.court).name}, ${fmtDate(b.date)}</span><br>${hhmm(b.start)} – ${hhmm(b.start + b.dur / 60)}</span><b>${b.code}</b></a>`).join("")
          : `<div class="card flat stack-8"><p>No bookings on this phone yet.</p><a class="btn sm" href="#/book">Book a court</a></div>`}
      </section>
      <section class="section stack-12">
        <h2>Saved</h2>
        ${sv.length ? `<div class="menu-list">${sv.map(([, v]) => `<a href="${v.href}"><span>${esc(v.title)}</span></a>`).join("")}</div>` : `<p class="small muted">Tap the heart on any card in your feed to keep it here.</p>`}
      </section>
      <section class="section">
        <div class="card forest stack-8">
          <span class="chip gold">Coming soon</span>
          <h3 style="font-size:var(--t-xl)">Zuma membership</h3>
          <p class="small">Member registration opens soon. Leave your number to be first in line.</p>
          <button class="btn gold sm" data-action="member">Get notified</button>
        </div>
      </section>
      <section class="section">
        <nav class="menu-list" aria-label="More">
          <a href="#/info"><span>Visit and help<small>Map, hours, FAQ, WhatsApp</small></span></a>
          <a href="#/promos"><span>Promos<small>Codes to use when booking</small></span></a>
          <a href="#/media-kit"><span>Partner with Zuma<small>Media kit for sponsors</small></span>${addon}</a>
        </nav>
      </section>
      <section class="section stack-12">
        <div class="btn-row"><button class="btn ghost sm" data-action="style" data-style="club">Switch to Club style</button><a class="btn ghost sm" href="#/admin">Admin panel (demo)</a></div>
        <button class="btn ghost sm" data-action="reset">Reset demo data</button>
      </section>
      ${tabbar("me")}`;
  }

  function viewMediaKit() {
    const hoursPerMonth = Z.courts.length * (P.close - P.open) * 30;
    return `
      ${topbar("#/more")}
      <section class="board" style="padding-top:28px">
        <p>${addon}</p>
        <h1 style="margin-top:10px">Partner with Zuma</h1>
        <p class="sub" style="font-size:var(--t-md)">${esc(Z.club.tagline)}</p>
      </section>
      <section class="section">
        <div class="admin-tiles" style="grid-template-columns:1fr 1fr">
          <div class="card"><span class="small">Courts</span><b>${Z.courts.length}</b><span class="small muted">Indoor, full panoramic</span></div>
          <div class="card"><span class="small">Court hours a month</span><b>${hoursPerMonth.toLocaleString()}</b><span class="small muted">06:00 to 23:00</span></div>
          <div class="card"><span class="small">Instagram</span><b>521</b><span class="small muted">Followers before opening</span></div>
          <div class="card"><span class="small">City</span><b>Bogor</b><span class="small muted">Jl. Pajajaran</span></div>
        </div>
        <p class="small muted">Visitor and booking numbers appear here once the app is live.</p>
      </section>
      <section class="section">
        <h2>Where your brand appears</h2>
        <div class="stack-8" style="margin-top:12px">
          ${[["Main partner", "Logo on the home screen, every booking confirmation and the club's Wi-Fi page"], ["Court partner", "A court named after you in the app and on the glass"], ["Event partner", "Title on an event page, its bracket and live scores"], ["Café and lifestyle", "Feed cards, promos and merch collaborations"]].map(([t, d]) => `<div class="card flat"><b>${t}</b><p class="small muted" style="margin-top:2px">${d}</p></div>`).join("")}
        </div>
        <p class="small muted" style="margin-top:8px">Every partner gets a monthly report of views and clicks.</p>
      </section>
      <section class="section">
        <h2>Upcoming events</h2>
        <div class="stack-16" style="margin-top:12px">${Z.events.slice().sort((a, b) => a.date.localeCompare(b.date)).map(eventRow).join("")}</div>
      </section>
      <section class="section stack-12">
        <a class="btn block" href="${waLink("Hi Zuma, I'd like to talk about a partnership.")}" target="_blank" rel="noopener">${icon("wa", 20)} Talk to the partnership team</a>
        <a class="btn ghost block" href="mailto:${Z.club.email}">Email ${esc(Z.club.email)}</a>
      </section>
      ${tabbar("more")}`;
  }

  /* ---------- Admin ---------- */
  const admin = {
    bookings: store.get("admin.bookings", null) || Z.adminBookings.map((b) => ({ ...b })),
    orders: store.get("admin.orders", null) || Z.adminOrders.map((o) => ({ ...o })),
    save() { store.set("admin.bookings", this.bookings); store.set("admin.orders", this.orders); },
  };

  function adminShell(active, body) {
    const item = (k, href, t) => `<a class="item" href="${href}" ${active === k ? 'aria-current="page"' : ""}>${t}</a>`;
    return `<div class="admin">
      <nav class="admin-nav" aria-label="Admin">
        <a href="#/admin" style="margin-bottom:16px;display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--ivory)">${logo(20)}<span class="small" style="color:var(--gold);font-weight:700">Admin</span></a>
        ${item("home", "#/admin", "Today")}
        ${item("bookings", "#/admin/bookings", "Bookings")}
        ${item("schedule", "#/admin/schedule", "Courts and prices")}
        ${item("content", "#/admin/content", "Content")}
        ${item("orders", "#/admin/orders", "Merch orders")}
        ${item("contacts", "#/admin/contacts", "Contacts and export")}
        ${item("reports", "#/admin/reports", "Reports")}
        <div class="foot"><a class="btn on-dark sm block" href="#/">Back to player app</a></div>
      </nav>
      <main class="admin-main">${body}</main>
    </div>`;
  }

  function bookingTable(rows) {
    return `<div class="table-wrap"><table class="table">
      <thead><tr><th>Code</th><th>Name</th><th>WhatsApp</th><th>Court</th><th>When</th><th>Players</th><th>Promo</th><th>Status</th><th></th></tr></thead>
      <tbody>${rows.map((b) => `<tr>
        <td><b>${b.code}</b></td><td>${esc(b.name)}</td><td>${b.wa}</td><td>${b.court}</td><td>${fmtDate(b.date)}, ${b.time} (${b.dur}m)</td><td>${b.players}</td><td>${b.promo || "–"}</td>
        <td><span class="status ${b.status}">${b.status}</span></td>
        <td style="white-space:nowrap">${b.status === "Pending" ? `<button class="btn sm" data-action="adm-confirm" data-code="${b.code}">Confirm</button> ` : ""}${b.status !== "Cancelled" ? `<button class="btn danger sm" data-action="adm-cancel" data-code="${b.code}">Cancel</button>` : ""}</td>
      </tr>`).join("")}</tbody></table></div>`;
  }

  function viewAdmin(sub, q) {
    if (sub === "bookings") {
      const f = q.status || "All";
      const rows = admin.bookings.filter((b) => f === "All" || b.status === f);
      return adminShell("bookings", `
        <div class="admin-head"><h1>Bookings</h1><button class="btn ghost sm" data-action="export" data-what="bookings">${icon("download", 18)} Export CSV</button></div>
        <div class="seg" style="margin-bottom:16px">${["All", "Pending", "Confirmed", "Cancelled"].map((s) => `<a href="#/admin/bookings?status=${s}" aria-current="${s === f}">${s}</a>`).join("")}</div>
        ${bookingTable(rows)}`);
    }
    if (sub === "schedule") {
      return adminShell("schedule", `
        <div class="admin-head"><h1>Courts and prices</h1><button class="btn sm" data-action="toast" data-msg="Saved. New prices show in the app right away.">Save changes</button></div>
        <div class="admin-tiles">
          <div class="card field"><label for="a-peak">Peak price per hour</label><input class="input" id="a-peak" value="${P.peak}" inputmode="numeric"></div>
          <div class="card field"><label for="a-off">Off-peak price per hour</label><input class="input" id="a-off" value="${P.offPeak}" inputmode="numeric"></div>
          <div class="card field"><label for="a-rule">Peak hours</label><input class="input" id="a-rule" value="${P.peakRule}"></div>
          <div class="card field"><label for="a-open">Opening hours</label><input class="input" id="a-open" value="${hhmm(P.open)} – ${hhmm(P.close)}"></div>
        </div>
        <h2 style="font-size:var(--t-xl);margin:8px 0 12px">Courts</h2>
        <div class="table-wrap"><table class="table"><thead><tr><th>Court</th><th>Type</th><th>Bookable</th><th></th></tr></thead>
          <tbody>${Z.courts.map((c) => `<tr><td><b>${c.name}</b></td><td>${c.kind}</td><td><label class="check"><input type="checkbox" checked><span>Open for booking</span></label></td><td><button class="btn ghost sm" data-action="toast" data-msg="Court editor opens here.">Edit</button></td></tr>`).join("")}</tbody></table></div>
        <h2 style="font-size:var(--t-xl);margin:24px 0 12px">Blocks and recurring bookings ${addon}</h2>
        <div class="table-wrap"><table class="table"><thead><tr><th>Court</th><th>Days</th><th>Time</th><th>Reason</th><th></th></tr></thead>
          <tbody>${Z.blocks.map((b) => `<tr><td>${Z.courts.find((c) => c.id === b.court).name}</td><td>${b.weekday.map((d) => DOW[d]).join(", ")}</td><td>${hhmm(b.from)} – ${hhmm(b.to)}</td><td>${b.label}</td><td><button class="btn ghost sm" data-action="toast" data-msg="Block removed in the real app.">Remove</button></td></tr>`).join("")}
          <tr><td>Court 1</td><td>Every Thu</td><td>20:00 – 21:30</td><td>Recurring: Budi Santoso</td><td><button class="btn ghost sm" data-action="toast" data-msg="Recurring booking editor opens here.">Edit</button></td></tr></tbody></table></div>
        <button class="btn ghost sm" style="margin-top:12px" data-action="toast" data-msg="Block form opens here.">Add a block</button>`);
    }
    if (sub === "content") {
      const tab = q.tab || "events";
      const tabs = { events: "Events", programs: "Programs", academy: "Academy and coaches", merch: "Merch", promos: "Promos", banners: "Banners", sponsors: "Sponsors" };
      const rowsFor = {
        events: Z.events.map((e) => [e.title, `${fmtLong(e.date)}, ${e.kind}`, `${e.filled}/${e.quota} signed up`]),
        programs: Z.programs.map((p) => [p.title, p.schedule, p.price]),
        academy: [...Z.academies.map((a) => [a.name, `${a.coaches.length} coaches`, `${a.packages.length} packages`]), ...Object.values(Z.coaches).map((c) => [c.name, c.role, c.spec])],
        merch: Z.products.map((p) => [p.name, rp(p.price), STATUS_LABEL[p.status]]),
        promos: Z.promos.map((p) => [p.code, p.title, `Until ${fmtLong(p.until)}`]),
        banners: Z.banners.map((b) => [b.title, b.text, b.href]),
        sponsors: Z.sponsors.map((s) => [s.name, s.tier, "Home, event pages"]),
      };
      return adminShell("content", `
        <div class="admin-head"><h1>Content</h1><button class="btn sm" data-action="toast" data-msg="New ${tabs[tab].toLowerCase()} form opens here.">Add new</button></div>
        <div class="seg" style="margin-bottom:16px">${Object.entries(tabs).map(([k, t]) => `<a href="#/admin/content?tab=${k}" aria-current="${k === tab}">${t}</a>`).join("")}</div>
        <div class="table-wrap"><table class="table"><thead><tr><th>Name</th><th>Details</th><th>Status</th><th></th></tr></thead>
          <tbody>${rowsFor[tab].map((r) => `<tr><td><b>${esc(r[0])}</b></td><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td style="white-space:nowrap"><button class="btn ghost sm" data-action="toast" data-msg="Editor for ${esc(r[0])} opens here.">Edit</button></td></tr>`).join("")}</tbody></table></div>`);
    }
    if (sub === "orders") {
      return adminShell("orders", `
        <div class="admin-head"><h1>Merch orders</h1><button class="btn ghost sm" data-action="export" data-what="orders">${icon("download", 18)} Export CSV</button></div>
        <div class="table-wrap"><table class="table"><thead><tr><th>Code</th><th>Name</th><th>Items</th><th>Pay at pickup</th><th>Status</th><th></th></tr></thead>
          <tbody>${admin.orders.map((o) => `<tr><td><b>${o.code}</b></td><td>${esc(o.name)}</td><td>${esc(o.items)}</td><td>${rp(o.total)}</td><td><span class="status ${o.status.split(" ")[0]}">${o.status}</span></td>
          <td>${o.status !== "Picked up" ? `<button class="btn sm" data-action="adm-picked" data-code="${o.code}">Mark picked up</button>` : ""}</td></tr>`).join("")}</tbody></table></div>`);
    }
    if (sub === "contacts") {
      const tag = q.tag || "All";
      const tags = ["All", "Beginner", "Intermediate", "Advanced", "Coaching", "Event"];
      const rows = Z.adminContacts.filter((c) => tag === "All" || c.tags.includes(tag));
      return adminShell("contacts", `
        <div class="admin-head"><h1>Contacts and export</h1><div class="btn-row"><button class="btn ghost sm" data-action="export" data-what="contacts">${icon("download", 18)} Export contacts</button><button class="btn ghost sm" data-action="export" data-what="signups">${icon("download", 18)} Export event sign-ups</button></div></div>
        <p class="muted small" style="margin-bottom:12px">Only people who agreed to hear from Zuma can be messaged. Filter by tag to send a targeted broadcast. ${addon}</p>
        <div class="seg" style="margin-bottom:16px">${tags.map((t) => `<a href="#/admin/contacts?tag=${t}" aria-current="${t === tag}">${t}</a>`).join("")}</div>
        <div class="table-wrap"><table class="table"><thead><tr><th>Name</th><th>WhatsApp</th><th>Email</th><th>Source</th><th>Tags</th><th>Consent</th></tr></thead>
          <tbody>${rows.map((c) => `<tr><td><b>${esc(c.name)}</b></td><td>${c.wa}</td><td>${c.email || "–"}</td><td>${c.source}</td><td><span class="chips">${c.tags.map((t) => `<span class="chip">${t}</span>`).join("")}</span></td><td>${c.consent ? "Yes" : '<span style="color:var(--brick)">No</span>'}</td></tr>`).join("")}</tbody></table></div>`);
    }
    if (sub === "reports") {
      const hours = Array.from({ length: 17 }, (_, i) => i + 6);
      const shade = (v) => v > 0.8 ? "var(--forest)" : v > 0.6 ? "var(--forest-3)" : v > 0.4 ? "var(--gold)" : v > 0.2 ? "var(--ivory-3)" : "var(--ivory-2)";
      const grid = DOW.map((d, di) => `<span class="lab">${d}</span>` + hours.map((h) => {
        const we = di === 0 || di === 6;
        const v = Math.min(1, (we ? 0.55 : h >= 17 ? 0.75 : h < 9 ? 0.45 : 0.18) + hash(d + h) * 0.3);
        return `<span style="background:${shade(v)}" title="${d} ${hhmm(h)}: ${Math.round(v * 100)}% booked"></span>`;
      }).join("")).join("");
      const clicks = [["Northline Water", 4210, 186], ["Arka Motors", 2980, 141], ["Vela Sportswear", 2650, 97], ["Kopi Rally", 1870, 120], ["Palma Rackets", 1530, 64]];
      const max = clicks[0][1];
      return adminShell("reports", `
        <div class="admin-head"><h1>Reports ${addon}</h1></div>
        <div class="card stack-12">
          <h2 style="font-size:var(--t-xl)">Quiet and busy hours, last 4 weeks</h2>
          <p class="small muted">Darker means more courts booked. Weekday middays are the quietest, a good window for promos and coaching.</p>
          <div style="overflow-x:auto"><div class="heat" style="min-width:560px"><span></span>${hours.map((h) => `<span class="lab" style="justify-content:center">${h}</span>`).join("")}${grid}</div></div>
        </div>
        <div class="card stack-12" style="margin-top:16px">
          <h2 style="font-size:var(--t-xl)">Sponsor views and clicks, this month</h2>
          <div class="bars">${clicks.map(([n, v, c]) => `<div class="b"><span>${n}</span><i style="width:${(v / max) * 100}%"></i><span class="small">${v.toLocaleString()} views, ${c} clicks</span></div>`).join("")}</div>
          <button class="btn ghost sm" data-action="export" data-what="sponsors" style="justify-self:start">${icon("download", 18)} Export for sponsor report</button>
        </div>`);
    }
    // Overview
    const today = iso(now());
    const pending = admin.bookings.filter((b) => b.status === "Pending").length;
    const openHours = Z.courts.reduce((n, c) => n + openSlotsToday(c.id, 99).length, 0);
    return adminShell("home", `
      <div class="admin-head"><div><h1>Today</h1><p class="muted">${fmtLong(today)}</p></div><a class="btn sm" href="#/admin/bookings?status=Pending">Review pending</a></div>
      <div class="admin-tiles">
        <div class="card"><span class="small">Bookings to confirm</span><b>${pending}</b></div>
        <div class="card"><span class="small">Open court hours left today</span><b>${openHours}</b></div>
        <div class="card"><span class="small">Smash The Year pairs</span><b>37/48</b></div>
        <div class="card"><span class="small">Merch to hand over</span><b>${admin.orders.filter((o) => o.status === "Ready for pickup").length}</b></div>
      </div>
      <h2 style="font-size:var(--t-xl);margin-bottom:12px">Latest bookings</h2>
      ${bookingTable(admin.bookings.slice(0, 4))}`);
  }

  /* ---------- Sheets and toasts ---------- */
  function sheet(html) {
    closeSheet();
    const host = document.querySelector(".device") || document.body;
    const el = document.createElement("div");
    el.className = "sheet-backdrop";
    el.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
    el.addEventListener("click", (e) => { if (e.target === el || e.target.closest("[data-close]")) closeSheet(); });
    host.appendChild(el);
    el.querySelector("input, button")?.focus();
  }
  function closeSheet() { document.querySelectorAll(".sheet-backdrop").forEach((x) => x.remove()); }

  let toastTimer;
  function toast(msg) {
    document.querySelectorAll(".toast").forEach((x) => x.remove());
    const host = document.querySelector(".device") || document.body;
    const el = document.createElement("div");
    el.className = "toast"; el.setAttribute("role", "status"); el.textContent = msg;
    host.appendChild(el);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.remove(), 2600);
  }

  function contactForm(title, intro, submitLabel, kind, extra = "") {
    return `<form class="stack-16" data-form="contact" data-kind="${esc(kind)}">
      <h2>${title}</h2><p class="small muted">${intro}</p>
      <div class="field"><label for="s-name">Name</label><input class="input" id="s-name" name="name" required autocomplete="name"></div>
      <div class="field"><label for="s-wa">WhatsApp number</label><input class="input" id="s-wa" name="wa" required inputmode="tel" autocomplete="tel"></div>
      ${extra}
      <label class="check"><input type="checkbox" name="consent" checked><span>Zuma can message me about events and programs.</span></label>
      <div class="btn-row"><button type="button" class="btn ghost" data-close>Close</button><button class="btn" type="submit">${submitLabel}</button></div>
    </form>`;
  }

  /* ---------- CSV export ---------- */
  function exportCsv(what) {
    const sets = {
      bookings: [["code", "name", "whatsapp", "court", "date", "time", "minutes", "players", "promo", "status"], ...admin.bookings.map((b) => [b.code, b.name, b.wa, b.court, b.date, b.time, b.dur, b.players, b.promo, b.status])],
      orders: [["code", "name", "items", "total_idr", "status"], ...admin.orders.map((o) => [o.code, o.name, o.items, o.total, o.status])],
      contacts: [["name", "whatsapp", "email", "source", "tags", "consent"], ...Z.adminContacts.map((c) => [c.name, c.wa, c.email, c.source, c.tags.join("|"), c.consent])],
      signups: [["event", "team", "whatsapp", "category"], ["Smash The Year", "Rizal / Bima", "0812•••1001", "Men's open"], ["Smash The Year", "Sari / Lisa", "0813•••2210", "Women's open"]],
      sponsors: [["sponsor", "views", "clicks"], ["Northline Water", 4210, 186], ["Arka Motors", 2980, 141], ["Vela Sportswear", 2650, 97], ["Kopi Rally", 1870, 120], ["Palma Rackets", 1530, 64]],
    };
    const csv = sets[what].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `zuma-${what}-sample.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast("Sample CSV downloaded");
  }

  /* ---------- Router ---------- */
  function parse() {
    const raw = location.hash.replace(/^#/, "") || "/";
    const [path, qs] = raw.split("?");
    const q = Object.fromEntries(new URLSearchParams(qs || ""));
    return { parts: path.split("/").filter(Boolean), q };
  }

  let cdTimer;
  function render() {
    const { parts, q } = parse();
    const [a, b, c] = parts;
    let key = "home", html = "";
    const isAdmin = a === "admin";
    if (q.style === "feed" || q.style === "club") store.set("style", q.style);
    document.body.classList.toggle("style-feed", isFeed());

    if (isAdmin) { key = "admin"; html = viewAdmin(b, q); }
    else if (!a && isFeed()) { key = "feed"; html = viewFeed(); }
    else if (!a) html = viewHome();
    else if (a === "book" && b === "details") { key = "book"; html = viewBookDetails(); }
    else if (a === "book") { key = "book"; html = viewBook(q); }
    else if (a === "booking") { key = "confirm"; html = viewConfirmed(b); }
    else if (a === "manage") { key = "manage"; html = viewManage(q); }
    else if (a === "events" && c === "bracket") { key = "bracket"; html = viewBracket(b); }
    else if (a === "events" && b) { key = "event"; html = viewEvent(b); }
    else if (a === "events") { key = "events"; html = viewEvents(q); }
    else if (a === "programs") { key = "programs"; html = viewPrograms(); }
    else if (a === "academy" && b) { key = "academy"; html = viewAcademyDetail(b); }
    else if (a === "academy") { key = "academy"; html = viewAcademy(); }
    else if (a === "beginners") { key = "beginners"; html = viewBeginners(); }
    else if (a === "shop" && b) { key = "product"; html = viewProduct(b, q); }
    else if (a === "shop") { key = "shop"; html = viewShop(q); }
    else if (a === "pickup") { key = "product"; html = viewPickup(b); }
    else if (a === "promos") { key = "promos"; html = viewPromos(); }
    else if (a === "info") { key = "info"; html = viewInfo(); }
    else if (a === "more") { key = "more"; html = viewMore(); }
    else if (a === "explore") { key = "explore"; html = viewExplore(q); }
    else if (a === "me") { key = "me"; html = viewMe(); }
    else if (a === "media-kit") { key = "mediakit"; html = viewMediaKit(); }
    else html = viewNotFound("This page doesn't exist.");
    if (!html) return;

    const prevScreen = document.querySelector(".screen");
    const keepScroll = render.sameView && prevScreen ? prevScreen.scrollTop : 0;
    root.innerHTML = isAdmin
      ? html
      : `<div class="stage">${presenter(key, false)}<div class="device"><div class="screen ${key === "feed" ? "feed-screen" : ""}">${html}</div></div></div>`;
    if (isAdmin) document.title = "Zuma admin";
    else document.title = "Zuma Padel Court";

    const screen = document.querySelector(".screen");
    if (screen) screen.scrollTop = keepScroll;
    if (!render.sameView) window.scrollTo(0, 0);
    render.sameView = false;

    clearInterval(cdTimer);
    if (key === "event") {
      const e = Z.events.find((x) => x.slug === b);
      cdTimer = setInterval(() => {
        const [d, h, m, s] = countdownParts(e.date);
        const set = (k, v) => { const el = document.querySelector(`[data-cd="${k}"]`); if (el) el.textContent = v; };
        set("d", d); set("h", pad(h)); set("m", pad(m)); set("s", pad(s));
      }, 1000);
    }
  }

  // Re-render the same route without jumping to the top (used for in-page picks).
  function rerender(hash) {
    render.sameView = true;
    if (hash && hash !== location.hash) history.replaceState(null, "", hash);
    render();
  }

  /* ---------- Events ---------- */
  document.addEventListener("click", (ev) => {
    const t = ev.target.closest("[data-action]");
    if (!t) return;
    const act = t.dataset.action;
    const st = () => bookingState({});

    if (act === "back") return; // plain link
    if (act === "toggle-addons") {
      document.body.classList.toggle("hide-addons");
      try { localStorage.setItem("zuma.hideAddons", document.body.classList.contains("hide-addons") ? "1" : ""); } catch {}
      return render();
    }
    if (act === "date") { const s = st(); store.set("draft", { ...s, date: t.dataset.date, start: null, court: s.court }); return rerender("#/book" + (s.change ? "?change=" + s.change : "")); }
    if (act === "dur") { const s = st(); store.set("draft", { ...s, dur: Number(t.dataset.dur) }); return rerender("#/book" + (s.change ? "?change=" + s.change : "")); }
    if (act === "pick") { const s = st(); store.set("draft", { ...s, court: t.dataset.court, start: Number(t.dataset.h) }); return rerender("#/book" + (s.change ? "?change=" + s.change : "")); }
    if (act === "waitlist") {
      const s = st(); const court = Z.courts.find((c) => c.id === t.dataset.court);
      return sheet(contactForm(`${court.name} is booked at ${hhmm(Number(t.dataset.h))}`, `Join the waitlist for ${fmtDate(s.date)}. If it's cancelled, we WhatsApp you first. ${addon}`, "Join waitlist", `waitlist:${court.name} ${hhmm(Number(t.dataset.h))}`));
    }
    if (act === "cancel-booking") {
      return sheet(`<div class="stack-16"><h2>Cancel ${t.dataset.code}?</h2><p class="small muted">The court is released for other players. This can't be undone.</p>
        <div class="btn-row"><button class="btn ghost" data-close>Keep booking</button><button class="btn danger" data-action="cancel-confirm" data-code="${t.dataset.code}">Cancel booking</button></div></div>`);
    }
    if (act === "cancel-confirm") {
      const all = myBookings(); const c = t.dataset.code;
      if (all[c]) { all[c].status = "Cancelled"; store.set("bookings", all); }
      closeSheet(); toast("Booking cancelled");
      return (location.hash = "#/booking/" + c);
    }
    if (act === "register" || act === "event-waitlist") {
      const e = Z.events.find((x) => x.slug === t.dataset.slug);
      const extra = `
        <div class="field"><label for="s-team">${e.kind === "Tournament" || e.kind === "League" ? "Partner's name" : "Coming with someone? (optional)"}</label><input class="input" id="s-team" name="team"></div>
        <div class="field"><label for="s-cat">Category</label><select class="input" id="s-cat" name="cat">${e.categories.map((c) => `<option>${esc(c)}</option>`).join("")}</select></div>
        <div class="field"><label for="s-email">Email, optional</label><input class="input" id="s-email" name="email" type="email"></div>`;
      return sheet(contactForm(act === "register" ? `Sign up for ${esc(e.title)}` : `Waitlist for ${esc(e.title)}`, `${esc(e.fee)}, paid at the club. We confirm your place on WhatsApp.`, act === "register" ? "Sign up" : "Join waitlist", (act === "register" ? "event:" : "waitlist:") + e.title, extra));
    }
    if (act === "interest") return sheet(contactForm(`Join ${esc(t.dataset.what)}`, "Leave your number and the coordinator adds you to the next session.", "Send", "program:" + t.dataset.what, `<div class="field"><label for="s-lvl">Your level</label><select class="input" id="s-lvl" name="level"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>`));
    if (act === "trial") return sheet(contactForm(`Trial class`, `${esc(t.dataset.what)}. Pick a time that suits you and a coach confirms on WhatsApp.`, "Request trial class", "trial:" + t.dataset.what, `<div class="field"><label for="s-when">Preferred time</label><select class="input" id="s-when" name="when"><option>Weekday morning</option><option>Weekday evening</option><option>Weekend</option></select></div><div class="field"><label for="s-lvl">Experience</label><select class="input" id="s-lvl" name="level"><option>Never played</option><option>Played a few times</option><option>Play tennis or squash</option></select></div>`));
    if (act === "coach") {
      const c = Z.coaches[t.dataset.coach];
      return sheet(`<div class="stack-16"><div class="coach"><div class="portrait">${c.name[0]}</div><div><h2>${esc(c.name)}</h2><p class="small muted">${esc(c.role)}</p></div></div>
        <dl class="kv"><dt>Specialty</dt><dd>${esc(c.spec)}</dd><dt>Coaching</dt><dd>${c.years} years</dd></dl>
        <a class="btn block" href="${waLink(`Hi Zuma, I'd like a session with ${c.name}.`)}" target="_blank" rel="noopener">${icon("wa", 20)} Book a private session</a>
        <button class="btn ghost block" data-close>Close</button></div>`);
    }
    if (act === "variant") return rerender(t.dataset.href);
    if (act === "reserve") {
      const p = Z.products.find((x) => x.slug === t.dataset.slug);
      return sheet(contactForm(`Reserve ${esc(p.name)}`, `${[t.dataset.v, t.dataset.s].filter(Boolean).join(", ")}. ${rp(p.price)}, paid when you pick it up.`, p.status === "preorder" ? "Pre-order" : "Reserve", `order:${p.slug}|${t.dataset.v}|${t.dataset.s}`));
    }
    if (act === "restock") return sheet(contactForm(`${esc(t.dataset.what)} is sold out`, "We message you when the next batch arrives.", "Notify me", "restock:" + t.dataset.what));
    if (act === "copy") {
      const text = t.dataset.text;
      (navigator.clipboard?.writeText(text) || Promise.reject()).then(() => toast("Copied"), () => toast(text));
      return;
    }
    if (act === "toast") return toast(t.dataset.msg);
    if (act === "sponsor") { ev.preventDefault(); return toast(`Opens ${t.dataset.name}'s page. The click is counted for the sponsor report.`); }
    if (act === "reset") { ["bookings", "orders", "draft", "admin.bookings", "admin.orders"].forEach((k) => store.set(k, k === "draft" ? {} : null)); location.reload(); return; }
    if (act === "adm-confirm" || act === "adm-cancel") {
      const b = admin.bookings.find((x) => x.code === t.dataset.code);
      b.status = act === "adm-confirm" ? "Confirmed" : "Cancelled"; admin.save();
      toast(act === "adm-confirm" ? `${b.code} confirmed. The player gets a WhatsApp.` : `${b.code} cancelled. The waitlist is notified.`);
      return rerender();
    }
    if (act === "adm-picked") {
      const o = admin.orders.find((x) => x.code === t.dataset.code);
      o.status = "Picked up"; admin.save(); toast(`${o.code} marked as picked up`);
      return rerender();
    }
    if (act === "export") return exportCsv(t.dataset.what);
    if (act === "style") { store.set("style", t.dataset.style); closeStory(); location.hash === "#/" ? render() : (location.hash = "#/"); return; }
    if (act === "story") return showStory(t.dataset.id, 0);
    if (act === "story-next" || act === "story-prev") { const v = document.querySelector(".story-view"); return showStory(v.dataset.id, Number(v.dataset.idx) + (act === "story-next" ? 1 : -1)); }
    if (act === "story-close" || act === "story-go") return closeStory();
    if (act === "save") {
      const all = saved(); const id = t.dataset.id; const on = !all[id];
      if (on) all[id] = { title: t.dataset.title, href: t.dataset.href }; else delete all[id];
      store.set("saved", all);
      t.setAttribute("aria-pressed", on);
      const c = t.querySelector("[data-count]"); c.textContent = Number(c.dataset.count) + (on ? 1 : 0);
      return toast(on ? "Saved to Me" : "Removed from saved");
    }
    if (act === "member") return sheet(contactForm("Zuma membership", "Member registration opens soon. We'll WhatsApp you first.", "Get notified", "member:"));
  });

  document.addEventListener("submit", (ev) => {
    const f = ev.target.closest("form[data-form]");
    if (!f) return;
    ev.preventDefault();
    const data = Object.fromEntries(new FormData(f));
    const kind = f.dataset.form;

    if (kind === "booking") {
      const err = f.querySelector("#form-error");
      const wa = (data.wa || "").replace(/\D/g, "");
      const problem = !data.name?.trim() ? "Add your name so the front desk can find your booking."
        : wa.length < 9 ? "Add a WhatsApp number with at least 9 digits. We send your code there."
        : !data.rules ? "Tick the box to confirm you've read the booking rules." : "";
      if (problem) { err.textContent = problem; err.hidden = false; return; }
      const st = bookingState({});
      if (!canStart(st.court, st.date, st.start, st.dur)) { err.textContent = "Someone just booked this time. Go back and pick another slot."; err.hidden = false; return; }
      const all = myBookings();
      if (st.change && all[st.change]) all[st.change].status = "Cancelled";
      const c = code("ZM");
      all[c] = { code: c, name: data.name.trim(), wa: data.wa, email: data.email, court: st.court, date: st.date, start: st.start, dur: st.dur, players: Number(data.players || 4), promo: (data.promo || "").toUpperCase(), status: "Confirmed", consent: !!data.consent };
      store.set("bookings", all);
      store.set("draft", { date: st.date, dur: st.dur });
      location.hash = "#/booking/" + c;
      return;
    }
    if (kind === "manage") { location.hash = "#/manage?code=" + encodeURIComponent((data.code || "").trim().toUpperCase()); return; }
    if (kind === "contact") {
      if (!data.name?.trim() || (data.wa || "").replace(/\D/g, "").length < 9) { toast("Add your name and a WhatsApp number"); return; }
      const k = f.dataset.kind;
      closeSheet();
      if (k.startsWith("order:")) {
        const [slug, v, s] = k.slice(6).split("|");
        const p = Z.products.find((x) => x.slug === slug);
        const orders = store.get("orders", {});
        const c = code("MR");
        orders[c] = { code: c, item: [p.name, v, s].filter(Boolean).join(", "), total: p.price, wa: data.wa, pre: p.status === "preorder" };
        store.set("orders", orders);
        location.hash = "#/pickup/" + c;
        return;
      }
      const msgs = { waitlist: "You're on the waitlist. We'll WhatsApp you if it opens.", event: "You're signed up. Confirmation sent on WhatsApp.", program: "Sent. The coordinator will message you.", trial: "Trial requested. A coach confirms on WhatsApp.", restock: "We'll tell you when it's back.", member: "You're on the list. We'll tell you when registration opens." };
      toast(msgs[k.split(":")[0]] || "Sent");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeSheet(); closeStory(); }
    if (document.querySelector(".story-view") && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
      const v = document.querySelector(".story-view");
      showStory(v.dataset.id, Number(v.dataset.idx) + (e.key === "ArrowRight" ? 1 : -1));
    }
  });
  document.addEventListener("input", (e) => {
    if (e.target.dataset.action !== "search") return;
    const term = e.target.value.trim().toLowerCase();
    let shown = 0;
    document.querySelectorAll(".explore [data-search]").forEach((el) => { const hit = !term || el.dataset.search.includes(term); el.hidden = !hit; shown += hit; });
    const empty = document.querySelector("[data-empty]"); if (empty) empty.hidden = shown > 0;
  });

  try { if (localStorage.getItem("zuma.hideAddons")) document.body.classList.add("hide-addons"); } catch {}
  window.addEventListener("hashchange", () => { closeSheet(); render(); });
  render();
})();
