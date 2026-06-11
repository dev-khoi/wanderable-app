# “Travel memories should be reconstructed from media, not GPS.”

# Wanderable — Final Product Specification

## The one-line pitch

You already took the photos. We'll rebuild the trip.

---

# The problem being solved

Every other travel app asks you to do something before or during your trip — open the app, start a trip, keep GPS running. Most people don't. They travel, take photos, come home with 400 images in their camera roll that never become anything. Wanderable works backwards from what people already have.

---

# Core product loop

Import → Reconstruct → Edit → View on map → Share.

The map view is the destination. Everything else in the product exists to feed it. A user who has done zero editing should still be able to land on the map view and feel something. A user who has spent an hour editing should feel the difference.

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

The node card is the primary editing unit.

Each card shows:
- the photos in that cluster (swipeable)
- the auto-named location (editable inline)
- a time range
- a map thumbnail of the area
- a blog entry prompt

## Core editing actions

- Merge two adjacent nodes into one event, the user must be able to drag to merge

## NODE requirements

- a node can have multiple pictures
- pictures must be arranged ascending timely order
- user can write blog like how polarstep is
- a node must only have a location

- Split a node that grouped too broadly, the user can take a picture that they don't want to belong to the node, to put it to other

- the line connecting to node, can have the icon on it
  - for now just have:
    - car
    - bike
    - walk
    - fly
    - none for default

- Rename any node (pre-filled from reverse geocoding)
- Add a text blog entry per node or per day
- Record a voice note tied to a specific node — preserved as audio, optionally transcribed into the blog field
- Drag photos between nodes
- Reorder days
- Set a cover photo for the trip and for each day
- Pin a manual location for GPS-missing photos

missing gps photos should all go to photos box that the user can add, if they dont add, it will just not be shown

Voice notes are a priority feature, not a nice-to-have. People narrate travel memories naturally and rarely type them. A 30-second voice note captured two days after a trip carries more emotional truth than a caption written six months later. The waveform display in the final view adds texture to the story.

---

# Step 4 — The map view (the core output)

This is where the product lives.

After reconstruction and editing, the user lands on an interactive map that shows their entire trip as a lived experience.

## What the map shows

similar to a polar tree

- A route line connecting all memory nodes in sequence, derived from node centroids — not continuous GPS tracking, so there is no transit clutter, only meaningful stops

- Pins at each node, sized or colored by the number of photos

- Tapping a pin opens that node's card:
  - photos
  - location name
  - time
  - blog entry
  - voice note player

- A timeline scrubber at the bottom that lets the user move through the trip chronologically, with the map panning to follow

- Day selector to jump between days

- The full route across all days is visible at once in a trip overview zoom

The map view should feel like reliving the trip, not filing it.

The emotional register of the product lives here.

Design decisions:
- pin style
- route line weight
- animation when scrubbing

matter more here than anywhere else in the app.

The map view is also the sharing entry point.

Every element visible on the map view is what gets shared.

must be mobile-friendly, it can be shared through instagram

---

# Step 5 — Sharing

From the map view, the user taps share.

Three outputs:

## Public trip page

A shareable URL that renders the map view and timeline for anyone with the link — no app required, no account required.

Includes:
- the route map
- day-by-day breakdown
- photos
- blog entries
- voice note players

Designed to be worth sharing as a link on its own, not just a redirect to download the app.

---

## Instagram export

Wanderable turns your camera roll into a beautiful, shareable travel story automatically.

Instead of tracking GPS like Strava or asking users to journal during trips, Wanderable reconstructs journeys from existing photos — generating a cinematic route map, travel stats, memory timelines, and interactive trip pages from moments people already captured.

The core sharing experience is a clean Instagram-story-style travel card showing:
- the route
- distance traveled
- trip duration
- key memories

with viewers able to tap into a full interactive map experience.

Wanderable is not a social network or trip planner; it is a post-travel memory system designed to make lived experiences feel meaningful, aesthetic, and worth sharing.

Like how Strava is trending for Instagram share stories

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

* ignore the nfc and printed travel book for now 

Three models, each reinforcing the core loop rather than interrupting it.

## Printed travel book

After a user views their finished trip on the map, the natural question is:

> how do I keep this?

The book answers that.

It generates automatically from the trip structure:
- photos
- day labels
- blog entries
- transcribed voice notes
- the route map as an insert

No additional layout work from the user.

Price point:
- $35–65 depending on length

fulfilled via print-on-demand partner.

This is the primary revenue model and the one with the most validated demand — Polarsteps built $10M in annual revenue almost entirely on this single product, with users who had already done the curation work inside the app.

---

## NFC souvenir tag

A small NFC sticker that the user adheres to any physical object they brought home from the trip:
- a keychain
- a magnet
- a postcard frame
- a piece of pottery

When tapped by any NFC-enabled phone, it opens that trip's published page directly.

Wanderable hosts the link permanently.

The use case is visceral and immediate:

> tap the keychain from Kyoto and the whole trip opens.

There is independent market validation for this — a Berlin startup called Memoried raised $129,000 from 699 backers on exactly this concept, with organic campaign reach of 3 million people on Instagram.

Wanderable's version is stronger because the trip story already exists inside the app — users are not uploading photos to a tag, they are linking a tag to something they already built.

Price point:
- $8–15 per tag
- with multi-packs at a discount

Natural gift product between travel partners.

---

## Wanderable Pro subscription

Unlocks:
- unlimited trips
- custom map styles
- watermark removal
- priority book fulfillment

Free tier:
- last 6 trips

Suggested pricing:
- $5/month
- $39/year

Build this last — the physical products validate willingness to pay more concretely than a subscription experiment can.

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

---

# Build sequence

## Phase 1 — Reconstruction and map view

Photo import, EXIF parsing, clustering, day grouping, reverse geocoding, map display with pins and route line.

The only goal is:
- the activation moment
- the first version of the map view

No editing, no export.

If this phase doesn't make users say "wow" before they've touched anything, the product premise needs to be reconsidered before building further.

---

## Phase 2 — Core editing

very easy Merge, rename, reorder, add blog text, voice notes.

The minimum suite that makes the reconstruction worth curating.

---

## Phase 3 — Sharing and book export

- Public trip page
- Instagram export
- book ordering

First monetization.

Public launch happens here.

---

## Phase 4 — NFC tags and Pro tier

The differentiated premium product and the subscription unlock.

Only after the core loop has demonstrated retention.

---

# The competitive position in plain language

Polarsteps is a GPS tracker that also stores memories.

Wanderable is a memory system that also shows where you were.

Esplorio had the same instinct and died because it had no revenue model and no compelling output — its map view was functional, not emotional.

Wanderable's map view is the product, not a feature.

The physical export layer gives it two revenue models validated before a line of code is written:
- one proven by Polarsteps itself
- one proven by independent crowdfunding demand

The opening is real.

Execution sequencing and the quality of the map view experience are the only things that will determine whether it gets captured.