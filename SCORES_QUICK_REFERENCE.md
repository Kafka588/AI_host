# Quick Reference: Separate Team & User Scores

## The Key Difference

| Component | Controls | API | Page |
|-----------|----------|-----|------|
| **User Scores** | Individual points (tasks + bonuses) | POST `/api/scores` | `/dashboard/admin/users` |
| **Team Scores** | Team competition points only | POST `/api/team-scores` | `/dashboard/admin/teams` |

---

## What Gets Stored Where

### When User Completes Task
- ✅ Points go to **user individual score**
- ❌ Does NOT affect team score

### When Admin Adds User Bonus
- ✅ Points go to **user individual score**
- ❌ Does NOT affect team score

### When Admin Adds Team Points
- ✅ Points go to **team competition score**
- ❌ Does NOT affect individual user scores

---

## Score Breakdown

### User Score
```
Base = Task completions (10 + 15 + 20 = 45)
+ Individual bonuses = +30
- Individual penalties = -5
= TOTAL = 70
```

### Team Score
```
Base = Team competition wins = 100
+ Team bonuses = +50
- Team penalties = -10
= TOTAL = 140

(User members' individual scores = SEPARATE, unaffected)
```

---

## APIs Quick Reference

### Add User Score
```bash
POST /api/scores
{
  "action": "add-user-score",
  "user_id": "uuid",
  "amount": 10,
  "reason": "Bonus"
}
```

### Add Team Score
```bash
POST /api/team-scores
{
  "action": "add-team-score",
  "team_id": "uuid",
  "amount": 50,
  "reason": "Won challenge"
}
```

---

## Database Tables

| Table | Purpose | Stores |
|-------|---------|--------|
| `score_transactions` | User score history | user_id, amount, reason |
| `team_score_transactions` | Team score history | team_id, amount, reason |
| `team_scores` | Current team score | team_id, current_score |

---

## Admin Pages

### `/dashboard/admin/users`
- View: User individual scores
- Action: "Score" button → Add/remove user points
- Doesn't touch team scores

### `/dashboard/admin/teams`
- View: Team competition scores
- Action: "Add Score" button → Add/remove team points
- Doesn't touch user scores
- Shows member list (informational only)

---

## Leaderboard Shows

- **Princess/Prince**: User rankings by individual score
- **Teams**: Team rankings by team competition score

Both independent = Different rankings!

---

## Tables to Create (in order)

```sql
-- 1. Teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- 2. Team scores (CURRENT team competition points)
CREATE TABLE team_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id),
  score INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT now()
);

-- 3. Team score transactions (AUDIT LOG)
CREATE TABLE team_score_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id),
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- 4. User score transactions (AUDIT LOG for individual bonuses)
CREATE TABLE score_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## If User Has Questions

**"Can I give both user AND team points?"**
- Yes! Use Users page for user points, Teams page for team points. Independent.

**"Do team points go to individual users?"**
- No. Team score = Team competition points only. User scores stay separate.

**"Can I see who got what bonus?"**
- Yes. Each transaction logged with reason, timestamp, and amount.

**"What if I made a mistake?"**
- Add negative amount to undo (e.g., add -10 to remove 10 points)
