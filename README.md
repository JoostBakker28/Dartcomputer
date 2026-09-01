# Dartcomputer

A two-player darts 501 scoreboard: enter each dart, and it keeps the score,
the legs and sets, the checkout suggestions and the match statistics.

Built with Next.js 16 (App Router), React 19, TypeScript and Tailwind CSS 4.
It runs entirely in the browser, with no backend and no database.

## Running it locally

Requires **Node.js 20.9 or newer** (Next.js 16 will not start on anything
older) and npm.

```bash
git clone https://github.com/JoostBakker28/Dartcomputer.git
cd Dartcomputer/dartcomputer
npm install
npm run dev
```

Then open <http://localhost:3000>. The app is the whole site: there is nothing
to configure, no environment variables and no account to create.

### Scripts

All of these are run from the `dartcomputer/` folder.

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on port 3000, with hot reload |
| `npm run build` | Production build, including a TypeScript check |
| `npm start` | Serves the production build (run `npm run build` first) |
| `npm run lint` | ESLint over the project |

## Playing a match

1. **Setup screen** — fill in both names, pick "Play legs" or "Play sets", and
   choose the length from the dropdown. Every option is an odd number, so a
   match cannot end level. A set is played as a best of five legs.
2. **Scoring** — type the three darts of a turn one at a time. The next field
   is selected as soon as the current one cannot take another digit, so 60 60 60
   is six keystrokes. Enter submits the turn, backspace in an empty field steps
   back a dart.
3. **Checkouts** — from 170 or less, a suggested route appears under the score
   and follows the turn as darts are entered. A turn that lands exactly on zero
   on a double checks out; landing below zero, on one, or on zero without a
   double is a bust.
4. **Undo** — the button between the two panels takes back the last turn and
   hands the throw back to whoever played it. It can be pressed repeatedly, all
   the way to the start of the match.
5. **Statistics** — the three-dart average, best turn, turns thrown and
   checkout percentage for both players appear when the match is won.

The score is held in memory, so refreshing the page starts over.

## The code

Everything lives in `dartcomputer/app/`. The rules are plain functions with no
React in them, which keeps the components thin and the logic easy to follow.

| File | Responsibility |
| --- | --- |
| `darts.ts` | Scoring a leg: dart input, turn totals, bust and checkout rules |
| `match-rules.ts` | Legs and sets: the format, and who has won the match |
| `checkout.ts` | Searching the board for the best way to take a score out |
| `player-stats.ts` | The end-of-match figures, derived from the recorded turns |
| `match.tsx` | Holds the names and rules, and switches setup to scoreboard |
| `match-setup.tsx` | The setup screen |
| `scoreboard.tsx` | Match state: turns, the undo stack, legs and banners |
| `player-panel.tsx` | One player: score, checkout, dart entry, turn history |
| `match-stats.tsx` | The end-of-match statistics table |
| `match-banner.tsx` | The bar that closes a leg, a set or the match |
