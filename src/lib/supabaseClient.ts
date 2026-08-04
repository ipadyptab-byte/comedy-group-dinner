import { createClient } from '@supabase/supabase-js';

// Provide TypeScript types for Vite's import.meta.env
type ImportMetaEnv = {
	VITE_SUPABASE_URL?: string;
	VITE_SUPABASE_ANON_KEY?: string;
	SUPABASE_URL?: string;
	SUPABASE_PUBLISHABLE_KEY?: string;
};

declare global {
	interface ImportMeta {
		readonly env: ImportMetaEnv;
	}
}

const url = (import.meta.env.VITE_SUPABASE_URL as string) || (import.meta.env.SUPABASE_URL as string) || '';
const anon = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || (import.meta.env.SUPABASE_PUBLISHABLE_KEY as string) || '';

export const supabase = url && anon ? createClient(url, anon) : null;

export default supabase;
