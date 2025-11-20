import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables.')
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '***' : undefined)
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSetup() {
  console.log('Checking Supabase connection and schema...')
  
  // Check if we can connect
  const { data: healthCheck, error: healthError } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
  
  if (healthError) {
    console.error('❌ Error connecting to profiles table:', healthError.message)
    if (healthError.code === 'PGRST204') {
        console.error('   This error (PGRST204) likely means the "profiles" table does not exist yet.')
    }
    return
  }
  
  console.log('✅ Connection successful! "profiles" table exists.')

  const { error: relationsError } = await supabase.from('work_relations').select('count', { count: 'exact', head: true })
  if (relationsError) {
      console.error('❌ Error connecting to work_relations table:', relationsError.message)
  } else {
      console.log('✅ "work_relations" table exists.')
  }

  const { error: shiftsError } = await supabase.from('shifts').select('count', { count: 'exact', head: true })
  if (shiftsError) {
      console.error('❌ Error connecting to shifts table:', shiftsError.message)
  } else {
      console.log('✅ "shifts" table exists.')
  }
}

checkSetup()
