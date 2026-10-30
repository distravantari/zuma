# Zuma web app: design notes

Clickable mockup of the Zuma Padel Club web app. Mobile-first, no install, no online payments.

## Point of view

The club's real product is court time that expires if nobody books it. So the home screen opens on a live **court board**: each court drawn top-down to padel proportions (20 × 10 m, service lines 6.95 m from the net), showing its next open time. Player dots appear on courts that are in use right now. That board is the one bold element; everything around it stays quiet.

## Two player app styles

The client picks one. Both cover the same brief features and share the same admin panel.

- **Club**: calm and editorial. A home screen led by the court board, with everything one tap away. Four tabs: Home, Book, Events, More.
- **Feed**: built on the habits Zuma's players already have from Instagram and TikTok. Stories across the top, a full-screen swipeable feed of cards (open courts, events, coaches, merch, promos, live scores), a heart to save and a WhatsApp share on every card. Five tabs with a raised Book button in the middle, and a Me tab that acts as a profile without an account. The feed is dark and immersive like Reels; inner pages stay light like Instagram.

Switch styles in the desktop side panel, from More or Me, or with `#/?style=feed` / `#/?style=club`.

## UI/UX audit (30 Oct 2026)

**Against the client's two PDFs.** All of section A works in both styles. The section B extras shown are tagged Add-on: empty slots, waitlist, off-peak labels, court blocks, reminders and check-in, campaign countdown, segmentation, gallery, beginner page, live bracket, quiet/busy report, sponsor stats, and the media kit (added in this round). Gaps that need the client, not design: real photos, hours, prices, WhatsApp number, Indonesian copy.

**Against Zuma's real brand** (Instagram @zumapadelcourt):
- Their voice is "a lifestyle of elegance, competition, and shared moments". It is told in black-and-white film photography with script-plus-serif headlines. The first mockup's chunky poster serif felt too playful. We moved to Cormorant Garamond with Pinyon Script, echoing their own post typography. Feed copy reuses their caption lines.
- The real logo replaces the placeholder wordmark everywhere: header, story avatar, presenter panel, admin, favicon and link preview.

**Against what players are used to** (Instagram, TikTok, Threads, AYO):
- Thumb-zone actions. Primary buttons sit at the bottom, Book is always one tap away, and sheets slide up from the bottom.
- Stories and a vertical feed for discovery (Feed style). A calm hub (Club style) for people who just want to book.
- A heart to save, share to WhatsApp, copy a link for Instagram, and a Me tab without sign-up. Booking takes a name and WhatsApp number only, which is lighter than AYO's account and app download.
- Live states (open now, live scores, countdowns) give people a reason to come back.

**Open recommendations:** Indonesian as the default language with an English toggle; real club photography in the halftone or film treatment; decide with the client how booking coexists with their AYO listing.

## Tokens

| Token | Hex | Use |
|---|---|---|
| Deep Forest | `#263C30` | Header, primary buttons, court board, category cards |
| Warm Ivory | `#F5F1E6` | Page background, light cards |
| Sand Gold | `#DFCC8A` | Accents, badges, promo marks. Never as text on ivory (1.4:1) |
| Dark Charcoal | `#202421` | Body text, tab bar, dark sections |
| Brick (derived) | `#8F3A26` | Cancel and error states only |

Type: **Cormorant Garamond** bold for headings and prices, with lining numerals. **Pinyon Script** for the first word of a feed or story headline, the way Zuma's Instagram posts do it. **Schibsted Grotesk** for UI text. Tight uppercase only on the stacked category cards (reference 1).

Shape hierarchy: pills for actions and chips, 20px radius for content cards, 12px for fields. 2px charcoal outlines mark things you can act on.

## Anti-slop rules we follow

- No stock photos. Imagery is halftone texture in brand colours (reference 2), replaced later by the club's own photos run through the same halftone treatment.
- No gradients, glassmorphism, emoji icons or drop shadows. Icons are one hand-drawn 24px set.
- No eyebrow labels above headings, no "→" on buttons, no 01/02/03 markers unless the content is a real sequence (how to book, first visit).
- One motion moment: the live-score dot. Sheets rise when you open them. Nothing animates on scroll.
- Copy says what happens: "Confirm booking", "Join waitlist", "Reserve for pickup". Errors say how to fix it.
- Respects reduced motion, keyboard focus is visible, text pairs follow the brand contrast table.

## Add-on tags

Features outside the core brief carry a dashed gold **Add-on** tag so the client can see what each pricing tier includes. Toggle them with "Show add-on tags" in the desktop side panel.
