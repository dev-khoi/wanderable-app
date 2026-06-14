# Wanderable App Wireframe

## Product idea

Wanderable is a **post-trip memory app**.

Core loop:

**Import → Reconstruct → Edit → View on map → Share**

The app should feel like **"we rebuilt your trip from your photos"**, not like a planner or social feed.

---

## Core product principle

- The **map view is the hero screen**
- Onboarding must be **short and permission-driven**
- The first wow moment is:
  - **"We found 23 trips across 14 countries between 2019 and today."**
- Editing exists to improve the story, not block it
- Missing GPS photos should never stop the user flow

---

## Recommended app structure

### First-time user flow

1. Splash
2. Value proposition / permission primer
3. Photo library permission
4. Import + reconstruction loading
5. Activation summary
6. Trip library
7. Open latest reconstructed trip
8. Map view

### Returning user flow

1. Open app
2. Land in **Trip Library / Home**
3. Tap trip
4. Go to **Map View**

---

## Where onboarding should happen

Onboarding should happen **only once, before import**, and should be extremely light.

### Onboarding includes

- brand intro
- short explanation:
  - "We rebuild trips from photos, not GPS tracking"
- photo permission request
- optional cloud import connection later, not required up front

### Onboarding should NOT include

- account creation wall
- trip setup wizard
- preference forms
- long tutorial carousel
- manual location entry before value is shown

### Best placement

- **Immediately after splash / first launch**
- Then move directly into scanning/import

---

## Primary navigation

Use a simple mobile bottom navigation with 3 top-level areas.

### Bottom nav

1. **Trips**
2. **Map**
3. **Profile / Settings**

### Notes

- **Trips** is the default landing tab
- **Map** opens the currently selected or most recent trip map
- Editing can live inside trip detail rather than as a top-level tab

---

## Information architecture

```text
Wanderable
├── Onboarding
│   ├── Splash
│   ├── Intro / permission primer
│   └── Import scanning
├── Trips
│   ├── Trip library
│   ├── Trip detail
│   │   ├── Map view
│   │   ├── Day selector
│   │   ├── Timeline scrubber
│   │   ├── Node detail card
│   │   └── Trip stats
│   └── Editing flows
│       ├── Node edit
│       ├── Day edit
│       ├── Missing photos inbox
│       ├── Voice notes
│       └── Reorder / merge / split
├── Share
│   ├── Public trip page
│   ├── Instagram story export
│   └── Copy link / share sheet
└── Profile / Settings
    ├── Connected sources
    ├── Map style
    ├── Subscription
    └── Export / privacy
```

---

## Screen-by-screen wireframe

## 1. Splash screen

**Goal:** quick brand entry.

```text
+----------------------------------+
|            Wanderable            |
|     Rebuild your trips           |
|       from your photos           |
+----------------------------------+
```

---

## 2. Intro / permission primer

**Goal:** explain the value before asking permission.

```text
+----------------------------------+
| [Illustration / sample map]      |
|                                  |
| We rebuild your trips from       |
| the photos you already took.     |
|                                  |
| No GPS tracking. No trip setup.  |
|                                  |
| [Allow Photo Access]             |
| [Not now]                        |
+----------------------------------+
```

---

## 3. Import / reconstruction loading

**Goal:** make the processing feel magical, not technical.

```text
+----------------------------------+
| Scanning your photo library...   |
|                                  |
| [progress animation]             |
|                                  |
| Finding places...                |
| Grouping moments...              |
| Rebuilding trips...              |
+----------------------------------+
```

---

## 4. Activation summary

**Goal:** deliver the wow moment.

```text
+----------------------------------+
| We found                         |
| 23 trips                         |
| 14 countries                     |
| 2019 → Today                     |
|                                  |
| [See my trips]                   |
+----------------------------------+
```

This is the most important conversion screen in the app.

---

## 5. Trips library / Home

**Goal:** show reconstructed travel history immediately.

```text
+----------------------------------+
| Wanderable                       |
| Search trips                     |
|                                  |
| Stats strip                      |
| [23 Trips] [14 Countries]        |
|                                  |
| Recent Trips                     |
| +------------------------------+ |
| | Cover photo                  | |
| | Japan • 8 days               | |
| | Kyoto / Osaka / Tokyo        | |
| +------------------------------+ |
|                                  |
| +------------------------------+ |
| | Cover photo                  | |
| | Italy • 5 days               | |
| +------------------------------+ |
|                                  |
| [Trips] [Map] [Profile]         |
+----------------------------------+
```

### Home contents

- trip cards with cover image
- trip duration
- dominant locations
- optional incomplete badge
- CTA to continue editing latest trip

---

## 6. Trip detail = Map view (hero screen)

**Goal:** this is the core output and emotional center.

```text
+----------------------------------+
| < Back        Japan 2024    Share|
|----------------------------------|
|                                  |
|         [Interactive Map]        |
| route line + highlights + pins   |
|                                  |
|                                  |
|----------------------------------|
| Highlight: Kyoto Walk  [Edit]    |
| [Highlight swipe rail]           |
|                                  |
| Swipe highlights  o----o---o     |
|                                  |
| Active highlight preview         |
| Cover | Kyoto Walk | Mar 19      |
| Story snippet / location         |
+----------------------------------+
```

### Must-have elements

- route line between highlights
- highlight pins or anchors on the map
- horizontal highlight swipe behavior
- active highlight preview
- share CTA
- edit CTA

---

## 7. Highlight story viewer

**Goal:** primary storytelling unit layered on top of the map.

```text
+----------------------------------+
| [drag handle]                    |
| [story media]                    |
|                                  |
| Kyoto Walk                       |
| Mar 19 • Kyoto                   |
| [mini map context]               |
|                                  |
| Story title / description        |
| "We got here before sunset..."  |
|                                  |
| Tap left = previous story        |
| Tap right = next story           |
| Hold = pause                     |
| Swipe = next highlight           |
+----------------------------------+
```

### Highlight/story requirements

- highlight is the map-following unit
- a highlight contains many stories
- a story contains media plus title, description, location, and date context
- photos and videos are supported in v1
- swiping between highlights updates the map automatically

---

## 8. Edit trip screen

**Goal:** curate the reconstructed trip with low friction.

```text
+----------------------------------+
| Edit Trip                Done    |
|----------------------------------|
| Day 1                            |
|  [Node A]---walk---[Node B]      |
|                 \                |
|                  \ drag merge    |
|                                  |
| Day 2                            |
|  [Node C]---train---[Node D]     |
|                                  |
| Missing Photos (12) >            |
| Reorder Days >                   |
+----------------------------------+
```

### Core editing actions here

- merge adjacent nodes
- split broad nodes
- drag photos between nodes
- reorder days
- set trip cover photo
- set day cover photo

---

## 9. Missing GPS photos inbox

**Goal:** isolate uncertainty without polluting the main map.

```text
+----------------------------------+
| Missing Locations                |
| 12 photos could not be placed    |
|                                  |
| [photo] [photo] [photo]          |
| [photo] [photo] [photo]          |
|                                  |
| Where were you?                  |
| [Pin on map]                     |
| [Add to existing node]           |
| [Skip for now]                   |
+----------------------------------+
```

### Rule

- if user does nothing, these photos stay out of the final trip map

---

## 10. Voice note capture

**Goal:** make narration easy and emotional.

```text
+----------------------------------+
| Add voice note                   |
|                                  |
|      [record button]             |
|                                  |
| 00:23                            |
| [waveform preview]               |
|                                  |
| [Save to node]                   |
| [Transcribe to blog]             |
+----------------------------------+
```

---

## 11. Share sheet

**Goal:** export from the map view, not from a separate social layer.

```text
+----------------------------------+
| Share Trip                       |
|                                  |
| [Public Trip Link]               |
| [Highlight Share Card]           |
| [Copy Link]                      |
| [Download Trip Preview]          |
+----------------------------------+
```

---

## 12. Public trip page

**Goal:** link-native viewing experience without app install.

```text
+----------------------------------+
| Trip title + cover               |
| Route map                        |
| Highlight sequence               |
| Story viewer                     |
| Story text and media             |
+----------------------------------+
```

---

## 13. Highlight share card

**Goal:** a lightweight, aesthetic summary for sharing.

```text
+----------------------------------+
| Trip cover / mini route          |
| Japan 2024                       |
| Kyoto Walk                       |
| Story preview                    |
| Shareable trip artifact          |
| Wanderable                       |
+----------------------------------+
```

---

## 14. Profile / settings

**Goal:** keep utility settings out of the core emotional flow.

```text
+----------------------------------+
| Profile / Settings               |
|                                  |
| Connected Sources >              |
| Map Style >                      |
| Subscription / Pro >             |
| Export Preferences >             |
| Privacy >                        |
+----------------------------------+
```

---

## Recommended user flow by screen

```text
First Launch
→ Splash
→ Intro / permission primer
→ Photo access
→ Scanning / reconstruction
→ Activation summary
→ Trip library
→ Trip detail map

Inside a Trip
→ Map view
→ Tap node
→ Open node card
→ Edit / add blog / add voice note
→ Return to map
→ Share
```

---

## What should be MVP vs later

## MVP

- onboarding
- photo permission
- import + EXIF parsing
- clustering and day grouping
- trip library
- map view
- node card
- rename node
- simple blog entry
- missing GPS inbox

## Phase 2

- merge / split nodes
- drag photos between nodes
- voice notes
- reorder days
- cover photo controls
- transport icons

## Phase 3

- public trip page
- Instagram export
- book export

## Phase 4

- NFC souvenir tag
- Pro subscription
- custom map styles

---

## UX rules to protect product quality

1. **Show value before asking for effort**
2. **Map view should be reachable fast**
3. **Never block on missing GPS**
4. **Editing should feel optional but rewarding**
5. **Sharing should start from the finished map**
6. **No feed, no likes, no follower graph**

---

## Suggested route structure for implementation

```text
app/
  index.tsx                  -> splash / entry redirect
  onboarding/
    intro.tsx
    permissions.tsx
    scanning.tsx
    summary.tsx
  (tabs)/
    trips.tsx                -> trip library
    map.tsx                  -> selected/current trip map
    profile.tsx              -> settings
  trip/
    [tripId]/index.tsx       -> trip detail map
    [tripId]/edit.tsx        -> trip editing
    [tripId]/missing.tsx     -> missing GPS photos
    [tripId]/share.tsx       -> share options
  node/
    [nodeId].tsx             -> node detail sheet/screen
```

---

## Final recommendation

If only one screen gets the most design attention, it should be:

1. **Activation summary**
2. **Trip detail map view**
3. **Node detail card**

Those three screens define whether Wanderable feels magical or ordinary.
