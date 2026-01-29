/**
 * Database Setup Script
 * Runs the schema.sql file to create all necessary tables
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  try {
    const DATABASE_URL = process.env.DATABASE_URL;
    
    if (!DATABASE_URL) {
      console.error('❌ DATABASE_URL not found in environment variables');
      console.error('   Please set DATABASE_URL environment variable or add it to .env.local');
      console.error('   Usage: DATABASE_URL=your_connection_string node scripts/setup-db.js');
      process.exit(1);
    }

    console.log('🔗 Connecting to database...');
    const sql = neon(DATABASE_URL);

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📄 Executing schema.sql...\n');

    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      // Skip comments and empty lines
      if (statement.startsWith('--') || !statement.trim()) {
        continue;
      }

      try {
        await sql(statement);
        successCount++;
        
        // Show what we're creating
        if (statement.includes('CREATE TABLE')) {
          const match = statement.match(/CREATE TABLE[^(]*\s+(\S+)/i);
          if (match) console.log(`✅ Created table: ${match[1]}`);
        } else if (statement.includes('CREATE INDEX')) {
          const match = statement.match(/CREATE INDEX[^(]*\s+(\S+)/i);
          if (match) console.log(`✅ Created index: ${match[1]}`);
        } else if (statement.includes('CREATE POLICY')) {
          const match = statement.match(/CREATE POLICY[^(]*"([^"]+)"/i);
          if (match) console.log(`✅ Created policy: ${match[1]}`);
        }
      } catch (error) {
        // Ignore "already exists" errors
        if (error.message.includes('already exists')) {
          // Silent skip
        } else {
          console.error(`❌ Error executing statement:`, error.message);
          errorCount++;
        }
      }
    }

    console.log('\n🎉 Database setup complete!');
    console.log(`   Successfully executed: ${successCount} statements`);
    if (errorCount > 0) {
      console.log(`   Errors: ${errorCount}`);
    }

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
