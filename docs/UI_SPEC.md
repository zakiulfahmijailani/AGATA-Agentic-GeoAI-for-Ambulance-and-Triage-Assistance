# UI SPECIFICATION — AGATA WebGIS

---

## Design Principles

1. **Dark-first** — dark navy background creates a professional GeoAI/smart city feel
2. **Data-dense but readable** — inspired by govtech products (Jakarta Smart City, BPS dashboards)
3. **Map is king** — the map takes the most space; everything else supports it
4. **Teal accent** — used exclusively for primary actions and highlights; not decoration

---

## Color System

```css
/* Brand */
--brand-navy:      #0f2d4a;   /* Primary background */
--brand-navy-2:    #1a3d5c;   /* Secondary surfaces */
--brand-navy-3:    #1e4a6e;   /* Hover states, cards */
--brand-teal:      #01b4bc;   /* Primary accent — CTAs, highlights */
--brand-teal-dim:  #0a7b82;   /* Hover state of teal */
--brand-teal-bg:   #012f31;   /* Very subtle teal surface */

/* Text */
--text-primary:    #f0f7ff;   /* Main text on dark */
--text-secondary:  #94b4cc;   /* Muted text */
--text-faint:      #4a7a9b;   /* Very muted / disabled */

/* Status (hospital bed availability) */
--status-available: #10b981; /* green — >= 5 beds */
--status-limited:   #f59e0b; /* amber — 1-4 beds */
--status-full:      #ef4444; /* red   — 0 beds */

/* Agent pipeline colors */
--agent-retrieval:     #3b82f6;  /* blue */
--agent-spatial:       #10b981;  /* green */
--agent-visualization: #f59e0b;  /* amber */
--agent-report:        #8b5cf6;  /* purple */

/* Dividers & borders */
--border:          rgba(1, 180, 188, 0.15);
--border-subtle:   rgba(255, 255, 255, 0.06);
```

---

## Typography

```css
font-family: 'Inter', -apple-system, sans-serif;

/* Scale */
--text-xs:    0.75rem;   /* 12px — tiny labels */
--text-sm:    0.875rem;  /* 14px — secondary info */
--text-base:  1rem;      /* 16px — body */
--text-lg:    1.125rem;  /* 18px — section heads */
--text-xl:    1.25rem;   /* 20px — panel titles */
--text-2xl:   1.5rem;    /* 24px — page title */
--text-hero:  2.25rem;   /* 36px — landing hero */
```

---

## Layout Specifications

### Dashboard Layout (desktop, min 1280px)

```
┌─────────────────────────────────────────────────────────────────┐
│ Header: h-14 (56px), sticky, bg-navy border-b border-teal/20    │
├──────────────┬──────────────────────────────┬───────────────────┤
│ ChatbotPanel │         MapView              │  Results + Stats  │
│   w-[300px]  │     flex-1 (fills rest)      │    w-[320px]      │
│   h-[calc    │     h-[calc(100vh-56px)]     │    h-[calc        │
│   100vh-56px │                              │    100vh-56px)]   │
│   )]         │                              │                   │
└──────────────┴──────────────────────────────┴───────────────────┘
```

**Total width:** 300 + flex-1 + 320 = fills 100vw

### Header contents (left → right):
1. `AGATA` logo (teal wordmark) + `WebGIS Dashboard` in text-secondary (16px gap)
2. `AgentStatusBar` (centered, absolute or margin auto)
3. Theme toggle icon + a `?` help button

---

## Component Visual Details

### ChatbotPanel
- Background: `#1a3d5c` (navy-2)
- Border-right: `1px solid rgba(1, 180, 188, 0.2)`
- Panel title bar: `bg-navy-3` with robot icon + "Asisten AGATA"
- Message bubbles:
  - User: `bg-brand-teal text-white` rounded-2xl rounded-br-none
  - Assistant: `bg-navy-3 text-text-primary` rounded-2xl rounded-bl-none
  - System: `text-text-faint text-xs italic` centered
- Typing indicator: 3 pulsing dots, same color as assistant bubble
- Input bar: `bg-navy` border-top, teal focus ring

### MapView
- Map style: `mapbox://styles/mapbox/dark-v11`
- Hospital markers:
  - Circle, 18px diameter
  - Green fill if available, amber if limited, red if full
  - White 2px stroke
  - Pulse animation (scale 1→1.5 opacity 1→0 repeat) on recommended hospitals
- Patient pin: white ambulance cross icon or red pulsing dot (24px)
- Route lines: dashed, 2px, teal `#01b4bc` opacity 0.7
- Legend: bottom-left corner, `bg-navy/80 backdrop-blur-sm` card, 3 items
- Attribution: bottom-right, standard Mapbox (required)

### AgentStatusBar
- Container: `bg-navy-3 rounded-full px-4 py-2 border border-teal/20`
- 4 pills connected by `···` (dot separator)
- Idle state: pill `bg-navy text-text-faint`
- Running state: pill `bg-agent-color/20 text-agent-color border border-agent-color/50` + spinner icon
- Done state: pill `bg-agent-color/10 text-agent-color/70` + checkmark icon
- Framer Motion: `AnimatePresence` + `motion.div` with `layoutId` for smooth transitions

### HospitalCard
- Container: `bg-navy-2 border border-border rounded-xl p-4 hover:border-teal/40 transition-all`
- Recommended: add `ring-1 ring-brand-teal` and rank badge in top-right corner
- Rank badges: `#FFD700` = 1st, `#C0C0C0` = 2nd, `#CD7F32` = 3rd (gold/silver/bronze)
- Status badge: `bg-status-color/20 text-status-color` small pill bottom-right
- `Pilih RS Ini` button: `bg-brand-teal text-white hover:bg-teal-dim w-full mt-3 rounded-lg py-2 text-sm font-medium`

### DashboardStats KPI Cards
- 4 cards stacked with `gap-3`
- Each: `bg-navy-2 border border-border rounded-xl p-4`
- Value: `text-2xl font-bold text-text-primary`
- Label: `text-xs text-text-secondary uppercase tracking-wide`
- Icon: `24px Lucide icon text-brand-teal`

---

## Landing Page

- Background: `linear-gradient(135deg, #0f2d4a 0%, #001a2e 100%)` + subtle grid SVG overlay
- Logo: `AGATA` in 48px font-black with teal accent on the A
- Tagline: 24px, text-text-primary
- Sub-tagline: 16px, text-text-secondary
- Feature badges: `bg-navy-2 border border-border rounded-full px-4 py-2 text-sm`
- CTA button: `bg-brand-teal text-white text-lg font-semibold px-8 py-4 rounded-full hover:scale-105 transition`
- SDG badges: small colored circles with SDG number (3=green, 9=orange, 11=gold)
- Centered layout, max-width 640px

---

## Responsive Behavior

- **< 1024px:** Collapse to tabs (Map / Chat / Results)
- **< 768px:** Single column, map top, chat bottom as slide-up sheet
- **For MVP:** desktop-first is acceptable, add basic mobile layout if time permits
