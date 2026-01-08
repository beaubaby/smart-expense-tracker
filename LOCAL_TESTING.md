# Local Testing Guide - Smart Expense Tracker

## Prerequisites
✅ Node.js v18+ installed  
✅ MongoDB Atlas account with cluster created  
✅ `.env.local` configured with correct MongoDB URI  

---

## Step 1: Setup Environment

### 1.1 Install Dependencies
```bash
npm install
```

### 1.2 Verify MongoDB Connection
```bash
npm run test:mongodb
```

**Expected Output:**
```
✅ Connected successfully!
📊 Server Info...
🎉 All tests passed!
```

---

## Step 2: Unit & Integration Tests

### Run All Tests
```bash
npm test                # Watch mode
npm test -- --run       # Run once
npm run test:coverage   # Coverage report
```

**Current Tests:**
- ✅ 6 Expense Model Tests
- ✅ 3 API Integration Tests  
- ✅ 3 Manual API Tests

---

## Step 3: Start Development Server

### 3.1 Start App
```bash
npm run dev
```

Opens: `http://localhost:5173`

### 3.2 Verify App Loads
- [ ] Landing page displays correctly
- [ ] No console errors
- [ ] Dashboard loads with charts

---

## Step 4: Manual UI Testing

### 4.1 Test Add Expense Feature
```
1. Click "Add Expense" button
2. Fill in form:
   - Amount: 100
   - Currency: NZD
   - Category: Food
   - Description: "Lunch test"
   - Date: Today
3. Click "Save"
4. Verify expense appears in list
5. Check MongoDB has the record
```

**Test Cases:**
- [ ] Add expense with valid data
- [ ] Add expense with special characters
- [ ] Add expense with large amount (9999.99)
- [ ] Validation: Try without amount (should fail)
- [ ] Validation: Try without category (should fail)

### 4.2 Test Expense List
```
1. Add 3-5 expenses
2. Verify all appear in list
3. Check amounts and categories display correctly
4. Test delete button:
   - Click delete
   - Verify removed from list
   - Refresh page (should still be gone)
```

**Test Cases:**
- [ ] List displays all expenses
- [ ] Delete removes expense
- [ ] List persists after page refresh
- [ ] Delete from MongoDB verified

### 4.3 Test Dashboard
```
1. Add expenses in different categories
2. Check Dashboard shows:
   - Total amount spent
   - Category breakdown chart
   - Monthly history
```

**Test Cases:**
- [ ] Total calculates correctly
- [ ] Charts render without errors
- [ ] Categories sum correctly
- [ ] Charts responsive (resize window)

### 4.4 Test Monthly View
```
1. Click "Monthly" in bottom nav
2. Verify shows month breakdown
3. Change month
4. Verify data updates
```

**Test Cases:**
- [ ] Monthly view loads
- [ ] Can navigate months
- [ ] Data matches dashboard

### 4.5 Test Bottom Navigation
```
1. Click each nav item:
   - Dashboard
   - Expenses
   - Monthly
   - Settings (if exists)
2. Verify correct page loads
```

**Test Cases:**
- [ ] All nav items clickable
- [ ] Active tab highlighted
- [ ] Pages load correctly

---

## Step 5: Database Integration Testing

### 5.1 Offline Test
```
1. Start app (npm run dev)
2. Open DevTools → Network → Offline
3. Add expense locally
4. Refresh page
5. Verify expense still there (IndexedDB)
6. Go back Online
7. Verify syncs to MongoDB
```

**Test Cases:**
- [ ] Add works offline
- [ ] Data persists in IndexedDB
- [ ] Syncs when online

### 5.2 MongoDB Direct Test
```bash
# Check expenses collection
mongosh "your-connection-string"
> use smart-expense-tracker
> db.expenses.find().pretty()
```

**Test Cases:**
- [ ] Expenses exist in MongoDB
- [ ] Data matches UI
- [ ] Deletions remove from DB

---

## Step 6: API Endpoint Testing

### 6.1 Test API Routes (using curl or Postman)

#### GET All Expenses
```bash
curl http://localhost:5173/api/expenses
```

#### CREATE Expense
```bash
curl -X POST http://localhost:5173/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-1",
    "amount": 100,
    "currency": "NZD",
    "originalAmount": 100,
    "originalCurrency": "NZD",
    "category": "Food",
    "date": "2024-01-09",
    "description": "Test expense",
    "createdAt": 1704816000000
  }'
```

#### DELETE Expense
```bash
curl -X DELETE http://localhost:5173/api/expenses/test-1
```

**Test Cases:**
- [ ] GET returns JSON array
- [ ] POST creates and returns ID
- [ ] DELETE removes expense
- [ ] Error handling works

---

## Step 7: Browser DevTools Testing

### 7.1 Console Check
```
1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors (should be none)
4. Perform actions, verify no error logs
```

**Test Cases:**
- [ ] No errors on load
- [ ] No errors on add expense
- [ ] No errors on delete
- [ ] No unhandled promise rejections

### 7.2 Network Tab
```
1. Open Network tab
2. Clear
3. Add expense
4. Check requests:
   - POST /api/expenses (should be 201)
5. Delete expense
6. Check request:
   - DELETE /api/expenses/:id (should be 200)
```

**Test Cases:**
- [ ] API calls made
- [ ] Correct status codes
- [ ] Correct payloads sent

### 7.3 Application Tab
```
1. Open Application tab
2. Check IndexedDB:
   - SmartExpenseTrackerDB → expenses
   - Verify data stored
```

**Test Cases:**
- [ ] IndexedDB stores expenses
- [ ] Data persists after refresh

---

## Step 8: Performance Testing

### 8.1 Load Testing
```
1. Add 50+ expenses
2. Check if app still responsive
3. Check dashboard renders performance
4. Monitor memory usage
```

**Test Cases:**
- [ ] Add many expenses
- [ ] Dashboard doesn't lag
- [ ] List scrolls smoothly
- [ ] No memory leaks (check DevTools memory tab)

### 8.2 Build & Preview
```bash
npm run build      # Build for production
npm run preview    # Preview production build
```

**Test Cases:**
- [ ] Build completes without errors
- [ ] Preview loads correctly
- [ ] All features work in preview
- [ ] Production size is reasonable

---

## Step 9: Browser Compatibility Testing

Test on multiple browsers:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**Test Cases:**
- [ ] App loads
- [ ] Charts render
- [ ] Forms work
- [ ] IndexedDB works

---

## Step 10: Mobile Testing

### Using Chrome DevTools
```
1. Press F12
2. Click device icon (top-left)
3. Select different devices
4. Test responsiveness
```

**Test Cases:**
- [ ] App responsive on mobile
- [ ] Navigation works on mobile
- [ ] Forms accessible on mobile
- [ ] Charts readable on mobile

---

## Quick Test Checklist

**Before pushing to GitHub:**
- [ ] `npm run test:mongodb` passes
- [ ] `npm test -- --run` passes all tests
- [ ] `npm run dev` starts without errors
- [ ] Can add expense → appears in list
- [ ] Can delete expense → removed
- [ ] Dashboard shows correct totals
- [ ] Offline mode works
- [ ] No console errors
- [ ] `.env.local` not in git
- [ ] `.gitignore` updated

---

## Troubleshooting

### App won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### MongoDB connection fails
```bash
# Test connection
npm run test:mongodb

# Check .env.local exists and has correct URI
cat .env.local
```

### Tests failing
```bash
# Run with verbose output
npm test -- --reporter=verbose

# Run specific test
npm test -- __tests__/expense.test.ts
```

### IndexedDB not working
```
1. Open DevTools → Application
2. Check IndexedDB → SmartExpenseTrackerDB
3. If missing, add an expense to initialize
4. Clear and try again
```

---

## Running All Tests (CI/CD)

```bash
# Run all tests in sequence
npm run test:mongodb
npm test -- --run
npm run build
npm run preview
```

**Expected: All pass ✅**
