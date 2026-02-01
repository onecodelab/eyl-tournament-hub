# Data Integrity & Authority Implementation - COMPLETED

## Implementation Status

### ✅ Phase 1: Database Functions & Triggers (DONE)
- Created `get_player_goal_count()` function
- Created `get_player_assist_count()` function  
- Created `get_player_appearances()` function
- Created `get_player_stats()` combined function
- Created `sync_player_stats_on_match_complete()` trigger
- Reset all player stats to 0
- Reset all team stats to 0
- Deleted legacy completed matches without reports

### ✅ Phase 2: Restrict Admin Authority (DONE)
- Removed "Completed" and "Live" status options from AdminMatches.tsx
- Removed "Completed" and "Live" status options from THOMatches.tsx
- Admins can only set: "Scheduled" or "Postponed"
- Added note explaining referees control match lifecycle

### ✅ Phase 3: Remove Manual Player Stat Editing (DONE)
- Removed Goals, Assists, Appearances inputs from AdminPlayers.tsx
- Removed stat fields from player form schema
- Stats now display as read-only (calculated from match data)

### ✅ Phase 4: Update Statistics Display (DONE)
- Created usePlayerStats.ts hook with:
  - `usePlayerStats()` - get single player stats via RPC
  - `useTopScorers()` - leaderboard from match events
  - `useTopAssisters()` - leaderboard from match events  
  - `useTopAppearances()` - leaderboard from lineups
- Updated Statistics.tsx to use real calculated data
- Added info banner explaining stats source
- Updated PlayerDetail.tsx with stats calculation note

---

## Authority Model Summary

| Role | Can Do | Cannot Do |
|------|--------|-----------|
| **Admin/THO Admin** | Create matches (scheduled/postponed), Assign referees, Set venue/date | Set matches to Live/Completed, Edit scores, Edit player stats |
| **Referee** | Start match (→ live), Log events (goals/cards/subs), End match (→ completed), Submit report | Create matches, Edit stats directly |

## Data Flow

```
Referee logs goal → match_events table
Referee ends match → match status = "completed"
Database trigger → Updates players table (goals, assists, appearances)
Database trigger → Updates teams table (wins, draws, losses, points)
```

## Files Modified

- `src/pages/admin/AdminMatches.tsx` - Restricted status options
- `src/pages/admin/AdminPlayers.tsx` - Removed stat editing
- `src/pages/tho-admin/THOMatches.tsx` - Restricted status options
- `src/pages/PlayerDetail.tsx` - Added stats note
- `src/pages/Statistics.tsx` - Now uses real calculated data
- `src/hooks/usePlayerStats.ts` - New hook for calculated stats
- `src/lib/schemas.ts` - Removed stat fields from validation
- Database migration - Added functions and triggers
