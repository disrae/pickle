# Builder Tab Feature

The Builder tab is a feature voting and discussion platform where users can propose, vote on, and discuss new features for the app.

## Features Implemented

### 1. Feature Voting System
- Users can vote for any feature by tapping the vote button
- Vote counts are displayed prominently on each feature card
- Users can toggle their vote on/off at any time
- Features are sorted by vote count (most popular first)

### 2. Feature Submission
- Any authenticated user can submit new feature ideas
- Required fields: title, description, category
- Categories: Gameplay, Social, Training, UI/UX, Other
- Features appear immediately after submission

### 3. Feature Management
- Feature creators can delete their own submissions
- Admin users can delete any feature
- Preset features (initial suggestions) cannot be deleted

### 4. Builder Chat System
- Global chat for discussing features and ideas
- Users can create multiple discussion threads
- Search functionality to find relevant conversations
- Real-time messaging with participant tracking

### 5. Preset Features
Six initial feature ideas are provided:
1. **Competitive Tournament Tab** - Ever-ending tournament system
2. **Player Matching by Skill Level** - Find partners that match your skill
3. **Skill Rating Self-Assessment** - Rate your own abilities
4. **Player Directory & Profiles** - Browse other players
5. **Friend System** - Connect with regular playing partners
6. **Player Challenges** - Challenge others to matches

## Database Schema

### Tables Added
- `featureRequests` - Stores feature proposals
- `featureVotes` - Tracks user votes
- `builderChats` - Chat discussions about features
- `builderChatMessages` - Messages in builder chats
- `builderChatParticipants` - Tracks chat participants

## Seeding Preset Features

To populate the initial 6 preset features, run this command in your Convex dashboard or CLI:

```bash
npx convex run seedFeatures:seedPresetFeatures
```

This will:
- Find the first admin user in the system
- Create 6 preset feature requests attributed to that admin
- Skip if preset features already exist (idempotent)

**Note:** Make sure at least one user has `isAdmin: true` in the database before running the seed command.

## Files Created

### Backend (Convex)
- `convex/featureRequests.ts` - Feature request API
- `convex/builderChats.ts` - Builder chat API
- `convex/builderChatMessages.ts` - Chat messages API
- `convex/seedFeatures.ts` - Seed script for preset features

### Frontend
- `app/(authenticated)/(tabs)/builder.tsx` - Main builder tab screen
- `app/(authenticated)/builder/chats.tsx` - Builder chat list
- `app/(authenticated)/builder/chats/[chatId].tsx` - Individual chat screen
- `components/ui/FeatureCard.tsx` - Feature display component

### Updated Files
- `convex/schema.ts` - Added 5 new tables
- `app/(authenticated)/(tabs)/_layout.tsx` - Added builder tab with hammer icon

## Usage

1. **Navigate to Builder Tab**: Tap the hammer icon in the bottom navigation
2. **Vote on Features**: Tap the vote button on any feature card
3. **Submit a Feature**: Scroll to bottom and tap "Suggest Your Own Feature"
4. **Discuss Features**: Tap the chat icon in the header to access builder discussions
5. **Delete Features**: Tap the trash icon (only visible on your own submissions or if admin)

## Future Enhancements

Potential improvements for consideration:
- Feature status tracking (Under Review, In Progress, Completed)
- Comments on individual features
- Feature categories/tags for better filtering
- Voting history and analytics
- Email notifications for highly voted features
- Admin dashboard for managing features

