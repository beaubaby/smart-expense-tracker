import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env.local') });

/**
 * Test MongoDB Connection
 * Run: npm run test:mongodb
 */

const MONGODB_URI = process.env.VITE_MONGODB_URI || '';

async function testConnection() {
  console.log('🔍 Testing MongoDB Connection...\n');

  if (!MONGODB_URI) {
    console.error('❌ Error: VITE_MONGODB_URI not set in .env.local');
    console.log('\n📝 Add this to your .env.local:');
    console.log('VITE_MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-expense-tracker?retryWrites=true&w=majority\n');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('📡 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Get server info
    const admin = client.db().admin();
    const serverStatus = await admin.serverStatus();
    console.log('📊 Server Info:');
    console.log(`   - Uptime: ${serverStatus.uptime} seconds`);
    console.log(`   - Version: ${serverStatus.version}`);
    console.log(`   - Host: ${serverStatus.host}\n`);

    // List databases
    const databases = await admin.listDatabases();
    console.log('📚 Available Databases:');
    databases.databases.forEach((db: any) => {
      console.log(`   - ${db.name}`);
    });
    console.log();

    // Test collection operations
    const db = client.db('expense-tracker');
    const collection = db.collection('expenses');

    // Create test expense
    const testExpense = {
      amount: 100,
      currency: 'NZD',
      category: 'Food',
      description: 'Test expense',
      date: new Date(),
    };

    console.log('📝 Testing Insert...');
    const insertResult = await collection.insertOne(testExpense);
    console.log(`✅ Inserted: ${insertResult.insertedId}\n`);

    // Read test expense
    console.log('📖 Testing Read...');
    const foundExpense = await collection.findOne({
      _id: insertResult.insertedId,
    });
    console.log(`✅ Found: ${JSON.stringify(foundExpense, null, 2)}\n`);

    // Update test expense
    console.log('✏️  Testing Update...');
    const updateResult = await collection.updateOne(
      { _id: insertResult.insertedId },
      { $set: { amount: 150 } }
    );
    console.log(`✅ Updated ${updateResult.modifiedCount} document(s)\n`);

    // Delete test expense
    console.log('🗑️  Testing Delete...');
    const deleteResult = await collection.deleteOne({
      _id: insertResult.insertedId,
    });
    console.log(`✅ Deleted ${deleteResult.deletedCount} document(s)\n`);

    console.log('🎉 All tests passed!\n');
  } catch (error: any) {
    console.error('❌ Connection Error:');
    console.error(`   ${error.message}\n`);

    if (error.code === 'ENOTFOUND') {
      console.log('💡 Tip: Check your MongoDB URI is correct');
    } else if (error.code === 'AUTHENTICATION_FAILED') {
      console.log('💡 Tip: Check your username and password');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Tip: MongoDB server might be down');
    }

    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Connection closed');
  }
}

testConnection();
