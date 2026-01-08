# MongoDB Integration Guide

## ✅ Current Status: FULLY INTEGRATED

The Smart Expense Tracker is fully integrated with MongoDB Atlas for production-grade cloud data persistence.

## Architecture Overview

### Hybrid Storage Pattern
```
Frontend (React) 
  ↓
dbService.ts (Offline-First Manager)
  ├─→ IndexedDB (Client-side cache)
  └─→ API Endpoint (/api/expenses)
        ↓
  Backend (Vercel Serverless)
        ↓
  MongoDB Atlas (Cloud Database)
```

### How It Works

1. **Offline Support**: All expenses stored in IndexedDB for instant offline access
2. **Cloud Sync**: Changes automatically sync to MongoDB via `/api/expenses` endpoint
3. **Fallback**: If API fails, app continues working with IndexedDB data
4. **Auto-Sync**: When connection restored, data syncs to cloud

## Database Components

### 1. Frontend Layer (dbService.ts)

**File**: [dbService.ts](dbService.ts)

**Key Methods**:
- `getAllExpenses()` - Fetches from MongoDB, falls back to IndexedDB
- `addExpense(expense)` - Saves to both MongoDB and IndexedDB
- `deleteExpense(id)` - Removes from both databases
- `init()` - Initializes IndexedDB on app startup

**Features**:
- Automatic cloud sync via `/api/expenses` REST endpoint
- IndexedDB caching for offline access
- Graceful fallback if MongoDB unavailable
- CORS-compatible fetch requests

### 2. Backend API Layer (api/expenses.ts)

**File**: [api/expenses.ts](api/expenses.ts)

**Vercel Serverless Function**: Handles all MongoDB CRUD operations

**Endpoints**:

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/expenses` | Fetch all expenses from MongoDB |
| POST | `/api/expenses` | Insert new expense |
| DELETE | `/api/expenses?id=...` | Delete expense by ID |

**Features**:
- MongoDB connection pooling (cached client)
- CORS headers configured for cross-origin requests
- Error handling with proper HTTP status codes
- TypeScript type safety with @vercel/node

### 3. Local Development Server (server.ts)

**File**: [server.ts](server.ts)

**Purpose**: Mirror production API during local development

**Usage**:
```bash
npm run server        # Start Express server on port 3001
npm run dev:full      # Run both backend + frontend dev servers
```

## MongoDB Atlas Configuration

### Database Details
- **Cluster**: `smart-expense-tracker-p`
- **Database**: `expense-tracker`
- **Collection**: `expenses`
- **Region**: Asia Pacific (ap-southeast-2)

### Connection String
```
mongodb+srv://<username>:<password>@smart-expense-tracker-p.gmzct32.mongodb.net/?appName=smart-expense-tracker-prod-ap-southeast-2
```

### Document Schema
```typescript
interface Expense {
  _id?: ObjectId;          // MongoDB generated ID
  id: string;              // Unique identifier
  amount: number;          // Expense amount
  currency: string;        // Currency code (NZD, USD, etc.)
  category: string;        // Expense category
  description: string;     // Expense description
  date: string;           // ISO date string
  createdAt: Date;        // Server-side timestamp
}
```

## Environment Configuration

### Local Development (.env.local)
```dotenv
VITE_MONGODB_URI=mongodb+srv://beauham4t_db_user:PASSWORD@smart-expense-tracker-p.gmzct32.mongodb.net/?appName=smart-expense-tracker-prod-ap-southeast-2
```

### Vercel Production
**Environment Variable**: `VITE_MONGODB_URI`

**Setup Instructions**:
1. Go to Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add: `VITE_MONGODB_URI` = `mongodb+srv://...` (full connection string)
4. Redeploy after saving

⚠️ **Important**: Never commit `.env.local` to GitHub (already in .gitignore)

## Testing MongoDB Integration

### Run MongoDB Tests
```bash
npm run test:mongodb
```

**Output shows**:
- ✅ Connection status
- ✅ Server information
- ✅ Available databases
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Connection closure

### Expected Test Results
```
✅ Connected successfully!
✅ Inserted: <ObjectId>
✅ Found: <expense document>
✅ Updated 1 document(s)
✅ Deleted 1 document(s)
✅ All tests passed!
```

## API Integration Testing

### Test GET (Fetch Expenses)
```bash
curl http://localhost:3001/api/expenses
```

### Test POST (Add Expense)
```bash
curl -X POST http://localhost:3001/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "id": "exp-001",
    "amount": 50,
    "currency": "NZD",
    "category": "Food",
    "description": "Lunch",
    "date": "2026-01-09"
  }'
```

### Test DELETE (Remove Expense)
```bash
curl -X DELETE "http://localhost:3001/api/expenses?id=exp-001"
```

## Deployment Checklist

### Pre-Deployment (Local)
- [x] MongoDB connection tested (`npm run test:mongodb`)
- [x] API endpoints functional
- [x] .env.local contains valid credentials
- [x] Build succeeds (`npm run build`)
- [x] Tests pass (`npm test -- --run`)

### Vercel Deployment
- [ ] Push to GitHub
- [ ] Vercel auto-detects new push
- [ ] Set `VITE_MONGODB_URI` in Vercel environment variables
- [ ] Deployment completes
- [ ] Visit deployed URL to verify

### Post-Deployment (Verify)
1. Open deployed application
2. Add a test expense via UI
3. Refresh page - expense persists ✅
4. Check MongoDB Atlas console to verify data stored

## Troubleshooting

### Issue: "Cannot find module '@vercel/node'"
**Solution**: Already installed. Run `npm install` locally.

### Issue: "VITE_MONGODB_URI undefined"
**Solution**: 
- Local: Create `.env.local` with MongoDB URI
- Production: Add to Vercel environment variables

### Issue: API returns 500 error
**Check**:
1. MongoDB connection string is valid
2. Database user has correct permissions
3. Network access allows Vercel IP range
4. Check server logs for detailed error

### Issue: Expenses not syncing to MongoDB
**Debug**:
1. Open browser DevTools → Network tab
2. Add an expense and monitor `/api/expenses` request
3. Check response status (should be 201 for POST)
4. Verify MongoDB connection in .env.local

## Security Notes

- ✅ MongoDB credentials stored in `.env.local` (excluded from git)
- ✅ API endpoint uses CORS headers for cross-origin requests
- ✅ @vercel/node handles secure serverless execution
- ✅ Connection pooling prevents connection exhaustion
- ✅ No credentials logged to console in production

## Performance Considerations

- **Connection Pooling**: MongoDB client cached across requests
- **IndexedDB Cache**: Instant local access to expenses
- **Lazy Loading**: API called only when needed
- **Chunk Splitting**: Vite optimized for ~600KB main bundle

## Next Steps

1. **Verify Local Setup**:
   ```bash
   npm install
   npm run test:mongodb
   npm run build
   npm test -- --run
   ```

2. **Push to GitHub**:
   ```bash
   git add -A
   git commit -m "MongoDB integration verified and production-ready"
   git push
   ```

3. **Deploy to Vercel**:
   - Vercel auto-deploys on GitHub push
   - Add `VITE_MONGODB_URI` environment variable
   - Verify deployment at your Vercel URL

4. **Monitor Production**:
   - Check Vercel logs for API errors
   - Monitor MongoDB Atlas console
   - Test expense operations on deployed site

## Resources

- [MongoDB Atlas Documentation](https://docs.mongodb.com/atlas/)
- [Vercel Functions Documentation](https://vercel.com/docs/functions)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)

---

**Last Updated**: January 9, 2026  
**Status**: ✅ Production Ready  
**MongoDB Integration**: ✅ Fully Functional  
**Tests**: ✅ All Passing
