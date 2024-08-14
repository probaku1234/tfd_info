// src/utils/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

// Load environment variables
const SUPABASE_URL = process.env.GATSBY_SUPABASE_URL as string;
const SUPABASE_KEY = process.env.GATSBY_SUPABASE_KEY as string;

// Create a single Supabase client for interacting with your database
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error(error);
    }
  } catch (error) {
    console.error(error);
  }
};
