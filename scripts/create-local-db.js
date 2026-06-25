const { Client } = require('pg');

async function run() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '',
    database: 'postgres',
  });
  
  try {
    await client.connect();
    
    // Check if karnex db exists
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname='karnex'");
    if (res.rowCount === 0) {
      console.log("Database 'karnex' does not exist. Creating it...");
      await client.query("CREATE DATABASE karnex");
      console.log("Database 'karnex' created successfully!");
    } else {
      console.log("Database 'karnex' already exists.");
    }
    
    await client.end();
  } catch (err) {
    console.error("Failed to create database:", err.message);
    process.exit(1);
  }
}

run();
