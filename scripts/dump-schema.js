#!/usr/bin/env node

/**
 * Database Schema Dumper
 * 
 * This script connects to your Neon database and exports the schema
 * to a SQL file.
 * 
 * Usage:
 *   node scripts/dump-schema.js
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function dumpSchema() {
  console.log('🔍 Connecting to database...');
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  try {
    console.log('📊 Fetching schema information...\n');

    // Get all tables in public schema
    const tables = await sql`
      SELECT 
        table_name,
        table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log(`Found ${tables.length} tables:\n`);

    let schemaOutput = `-- ================================================
-- Neon Database Schema Export
-- Generated: ${new Date().toISOString()}
-- Database: neondb
-- ================================================

`;

    for (const table of tables) {
      console.log(`  📋 ${table.table_name}`);

      // Get columns for this table
      const columns = await sql`
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' 
          AND table_name = ${table.table_name}
        ORDER BY ordinal_position
      `;

      // Get constraints
      const constraints = await sql`
        SELECT
          tc.constraint_name,
          tc.constraint_type,
          kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_schema = 'public'
          AND tc.table_name = ${table.table_name}
      `;

      // Get indexes
      const indexes = await sql`
        SELECT
          indexname,
          indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename = ${table.table_name}
      `;

      schemaOutput += `\n-- Table: ${table.table_name}\n`;
      schemaOutput += `CREATE TABLE IF NOT EXISTS public.${table.table_name} (\n`;
      
      const columnDefs = columns.map(col => {
        let def = `  ${col.column_name} ${col.data_type}`;
        
        if (col.character_maximum_length) {
          def += `(${col.character_maximum_length})`;
        }
        
        if (col.is_nullable === 'NO') {
          def += ' NOT NULL';
        }
        
        if (col.column_default) {
          def += ` DEFAULT ${col.column_default}`;
        }
        
        return def;
      });

      schemaOutput += columnDefs.join(',\n');
      schemaOutput += '\n);\n';

      // Add constraints
      if (constraints.length > 0) {
        schemaOutput += `\n-- Constraints for ${table.table_name}\n`;
        for (const constraint of constraints) {
          console.log(`    🔒 ${constraint.constraint_type}: ${constraint.constraint_name}`);
        }
      }

      // Add indexes
      if (indexes.length > 0) {
        schemaOutput += `\n-- Indexes for ${table.table_name}\n`;
        for (const index of indexes) {
          schemaOutput += `${index.indexdef};\n`;
          console.log(`    📇 ${index.indexname}`);
        }
      }

      schemaOutput += '\n';
    }

    // Write to file
    const outputPath = path.join(__dirname, 'schema-dump.sql');
    fs.writeFileSync(outputPath, schemaOutput);

    console.log(`\n✅ Schema exported to: ${outputPath}`);
    console.log(`\n📄 Total tables: ${tables.length}`);

  } catch (error) {
    console.error('❌ Error dumping schema:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  dumpSchema();
}

module.exports = { dumpSchema };
