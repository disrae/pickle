# Training & Drills Setup Guide

## Overview

The training tab has been successfully implemented with full drill management, progress tracking, and community chat features.

## Features Implemented

### 1. Database Schema
- **drills**: Store drill information with categories, difficulty, milestones, and metrics
- **drillProgress**: Track user progress on drills (completed milestones, personal bests, sessions)
- **trainingChats**: Community chats for training discussions
- **trainingChatMessages**: Messages in training chats
- **trainingChatParticipants**: Participants in training chats

### 2. Backend Functions (Convex)
- `convex/drills.ts`: List, get, create, and get popular drills
- `convex/drillProgress.ts`: Track user progress, complete milestones, update personal bests, get stats
- `convex/trainingChats.ts`: Manage training chats (list, get, create, search)
- `convex/trainingChatMessages.ts`: Send and list messages
- `convex/seedDrills.ts`: Seed official drills (15 pre-made drills)

### 3. UI Components
- `DrillCard`: Display drill with progress indicators
- `DrillDetailCard`: View drill details, complete milestones, log personal best
- `CreateDrillCard`: Create new user-submitted drills
- `TrainingFAB`: Floating action button with animation
- `BottomSheetCard`: Reusable bottom sheet with gesture handling

### 4. Screens
- `app/(authenticated)/(tabs)/training.tsx`: Main training screen with stats, filters, drill list
- `app/(authenticated)/training/chats.tsx`: Training chats list
- `app/(authenticated)/training/chats/[chatId].tsx`: Individual training chat

## How to Seed Official Drills

The database schema has been updated, but you need to seed the official drills. Here's how:

### Option 1: Via Convex Dashboard
1. Open your Convex dashboard
2. Go to the "Functions" tab
3. Find `seedDrills:seedOfficialDrills`
4. Run the mutation with empty args: `{}`
5. This will create 15 official drills across all categories

### Option 2: Via Code (One-time Script)
You can also call the seed function from your app once. Add this temporary code somewhere that runs once:

```typescript
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// In a component or effect
const seedDrills = useMutation(api.seedDrills.seedOfficialDrills);

// Call once
useEffect(() => {
  seedDrills().then(result => {
    console.log("Seeded drills:", result);
  });
}, []);
```

**Important**: Make sure you have at least one admin user in your database before seeding! The seed function requires an admin user to create official drills.

## Official Drills Included

### Serving (3 drills)
- Deep Serve Mastery
- Corner Target Serves
- Spin Serve Practice

### Drop Shot (2 drills)
- Kitchen Line Drops
- Third Shot Drop from Baseline

### Dinking (2 drills)
- Cross-Court Dinking Rally
- Dink and Move

### Reset (2 drills)
- Smash Reset from Baseline
- Block and Reset at Kitchen

### Volley (2 drills)
- Wall Volleys
- Rapid Fire Volleys

### Footwork (3 drills)
- Split-Step Practice
- Baseline to Kitchen Sprints
- Shadow Drills

## Drill Categories

- **Serving**: Serve practice and accuracy
- **Dinking**: Soft game at the kitchen line
- **Drop Shot**: Transition shots from mid-court or baseline
- **Reset**: Defensive shots to neutralize attacks
- **Volley**: Quick reflex shots
- **Footwork**: Movement and positioning

## Difficulty Levels

- **Beginner**: Basic fundamentals
- **Intermediate**: More challenging techniques
- **Advanced**: High-level skills
- **Expert**: Professional-level drills

## User Features

### For All Users
- Browse drills with category/difficulty filters
- Search drills by title or description
- View drill details with milestones and metrics
- Track personal progress on each drill
- Log personal bests
- Complete milestone checkboxes
- Create custom drills
- Participate in training chats

### Progress Tracking
- Weekly stats: drills completed, minutes practiced, sessions
- Per-drill progress: completed milestones, personal best
- Visual progress bars on drill cards

### Training Chats
- Create discussion chats about training
- Search and browse training chats
- Real-time messaging
- Participant tracking

## Navigation

- **Training Tab**: Main screen with stats, filters, and drill list
- **Chat Icon (Header)**: Navigate to training chats
- **FAB (Bottom Right)**: Create new drill
- **Drill Card**: Tap to open drill detail modal

## Next Steps

1. Seed the official drills (see above)
2. Test creating a custom drill
3. Test completing milestones and logging personal bests
4. Create a training chat
5. Invite users to share their favorite drills!

## Notes

- All user-submitted drills are visible immediately and show creator name
- Admin users can create "official" drills (marked with shield checkmark)
- Progress is tracked per-user per-drill
- Stats are calculated weekly (last 7 days)

