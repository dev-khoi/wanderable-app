# “Travel memories should be reconstructed from media, not GPS.”

# Wanderable — Final Product Specification

## The one-line pitch

You already took the photos. We'll rebuild the trip into highlights worth reliving.

---

# The problem being solved

Every other travel app asks you to do something before or during your trip — open the app, start a trip, keep GPS running. Most people don't. They travel, take photos, come home with 400 images in their camera roll that never become anything. Wanderable works backwards from what people already have.

---

# Core product loop

Import → Reconstruct → Edit → View on map → Share.

The map view is the destination. Everything else in the product exists to feed it. A user who has done zero editing should still be able to land on the map view and feel something. A user who has spent an hour editing should feel the difference.

---

# Core content model

Wanderable should feel Instagram-like in interaction speed, but follow Polarsteps in business shape: the user ends up with a trip artifact they are proud to relive and share.

The primary objects are:

- Trip: the full travel artifact owned by one user
- Highlight: the main swipeable chapter on the map; this is the map-following unit
- Story: the nested memory unit inside a highlight
- Media: photo or video attached to a story, with time and location metadata

Rules for the model:

- One trip has many highlights
- One highlight has many stories
- One story can render one or more media assets, but the story remains the narrative unit
- Highlights sit next to each other and can be swiped horizontally
- The active highlight controls what the map is focused on
- Opening a highlight should feel like a story viewer, not a full-screen modal wall
- Trips belong to one user in v1, but can be shared read-only by link

This replaces the older day-first mental model. Days can still be derived from timestamps later, but they are not the primary UI or database object.

---

# Step 1 — Import

User opens the app for the first time and grants photo library access. The app scans all photos silently. No trip setup. No forms. The first screen after scanning is not a setup wizard — it's their travel history, already reconstructed.

The activation hook:

> "We found 23 trips across 14 countries between 2019 and today."

This is the product's most powerful first impression. The entire value proposition is demonstrated in one moment before the user has done anything.

Import sources:
- local camera roll
- Google Photos
- iCloud

Photos without GPS are flagged but never block the flow.

---

# Step 2 — Reconstruction engine

Three passes, no generative AI.

## EXIF extraction

GPS coordinates and timestamps pulled from every photo. Photos missing GPS are queued for fallback handling — they are not discarded.

## Geo-temporal clustering

Consecutive photos are grouped into memory nodes when they fall within ~500m of each other and within ~2 hours of each other.

Both thresholds are user-tunable.

Each node gets:
- a centroid location
- a time range

## Day and trip sequencing

Nodes are grouped into calendar days.

Days are grouped into trips by detecting gaps of 2+ days between activities — the home-return heuristic.

Each node is reverse-geocoded to a human-readable place name.

Each day is named by its dominant location.

## Fallback for missing GPS

Photos with timestamps but no coordinates are slotted into the nearest time window.

The app surfaces a single prompt in the editing flow:

> "We couldn't locate these 12 photos — where were you?"

User pins on a map or skips.

Never a blocking gate.

---

# Step 3 — Editing suite

The highlight is the primary editing unit.

Each highlight should show:
- a cover media asset
- a location anchor on the map
- a sequence of stories inside it
- a start/end time window derived from its stories
- lightweight summary text if the user wants it

Each story should show:
- photo or video media
- a title
- a short description or journal text
- location metadata
- captured date and time

## Core editing actions

- Rename a highlight
- Reorder highlights inside a trip
- Reorder stories inside a highlight
- Add or remove media from a story
- Edit story title, description, location label, and date context
- Choose the cover media for a highlight and for the trip
- Decide whether a story inherits the highlight location or overrides it

Core rules:

- Highlights are the map-following object
- Stories are the narrative object
- Media must stay sorted chronologically inside a story unless the user explicitly reorders it
- Missing GPS media should never block the flow; it can stay off-map until the user assigns it or the system infers it later

This editing suite should feel like curating a trip recap, not fixing a database. The user is shaping a story output they can relive and share.

---

# Step 4 — The map view (the core output)

This is where the product lives.

After reconstruction and editing, the user lands on an interactive map that shows their entire trip as a lived experience.

## What the map shows

similar to a Polarsteps route, but consumed through highlight swiping

- A route line connecting all highlights in sequence, derived from their map anchors rather than continuous GPS tracking

- Pins or markers at each highlight

- The active highlight card at the bottom, showing the current chapter the user is browsing

- Horizontal swiping between highlights, with the map panning to follow the active highlight automatically

- Tapping a highlight opens a story viewer that covers around 80% of the screen instead of taking over the entire app

- Inside the open story viewer:
  - tap left half to go back
  - tap right half to go forward
  - hold to pause
  - swipe horizontally to move between highlights

- The full route across all highlights remains visible in the trip overview state

The map view should feel like reliving the trip, not filing it.

The emotional register of the product lives here.

Design decisions:
- pin style
- route line weight
- animation when swiping between highlights and opening the story viewer

matter more here than anywhere else in the app.

The map view is also the sharing entry point.

Every element visible on the map view is what gets shared.

must be mobile-friendly, it can be shared through instagram

---

# Step 5 — Sharing

From the map view, the user taps share.

The core sharing outputs are:

## Public trip page

A shareable URL that renders the trip map, highlight sequence, and story viewer for anyone with the link — no app required, no account required.

Includes:
- the route map
- the ordered highlights
- story media
- story titles and descriptions
- date and location context

Designed to be worth sharing as a link on its own, not just a redirect to download the app.

---

## Highlight-first sharing

Wanderable turns a trip into a set of polished highlights that feel natural to share on Instagram, WhatsApp, and group chats.

The core sharing experience is:
- a public trip page with the route and full highlight/story structure
- a compact share card that previews the trip visually
- a highlight/story interaction model that feels familiar to story viewers without becoming a social feed

The product should feel Instagram-like in interaction design, but not in business model. The value comes from rebuilding and curating a trip artifact, not from building a feed.

The sharing experience is not a feed or a social network.

Wanderable has:
- no follower graph
- no likes
- no algorithm

Users bring their own audience from wherever they already are:
- Instagram
- WhatsApp
- family group chats

Wanderable produces the content; distribution is the user's.

---

# Monetization

The business should still learn from Polarsteps: the core value is a trip output that users want to revisit and share. Wanderable should not chase social engagement loops or planning tools.

Near-term business leverage comes from:
- a trip artifact people are proud to publish by link
- a shareable highlight/story experience that fits how people already distribute memories
- future premium outputs built on top of a structured trip model

The product should first prove that:
- users understand the trip → highlight → story model
- the map and highlight viewer feel emotionally strong
- sharing a trip artifact is meaningfully better than dumping photos into a feed

---

# What Wanderable is not

## Not a travel planner

No:
- itinerary builder
- booking integration
- future-trip suggestions

Planning is a different job-to-be-done owned by Wanderlog and TripIt.

Wanderable owns the post-trip layer entirely.

## Not a social network

No:
- feed
- follower graph
- likes
- algorithm

A publishing tool, not a platform.

Instagram-like gestures are allowed. Instagram-like incentives are not.

---

# Build sequence

## Phase 1 — Trip, highlight, and story model

Get the core domain right first:
- trip ownership
- media upload and metadata storage
- highlight ordering
- story rendering
- map-following highlight behavior
- read-only sharing by link

The goal is to prove the object model and interaction model before the full reconstruction engine is layered on top.

---

## Phase 2 — Reconstruction and curation

Add reconstruction logic that can understand uploaded media metadata and generate draft highlights and stories.

Then add lightweight curation:
- rename highlights
- reorder highlights
- edit story text
- fix locations
- choose cover media

---

## Phase 3 — Sharing and premium outputs

- Public trip page
- Highlight/story share cards
- richer exported outputs built from the structured trip model

Public launch happens once the map and highlight viewer feel good enough to share.

---

## Phase 4 — Expanded premium business model

Once the core trip artifact has clear demand, expand into premium outputs and higher-value share or export layers.

---

# The competitive position in plain language

Polarsteps is a trip artifact built from captured travel progress.

Wanderable is a trip artifact rebuilt from captured media.

Esplorio had the same instinct and died because it had no revenue model and no compelling output — its map view was functional, not emotional.

Wanderable's map view is the product, not a feature.

The opening is not in becoming another travel social app. It is in making trips feel structured, aesthetic, and easy to share from the media people already have.

Execution sequencing and the quality of the map view experience are the only things that will determine whether it gets captured.
