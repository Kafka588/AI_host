# Database Migration Guide

## Tables to Create

Run these SQL commands in your Supabase SQL editor:

### 1. Create teams table

```sql
CREATE TABLE teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Add index on name for faster lookups
CREATE INDEX idx_teams_name ON teams(name);
```

### 2. Create team_scores table (separate team competition points)

```sql
CREATE TABLE team_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX idx_team_scores_team_id ON team_scores(team_id);
```

### 3. Create team_score_transactions table (audit trail for team score changes)

```sql
CREATE TABLE team_score_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Add indexes for faster queries
CREATE INDEX idx_team_score_transactions_team_id ON team_score_transactions(team_id);
CREATE INDEX idx_team_score_transactions_created_at ON team_score_transactions(created_at);
```

### 4. Create score_transactions table (audit trail for INDIVIDUAL user score changes only)

```sql
CREATE TABLE score_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Add indexes for faster queries
CREATE INDEX idx_score_transactions_user_id ON score_transactions(user_id);
CREATE INDEX idx_score_transactions_created_at ON score_transactions(created_at);
```

### 3. Update users table (if not already has team field)

The users table should already have a `team` TEXT field. If not, add:

```sql
ALTER TABLE users ADD COLUMN team TEXT;
```

## What These Tables Do

- **teams**: Store team names and descriptions
- **score_transactions**: Audit trail of all score changes (for users and teams)
  - When a user completes a task, a transaction is created
  - When admin adds/removes score, a transaction is created
  - Team bonuses create transactions for the team AND for all team members

## API Endpoints

### User Scores: POST /api/scores
```json
{
  "action": "add-user-score",
  "user_id": "uuid",
  "amount": 10,
  "reason": "Admin bonus"
}
```

### Team Scores: POST /api/scores
```json
{
  "action": "add-team-score",
  "team_id": "uuid",
  "amount": 50,
  "reason": "Team challenge completed"
}
```

### Get Transactions: GET /api/scores?user_id=uuid or ?team_id=uuid

### Teams Management: GET/POST /api/teams
```json
{
  "action": "create",
  "name": "Team Name",
  "description": "Description"
}
```

## Backward Compatibility

The leaderboard will continue to work the same way - it calculates scores dynamically from:
1. Task scores from approved submissions
2. Plus any bonuses from score_transactions table

This means you can add bonuses/penalties without modifying the tasks table.
