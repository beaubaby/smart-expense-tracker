import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env.local') });

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.VITE_MONGODB_URI || '';
const client = new MongoClient(MONGODB_URI);

let db: any;
let expensesCollection: any;

// Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    db = client.db('expense-tracker');
    expensesCollection = db.collection('expenses');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
}

// GET all expenses
app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await expensesCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    console.log(`📖 Retrieved ${expenses.length} expenses`);
    res.json(expenses);
  } catch (error: any) {
    console.error('❌ Error fetching expenses:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST new expense
app.post('/api/expenses', async (req, res) => {
  try {
    const expense = {
      ...req.body,
      createdAt: new Date(),
      _id: req.body.id, // Use the expense id as MongoDB _id
    };

    const result = await expensesCollection.insertOne(expense);
    console.log(`✅ Inserted expense: ${result.insertedId}`);
    res.status(201).json({ id: expense.id, ...expense });
  } catch (error: any) {
    console.error('❌ Error creating expense:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// DELETE expense
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await expensesCollection.deleteOne({ _id: id });
    console.log(`🗑️  Deleted ${result.deletedCount} expense(s)`);
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (error: any) {
    console.error('❌ Error deleting expense:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', database: db ? 'connected' : 'disconnected' });
});

// Start server
async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api/expenses\n`);
  });
}

start().catch(console.error);
