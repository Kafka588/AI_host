# Score & Team Management System Implementation

## Overview
Created a comprehensive team and score management system with separate database tables for teams and score transactions, allowing fine-grained control over user and team scores.

## New Database Tables

### 1. `teams` table
- `id`: UUID (primary key)
- `name`: TEXT (unique team name)
- `description`: TEXT (optional team description)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### 2. `score_transactions` table
Audit trail for all score changes (bonuses, penalties, team awards):
- `id`: UUID (primary key)
- `user_id`: UUID FK (references users.id)
- `team_id`: UUID FK (references teams.id, nullable)
- `amount`: INTEGER (positive or negative)
- `reason`: TEXT (description of the score change)
- `type`: TEXT ('user' or 'team')
- `created_at`: TIMESTAMP

**SQL to create tables is in [DATABASE_MIGRATION.md](DATABASE_MIGRATION.md)**

## New Features

### 1. Teams Management Page
**Route**: `/dashboard/admin/teams`
- Create new teams
- Edit team name/description
- Delete teams (only if no members)
- View team member count
- Add scores to entire teams (distributes equally to all members)
- View live team rankings with member counts

### 2. User Score Controls
**Updated Route**: `/dashboard/admin/users`
- Added "Score" column showing current user score
- New "Score" button per user to add/remove points
- Preview of new score before applying
- Reason required for audit trail
- Can use negative numbers to subtract points

### 3. Score Management API
**POST `/api/scores`** - Add scores to users or teams

**Add user score:**
```json
{
  "action": "add-user-score",
  "user_id": "uuid",
  "amount": 10,
  "reason": "Admin bonus for participation"
}
```

**Add team score:**
```json
{
  "action": "add-team-score",
  "team_id": "team_name",
  "amount": 50,
  "reason": "Team challenge completed"
}
```

When adding team score:
- Creates transaction record for the team
- Creates individual transaction for each team member
- Each member gets the full amount

**GET `/api/scores`** - Query transactions
```
GET /api/scores?user_id=uuid  // Get user's transaction history
GET /api/scores?team_id=uuid  // Get team's transaction history
```

### 4. Teams Management API
**GET/POST `/api/teams`**

```json
// Create team
{
  "action": "create",
  "name": "Team Alpha",
  "description": "Description here"
}

// Update team
{
  "action": "update",
  "id": "team_uuid",
  "name": "New Name",
  "description": "New description"
}

// Delete team
{
  "action": "delete",
  "id": "team_uuid"
}
```

### 5. Updated Leaderboard
**Route**: `/api/leaderboard`

Now includes:
- Score transactions (bonuses/penalties) in total score calculation
- Team member count in team rankings
- Dynamic calculation combining:
  - Task submission scores
  - Score transaction adjustments

Response example:
```json
{
  "princess": [
    {
      "id": "uuid",
      "name": "username",
      "sex": "female",
      "profile_pic_url": "...",
      "team": "Team Alpha",
      "score": 150
    }
  ],
  "prince": [...],
  "teams": [
    {
      "name": "Team Alpha",
      "score": 450,
      "memberCount": 3
    }
  ]
}
```

## How It Works

### Score Calculation
User's total score = Task completion points + Score transaction adjustments

**Example:**
- User completes 3 approved tasks (10, 15, 20 points) = 45 points
- Admin adds 10 point bonus = +10 points
- Admin removes 5 points for rule violation = -5 points
- **Final score = 45 + 10 - 5 = 50**

### Team Score Calculation
Team's total score = Sum of all members' individual scores

When admin adds 50 points to a team with 3 members:
- Each member gets +50 points individually
- Team score increases by 150 (50 × 3)
- Audit trail shows: 1 team transaction + 3 user transactions

## Admin Workflow

### Managing Individual User Scores
1. Go to `/dashboard/admin/users`
2. Click "Score" button next to user
3. Enter amount (positive or negative)
4. Enter reason for audit trail
5. Preview new score
6. Click "Add Score"

### Managing Team Scores
1. Go to `/dashboard/admin/teams`
2. Click "Add Score" button for team
3. Enter amount and reason
4. See which members will be affected
5. Click "Add Score"
6. All members get the bonus automatically

### Creating Teams
1. Go to `/dashboard/admin/teams`
2. Click "+ Create Team"
3. Enter team name and optional description
4. Team appears in leaderboard immediately

## Database Migration Steps

1. **Run SQL migrations** from [DATABASE_MIGRATION.md](DATABASE_MIGRATION.md)
   - Create `teams` table with indexes
   - Create `score_transactions` table with indexes
   - Ensure `users` table has `team` field

2. **No data loss** - Backward compatible
   - Existing user scores from tasks still work
   - Score transactions are added on top
   - Users field `team` used to link members to teams

3. **Optional: Migrate existing team data**
   - If you have team names in users.team field
   - Create corresponding team records
   - Update teams.name to match existing user team values

## Files Created/Modified

**New Files:**
- [app/api/scores/route.ts](app/api/scores/route.ts) - Score management API
- [app/api/teams/route.ts](app/api/teams/route.ts) - Teams management API
- [app/dashboard/admin/teams/page.tsx](app/dashboard/admin/teams/page.tsx) - Teams management page
- [DATABASE_MIGRATION.md](DATABASE_MIGRATION.md) - Migration instructions

**Modified Files:**
- [app/dashboard/admin/users/page.tsx](app/dashboard/admin/users/page.tsx) - Added score controls and display
- [app/api/leaderboard/route.ts](app/api/leaderboard/route.ts) - Updated to include score transactions and member counts

## Next Steps

1. **Run SQL migrations** to create tables
2. **Test teams page** - Create some test teams
3. **Test score management** - Add scores to users and teams
4. **Verify leaderboard** - Check that scores include transactions
5. **Add admin navigation** - Update admin sidebar to include Teams link

## Admin Navigation Update

Add this to your admin navigation menu:
```jsx
<Link href="/dashboard/admin/teams">Teams Management</Link>
```
