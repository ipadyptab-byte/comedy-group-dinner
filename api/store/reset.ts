import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { GET_INITIAL_DATA } from '../../src/initialData';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET) {
  throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY are required');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
    return;
  }

  const initial = GET_INITIAL_DATA();
  const { error } = await supabase.from('app_store').upsert({ id: 'singleton', data: initial }, { returning: 'minimal' });
  if (error) {
    console.error('Supabase reset error', error);
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ success: true, store: initial });
}
