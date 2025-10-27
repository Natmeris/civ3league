# 🏛️ Civilization 3 Players League

[![Live Site](https://img.shields.io/badge/Live-Site-brightgreen)](https://vladpocris.github.io/CivPlayers-Civ3-League/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-purple.svg)](https://vitejs.dev/)

The premier online hub for the **Civilization III Multiplayer League**. Track rankings, view events, explore guides, and generate balanced teams with ELO-based algorithms.

---

## 🌟 Features

### 📊 Live Leaderboards
- **Multi-Mode Rankings**: Track player ratings across 8 game modes (MPT, Modern, FUT, QC, MDJ, UU, CW, Overall)
- **Google Sheets Integration**: Real-time data sync from published CSV spreadsheets
- **Player Profiles**: Click any player to see detailed stats, mode rankings, and performance charts
- **Sortable & Searchable**: Filter and navigate through rankings with ease

### 🎯 Team Generator (ELO-Based)
- **Smart Team Balancing**: Input 4-8 players and generate perfectly balanced teams
- **Captain Selection**: Automatically identifies top two players as captains
- **Split Analysis**: Shows both pick scenarios (Pick A vs Pick B) with:
  - Total team ELO
  - Win probability calculations
  - Visual recommendations
- **Autofill Top 8**: Quick-fill with the highest-rated players from selected mode
- **Duplicate Prevention**: Smart validation ensures no repeated players

### 📅 Events & Tournaments
- **Event Calendar**: Browse past and upcoming tournaments
- **Rich Content**: Events support ordered blocks (paragraphs, images, links)
- **Live Stream Integration**: Direct links to YouTube/Twitch with branded buttons
- **Detailed Pages**: Full event descriptions, dates, and media

### 📚 Resources
- **Hall of Fame**: Celebrate league champions and top performers
- **Guides**: Comprehensive tutorials for different game modes
- **Rules**: Official league rules and regulations
- **Streaming**: Watch live matches and replays

### 🎨 Modern UI/UX
- **Civ3 Theme**: Custom gold/blue color scheme matching the game's aesthetic
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Dark Mode**: Easy on the eyes for extended browsing
- **Smooth Animations**: Polished transitions and interactions

---

## 🛠️ Admin Panel

Access the admin panel at `/admin` to manage content without touching code:

### Events Management
- **Create/Edit/Delete Events**: Full CRUD operations for tournaments
- **Rich Content Editor**:
  - Add ordered content blocks (paragraphs, images, links)
  - Preview changes before saving
  - Legacy text migration tool (converts old longDescription to blocks)
- **Metadata**: Set dates, titles, descriptions, and external links
- **Media Upload**: Link to YouTube/Twitch streams

### Bracket Generator
- **Tournament Brackets**: Generate single/double elimination brackets
- **Match Editor**: Manually add/remove rounds and matches
- **JSON Export**: Download bracket data for integration

### Data Management
- **Events JSON**: Download updated `events.json` with all changes
- **Leaderboard Integration**: Links to Google Sheets for rankings
- **Local Storage**: Changes persist in browser until download

---

## 🚀 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite 5 |
| **Routing** | React Router v6 |
| **UI Library** | shadcn/ui + Radix UI |
| **Styling** | Tailwind CSS 3 |
| **Icons** | Lucide React |
| **Data Source** | Google Sheets (CSV) |
| **Deployment** | GitHub Pages |

---

## 📁 Project Structure

```
CivPlayers-Civ3-League/
├── public/
│   ├── civ3-assets/          # Game images, logos, leaderboard snapshots
│   │   ├── preview.png       # Social share image
│   │   └── Logo/             # League branding
│   └── data/
│       ├── events.json       # Tournament/event data
│       ├── guides.json       # Game mode guides
│       ├── rules.json        # League rules
│       └── stream.json       # Streaming info
├── src/
│   ├── components/
│   │   ├── home/
│   │   │   ├── Leaderboard.tsx        # Multi-mode rankings table
│   │   │   ├── TeamGenerator.tsx      # ELO-based team balancing
│   │   │   └── SeasonOverview.tsx     # Season summary
│   │   ├── layout/
│   │   │   ├── Header.tsx             # Navigation bar
│   │   │   └── Footer.tsx             # Site footer
│   │   └── ui/                        # shadcn/ui components
│   ├── pages/
│   │   ├── Index.tsx                  # Home page
│   │   ├── Events.tsx                 # Event listing
│   │   ├── EventDetails.tsx           # Single event view
│   │   ├── PlayerProfile.tsx          # Player stats page
│   │   ├── Admin.tsx                  # Content management
│   │   ├── HallOfFame.tsx            # Champions showcase
│   │   ├── Guides.tsx                # Game tutorials
│   │   ├── Rules.tsx                 # League regulations
│   │   └── Stream.tsx                # Live streaming
│   ├── lib/
│   │   ├── leaderboardData.ts        # CSV parsing & data fetching
│   │   └── utils.ts                  # Helper functions
│   └── styles/
│       └── civ3-theme.css            # Custom Civ3 styling
├── index.html                         # Entry point + meta tags
├── vite.config.ts                     # Vite configuration
└── tailwind.config.ts                 # Tailwind setup
```

---

## 🏗️ Key Components

### Leaderboard System
**File**: `src/components/home/Leaderboard.tsx`

- Fetches live data from Google Sheets published CSVs
- Robust parsing handles BOM, quotes, and malformed data
- Converts win rates from decimals to percentages
- Links each player to their profile page
- Tabs switch between game modes
- Responsive pagination and sorting

### Team Generator
**File**: `src/components/home/TeamGenerator.tsx`

- **Algorithm**: Brute-force combinations to find optimal split
- **Captain Logic**: Top 2 by ELO; auto-corrects if wrong positions
- **Pick Analysis**:
  - If Captain 2 picks A: Team1 = Cap1 + SplitB, Team2 = Cap2 + SplitA
  - If Captain 2 picks B: Team1 = Cap1 + SplitA, Team2 = Cap2 + SplitB
- **Probability**: Uses Elo formula `1 / (1 + 10^((Rb - Ra)/400))`
- **UI**: Shows player numbers (input positions), recommendations, and final teams

### Player Profile
**File**: `src/pages/PlayerProfile.tsx`

- Aggregates stats across all modes
- Bar charts for rating comparison
- Excludes "Overall" from per-mode displays
- Quick summary with placement info

### Admin Panel
**File**: `src/pages/Admin.tsx`

- **Events Editor**: JSON-based content management
- **Ordered Content Blocks**: Paragraphs, images (with captions), links
- **Legacy Migration**: Converts old `longDescription` to blocks
- **Bracket Generator**: Creates tournament structures
- **Download**: Exports updated JSON for deployment

---

## 🎮 How It Works

### Leaderboard Data Flow
1. Google Sheets → Publish to Web as CSV
2. `fetchModeData(mode)` fetches the CSV URL
3. `parseCSV()` cleans and normalizes data:
   - Strips BOM and whitespace
   - Infers headers from first row
   - Converts win rates (0.6 → 60%)
   - Maps columns to `LeaderboardEntry` objects
4. UI renders tables with sorting/filtering

### Team Generation Algorithm
1. User inputs 4-8 players
2. Fetch ratings from selected mode's leaderboard
3. Identify top 2 as captains (by ELO)
4. Generate all combinations of remaining players into two splits
5. For each split pair (A, B):
   - Calculate Team1 ELO if Cap2 picks A (Cap1 + B)
   - Calculate Team2 ELO if Cap2 picks A (Cap2 + A)
   - Calculate Team1 ELO if Cap2 picks B (Cap1 + A)
   - Calculate Team2 ELO if Cap2 picks B (Cap2 + B)
6. Choose the split where min(deltaA, deltaB) is smallest
7. Display both scenarios with probabilities

### Event Content Rendering
- Events can have `orderedContent` array or legacy `longDescription`
- Ordered blocks render in sequence:
  - **paragraph**: Styled text with line breaks
  - **image**: URL + optional caption
  - **link**: Styled button/link to external resource
- Admin panel provides WYSIWYG-like editor for blocks
- URLs resolve relative to GitHub Pages base path

---

## � Video Tutorials

**Complete walkthrough videos** covering admin panel usage, web updates, and basic code modifications:

👉 **[Access Video Tutorials](https://mega.nz/folder/yVkATZIY#pvSXQ1gHPInbOwATtO7Ymg)**

Topics covered:
- Admin panel navigation and features
- How to update events, guides, and rules
- Managing leaderboard data
- Basic code changes and customization
- Deployment and content updates
- Important note: Setting the link on events admin panel to N/A, makes the buttons hidden for that particular event.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/VladPocris/CivPlayers-Civ3-League.git
cd CivPlayers-Civ3-League

# Install dependencies
npm install
```

### Development

```bash
# Start dev server
npm run dev

# Open http://localhost:5173/CivPlayers-Civ3-League/
```

### Build for Production

```bash
# Build optimized bundle
npm run build

# Preview production build locally
npm run preview
```

### Deployment

The site auto-deploys to GitHub Pages on push to `main`:

1. Push changes to `main` branch
2. GitHub Actions builds and deploys to `gh-pages`
3. Live at: `https://vladpocris.github.io/CivPlayers-Civ3-League/`

---

## 📝 Content Management

### Updating Leaderboards
1. Edit your Google Sheets with player data
2. File → Share → Publish to web → CSV
3. Update the CSV URL in `src/lib/leaderboardData.ts` (if needed)
4. Data updates automatically on page load

### Adding Events
1. Go to `/admin`
2. Click "Add New Event"
3. Fill in:
   - Title, Date, Description
   - Add ordered content blocks (paragraphs, images, links)
   - Set YouTube/Twitch URLs (optional)
4. Click "Save" to download updated `events.json`
5. Replace `public/data/events.json` with the new file
6. Commit and push

### Editing Guides/Rules
1. Edit JSON files in `public/data/`:
   - `guides.json` – Game mode guides
   - `rules.json` – League rules
   - `stream.json` – Streaming info
2. Follow existing structure
3. Commit and push

---

## 🎨 Customization

### Theme Colors
Edit `src/civ3-theme.css`:

```css
:root {
  --civ3-blue: #2c5282;      /* Primary blue */
  --civ3-gold: #f0ad4e;      /* Gold accent */
  --civ3-border: #d4af37;    /* Gold border */
}
```

### Base URL (for deployment path)
Edit `vite.config.ts`:

```ts
export default defineConfig({
  base: '/CivPlayers-Civ3-League/', // Change to your repo name
  ...
});
```

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/my-feature`
3. **Commit** your changes: `git commit -m 'Add some feature'`
4. **Push** to the branch: `git push origin feature/my-feature`
5. **Open** a Pull Request

---

##  Acknowledgments

- **CivPlayers Community** – For the passion and dedication to Civilization III multiplayer
- **shadcn/ui** – For the beautiful component library
- **React & Vite** – For the modern development experience
- **Civilization III** – The timeless classic that brings us all together

---

## 📬 Contact

- **GitHub**: [@VladPocris](https://github.com/VladPocris)
- **Portfolio**: [@VladPocris](https://vladpocris.github.io/InteractiveCV/)
- **League Website**: [CivPlayers Civ3 League](https://vladpocris.github.io/CivPlayers-Civ3-League/)

---

<div align="center">
  <strong>🏛️ Built with ❤️ for the Civ3 Community 🏛️</strong>
</div>
