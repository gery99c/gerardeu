import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ybytyrxlktjmbqxunrhw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlieXR5cnhsa3RqbWJxeHVucmh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NTY0NjcsImV4cCI6MjA1NTUzMjQ2N30.Sjec8zFzC8xlLdAoSekkbZG5x93suFMc91CUYY-YRhc';

export const supabase = createClient(supabaseUrl, supabaseKey);
