# Aircraft imagery provenance

All aircraft images in this folder are AI-generated renders of a fictional airline livery (Aurora Airlines),
created with Figma AI image generation (model: gpt-image-2.5-sunburst) on 14 Oct 2026.
Source file: https://www.figma.com/design/dQYo99GjdzRvSUm83JYJZn (nodes 2:2, 4:2, 5:2, 6:2, 7:2, 8:2).

Shared livery description used in every prompt: next-generation twin-engine widebody (A350-1000-like proportions),
glossy ice-white fuselage, "AURORA" wordmark in widely spaced midnight-navy capitals on the forward upper fuselage,
midnight-navy engine nacelles, thin teal line along the lower fuselage, tail fin with a vertical teal-to-violet gradient,
registration 9V-AUR.

| File | Figma node | Scene |
|---|---|---|
| aircraft-day.webp | 66:2 | Hero, daylight: high three-quarter top view banking over a sunlit ocean, wordmark centred above the windows (replaces all earlier hero renders) |
| aircraft-night.webp | 66:2 (graded) | Night hero: the day render with a day-for-night grade (cool moonlit tone, darkened ocean, vignette), tail fin kept in its brand colours |
| aircraft-side.webp | 30:2 | Side profile above bright white clouds, clear blue sky (replaces 5:2, golden hour) |
| aircraft-engine.webp | 35:2 | Engine and winglet in flight, luminous blue sky, portrait 960 × 1280 (replaces 6:2) |
| aircraft-tail.webp | 36:2 | Tail fin against a luminous blue sky, portrait 960 × 1280 (replaces 7:2 and 31:2) |
| aircraft-day-portrait.webp | 68:2 | Hero for portrait screens, daylight: same top view, aircraft in the lower half |
| aircraft-night-portrait.webp | 68:2 (graded) | Night hero for portrait screens: the day portrait with the same grade |

## Destination and cabin imagery

Generated with the same model (gpt-image-2.5-sunburst) on 14 Oct 2026 in the same Figma file.

Destinations share one art direction so they sit with the brand: bright clear daylight in a strictly blue and white
palette (snow, white architecture, white cloud, blue water and sky), no warm oranges or reds, no people or signage.
Cabins and aircraft share the same luminous blue daylight: blinds up, bright blue sky and white cloud in the
windows, midnight-navy seats, light-grey headrests, white bedding.

Every image is exported at the model's full native resolution (1536 × 864, or 1024 × 1024 for the square aircraft
plates) as WebP quality 90, with a light grade only: contrast 0.94, saturation 0.95 and a gentle unsharp mask.
No softening or grain, so detail survives on large and high-density screens.

| File | Figma node | Scene |
|---|---|---|
| dest-reykjavik.webp | 23:2 | Hallgrímskirkja above snowy rooftops, blue bay and mountains |
| dest-tokyo.webp | 24:2 | Tokyo Bay skyline with snow-capped Mount Fuji |
| dest-lisbon.webp | 22:2 | Alfama street of white façades and blue azulejo tiles, the Tagus beyond |
| dest-queenstown.webp | 25:2 | Snowy Remarkables reflected in Lake Wakatipu |
| dest-kyoto.webp | 26:2 | Zen temple garden after fresh snow |
| dest-capetown.webp | 27:2 | Table Mountain under its cloud tablecloth, from a white beach |
| dest-newyork.webp | 28:2 | Midtown skyline over Central Park in snow |
| dest-sydney.webp | 29:2 | Opera House sails and a ferry on the blue harbour |
| cabin-suite.webp | 32:2 | Business suite made up as a bed, daylight cabin |
| cabin-premium.webp | 33:2 | Premium Economy recliners with calf rests, daylight cabin |
| cabin-economy.webp | 34:2 | Economy 3-3-3 row with seatback screens, daylight cabin |

Earlier nodes 5:2, 7:2 and 9:2 to 21:2 (golden-hour and dusk aircraft, dusk and autumn destinations, night cabins) are superseded.

Unused hero angle studies in the same file: 45:2 (front three-quarter) and 46:2 (high top-down bank).

| hero-clouds-day.webp | 66:2 (crop) | Bottom 40% of the day hero, pinned to the bottom of the hero so the cloud bed stays in view |
| hero-clouds-night.webp | 67:2 (crop) | Bottom 40% of the night hero, same use |

Hero images (aircraft-day, aircraft-night and their portrait versions, hero-clouds-*) skip the grade and sharpening: they are
upscaled from the source with Lanczos (2560 px wide, 1296 px for portraits) and saved as WebP quality 92 to 94, because the
hero shows them larger than their native size and sharpening made the white paint look dirty.
They are also lifted for a brighter aircraft: gamma 0.92 and brightness 1.03 for day, gamma 0.78 and brightness 1.08 for night.

## Page backgrounds

| File | Figma node | Scene |
|---|---|---|
| bg-destinations.webp | 57:2 | The Earth's curve from high altitude, cobalt sky over a sea of cloud |
| bg-book.webp | 58:2 | Aircraft window looking out at a wing above white cloud |
| bg-manage.webp | 59:2 | Bright departure lounge with an aircraft at the gate |
| bg-status.webp | 60:2 | Runway at blue hour with an aircraft lifting off |

| hero-cloudsea-day.webp | 66:2 (crop) | The day cloud band followed by its mirror image, so it tiles seamlessly as the flowing cloud sea |
| hero-cloudsea-night.webp | 66:2 (crop, graded) | The day cloud sea with the same night grade, transparency kept |
| bg-checkin.webp | 70:2 | Boarding gate at dawn, a jet bridge at the open door of an Aurora aircraft |
| bg-miles.webp | 71:2 | Aurora lounge at the Singapore hub, an aircraft at the gate beyond the windows |
| bg-about.webp | 72:2 | 9V-AUR on a wet apron at blue hour, Singapore skyline and a faint aurora behind |
| bg-access.webp | 73:2 | Level glass jet bridge to an open aircraft door, an aisle wheelchair ready |
| bg-baggage.webp | 74:2 | Navy and white suitcases in a bright terminal, an Aurora aircraft beyond |
| bg-fares.webp | 75:2 | Passport, boarding pass and map on a blue desk by a window |
| bg-contact.webp | 76:2 | Airport service desk with a headset and tablet, aircraft at the gate |
