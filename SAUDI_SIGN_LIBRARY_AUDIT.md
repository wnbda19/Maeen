> Phase 3B follow-up: Public JSON and MP4 routes, all 25 durations/dimensions, and manual preview framing have now been inspected. See SAUDI_LIBRARY_POC_INGESTION_REPORT.md for current findings. This earlier investigation is preserved; no media-copying/training rights have been confirmed.

# Saudi Sign Language Library audit

Checked 2026-10-21. **Primary research candidate; permission NOT CONFIRMED. No media corpus acquired, scraped, saved, landmarked or trained on.** Inspection was limited to public pages, a bounded 25-record shortlist and metadata already loaded by the normal web player. Browser-managed playback/cache is not a licensed dataset export. No media source URLs were enumerated or API routes probed.

## Ownership and size

[Library](https://sshi.sa/) identifies itself as an Association platform; [Association](https://shi.org.sa/) corroborates the library and displays the same count. Current published total: **8,818 terms, 36 categories**. This is a verified displayed count, not an independently deduplicated inventory or 8,818 distinct lexical classes. Alphabet, numbers, multiword phrases, synonyms and duplicate titles are included. Footer reserves rights to the Saudi Hearing Disability Association (الجمعية السعودية للإعاقة السمعية), license 205. Ownership of every underlying performer/right is not independently established.

## Public access and metadata

| Question | Observation / limit |
|---|---|
| Access | JavaScript public website, search, paginated categories and stable `/category/<categoryId>/<termId>` records; linked mobile apps |
| Term fields | Arabic title, numeric term/category IDs, category, English gloss on inspected records, optional definition/illustration, views, likes and share permalink; search exposes title variants/synonyms |
| Number of videos | One primary sign player per inspected record; three learning snapshots explicitly come from that same clip. Related-term preview players are not extra independent takes. Total clips per lexical concept and alternate recordings remain unknown |
| Duplicate concepts | نعم 972/11568; أريد 5078/88; طبيب 9533/12594; أين 8425/8426. Different record IDs do not establish different performers, recordings or variants |
| Download | Public player streams media. No video-download control observed on inspected record. QR/card downloads concern links/print materials. Neither technical stream-only protection nor an authorized download facility is established |
| Sign unit | Records include isolated terms **and full phrases** (e.g. لحظة من فضلك). Do not label every record an isolated single word |
| Duration/resolution | Browser-loaded sample شكراً #5018: **3.72s, 1920×1080**; إعاقة سمعية #5469: **3.84s, 1920×1080**. No all-library distribution measured. Unloaded metadata is unknown, not zero |
| Visual capture | Those two visible sample frames show an adult presenter, face and upper body, with hand(s) visible against a light branded background. Full-motion hand clipping/occlusion, handedness and motion class are unreviewed; frame visibility does not prove sequence QC |
| Signer metadata | No stable signer/person ID or session ID exposed in inspected term UI; no roster/repetition information found |
| Multiple signers | Not established by this limited inspection. Similar presentation across samples suggests potential performer/session reuse, but no identity inference or verified same-person mapping is claimed |
| Sentence data | [Sentences](https://sshi.sa/sentences) offers situation packs and a builder that sequences existing signs; missing words may be fingerspelled. Its explanatory text says ordering is approximate for learning. This is not evidence of separately recorded natural continuous sentence clips or independent samples |
| Learning | [Learning route](https://sshi.sa/education), alphabet/number sections, speed/loop/mirror controls and start/movement/end snapshots exist. Learning assets are not extra training repetitions |
| API | No documented public developer API, dataset endpoint, authentication policy, rate limit or dataset export license found in inspected official pages/search. Internal site requests may exist; none was guessed, reverse-engineered or called |
| Structured access | Browser-rendered labels/links are readable; this does not grant bulk machine access. Request an official metadata export/API and explicit permission first |

Evidence: [bounded inspection notes](docs/phase3/official-library-records.json). No original video, extracted frame, biometric embedding or landmark file is included there. Unknown fields are deliberately retained.

## Published policies and permission matrix

- [Rules](https://sshi.sa/rules): despite the footer's usage-rules label, the page concerns interpreter competence/professional ethics. It does not grant dataset or ML rights.
- [Privacy](https://sshi.sa/privacy): general lawful-use, confidentiality and non-interference conditions. Lawful personal/commercial use language is **not an explicit license** to copy the collection, derive landmarks, train or distribute weights.
- Copyright: library and Association footer reserve all rights. No Creative Commons/open-data grant found.
- Dataset, API, research-use and content-reuse policies: **not found in the inspected linked pages and official-domain search**. This is not proof none exists privately or elsewhere.

| Intended MAEEN act | Permission status |
|---|---|
| Programmatic access to videos/structured records | NOT CONFIRMED |
| Download/store video copies | NOT CONFIRMED |
| Extract/store hand, pose and facial landmarks | NOT CONFIRMED |
| Train/evaluate ML models | NOT CONFIRMED |
| Publish/distribute trained weights | NOT CONFIRMED |
| Competition demonstration | NOT CONFIRMED |
| Public web application deployment | NOT CONFIRMED |
| Future commercial model use | NOT CONFIRMED; requires separate explicit scope |

These are project authorization findings, not a legal determination of every statutory exception. **Do not train.** Written permission must define asset IDs, access method, permitted transformations, performer/privacy rights, model distribution, attribution, territory/duration, retention/revocation and commercialization. See [Arabic request](PERMISSION_REQUEST_AR.md) and [split feasibility](DATA_SPLIT_FEASIBILITY.md).

## Decision

Primary candidate for Saudi linguistic relevance and official provenance; **not yet an authorized or scientifically sufficient training dataset**. First-party recording is paused, with all prior infrastructure preserved. The app remains unavailable for word recognition. Next action is a reviewed written grant and provider metadata, followed by licensed-corpus acceptance, not a downloader or training run.
