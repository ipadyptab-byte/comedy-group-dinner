import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { GET_INITIAL_DATA } from '../src/initialData';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET = process.env.SUPABASE_SECRET_KEY;

const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_SECRET);
const supabase = hasSupabaseConfig ? createClient(SUPABASE_URL as string, SUPABASE_SECRET as string) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!supabase) {
    console.error('Missing Supabase config in Vercel environment variables.');
    res.status(500).json({ error: 'Supabase configuration missing. Set SUPABASE_URL and SUPABASE_SECRET_KEY in Vercel.' });
    return;
  }
  if (req.method === 'GET') {
    const { data, error } = await supabase.from('app_store').select('data').eq('id', 'singleton').limit(1).maybeSingle();
    if (error) {
      console.error('Supabase GET error', error);
      res.status(500).json({ error: error.message });
      return;
    }
    if (!data || !(data as any).data) {
      const initial = GET_INITIAL_DATA();
      res.status(200).json(initial);
      return;
    }
    res.status(200).json((data as any).data);
    return;
  }

  if (req.method === 'POST') {
    if (!req.body || typeof req.body !== 'object') {
      res.status(400).json({ error: 'Invalid store data' });
      return;
    }

    const upsertData = { id: 'singleton', data: req.body };
    const { error } = await supabase.from('app_store').upsert(upsertData, { returning: 'minimal' });
    if (error) {
      console.error('Supabase POST error', error);
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(200).json({ success: true, store: req.body });
    return;
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).end('Method Not Allowed');
}
