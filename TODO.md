# WePickle TODO

## Recently completed

- [x] Simplified login to password-based auth only.
- [x] Wiped database to reset state during auth transition.
- [x] Established design-token single source of truth (`lib/theme.ts` -> `tailwind.config.js`).
- [x] Redesigned login screen as the first brand "hero" proof.
- [x] Upgraded `StyledButton` (added `brand` variant + loading) and `StyledInput` (theme-aware, show/hide).
- [x] Replaced the old lime "green holes" background with a dark premium gradient + glow backdrop.
- [x] Rebuilt global glass surfaces (`GlassContainer`) to remove milky/light overlays across cards.
- [x] Updated header shell to a darker high-contrast surface and removed the unwanted light border.
- [x] Updated tab bar styling to match the new dark Volt brand direction.
- [x] Tuned skill profile card surface to match the new dark card treatment.

## Brand: "Court-Ready" (decided)

- **Volt** = signature pickleball lime-green; primary CTAs / highlights / brand moments.
- **Ink** = green-tinted near-black; text + structure + dark surfaces.
- **Amber (`competition`)** = reserved ONLY for ladder / tournament / ranking, so competition always reads as distinct.
- **Neutrals**: warm paper (light) / green-charcoal (dark). Both modes are first-class.
- **Shape/feel**: generous rounded cards (`rounded-[28px]`/`2xl`), soft depth, lots of breathing room, clean gradients instead of the old busy dot pattern.
- **Tokens**: use semantic classes only (`bg-background`, `text-foreground`, `bg-brand`, `bg-surface`, `border-border`, `bg-competition`). Avoid raw `slate-*`/`lime-*` going forward.

## Information architecture (decided)

- **Tab bar (4):** Court · Coach's Corner · Compete · Profile.
- **Court** (default home): live roster, scheduling, geofence auto check-in, court chat. The social hub.
- **Coach's Corner**: drills, skills graph, training progress.
- **Compete**: teams, rolling tournament, leaderboard/rankings (amber `competition` UI). In the bar from day one even while flows are built out.
- **Profile**: you, settings, other players, Builder (feature voting) as a sub-section.
- **Player chat (DMs)**: cross-cutting inbox, not a tab. Entry from Court roster + player profiles (header inbox icon).

### Courts model (decided): multi-court

- **Seed multiple courts** (Queen Elizabeth + Jericho Beach to start).
- **Court tab** lets you browse courts and **set a home court**; defaults to home court.
- Each court has its own roster, wall, planned visits, status.
- Geofence picks/suggests nearest court (ties into auto check-in).
- Watch the low-usage risk: presence fragments across courts — keep home-court default strong so users land somewhere active.

### Design principles (decided)

- **Court presence is the spine.** Compete and Chat hang off who's-here, not as standalone silos.
- **Court answers "should I go now?" in <2s**: live count + faces + upcoming visits above the fold, not a button menu.
- **Court empty state (nobody checked in):** show upcoming planned visits + one-tap "I'm headed there, notify regulars" (A+B). Never a bare empty roster.
- **Chat is presence-driven**: "message who's here now" over a generic DM list.
- **Compete needs a cold-start plan** (see Phase 6) so the tab is never a ghost town.

## Next up: Massive UI overhaul

### Phase 1: Foundation (design system)

- [x] Define color tokens (Volt / Ink / Amber / neutrals) wired through CSS vars.
- [x] Wire `tailwind.config.js` to consume the variables (theme-aware + opacity modifiers).
- [ ] Define typography scale + add a custom display font (e.g. Space Grotesk / Clash).
- [ ] Finish reusable primitives: `Card`, `Badge`, `Avatar`, `Chip`, `SectionHeader`, `EmptyState`.
- [ ] Standardize layout patterns (screen padding, headers, empty/loading states).
- [ ] Add a style-guide preview screen for fast visual QA of tokens + primitives.

### Phase 2: Navigation and app shell refresh

- [x] Redesign tab bar and top headers for a cleaner information hierarchy.
- [x] Update background, glass, and container treatments for consistent depth.
- [x] Tab bar IA: Court · Coach · Compete · Profile (Builder hidden under Profile).
- [ ] Improve safe-area handling and responsive behavior across iOS/Android/Web.
- [ ] Unify icon usage and sizing across all major screens.

### Phase 3: Coach's Corner (AI coach = engagement engine)

**Reframe (decided): Coach is NOT a drill library — it's the proactive AI layer that feeds the Court spine.**

- The coach's recurring "playing this week?" push = the demand-generation / ping-the-regulars mechanism for Court's empty-state problem. Loop: coach pings -> user says yes -> planned visit on Court -> alerts others -> court feels alive.
- **Coach's four jobs:**
  1. **Onboarding interview** -> builds skills profile conversationally (replaces dull self-rating).
  2. **Recurring check-ins** (push) -> "playing this week?" / "how'd it go?" -> feeds planned visits + presence, keeps profile fresh.
  3. **Drill recommendations** -> next-best drill from the profile.
  4. **Partner recommendations** -> "who to play with next."
- **Skills profile ownership (decided: B — AI proposes, user confirms).** Coach interviews, proposes per-skill levels + overall ("~3.5 at dinking"), user accepts/adjusts. Profile is a structured object the user owns; the rest of the app (graph, drill recs, matchmaking) reads it. Avoids rejection of an AI-assigned rating in a rating-is-identity community.
- **Partner rec engine (decided: heuristic, NOT ML).** Weighted scorer over data already collected: rating proximity + court/time (presence) overlap + past play + availability. Coach narrates the top picks ("Sarah's your level and plays Jericho evenings — ping her?"). Ties partner recs -> DMs -> presence. Scope as a ranked query, not a recommender system.

**Entry UX:** proactive prompt ("hey, I'm talking to you") that opens the coach conversation.

**Tasks:**

- [x] LLM wiring (Convex action + AI SDK) for coach conversation.
- [x] Structured skills-profile object + storage; coach proposes / user confirms.
- [x] Onboarding interview flow + proactive entry prompt on Court tab.
- [ ] Recurring push check-ins ("playing this week?") -> create planned visit -> notify others.
- [ ] Drill recommendations from profile.
- [ ] Partner recommendation heuristic + coach narration.
- [ ] Redesign drills list / detail (drills still accessible from Coach tab post-onboarding).
- [~] Improve skills graph readability and profile storytelling. (in progress)

### Phase 4: Community-first surfaces (Court hub)

- [x] Seed Queen Elizabeth + Jericho Beach courts (seeder exists — run `courts:seedInitialCourt` once).
- [x] Court browser + set home court (defaults to home court).
- [x] Redesign Court tab: hero roster counts, empty-state actions, coach prompt banner.
- [x] Geofence auto check-in (foreground/background choice in Profile; `expo-location` hook).
- [x] "I'm headed there — notify regulars" + push on planned visits.
- [x] Ghost mode + arrive privately (Profile toggle + per-session eye icon on check-in).
- [ ] Expand scheduling UX (calendar feel, reminders).
- [ ] Refresh court chat → ephemeral court wall.
- [ ] Add stronger profile presentation for other users (skills snapshot + activity).
- [ ] Rework notifications and badges for better clarity and less noise.

**Geofence auto check-in model (decided):**

- **User chooses the mode explicitly**, framed in plain language (not a raw OS permission dump):
  - "Only when the app is open" -> foreground location, While-Using permission.
  - "Even when it's in my pocket" -> background geofence, Always-Allow permission.
- Make the *why* explicit before the OS prompt: explain that it auto-checks you in at the court so friends can see you're there.
- Manual check-in/out always available; presence auto-expires (existing 2-hour expiry).
- **Visibility (decided): roster visible to everyone at the court, friends highlighted.** Maximize the "is anyone playing?" signal; do NOT default to friends-only (kills signal at low usage).
- **Hide controls (two entry points, same mechanic):**
  - Persistent: **"Ghost mode"** setting — toggle "Appear at the court" (on by default), subtext "Others can see you're here. Turn off to stay hidden."
  - Per-session: **"Arrive privately"** on the check-in card — counts you in for your own view/standings but hides you from the roster this session.

### Phase 5: Player chat & social graph

**Chat model (decided): chat is mostly logistics, not conversation. Two surfaces only.**

- **Court wall (ephemeral, presence-driven):** the workhorse. Public per-court feed for "who's in at 6?", court conditions, "need a 4th". Lives on Court.
  - Messages auto-expire — longer than check-ins (~end-of-day / 8-12h) so morning posts still help the evening crowd.
  - NO per-message timers (not Snapchat-style); readable whenever the user opens the app.
  - Prefer tying expiry to the relevant event (e.g. a "coming at 6" post lives until 6 passes) over a flat TTL. OPEN: flat TTL vs tied-to-event — implement flat first, refine if needed.
  - Ephemeral = zero moderation/history burden + always-current wall.
- **Direct DMs (persistent):** thin 1:1 only, fired from profile / roster ("Message" CTA). The relationship glue ("you around Saturday?"). No group DMs initially. Do NOT make these disappear.
- **Kill the silos:** fold/remove `trainingChats` and `builderChats` — likely aspirational/dead. Consolidate toward court wall + DMs (+ team chat later in Phase 6).
- [ ] Build ephemeral court wall on Court tab.
- [ ] Build persistent 1:1 DMs (entry from profile + roster).
- [ ] Remove/migrate training + builder chat surfaces.

### Phase 6: Teams & rolling tournament

**Rolling tournament model (decided):**

- **Enrollment:** auto-enroll everyone who plays onto a rolling ladder (standings never empty) + active hook is "challenge a player checked in at the court right now."
- **Two ladders:** Doubles (team vs team) + Singles (individual vs individual). Separate ratings for each.
- **Team rating (doubles):** each 2-person team has its own score-weighted Elo (DUPR-style). Seeded from avg of members' individual ratings on creation. Marked "provisional" until 3 matches played.
- **Individual rating (singles):** score-weighted Elo, also drives skills profile + partner recs.
- **Teams = persistent named 2-person partnerships.** A player can be on unlimited teams (plays with different partners). Teams are browsable + challengeable at your court. Do NOT conflate with ad-hoc doubles partner of the day.
- **No team required to play.** You can challenge/report any 4 players ad-hoc; ratings still update individually. Teams are opt-in identity layer on top.

**Compete tab IA (decided):**

```
Compete
├── Ladder (top control)
│   ├── Doubles · Singles (inner pill toggle)
│   │   Row: rank + avatars + name + rating + W/L + Challenge button
│   │   Tap row → profile/[id] + Match History section + Challenge CTA
│   └── Upcoming matches strip (1–3 cards at top, before ladder)
└── Teams (top control)
    ├── My Teams — your partnerships, W/L, avg rating, team chat entry
    └── Browse — all teams at your home court, challengeable
```

- **Leaderboard scope:** home court by default, "All Courts" toggle. Per-court tournaments feel independent; global individual rating is just filtered by court — no separate ladders.
- **First-time empty state:** unranked entry card ("Play a match to get ranked") + "Find a Partner / Create Team" CTA.

**Challenge flow (decided):**

- Entry points: Court roster tap OR Compete ladder/team row tap (both).
- Bottom sheet: pick your partner (or play solo) + pick opponents + format (first to 11 etc.).
- No team required — all 4 players can be picked ad-hoc on the spot.

**Match reporting (decided):**

- ~2h after challenge accepted → push notification + in-app prompt ("How'd it go?").
- Simple score sheet: your score / their score → submit.
- Ratings update only after opponent confirms (auto-confirm after 24h if no response).
- Manual "Log a match" entry also available from Compete for untracked games.

**Scheduling (decided):**

- Scheduled match = distinct from planned court visit, but auto-creates a planned visit for all participants.
- No dedicated calendar page (v1). Surfaces as: "Upcoming" horizontal strip at top of Compete Ladder + planned visit card on Court tab.

**Post-match coach debrief (decided):**

- After match confirmed, amber banner appears on Compete (and Court): "Debrief ready — your coach wants to hear about the game."
- Tap → Coach tab opens with match context pre-loaded ("You beat The Dink Tanks 11–7. Tell me what clicked.").
- Coach extracts qualitative insight (shots missed, what landed) → updates skills profile.
- Triggers for both teams immediately on report/confirmation respectively.

**Tasks:**

- [ ] Schema: `teams`, `teamMemberships`, `matches` (participants, scores, format, courtId), `individualRatings`, `teamRatings`, `challenges`, `scheduledMatches`.
- [ ] Convex mutations: create team + invite, accept invite, leave team.
- [ ] Convex mutations: issue challenge, accept/decline challenge, report score, confirm score.
- [ ] Rating update logic: score-weighted Elo for both individual (singles) and team (doubles). Run on score confirmation.
- [ ] Compete tab: Ladder | Teams top control + Doubles · Singles inner toggle.
- [ ] Ladder screen: upcoming strip + ranked list rows + home/all courts toggle.
- [ ] Teams screen: My Teams list + Browse (court-scoped).
- [ ] Challenge bottom sheet (from Court roster + from Compete).
- [ ] Match report screen / score sheet.
- [ ] Scheduled match creation + auto planned visit.
- [ ] Post-match debrief banner → Coach tab with match context.
- [ ] Match History section on `profile/[id]` + rating trend.
- [ ] Team-scoped chat channel (reuse DM or court chat infrastructure).

### Phase 7: Quality and rollout

- [ ] Run visual QA pass on all authenticated tabs + key detail screens.
- [ ] Verify accessibility basics (color contrast, touch targets, text scaling).
- [ ] Remove dead UI patterns/components replaced by new system.
- [ ] Create follow-up polish backlog from testing feedback.

## Backlog (post-overhaul)

> AI coach interview, skills profile, and partner matching are now CORE (Phase 3), not backlog.

- [ ] Friend system and regular-partner shortcuts.
- [ ] Player challenges (challenge another player to a match) — overlaps Compete challenge flow.
- [ ] Group DMs (only if 1:1 proves insufficient).
- [ ] Demote Builder tab to Profile sub-section (already decided in IA; track the actual move here).

## Working rhythm

- [ ] Tackle one phase per session.
- [ ] Keep each PR scoped to one vertical slice or one design-system chunk.
- [ ] Validate on iOS + Android before merging major UI batches.
