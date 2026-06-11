# Wanderable Editing Suite Analysis

This document focuses only on the editing suite and story-view behavior for Wanderable. It does not describe implementation details for the current app screens, and it does not attempt to build the Figma drafts. The goal is to clarify what users can do after reconstruction, how this competes with Polarsteps, and how the business domains connect.

## Core Position

Wanderable should not become "Polarsteps plus Instagram sharing." The distinction is sharper:

| Product | Starting Point | User Effort | Core Object | Emotional Output |
| --- | --- | --- | --- | --- |
| Polarsteps | Track or create a trip while traveling | User records steps during the trip | Step | A tracked travel diary |
| Wanderable | Import existing media after or during a trip | App reconstructs first, user corrects later | Memory node | A rebuilt travel memory map |

Polarsteps works because the trip becomes a sequence of meaningful "steps" on a map. Each step can hold a location, photos, text, and route context. The book business works because users have already organized their memories inside the product.

Wanderable should borrow the strength of the step model, but not the input model. The user should not need to manually start tracking, create steps, or journal during travel. Wanderable creates the first draft automatically from photos and videos, then lets the user edit the reconstructed story.

## Editing Suite Job

The editing suite has one job: turn an automatically reconstructed trip into a story the user is proud to view, share, and possibly print.

The editor is not a planner, not a social composer, and not a full video editor. It is a correction and storytelling layer on top of reconstructed memory nodes.

## Primary Editing Object: Memory Node

A memory node is Wanderable's version of a Polarsteps step, but generated from media rather than GPS tracking.

### Node Rules

| Rule | Decision |
| --- | --- |
| Location | A node has exactly one location. |
| Media | A node can contain multiple photos and videos. |
| Media order | Media inside the node is always sorted ascending by timestamp. |
| Node title | Auto-filled from reverse geocoding, editable by the user. |
| Node body | User can write a blog-style memory for the node. |
| Media caption | Each photo or video can optionally have its own short description. |
| Voice note | A node can have a voice note attached. |
| Route context | Movement between nodes belongs to the route segment, not the node. |
| Missing GPS | Media without location starts outside the main route in a missing-location inbox. |

This gives the product a clean mental model: node equals one place-based memory. Media and writing enrich the node, but the node should not contain multiple places.

## Route Segment Rules

The line between nodes is its own product object. This matters because users may want to describe how they moved without changing the memory node itself.

| Segment Field | Purpose |
| --- | --- |
| From node | Previous memory node. |
| To node | Next memory node. |
| Transport icon | Car, bike, walk, fly, or none. |
| Derived route line | Connects node centroids, not continuous GPS tracking. |
| User edit | User can change the transport icon only in the MVP. |

Default should be `none`. The route should feel clean and memory-based, not like a noisy tracking log.

## What Users Can Do In Edit Mode

Edit mode should feel like correcting a reconstructed story, not building a trip from scratch.

### 1. Rename A Node

User sees an auto-generated place name and can replace it inline.

Example: `Kiyomizu-dera Area` becomes `Sunset walk near Kiyomizu`.

Why it matters: reverse geocoding is functional, but emotional naming is user-owned.

### 2. Write A Node Blog Entry

User can add a blog-like memory to each node.

The editor should support short or long text, but the prompt should encourage lightweight writing.

Good prompt: `What happened here?`

Bad prompt: `Write a journal entry`.

Why it matters: this is how the trip becomes personal enough to share or print.

### 3. Add Descriptions To Individual Media

Each photo or video inside a node can have a short description.

This is different from the node blog. The node blog describes the whole place or moment. A media description explains one specific item.

Example:

| Level | Example |
| --- | --- |
| Node blog | `We spent the whole afternoon walking through the shrine paths and got caught in light rain.` |
| Media description | `The first gate where we realized how huge the place was.` |

This supports the user's idea that each picture or video can contain its own trip description, while keeping the node as the main story unit.

### 4. Record A Voice Note

User can record a voice note tied to a node.

Voice note behavior:

| Action | Behavior |
| --- | --- |
| Record | Saves audio to the node. |
| Replay | Shows a waveform/player in edit and view mode. |
| Transcribe | Optional conversion into the node blog field. |
| Keep audio | Audio should remain available even if transcribed. |

Voice notes are a priority because users naturally talk through memories. This is a stronger differentiator than another caption field.

### 5. Merge Adjacent Nodes

User can drag one adjacent node into another to merge them.

Merge should only be available for adjacent nodes in the same day, unless a later version intentionally supports cross-day merging.

Merge result:

| Field | Result |
| --- | --- |
| Location | User chooses one location or the app keeps the dominant centroid. |
| Media | Combined and sorted by timestamp. |
| Blog | Preserved by appending both entries, with separation. |
| Voice notes | Preserve both or ask which to keep if MVP only allows one. |
| Route | Previous and next segments reconnect to the merged node. |

Why it matters: clustering will sometimes over-split one real memory into several nearby nodes.

### 6. Split A Node

User can split a node that grouped too broadly.

Expected interaction:

1. User opens a node.
2. User selects photos or videos that do not belong.
3. User chooses `Move to new node` or `Move to existing node`.
4. If creating a new node, user pins or confirms one location.

Split result:

| Field | Result |
| --- | --- |
| Original node | Keeps remaining media. |
| New node | Receives selected media, sorted by timestamp. |
| Location | Must be confirmed because a node can only have one location. |
| Route | New node is inserted into chronological route order. |

Why it matters: automatic clustering may group photos from different nearby places into one node.

### 7. Drag Photos Between Nodes

User can move photos or videos from one node to another.

This should be framed as fixing the story, not file management.

Rule: after moving, the target node re-sorts media by timestamp automatically.

### 8. Handle Missing GPS Media

Photos or videos without usable GPS should not appear on the map by default. They go into a missing-location inbox.

User choices:

| Choice | Behavior |
| --- | --- |
| Add to existing node | Media joins that node and appears in that node's story. |
| Pin on map | User creates or assigns a location, then media can become a node. |
| Skip | Media stays out of the public/viewable trip. |

Important rule: missing GPS media never blocks the flow. If the user ignores it, it simply does not show in the final route or story.

### 9. Reorder Days

User can reorder days if reconstruction got the sequence wrong, but this should be less common than node edits.

Reordering days changes story presentation order. It should not mutate original media timestamps.

### 10. Set Cover Media

User can set cover media for the trip and for each day.

Cover media is presentation metadata. It does not change reconstruction logic.

### 11. Change Transport Icon Between Nodes

User can tap the route line between two nodes and set an icon:

| Icon | Meaning |
| --- | --- |
| Car | Driving or ride share. |
| Bike | Cycling. |
| Walk | Walking. |
| Fly | Flight. |
| None | Unknown or not worth showing. |

This creates a small but visible sense of journey without needing GPS tracking.

## What Users Can Do In View Stories

View mode is the emotional output. Editing feeds this view.

The two Figma drafts suggest two useful states:

| Figma Direction | Product Meaning |
| --- | --- |
| Small bottom story card over map | User is browsing the route while keeping map context visible. |
| Large immersive story panel | User is focused on one node's media and description. |

Both can exist as one interaction model: tap a node to open a compact card, then expand into an immersive story view.

### Story View State 1: Map With Active Node Card

User sees the route map, node pins, and a bottom card for the active node.

The card should show:

| Element | Purpose |
| --- | --- |
| Day label | Places the node in trip sequence. |
| Date and location | Anchors the memory. |
| Media preview | Shows the most emotional visual asset. |
| Blog snippet | Gives story context. |
| Voice note affordance | Shows that this node has spoken memory. |
| Expand action | Opens immersive story view. |

This is the default map reliving state.

### Story View State 2: Immersive Node Story

User expands the card into a larger story panel.

The panel should show:

| Element | Behavior |
| --- | --- |
| Media carousel | Photos and videos in chronological order. |
| Tap left/right | Move through media like a story viewer. |
| Node title | Editable in edit mode, read-only in view mode. |
| Date/location | Always visible or quickly recoverable. |
| Description | Shows node blog and optional media caption. |
| Voice note | Playable waveform/player. |
| Map context | Map remains behind or is recoverable by closing panel. |

This should feel like reliving a place, not consuming a social story. Instagram can inspire the interaction speed, but the content should remain trip-memory-first.

### Story Navigation

Users should be able to move through a trip in three ways:

| Navigation | User Intent |
| --- | --- |
| Tap pins | Explore spatially. |
| Timeline scrubber | Relive chronologically. |
| Story left/right tap | Move media-by-media inside the active node. |

Do not force the user into only one navigation style. Map people and story people should both feel supported.

## MVP Editing Scope

The minimum editing suite that is worth building:

| Priority | Feature | Reason |
| --- | --- | --- |
| P0 | Rename node | Fixes ugly auto names. |
| P0 | Node blog entry | Makes the memory personal. |
| P0 | Missing GPS inbox | Prevents uncertainty from blocking the map. |
| P0 | Move media to existing node | Fixes common reconstruction mistakes. |
| P1 | Merge adjacent nodes | Fixes over-splitting. |
| P1 | Split node | Fixes over-grouping. |
| P1 | Voice note | Major emotional differentiator. |
| P1 | Transport icon | Adds route meaning cheaply. |
| P2 | Reorder days | Useful but less frequent. |
| P2 | Per-media descriptions | Valuable, but node blog should come first. |
| P2 | Trip/day covers | Presentation polish. |

If build time is limited, protect P0 first. A reconstructed map with ugly place names and no correction path will feel brittle.

## Competitive Implications Against Polarsteps

### Where Polarsteps Is Strong

| Strength | Why It Matters |
| --- | --- |
| Step-based storytelling | Users understand a trip as a sequence of places. |
| Route map output | The map makes travel feel concrete. |
| Book conversion | A curated trip naturally becomes a physical keepsake. |
| Sharing | A finished trip can be shown to others. |

### Where Wanderable Can Win

| Wanderable Advantage | Product Requirement |
| --- | --- |
| No need to remember tracking | Reconstruction must create a good first draft. |
| Uses photos users already took | Import and clustering must feel magical. |
| Lower writing burden | Voice notes and media-first stories reduce typing. |
| Faster emotional output | Map view must be valuable before editing. |
| Better recovery of old trips | Historical camera roll import creates instant inventory. |

### Trap To Avoid

Do not compete by copying Polarsteps' travel diary workflow. Compete by making the first draft automatic and the editing delightful.

The user should feel: `I did not build this trip. Wanderable found it, and I made it mine.`

## Business Domains

These domains should stay conceptually separate even if the early code keeps them simple.

| Domain | Owns | Does Not Own |
| --- | --- | --- |
| Media Import | Photo/video access, metadata extraction, source sync | Story editing decisions |
| Reconstruction | Clustering, sequencing, reverse geocoding | User-authored story content |
| Editing Suite | Node corrections, media movement, text, voice, covers | Public sharing infrastructure |
| Missing Location | Unplaced media inbox, pinning, skip state | Blocking import or map access |
| Story View | Map presentation, node playback, timeline navigation | Raw EXIF processing |
| Route Segment | Node-to-node connection and transport icon | Node location identity |
| Publishing | Public URL, share visibility, Instagram export | Reconstruction algorithms |
| Monetization | Print, NFC, Pro unlocks | Core editing correctness |
| Privacy | Permissions, local/private state, publish consent | Visual storytelling details |

## User Stories For Editing

| User Story | Acceptance Criteria |
| --- | --- |
| As a user, I can rename a reconstructed node so the map uses my own memory language. | Rename is inline, persists, and updates the map card/story view. |
| As a user, I can write a blog entry for a node so the stop has emotional context. | Entry saves to the node and appears in compact and immersive story views. |
| As a user, I can add a description to one photo or video so a specific moment has context. | Caption stays tied to that media item and appears when that item is active. |
| As a user, I can record a voice note for a node so I do not need to type everything. | Audio is playable in edit/view mode and can optionally be transcribed. |
| As a user, I can merge adjacent nodes so one real event is not split into pieces. | Media is combined in timestamp order and route segments reconnect. |
| As a user, I can split a node so different places are not mixed together. | Selected media moves to a new or existing node with one confirmed location. |
| As a user, I can drag media between nodes so the reconstructed story is accurate. | Media moves, target node re-sorts by timestamp, and source node updates. |
| As a user, I can place missing-GPS media or ignore it so unlocated photos do not block me. | Missing media can be assigned, pinned, or skipped. Skipped media does not show publicly. |
| As a user, I can choose transport icons between nodes so the route feels more like a journey. | Segment supports car, bike, walk, fly, and none. |

## User Stories For View Stories

| User Story | Acceptance Criteria |
| --- | --- |
| As a user, I can tap a map pin and see that node's story card. | Map stays visible and the active node card shows media, title, time, and text. |
| As a user, I can expand a node into a full story panel. | Media becomes the focus, while location/date/story details remain available. |
| As a user, I can swipe or tap through photos and videos in time order. | Media order follows timestamp ascending and captions follow the active item. |
| As a user, I can play a voice note while viewing a node. | Player is visible when audio exists and does not block visual browsing. |
| As a user, I can scrub the timeline and watch the map follow the trip. | Active node changes as the scrubber moves and map pans to the node. |

## Product Decisions To Lock

| Question | Recommended Decision |
| --- | --- |
| Is the node a place or a collection? | A node is one place-based memory with many media items. |
| Can one node have multiple locations? | No. Split the node instead. |
| Can media have captions? | Yes, but node blog is the main writing surface. |
| Do missing-GPS photos appear by default? | No. They only appear after assignment or pinning. |
| Is transport stored on nodes? | No. Transport belongs to route segments between nodes. |
| Is the story view an Instagram clone? | No. It can borrow tap-through behavior, but it must preserve map/trip context. |

## Recommended Next Product Cut

Build the editing suite around four screens/states:

| State | Purpose |
| --- | --- |
| Map view with active node card | Emotional browsing and entry point to edit/share. |
| Node edit sheet | Rename, blog, voice, move media, cover, transport. |
| Split/merge workspace | Fix clustering mistakes with drag and selection. |
| Missing location inbox | Resolve or skip photos/videos without GPS. |

This keeps the product focused on the loop: reconstructed map first, editing second, story output always visible.
