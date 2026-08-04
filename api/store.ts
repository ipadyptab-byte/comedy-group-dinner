import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { GET_INITIAL_DATA } from '../src/initialData';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET = process.env.SUPABASE_SECRET_KEY;

const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_SECRET);
const supabase = hasSupabaseConfig ? createClient(SUPABASE_URL as string, SUPABASE_SECRET as string) : null;

export default async function handler(req: any, res: any) {
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
    // Basic validation
    if (!req.body || typeof req.body !== 'object') {
      res.status(400).json({ error: 'Invalid store data' });
      return;
    }

    // Check payload size to catch serverless limits
    const contentLength = parseInt(req.headers['content-length'] || '0', 10) || 0;
    let payloadSize = contentLength;
    if (!payloadSize) {
      try {
        payloadSize = Buffer.byteLength(JSON.stringify(req.body), 'utf8');
      } catch {
        payloadSize = 0;
      }
    }

    // If payload > 4.5MB, return 413 to indicate too large for Vercel function
    const MAX_BYTES = 4_500_000;
    if (payloadSize > MAX_BYTES) {
      console.error('Payload too large for /api/store:', { payloadSize, contentLength, max: MAX_BYTES });
      res.status(413).json({ error: 'Payload too large for serverless function', payloadSize, max: MAX_BYTES });
      return;
    }

    // Log request metadata for debugging (do not log body contents)
    console.info('POST /api/store headers:', {
      'content-type': req.headers['content-type'],
      'content-length': contentLength,
    });

    const upsertData = { id: 'singleton', data: req.body };
    try {
      const result: any = await (supabase as any).from('app_store').upsert(upsertData);
      if (result.error) {
        console.error('Supabase POST error', result.error);
        res.status(500).json({ error: result.error.message || String(result.error) });
        return;
      }
    } catch (err: any) {
      console.error('Supabase POST exception', err);
      res.status(500).json({ error: err?.message || String(err) });
      return;
    }

    res.status(200).json({ success: true, store: req.body });
    return;
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).end('Method Not Allowed');
}
