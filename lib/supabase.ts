import { createClient } from '@supabase/supabase-js'

// Hardcoded for stability on Hostinger deployment
const supabaseUrl = 'https://adhvtuqtfpdrinyfmoll.supabase.co'
const supabaseAnonKey = 'sb_publishable_e6tCGLg_GR6RmZzn6Z5nUg_l1m8OODq'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
