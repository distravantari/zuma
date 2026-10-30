# Zuma web app mockup

Clickable mockup of the Zuma Padel Court (Bogor) web app, for client review. Two player app styles: Club and Feed.

**Live:** https://distravantari.github.io/zuma/

- Player app: home, court booking, booking code, manage booking, events, bracket, programs, academy, beginners, merch shop, promos, info.
- Admin panel: `#/admin` (bookings, courts and prices, content, merch orders, contacts and CSV export, reports, settings) with the Zuma Assistant chat.
- All data is sample data in `assets/js/data.js`. Bookings made in the demo stay in your browser only.

Proposal: https://distravantari.github.io/zuma/proposal.html

Design notes: [DESIGN.md](DESIGN.md).

## Run locally

```bash
python3 -m http.server 4173
```

Then open http://localhost:4173.
