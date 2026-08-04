import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { GET_INITIAL_DATA } from '../../src/initialData';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET = process.env.SUPABASE_SECRET_KEY;

const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_SECRET);
const supabase = hasSupabaseConfig ? createClient(SUPABASE_URL as string, SUPABASE_SECRET as string) : null;

export default async function handler(req: any, res: any) {
  if (!supabase) {
    console.error('Missing Supabase config in Vercel environment variables for reset route.');
    res.status(500).json({ error: 'Supabase configuration missing. Set SUPABASE_URL and SUPABASE_SECRET_KEY in Vercel.' });
    return;
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
    return;
  }

  const initial = GET_INITIAL_DATA();
  try {
    const result: any = await (supabase as any).from('app_store').upsert({ id: 'singleton', data: initial });
    if (result.error) {
      console.error('Supabase reset error', result.error);
      res.status(500).json({ error: result.error.message || String(result.error) });
      return;
    }
  } catch (err: any) {
    console.error('Supabase reset exception', err);
    res.status(500).json({ error: err?.message || String(err) });
    return;
  }

  res.status(200).json({ success: true, store: initial });
}
