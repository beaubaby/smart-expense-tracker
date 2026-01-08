import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient, ObjectId } from 'mongodb';

let cachedClient: MongoClient | null = null;

async function connectDB() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(process.env.VITE_MONGODB_URI || '');
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const client = await connectDB();
    const db = client.db('expense-tracker');
    const collection = db.collection('expenses');

    if (req.method === 'GET') {
      // Get all expenses
      const expenses = await collection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      console.log(`✅ Retrieved ${expenses.length} expenses`);
      return res.status(200).json(expenses);
    }

    if (req.method === 'POST') {
      // Add new expense
      const expense = {
        ...req.body,
        createdAt: new Date(),
      };
      const result = await collection.insertOne(expense);
      console.log(`✅ Inserted expense: ${result.insertedId}`);
      return res.status(201).json({ id: req.body.id, ...expense });
    }

    if (req.method === 'DELETE') {
      // Delete expense
      const id = req.query.id as string;
      const result = await collection.deleteOne({ _id: id });
      console.log(`🗑️  Deleted ${result.deletedCount} expense(s)`);
      return res.status(200).json({ success: true, deletedCount: result.deletedCount });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('❌ API error:', error.message);
    res.status(500).json({ error: error.message });
  }
}
