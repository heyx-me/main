import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types'
const supabaseUrl = 'https://dhhpdrhxbfuyvebwevhc.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!supabaseKey) throw new Error("No key")
export const supabase = createClient<Database>(supabaseUrl, supabaseKey)