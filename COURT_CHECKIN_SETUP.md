# Court Check-in System - Setup Guide

## What Was Implemented

✅ Database schema with three new tables: `courts`, `checkIns`, `plannedVisits`
✅ Backend Convex functions for court management, check-ins, and planned visits
✅ Scheduled cron job for auto-checkout after 2 hours
✅ Custom time picker with 15-minute intervals
✅ Complete UI with check-in/out button, player lists, and time slots

## Initial Setup Steps

### 1. Deploy Schema Changes

The schema has been updated with three new tables. Convex will automatically apply these changes when you run your dev server or deploy.

### 2. Seed Initial Court Data

You need to run the seeder mutation once to create the "Jericho Beach" court:

**Option A: Via Convex Dashboard**
1. Open your Convex dashboard (https://dashboard.convex.dev)
2. Navigate to your project
3. Go to "Functions" 
4. Find `courts:seedInitialCourt`
5. Click "Run" (no arguments needed)

**Option B: Via Code (One-time)**
You can temporarily add this to your app initialization:
```typescript
// Run once then remove
const seed = useMutation(api.courts.seedInitialCourt);
// Call seed() on app mount
```

### 3. Test the Features

Once the court is seeded, you can:
- ✅ Click "I'm Here!" to check in
- ✅ See other checked-in players
- ✅ Click "Check Out" when done
- ✅ Click "Plan to Go Later" to schedule a visit
- ✅ See all planned visits grouped by time
- ✅ Delete your own planned visits

### 4. Verify Cron Job

The auto-checkout cron job runs every 5 minutes. You can verify it's working in the Convex dashboard under "Cron Jobs".

## Future Enhancements

To add more courts in the future:
1. Use the same `seedInitialCourt` pattern to create a mutation for new courts
2. Add UI to switch between courts (court selector dropdown)
3. The schema is already designed to support multiple courts

## Managing Court Notes

To update court notes (e.g., special events, maintenance):
```typescript
const updateNotes = useMutation(api.courts.updateNotes);

// Add a note
await updateNotes({ 
  courtId: court._id, 
  notes: "Tournament this Saturday! Courts reserved 2-5pm" 
});

// Remove a note
await updateNotes({ 
  courtId: court._id, 
  notes: undefined 
});
```

## Architecture Notes

- **Auto-checkout**: Handled by scheduled function, runs every 5 minutes
- **Time storage**: All timestamps in milliseconds (Date.now())
- **Check-in duration**: 2 hours (configurable in `checkIns.ts`)
- **Time slots**: 15-minute intervals for next 24 hours
- **Multi-court ready**: Schema supports multiple courts, just need UI for switching

