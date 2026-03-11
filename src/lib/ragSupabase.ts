import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_RAG_SUPABASE_URL!;
const supabaseServiceKey = process.env.RAG_SUPABASE_SERVICE_KEY!;

// This client bypasses RLS and should only be used in server environments
export const ragSupabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
