import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';

// prefer server-side name, fallback to VITE_ for local dev
const MONGODB_URI = process.env.MONGODB_URI || process.env.VITE_MONGODB_URI;
const DB_NAME = 'expense-tracker';
const COLLECTION_NAME = 'expenses';

if (!MONGODB_URI) {
  console.error('MONGODB_URI not set. Set MONGODB_URI (or VITE_MONGODB_URI for local) in .env.local or Vercel env vars.');
}

let cachedClient: MongoClient | null = null;
async function connectToDatabase() {
  if (!MONGODB_URI) throw new Error('Missing MongoDB URI');
  if (cachedClient && (cachedClient as any).topology?.isConnected?.()) return cachedClient;
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  console.log('Connected to MongoDB');
  return client;
}

export default async function handler(req: any, res: any) {
  console.log(`${req.method} ${req.url} - body:`, req.body);
  try {
    const client = await connectToDatabase();
    const collection = client.db(DB_NAME).collection(COLLECTION_NAME);

    if (req.method === 'POST') {
      const { amount, currency, category, description, date } = req.body;
      const expense = {
        amount: Number(amount),
        currency,
        category,
        description: description || '',
        date: date ? new Date(date) : new Date(),
        createdAt: new Date(),
      };
      console.log('Inserting expense:', expense);
      const result = await collection.insertOne(expense);
      console.log('InsertedId:', result.insertedId.toString());
      return res.status(201).json({ id: result.insertedId.toString(), ...expense });
    }

    if (req.method === 'GET') {
      // Get all expenses
      const expenses = await collection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      console.log(`✅ Retrieved ${expenses.length} expenses`);
      return res.status(200).json(expenses);
    }

    if (req.method === 'DELETE') {
      // Delete expense
      const id = req.query.id as string;
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      console.log(`🗑️  Deleted ${result.deletedCount} expense(s)`);
      return res.status(200).json({ success: true, deletedCount: result.deletedCount });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
}
