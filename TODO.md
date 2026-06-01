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
- [ ] Improve safe-area handling and responsive behavior across iOS/Android/Web.
- [ ] Unify icon usage and sizing across all major screens.

### Phase 3: Skills + drills -> Coach's Corner

- [ ] Rename/reframe skills area as "Coach's Corner".
- [ ] Redesign drills list, drill cards, and drill detail hierarchy.
- [~] Improve skills graph readability and profile storytelling. (in progress: card surface + contrast pass done)
- [ ] Add clearer progress states (beginner/intermediate/advanced, milestones, next best drill).
- [ ] Improve creation flows for drills/features with cleaner forms.

### Phase 4: Community-first surfaces

- [ ] Refresh court chats and training/builder chat screens with modern message UI.
- [ ] Add stronger profile presentation for other users (skills snapshot + activity).
- [ ] Design placeholders for future scheduling and team features.
- [ ] Rework notifications and badges for better clarity and less noise.

### Phase 5: Quality and rollout

- [ ] Run visual QA pass on all authenticated tabs + key detail screens.
- [ ] Verify accessibility basics (color contrast, touch targets, text scaling).
- [ ] Remove dead UI patterns/components replaced by new system.
- [ ] Create follow-up polish backlog from testing feedback.

## Backlog (post-overhaul)

- [ ] Agent chat that interviews users to build skills profile.
- [ ] Inter-user chat + scheduling features.
- [ ] Team creation and team management UX.
- [ ] Continuous ladder ranking system UI + supporting flows.

## Working rhythm

- [ ] Tackle one phase per session.
- [ ] Keep each PR scoped to one vertical slice or one design-system chunk.
- [ ] Validate on iOS + Android before merging major UI batches.
