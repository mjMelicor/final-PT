import { createClient } from "@supabase/supabase-js";

// For Create React App
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase credentials. " +
      "Make sure your .env file has REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY set, " +
      "then restart the server with: npm start"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
