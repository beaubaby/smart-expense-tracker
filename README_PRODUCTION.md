# Smart Expense Tracker - Production Deployment Ready

Complete expense tracking application with MongoDB backend, ready for production deployment on Vercel.

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your MongoDB URI

# Run both servers (frontend + API)
npm run dev:full

# Frontend: http://localhost:3000 (or 3001)
# API: http://localhost:3001
```

### Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step Vercel deployment guide.

**TL;DR:**
1. Push code to GitHub
2. Connect to Vercel
3. Add `VITE_MONGODB_URI` environment variable
4. Deploy! 🎉

---

## 📋 Features

✅ **Add Expenses** - Track spending with categories and descriptions  
✅ **View Expenses** - See all expenses in a sortable list  
✅ **Dashboard** - Visual breakdown by category and monthly trends  
✅ **Offline Support** - Works offline via IndexedDB, syncs when online  
✅ **MongoDB Integration** - Cloud data persistence  
✅ **Responsive Design** - Works on desktop and mobile  
✅ **Fast & Secure** - Built with React 19, TypeScript  

---

## 🏗️ Architecture

```
Frontend (Vite + React)
    ↓
IndexedDB (Offline)
    ↓
API Layer (Vercel Functions)
    ↓
MongoDB Atlas (Production)
```

## 📁 Project Structure

```
smart-expense-tracker/
├── api/
│   └── expenses.ts              # Vercel serverless API
├── components/
│   ├── AddExpenseModal.tsx
│   ├── Dashboard.tsx
│   ├── ExpenseList.tsx
│   ├── MonthlyView.tsx
│   └── BottomNav.tsx
├── src/
│   ├── App.tsx                  # Main app component
│   ├── dbService.ts             # Database service
│   ├── types.ts                 # TypeScript types
│   └── ...
├── vite.config.ts               # Vite configuration
├── vercel.json                  # Vercel configuration
├── tsconfig.json                # TypeScript config
└── package.json                 # Dependencies
```

---

## 🧪 Testing

```bash
# Run all tests
npm test -- --run

# Watch mode
npm test

# Coverage report
npm run test:coverage

# MongoDB connection test
npm run test:mongodb
```

**Test Coverage:**
- ✅ 12 unit & integration tests passing
- ✅ Expense model validation
- ✅ API endpoint testing
- ✅ Database operations

---

## 🔧 Technology Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Recharts** - Data visualization
- **IndexedDB** - Offline storage

### Backend
- **Vercel Functions** - Serverless API
- **MongoDB** - Database
- **Node.js** - Runtime

### DevTools
- **Vitest** - Unit testing
- **ESLint** - Code quality
- **Prettier** - Code formatting

---

## 📦 Scripts

```bash
npm run dev         # Start frontend dev server
npm run server      # Start backend server locally
npm run dev:full    # Start both servers concurrently
npm run build       # Build for production
npm run test        # Run tests in watch mode
npm test -- --run   # Run tests once
npm run test:mongodb # Test MongoDB connection
```

---

## 🔐 Environment Variables

### Required (.env.local)
```
VITE_MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-expense-tracker?retryWrites=true&w=majority
```

**Important:**
- Never commit `.env.local`
- Use `.env.example` as template
- Set variables in Vercel dashboard for production

---

## 📊 Database Schema

### expenses Collection
```json
{
  "_id": "unique-id",
  "amount": 100,
  "currency": "NZD",
  "originalAmount": 100,
  "originalCurrency": "NZD",
  "category": "Food",
  "date": "2024-01-09",
  "description": "Lunch",
  "createdAt": "2024-01-09T12:00:00Z"
}
```

---

## 🌐 API Endpoints

### GET /api/expenses
Fetch all expenses
```bash
curl https://your-project.vercel.app/api/expenses
```

### POST /api/expenses
Create new expense
```bash
curl -X POST https://your-project.vercel.app/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"id":"1","amount":100,"category":"Food",...}'
```

### DELETE /api/expenses/:id
Delete expense
```bash
curl -X DELETE https://your-project.vercel.app/api/expenses/1
```

---

## 📱 Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Build succeeds: `npm run build`
- [ ] Tests pass: `npm test -- --run`
- [ ] MongoDB configured in Vercel env vars
- [ ] `.env.local` NOT in git (check `.gitignore`)
- [ ] All features tested locally
- [ ] Production URL verified
- [ ] Monitoring set up

See [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) for detailed checklist.

---

## 📖 Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Step-by-step Vercel deployment
- [LOCAL_TESTING.md](LOCAL_TESTING.md) - Local testing guide
- [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) - Pre-launch checklist
- [TEST_CHECKLIST.md](TEST_CHECKLIST.md) - Manual testing checklist

---

## 🐛 Troubleshooting

### Build Issues
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### API Not Working
```bash
# Test MongoDB connection
npm run test:mongodb

# Check API logs in Vercel dashboard
# Verify VITE_MONGODB_URI in Vercel env vars
```

### Data Not Syncing
```bash
# Check IndexedDB in DevTools
# Application → IndexedDB → SmartExpenseTrackerDB

# Check browser console for errors
# F12 → Console tab
```

---

## 📞 Support

**Issues?** Check:
1. [DEPLOYMENT.md](DEPLOYMENT.md) - Common deployment issues
2. [LOCAL_TESTING.md](LOCAL_TESTING.md) - Testing guide
3. Browser console (F12) - Error messages
4. Vercel dashboard - Function logs
5. MongoDB Atlas - Database logs

---

## 📄 License

Created for personal expense tracking.

---

## ✨ Next Steps

1. ✅ Review [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md)
2. ✅ Follow [DEPLOYMENT.md](DEPLOYMENT.md)
3. ✅ Deploy to Vercel
4. ✅ Test production app
5. ✅ Monitor performance

**Ready to deploy? Let's go! 🚀**
