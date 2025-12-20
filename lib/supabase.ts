import { createClient } from '@supabase/supabase-js'

// Hardcoded for stability on Hostinger deployment
const supabaseUrl = 'https://adhvtuqtfpdrinyfmoll.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkaHZ0dXF0ZnBkcmlueWZtb2xsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNTc3NTcsImV4cCI6MjA4MTgzMzc1N30.dotYR5drO6huQed-iXjrwShjCunV0YQGISIVV9AKB0E'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
