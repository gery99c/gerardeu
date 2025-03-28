import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigrations() {
  try {
    console.log('Running migrations...')
    
    const migrationsDir = join(__dirname, '../supabase/migrations')
    const files = fs.readdirSync(migrationsDir)
    
    for (const file of files) {
      if (file.endsWith('.sql')) {
        console.log(`Running migration: ${file}`)
        const sql = fs.readFileSync(join(migrationsDir, file), 'utf8')
        
        const { error } = await supabase.rpc('exec_sql', { sql })
        if (error) throw error
        
        console.log(`Migration ${file} completed successfully`)
      }
    }
    
    console.log('All migrations completed')
  } catch (error) {
    console.error('Migration error:', error)
    process.exit(1)
  }
}

runMigrations() 