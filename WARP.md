# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Setup and Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
# Starts Vite dev server on port 3000 (http://0.0.0.0:3000)
```

### Build
```bash
npm run build
# Builds production-ready application to dist/
```

### Preview Production Build
```bash
npm run preview
# Preview the production build locally
```

## Architecture Overview

### Project Type
React + TypeScript SPA (Single Page Application) for expense tracking with AI-powered receipt scanning and Firebase cloud sync.

### Key Technologies
- **Frontend**: React 19 with functional components and hooks
- **Styling**: Tailwind CSS (utility-first, inline classes)
- **Build Tool**: Vite 6 with React plugin
- **AI**: Google Generative AI (Gemini 3 Flash) for receipt image parsing
- **Database**: Firebase Firestore for real-time cloud sync
- **Charts**: Recharts library for data visualization
- **TypeScript**: ~5.8.2 with modern ES2022 target

### Application Structure
This is a **flat-structure** project where all source files live at the root level (no `src/` directory).

**Root-level files:**
- `App.tsx` - Main application component with view routing (overview/transactions/monthly)
- `types.ts` - TypeScript interfaces and enums (Expense, Category, SummaryData)
- `constants.tsx` - App-wide constants (currency rates, category colors)
- `firebaseConfig.ts` - Firebase initialization and configuration validation
- `geminiService.ts` - AI receipt parsing integration
- `dbService.ts` - Legacy IndexedDB service (not actively used; app uses Firebase)
- `index.tsx` - React entry point
- `index.html` - HTML entry point

**Components directory:**
- `AddExpenseModal.tsx` - Modal for adding expenses (manual entry + AI scan)
- `Dashboard.tsx` - Overview page with charts (pie chart for allocation, bar chart for flow)
- `ExpenseList.tsx` - Transaction list view
- `MonthlyView.tsx` - Monthly breakdown view
- `BottomNav.tsx` - Mobile-first bottom navigation

### Data Flow
1. **Firebase Firestore** is the primary data source (real-time sync via onSnapshot)
2. All expense CRUD operations use Firebase Firestore directly
3. Data is stored in the `expenses` collection with auto-generated IDs
4. Each expense has: `id`, `amount` (converted to NZD), `originalAmount`, `originalCurrency`, `category`, `date`, `description`, `createdAt`

### Currency Handling
- **Default currency**: NZD (New Zealand Dollar)
- **Supported currencies**: NZD, THB (Thai Baht)
- **Conversion rate**: 1 NZD = 20 THB (hardcoded in constants.tsx)
- All expenses are stored with both original currency/amount AND converted NZD amount
- AI receipt scanning automatically detects THB or NZD from images

### AI Receipt Scanning
- Uses `@google/genai` package with Gemini 3 Flash model
- Accepts base64-encoded images (receipts or screenshots)
- Extracts: `originalAmount`, `originalCurrency`, `convertedAmount`, `category`, `date`, `description`
- Returns structured JSON via `responseMimeType: "application/json"` with schema validation
- Handles multi-currency detection (THB/NZD) and auto-conversion

## Environment Variables

### Required for Development
Create a `.env` file at the root with:

```bash
# Gemini AI (for receipt scanning)
GEMINI_API_KEY=your_gemini_api_key

# Firebase Config (for cloud sync)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Environment Variable Mapping
- `GEMINI_API_KEY` is mapped to `process.env.API_KEY` in vite.config.ts (line 14)
- All `VITE_*` variables are automatically available as `process.env.VITE_*` in the app
- Firebase variables are validated in `firebaseConfig.ts` - app shows setup error UI if missing

### Production Deployment (Vercel)
Set the same environment variables in Vercel project settings before deployment. The app validates Firebase config at runtime and shows user-friendly error messages if misconfigured.

## Code Patterns and Conventions

### Component Patterns
- **Functional components only** with TypeScript typed props
- Use React hooks: `useState`, `useEffect`, `useMemo`, `useRef`
- Component files use PascalCase naming (e.g., `AddExpenseModal.tsx`)
- Props are defined as interfaces with descriptive names (e.g., `AddExpenseModalProps`)

### State Management
- Local component state via `useState`
- No global state management library (Redux, Zustand, etc.)
- Firebase Firestore provides real-time data sync via `onSnapshot` in `App.tsx`
- Search and view routing state managed at App level, passed as props

### Styling Approach
- **Tailwind CSS utility classes** (inline, no separate CSS files)
- Design system uses custom rounded corners (e.g., `rounded-[32px]`, `rounded-3xl`)
- Color palette: indigo-600 (primary), slate (neutral), emerald/red/amber (semantic)
- Responsive design with mobile-first approach (lg: breakpoint for desktop)
- Animations via Tailwind classes: `animate-pulse`, `animate-spin`, `transition-all`

### File Organization
- **No src/ directory** - all source files are at project root
- Import paths use relative paths (e.g., `./types`, `./components/Dashboard`)
- Path alias `@/*` maps to project root (configured in tsconfig.json and vite.config.ts)

### TypeScript Usage
- Enums for Category (Food, Transport, Utilities, Shopping, Entertainment, Health, Others)
- Interfaces for data structures (Expense, SummaryData)
- Explicit typing for component props
- Use of `React.FC` for functional components
- Type assertions where necessary (e.g., `as Category` for AI-parsed category)

### Firebase Integration
- Firestore methods: `collection`, `addDoc`, `onSnapshot`, `query`, `orderBy`, `deleteDoc`, `doc`
- Error handling for permission-denied, offline, and suspended project states
- Graceful degradation: shows setup instructions if Firebase is not configured
- Real-time listeners cleaned up in `useEffect` return function

### Error Handling
- AI parsing errors show user-friendly retry UI in modal
- Firebase errors display status messages in header and content area
- Form validation prevents submission with invalid data
- Console errors logged for debugging but not exposed to users

## Important Technical Notes

### Environment Variable Access Pattern
- **Gemini API**: Uses `process.env.API_KEY` (mapped in vite.config.ts)
- **Firebase**: Uses `(process.env as any).VITE_FIREBASE_*` pattern
- Never hardcode API keys; always use environment variables

### Vite Configuration
- Custom port: 3000 (default Vite is 5173)
- Host: 0.0.0.0 (accessible on network)
- Environment variables loaded with `loadEnv(mode, '.', '')`
- Path alias `@` resolves to project root

### Date Formatting
- Internal storage: ISO 8601 format `YYYY-MM-DD`
- Display: Uses `toLocaleDateString('en-NZ', ...)` for user-facing dates
- Month grouping: Substring `date.substring(0, 7)` for `YYYY-MM` format

### CSV Export
- Headers: Date, Description, Category, Original Amount, Original Currency, Converted Amount
- Description field is escaped for CSV (quotes doubled)
- Filename format: `expenses_export_YYYY-MM-DD.csv`
- Uses Blob API and temporary anchor link for download

## Security Considerations

### Firestore Security Rules
The app currently works in test mode. For production, implement rules like:
```javascript
service cloud.firestore {
  match /databases/{database}/documents {
    match /expenses/{expenseId} {
      allow read, write: if request.auth != null && 
                          request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

### API Key Protection
- Never commit `.env` files to version control
- Use environment variables in deployment platforms (Vercel, Netlify, etc.)
- Gemini API key should be restricted by HTTP referrer in Google Cloud Console

## Common Tasks

### Adding a New Category
1. Update `Category` enum in `types.ts`
2. Add corresponding color in `CATEGORY_COLORS` in `constants.tsx`
3. Update AI parsing prompt in `geminiService.ts` to include new category

### Adding a New Currency
1. Add currency code to `SUPPORTED_CURRENCIES` in `constants.tsx`
2. Add conversion rate constant (e.g., `EUR_TO_NZD_RATE`)
3. Update `calculateConverted` logic in `AddExpenseModal.tsx`
4. Update AI parsing prompt in `geminiService.ts`

### Modifying AI Parsing Schema
- Edit the `responseSchema` object in `geminiService.ts`
- Ensure prompt text matches expected output fields
- Update form handling in `AddExpenseModal.tsx` to map new fields

### Adding a New View
1. Add view type to `ViewType` union in `App.tsx`
2. Create new component in `components/` directory
3. Add conditional rendering in App's main content section
4. Update `BottomNav.tsx` to include new navigation button
