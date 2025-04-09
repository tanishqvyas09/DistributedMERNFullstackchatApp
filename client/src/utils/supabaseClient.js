import { createClient } from '@supabase/supabase-js';


const supabaseUrl = "https://cwdzmfkfyvlczribvape.supabase.co";        // ← Replace with your project URL
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3ZHptZmtmeXZsY3pyaWJ2YXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxODIzOTcsImV4cCI6MjA1OTc1ODM5N30.jEkGJHzswCPUA96scijfUcQOAcK1BRU8l2ic8A4tGjU";                   // ← Replace with your anon/public API key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
