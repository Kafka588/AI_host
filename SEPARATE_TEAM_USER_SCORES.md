# Separate Team & User Score System - Complete Implementation

## Overview
Created a completely separate scoring system where:
- **User Scores** = Task completions + Individual bonuses/penalties (controlled via Users page)
- **Team Scores** = Team competitions/challenges ONLY (controlled via Teams page)
- Teams and users have **INDEPENDENT** scoring - no mixing!

---

## Database Schema

### 1. `teams` table
Stores team metadata:
```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE,
  description TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 2. `team_scores` table  
**Stores TEAM competition points** (separate from users):
```sql
CREATE TABLE team_scores (
  id UUID PRIMARY KEY,
  team_id UUID FK → teams(id),
  score INTEGER (current total),
  updated_at TIMESTAMP
);
```

### 3. `team_score_transactions` table
Audit trail for all team score changes:
```sql
CREATE TABLE team_score_transactions (
  id UUID PRIMARY KEY,
  team_id UUID FK → teams(id),
  amount INTEGER (+/- points),
  reason TEXT,
  created_at TIMESTAMP
);
```

### 4. `score_transactions` table
Audit trail for **INDIVIDUAL USER** score changes ONLY:
```sql
CREATE TABLE score_transactions (
  id UUID PRIMARY KEY,
  user_id UUID FK → users(id),
  amount INTEGER (+/- points),
  reason TEXT,
  created_at TIMESTAMP
);
```

---

## Score Calculation Logic

### User Total Score
```
User Score = (Task Completion Points) + (Individual Bonuses/Penalties)
```

**Example:**
- User completes 3 approved tasks: 10 + 15 + 20 = 45 points
- Admin adds 10 point bonus = +10
- Admin removes 5 points for rule violation = -5
- **Final User Score = 45 + 10 - 5 = 50**

### Team Total Score
```
Team Score = (Team Competition Points from team_scores table)
```

**Example:**
- Team wins challenge = +100 points
- Team bonuses = +50 points
- **Team Score = 150** ← COMPLETELY SEPARATE from member scores

---

## API Endpoints

### 1. User Scores API
**POST `/api/scores`** - Add/remove individual user points

```json
{
  "action": "add-user-score",
  "user_id": "uuid",
  "amount": 10,
  "reason": "Bonus for helping team"
}
```

**GET `/api/scores?user_id=uuid`** - View user's transaction history

### 2. Team Scores API
**POST `/api/team-scores`** - Add/remove team competition points

```json
{
  "action": "add-team-score",
  "team_id": "uuid",
  "amount": 50,
  "reason": "Won team challenge"
}
```

**GET `/api/team-scores?team_id=uuid`** - View team's transaction history

### 3. Teams Management API
**GET/POST `/api/teams`** - Create, edit, delete teams

```json
{
  "action": "create",
  "name": "Team Alpha",
  "description": "Description"
}
```

---

## Admin Pages

### Users Page (`/dashboard/admin/users`)
✅ Manage **INDIVIDUAL USER SCORES**
- View all users with their individual scores
- "Score" button to add/remove points per user
- Individual bonus/penalty tracking
- Preview new score before applying
- Reason required for audit

**User Score = Task points + Individual bonuses**

### Teams Page (`/dashboard/admin/teams`)
✅ Manage **TEAM COMPETITION SCORES**
- Create/edit/delete teams
- "Add Score" button to add/remove team competition points
- Team rankings based on TEAM scores only
- Team members listed (but score is independent)
- Preview team score before applying
- Clear indicator: "⚠️ Team Scores (Team Competition)"

**Team Score = Team competition points ONLY**

---

## Leaderboard Output (`/api/leaderboard`)

Returns 3 separate sections:

### 1. Princess (Female Top 10)
Shows users ranked by **individual scores**:
```json
{
  "id": "uuid",
  "name": "username",
  "sex": "female",
  "profile_pic_url": "...",
  "team": "Team Alpha",
  "score": 150  ← Individual score
}
```

### 2. Prince (Male Top 10)
Shows users ranked by **individual scores**:
```json
{
  "id": "uuid",
  "name": "username",
  "sex": "male",
  "profile_pic_url": "...",
  "team": "Team Beta",
  "score": 120  ← Individual score
}
```

### 3. Teams
Shows teams ranked by **team competition scores**:
```json
{
  "name": "Team Alpha",
  "score": 350,  ← TEAM score (separate)
  "memberCount": 3
}
```

---

## Score Independence Example

### Scenario
- **User1** in Team A
- **User2** in Team A
- **User3** in Team A

### Task Completions
- User1 completes task: +10
- User2 completes task: +15
- User3 completes task: +20

**Individual Scores:**
- User1: 10
- User2: 15
- User3: 20

### Team Competition
- Team A wins challenge: **+100 team points**

**Individual Scores (unchanged):**
- User1: 10
- User2: 15
- User3: 20

**Team Score:**
- Team A: 100

### Admin gives User1 bonus
- Add +50 to User1

**Updated Scores:**
- User1: **60** (affected)
- User2: 15 (unchanged)
- User3: 20 (unchanged)
- Team A: **100** (unchanged)

---

## File Changes

**New Files:**
- [app/api/team-scores/route.ts](app/api/team-scores/route.ts) - Team score API
- [DATABASE_MIGRATION.md](DATABASE_MIGRATION.md) - Migration SQL

**Modified Files:**
- [app/api/scores/route.ts](app/api/scores/route.ts) - User scores ONLY
- [app/api/teams/route.ts](app/api/teams/route.ts) - Teams CRUD
- [app/dashboard/admin/teams/page.tsx](app/dashboard/admin/teams/page.tsx) - Teams page (team scores)
- [app/dashboard/admin/users/page.tsx](app/dashboard/admin/users/page.tsx) - Users page (individual scores)
- [app/api/leaderboard/route.ts](app/api/leaderboard/route.ts) - Updated to use separate tables

---

## Setup Instructions

### 1. Run Database Migrations
Copy SQL from [DATABASE_MIGRATION.md](DATABASE_MIGRATION.md) and run in Supabase SQL editor:
- Create `teams` table
- Create `team_scores` table
- Create `team_score_transactions` table
- Create `score_transactions` table

### 2. Create Teams
Go to `/dashboard/admin/teams` and create your teams:
- Team Alpha
- Team Beta
- etc.

### 3. Assign Users to Teams
Users already have a `team` TEXT field. Assign them via Users page.

### 4. Manage Scores
- **Individual scores**: Use Users page "Score" button
- **Team scores**: Use Teams page "Add Score" button

---

## Key Features

✅ **Separate Scoring System**
- User scores independent from team scores
- Can manage each separately without affecting the other

✅ **Audit Trail**
- All score changes tracked in `score_transactions` and `team_score_transactions`
- Reason required for every change
- Timestamp recorded automatically

✅ **Admin Controls**
- Add/remove points anytime
- Use negative numbers to subtract
- Preview changes before applying

✅ **Team Management**
- Create, edit, delete teams
- View member counts
- Team rankings based on competition points

✅ **Real-time Leaderboard**
- User scores: From tasks + individual bonuses
- Team scores: From team competitions ONLY
- Separate top 10 for male/female

---

## Next Steps

1. ✅ Run SQL migrations
2. Create teams in admin panel
3. Test adding scores to users
4. Test adding scores to teams
5. Verify leaderboard shows correct independent scores
6. (Optional) Add Teams link to admin navigation

---

## Important Notes

⚠️ **DO NOT** add points to users via team operations
- Team operations ONLY affect team_scores table
- User operations via /api/scores ONLY affect score_transactions
- They are completely separate

⚠️ **Team scores are competition-based**
- If you want users to get individual points, use Users page
- If you want team to get points, use Teams page

✅ **Backward Compatible**
- Existing user/task data unchanged
- Leaderboard calculation updated to use new tables
- No loss of data
