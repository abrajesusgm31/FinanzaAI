import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Force load env, but don't override existing process.env
dotenv.config({ path: path.resolve(__dirname, '../../.env.test'), override: false });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(`Missing Supabase credentials. URL: ${!!url}, Key: ${!!key ? key.substring(0, 5) + '...' : 'null'}`);
  throw new Error(`Missing Supabase credentials.`);
}

export const adminSupabase = createClient(url, key);
export const supabase = adminSupabase;

// Helper to create an auth client for testing RLS
export const createAuthClient = (token: string) => {
    return createClient(
        url!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        }
    );
};

export const getAuthToken = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
    return data.session.access_token;
};
