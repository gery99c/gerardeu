import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rrclsnobkthwwvnfxyuf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyY2xzbm9ia3Rod3d2bmZ4eXVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzOTQzOTQsImV4cCI6MjA1NTk3MDM5NH0.R4SdQ_5UZC8aerokqKiauDrWYELq5Q_UywLo-dlb3CU'

export const supabase = createClient(supabaseUrl, supabaseKey) 