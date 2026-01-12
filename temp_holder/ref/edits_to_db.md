create table if not exists attempts (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,

  -- what the user attempted
  teil_id bigint not null references teile(id) on delete cascade,
  part_id bigint not null references parts(id) on delete cascade,

  -- if not null => this teil attempt was inside an exam run for a theme
  theme_id bigint references themes(id) on delete cascade,

  -- progress fields
  correct_count int not null,
  total_count int not null,

  -- store computed points for fast dashboards
  obtained numeric(6,2) not null,
  possible numeric(6,2) not null,

  created_at timestamptz not null default now(),

  check (total_count > 0),
  check (correct_count >= 0 and correct_count <= total_count),
  check (possible > 0),
  check (obtained >= 0 and obtained <= possible)
);

-- indexes for “latest attempt” queries
create index if not exists idx_attempts_user_teil_practice_latest
  on attempts (user_id, teil_id, created_at desc)
  where theme_id is null;

create index if not exists idx_attempts_user_theme_part_latest
  on attempts (user_id, theme_id, part_id, created_at desc)
  where theme_id is not null;
-----------------------------instructions-----------------------------
User Progress & Attempts – Design Explanation
Goal

We want to track user progress in a TELC B2 Lesen / Sprachbausteine app in a way that is:

Simple

Scalable (future SaaS, accounts, history)

Aligned with the TELC exam structure

Efficient for dashboard queries (latest scores)

The UI must be able to:

Show latest practice score per Teil

Show latest exam score per Theme

Show per-part scores inside a Theme exam

Work without storing full answer history for now

Core Idea

Every user submission is an attempt.

An attempt is always tied to a Teil

A Teil belongs to a Part (1–5)

A Theme is optional context

Meaning of theme_id

theme_id IS NULL
→ This attempt is practice mode (standalone Teil)

theme_id IS NOT NULL
→ This attempt happened inside a full Theme exam

There is no separate “exam attempt” table.
A full exam = multiple attempts, one per Teil, all sharing the same theme_id.

Database Table: attempts
create table if not exists attempts (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,

  -- what the user attempted
  teil_id bigint not null references teile(id) on delete cascade,
  part_id bigint not null references parts(id) on delete cascade,

  -- if not null => this teil attempt was inside an exam run for a theme
  theme_id bigint references themes(id) on delete cascade,

  -- progress fields
  correct_count int not null,
  total_count int not null,

  -- computed score (used directly by the UI)
  obtained numeric(6,2) not null,
  possible numeric(6,2) not null,

  created_at timestamptz not null default now(),

  check (total_count > 0),
  check (correct_count >= 0 and correct_count <= total_count),
  check (possible > 0),
  check (obtained >= 0 and obtained <= possible)
);

Indexes (important for UI performance)
-- Latest practice attempt per Teil
create index if not exists idx_attempts_user_teil_practice_latest
  on attempts (user_id, teil_id, created_at desc)
  where theme_id is null;

-- Latest exam attempt per Theme + Part
create index if not exists idx_attempts_user_theme_part_latest
  on attempts (user_id, theme_id, part_id, created_at desc)
  where theme_id is not null;


These indexes are critical for dashboard queries like:

“latest practice per teil”

“latest score per part in a theme exam”

How the UI Uses This Table
1. Practice Mode (Teil only)

When the user practices a Teil:

Insert one row

theme_id = NULL

Example:

{
  user_id,
  teil_id,
  part_id,
  theme_id: null,
  correct_count: 4,
  total_count: 5,
  obtained: 20,
  possible: 25
}

UI needs to show:

Latest score per Teil

Query logic:
“latest attempt per teil where theme_id IS NULL”

2. Exam Mode (Whole Theme)

When the user starts a full Theme exam:

For each Teil / Part, insert one attempt

All attempts share the same theme_id

Example (Theme 3, Part 1–5):

{
  user_id,
  teil_id,
  part_id,
  theme_id: 3,
  correct_count,
  total_count,
  obtained,
  possible
}

UI needs to show:

Theme card score → sum of latest attempts per part for that theme

Parts UI → per-part score (latest attempt per part)

Dashboard Logic (Conceptual)
Practice dashboard

Show latest attempt per Teil

Ignore rows where theme_id IS NOT NULL

Main dashboard (Themes)

For each Theme:

Take latest attempt per part where theme_id = theme.id

Sum obtained / possible

Display total exam score

Why This Design

No duplication of “exam” vs “practice” tables

No JSON history blobs

Very easy to query “latest result”

Scales naturally when adding:

Exam sessions

User history

Analytics

Matches TELC structure perfectly (Teil → Part → Theme)

Important Notes for Future Work

Scoring rules (points per question) live in the parts table

obtained / possible are stored for speed

We can add an exam_runs table later without breaking this model

No user answer storage yet (frontend checks answers)

In short:
This table is the single source of truth for user progress, and the UI is built entirely around querying the latest attempts.