# Quick Setup Guide - Teams & Score Management

## Step 1: Database Migration (REQUIRED)

Open Supabase SQL editor and run these commands:

### Create Teams Table
```sql
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);
```

### Create Score Transactions Table
```sql
CREATE TABLE IF NOT EXISTS score_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('user', 'team')),
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_score_transactions_user_id ON score_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_score_transactions_team_id ON score_transactions(team_id);
CREATE INDEX IF NOT EXISTS idx_score_transactions_created_at ON score_transactions(created_at);
```

## Step 2: Test in Your App

### Start the dev server
```bash
npm run dev
```

### Navigate to Teams Management
- Go to: `http://localhost:3000/dashboard/admin/teams`

### Create a test team
- Click "+ Create Team"
- Enter name: "Test Team"
- Create it

### Add score to team
- Click "Add Score" button
- Amount: 100
- Reason: "Test bonus"
- Confirm

### Verify it worked
- Check `/dashboard/admin/users` - all team members should have +100 points
- Check `/dashboard/admin/teams` - team score should reflect the bonus

## Step 3: Update Admin Navigation

If you have an admin navigation menu, add the link:

```jsx
<Link href="/dashboard/admin/teams">Teams Management</Link>
```

## Feature Overview

### For Admin Users

**Teams Management Page** (`/dashboard/admin/teams`)
- Create/Edit/Delete teams
- Add scores to entire teams (all members get bonus equally)
- View team rankings with member counts
- Browse transaction history

**Users Management Page** (Updated `/dashboard/admin/users`)
- View user scores in table
- Click "Score" button to add/remove individual points
- Enter reason for audit trail
- Preview score change before confirming

### How Scores Work

**Individual User Score** = Task completion points + Score transaction adjustments

Example:
- User completes 3 tasks: +45 points
- Admin adds bonus: +10 points
- Admin removes penalty: -5 points
- Final: 50 points

**Team Score** = Sum of all members' individual scores

When you add 100 points to a team with 3 members:
- Each member gets +100
- Team total increases by +300

## API Endpoints (if you need to call them directly)

### Add Score to User
```bash
curl -X POST http://localhost:3000/api/scores \
  -H "Content-Type: application/json" \
  -d '{
    "action": "add-user-score",
    "user_id": "user-uuid-here",
    "amount": 50,
    "reason": "Monthly bonus"
  }'
```

### Add Score to Team
```bash
curl -X POST http://localhost:3000/api/scores \
  -H "Content-Type: application/json" \
  -d '{
    "action": "add-team-score",
    "team_id": "team-name",
    "amount": 100,
    "reason": "Challenge completed"
  }'
```

### Get User Transaction History
```bash
curl http://localhost:3000/api/scores?user_id=user-uuid-here
```

### Create Team
```bash
curl -X POST http://localhost:3000/api/teams \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "name": "Team Alpha",
    "description": "Our awesome team"
  }'
```

## Troubleshooting

### "Table does not exist" error
- Make sure you ran the SQL migrations in Supabase
- Verify the table names: `teams`, `score_transactions`

### Scores not appearing
- Check that score_transactions table has records
- Verify the leaderboard is fetching correctly: `/api/leaderboard`

### Team members not getting bonuses
- Make sure team name matches exactly in user.team field
- Check score_transactions has individual records for each member

## Next: Additional Features (Optional)

These can be added later:
- Score transaction history page
- Team performance chart
- Monthly leaderboard reset
- Score multiplier for events
- Bulk score import
