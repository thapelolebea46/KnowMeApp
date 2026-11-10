# knowme – friendship quiz app (React Native / Expo Router)

Redesigned to match the four mockups: cream paper background, electric purple, lime accents,
Space Grotesk headlines + Inter body text. Your backend calls and quiz logic are unchanged.

## Run it

```bash
npm install
npx expo install @expo-google-fonts/inter @expo-google-fonts/space-grotesk @expo/vector-icons expo-clipboard
npx expo start
```

The second line is only to let Expo pin the right versions for your SDK. I added these 4 packages to
`package.json` (fonts, icons, clipboard for the "Copy link" button).

Env vars (same as before): `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_WEB_URL`.

## What changed

### Screens (match your mockups)
| Screen | File | Notes |
|---|---|---|
| **Login / Sign up** (new look) | `app/index.js` | Same theme. Log in / Sign up toggle, show-password eye, inline errors, auto-skips if already logged in. |
| **Home** (mockup 1) | `app/(tabs)/home.js` | "Hey, Alex", purple hero card with lime "Create a quiz +", "Your quizzes" with a **Current Bestie** card. Avatar (top right) opens Log out. Pull to refresh. |
| **Create – Questions** (mockup 2) | `app/create.js` | Stepper, quiz name, one question card at a time, A–D options, dashed "Add a question", "Save & get link". |
| **Create – Share** (mockup 3) | `app/create.js` | Purple share card with lime offset + "PROVE IT." sticker, personal link + copy, Message / Your story / More, "Copy my link". |
| **Friend plays the quiz** (mockup 4) | `app/play/[code].js` | Progress segments, purple question card, A–D radio options, "Playing as Jamie · Change", Next question. |
| My quizzes / Results tabs | `app/(tabs)/quizzes.js`, `results.js` | Bottom tab bar with the lavender active pill. |
| Quiz results detail | `app/quiz/[id].js` | Leaderboard (top spot = Current Bestie) + per-question % bars. |

### Preset questions
`src/presets.js` holds the 8 starter questions from your doc under **"The Inner Circle Lore"**,
each tagged with a category:

`Favorites · Lifestyle · What if… · Personality · Quirks`

- New quizzes open pre-filled with those 8. Question 1 starts with answer A ticked (like the mockup);
  the other 7 start **unanswered** so you pick your own truth. Save is blocked until each has an answer,
  and it jumps you to the first one you missed.
- **Tap an option** = mark it as the correct answer (purple check). **Tap the selected option again** = edit its text.
- **Add a question** opens a sheet with category filters and 11 extra preset ideas, or "Write my own".
- **⋯ menu** on each question: change category, duplicate, delete. The category chip is also tappable.
- Numbered chips above the card jump between questions (dashed = no answer yet).
- Max 20 questions, min 2 filled options per question.

## Things to know / check on your backend

1. **Friend play endpoints are guesses.** Your original code had no friend-side API calls (that lives in your web app).
   In `src/api.js` I added:
   - `fetchPublicQuiz(code)` → `GET /api/quizzes/public/:code`, expected `{ title, ownerName?, questions: [{ text, options }] }`
   - `submitAttempt(code, { name, answers })` → `POST /api/quizzes/public/:code/attempts`, expected `{ score, total }`

   Change those two paths/shapes to match your server. **"Preview as a friend"** (on the share screen) works fully offline
   with no endpoints, so you can test the play UI right away.
2. **`category`** is now sent with each question on `POST /api/quizzes`. If your backend rejects unknown fields,
   strip it in `build()` in `app/create.js`.
3. **Login response**: I save the user's name (for "Hey, Alex" and "Think you know Alex?") from `d.user.name`, `d.name`,
   or the name typed at sign-up. If your API returns it elsewhere, adjust the one line in `app/index.js`.
4. "Current bestie" on each card calls `/api/quizzes/:id/results` and shows the top of the leaderboard.
5. "Your story" opens the normal share sheet (apps don't allow deep-linking straight into a story).
6. `src/api.js` still has your `API` constant untouched (it resolves to `localhost:4000` because of the `||` order,
   so use `EXPO_PUBLIC_API_URL` on a real device).

## Files removed
Leftovers from the default Expo template that clashed with your routes (a second `_layout.tsx`, `(tabs)/index.tsx`,
`two.tsx`, `modal.tsx`, `+html.tsx`, `+not-found.tsx`, `components/`, and the old `app/home.js`).
`_layout.tsx` was also trying to load a font file that wasn't in the zip.

## Structure
```
app/
  _layout.js          fonts + navigation
  index.js            login / sign up
  create.js           build quiz → share
  (tabs)/             home · quizzes · results
  play/[code].js      friend view (+ /play/preview)
  quiz/[id].js        results detail
src/
  theme.js            colors + fonts
  ui.js               buttons, fields, sheets, pills
  QuizCard.js         "Your quizzes" card
  presets.js          starter + bank questions, categories
  store.js            draft used for preview
  api.js              your API helper + friend endpoints
```

I couldn't run this on a device here, so I checked syntax on every file, but please test on your phone and tell me
if anything looks off from the mockups.
