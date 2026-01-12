## App description

Your app is a **TELC B2 “Lesen + Sprachbausteine” exam simulator**, not a generic quiz app.

* Users practice **exactly the same structure as the real exam** (Parts 1–5).
* Each part has its **own fixed UI** (drag & drop, multiple choice, matching, etc.).
* Practice is organized by **themes** (≈30 topics like Work Life, Environment, Education…).
* The backend stays minimal: it stores **exam content blocks** and serves them to the frontend; the frontend decides how to render based on the **part number**.
* (Optional) You can add a “tutor layer” (hints/explanations) without mixing it into the exam content.

---

## Database structure (your final model)

### Conceptual model

```
Theme → Part → Teil
```

* **Theme**: a topic/category (what the user selects in the app)
* **Part**: the fixed TELC section definition (1–5)
* **Teil**: one reusable exam unit (content + solution) for one part

Key rule:

* A theme is “assembled” by linking **one Teil per part**.

### Tables

#### 1) `themes`

Stores the list of topics (≈30).

* `id` (PK)
* `title` (e.g., “Insel”)
* `title_ar` (Arabic title, optional but useful)
* `description`

#### 2) `parts` (static)

Defines the TELC exam parts.

* `id` (PK)
* `part_number` (1–5)
* `name` (e.g., “Reading – Headings”)

Frontend selects the UI using `part_number`.

#### 3) `teile` (reusable tasks)

Stores the real exam content.

* `id` (PK)
* `part_id` (FK → parts)
* `content` (JSONB) — everything needed to render the exam screen for that part
* `solution` (JSONB) — correct answers (never sent to frontend)
* optional: `hints` (JSONB) — tutoring/warnings/explanations

Teile are **independent** and can be reused across themes.

#### 4) `theme_teile` (join table)

Connects themes to the Teile they use.

* `theme_id` (FK → themes)
* `part_id` (FK → parts)
* `teil_id` (FK → teile)

Constraints enforce:

* **one Teil per theme per part**
* a Teil can’t be linked to the wrong part

---

### How it works in practice

* To load a full theme exam: query `theme_teile` → join `parts` → join `teile` → order by `part_number`.
* To practice a single part: query `teile` filtered by `part_id`.

If you want, I can write a short “README-style” section you can paste into your GitHub repo (App overview + schema + example queries).

