# Testing Checklist for Smart Expense Tracker

## Database Tests
- [ ] Add expense to IndexedDB
- [ ] Add expense to MongoDB
- [ ] Fetch all expenses from MongoDB
- [ ] Fetch all expenses from IndexedDB (offline)
- [ ] Delete expense from both databases
- [ ] Sync IndexedDB with MongoDB

## API Tests
- [ ] GET /api/expenses returns list
- [ ] POST /api/expenses creates new expense
- [ ] DELETE /api/expenses/:id removes expense
- [ ] Error handling when MongoDB is down

## Frontend Tests
- [ ] AddExpenseModal opens/closes
- [ ] AddExpenseModal validates required fields
- [ ] AddExpenseModal adds expense successfully
- [ ] ExpenseList displays all expenses
- [ ] ExpenseList updates after adding expense
- [ ] ExpenseList deletes expense correctly
- [ ] Dashboard shows summary
- [ ] Dashboard shows category breakdown
- [ ] MonthlyView displays monthly data
- [ ] BottomNav navigates between screens

## Integration Tests
- [ ] Add expense → appears in list
- [ ] Add expense → appears in Dashboard
- [ ] Delete expense → removed from all views
- [ ] Add expense offline → syncs online
- [ ] Refresh page → data persists

## Edge Cases
- [ ] Add expense with special characters
- [ ] Add expense with very large amount
- [ ] Add expense with future date
- [ ] Delete last expense
- [ ] Handle network errors gracefully
- [ ] Handle MongoDB connection errors
