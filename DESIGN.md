# Zuma web app: design notes

Clickable mockup of the Zuma Padel Club web app. Mobile-first, no install, no online payments.

## Point of view

The club's real product is court time that expires if nobody books it. So the home screen opens on a live **court board**: each court drawn top-down to padel proportions (20 × 10 m, service lines 6.95 m from the net), showing its next open time. Player dots appear on courts that are in use right now. That board is the one bold element; everything around it stays quiet.

## Tokens

| Token | Hex | Use |
|---|---|---|
| Deep Forest | `#263C30` | Header, primary buttons, court board, category cards |
| Warm Ivory | `#F5F1E6` | Page background, light cards |
| Sand Gold | `#DFCC8A` | Accents, badges, promo marks. Never as text on ivory (1.4:1) |
| Dark Charcoal | `#202421` | Body text, tab bar, dark sections |
| Brick (derived) | `#8F3A26` | Cancel and error states only |

Type: **Young Serif** for headings and prices (heavy, friendly serif, reference 3). **Schibsted Grotesk** for UI text. Tight uppercase only on the stacked category cards (reference 1).

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
