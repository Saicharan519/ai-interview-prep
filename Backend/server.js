// MUST call dotenv.config() as the very first line before any other imports
import dotenv from 'dotenv';
dotenv.config({ override: true });

import { connectDB } from './src/config/db.js';
import app from './app.js';

const PORT = process.env.PORT || 5000;
const geminiKey = process.env.GEMINI_API_KEY || '';

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(
        `Gemini key loaded: ${geminiKey.slice(0, 6)}...${geminiKey.slice(-4)}`
      );
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
