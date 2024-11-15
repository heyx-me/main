import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://dhhpdrhxbfuyvebwevhc.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!supabaseKey) throw new Error("No key")
export const supabase = createClient(supabaseUrl, supabaseKey)