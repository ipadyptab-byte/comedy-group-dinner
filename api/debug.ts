import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

export default async function handler(req: any, res: any) {
  const SUPABASE_URL = process.env.SUPABASE_URL || '';
  const SUPABASE_SECRET = process.env.SUPABASE_SECRET_KEY || '';

  const mask = (s: string) => {
    if (!s) return '';
    if (s.length <= 8) return s.replace(/./g, '*');
    return s.slice(0, 4) + '...' + s.slice(-4);
  };

  const info: any = {
    supabaseEnvPresent: Boolean(SUPABASE_URL && SUPABASE_SECRET),
    env: {
      SUPABASE_URL: SUPABASE_URL ? mask(SUPABASE_URL) : null,
      SUPABASE_SECRET_KEY: SUPABASE_SECRET ? mask(SUPABASE_SECRET) : null,
    },
  };

  if (!SUPABASE_URL || !SUPABASE_SECRET) {
    res.status(200).json({ ok: false, reason: 'Supabase env missing', info });
    return;
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET);
    // Try a lightweight read
    const result: any = await (supabase as any).from('app_store').select('id').limit(1).maybeSingle();
    if (result.error) {
      info.supabaseReachable = false;
      info.queryError = String(result.error.message || result.error);
      res.status(200).json({ ok: false, reason: 'Supabase query failed', info });
      return;
    }
    info.supabaseReachable = true;
    info.sampleRow = result.data || null;
    res.status(200).json({ ok: true, info });
  } catch (err: any) {
    info.supabaseReachable = false;
    info.exception = String(err?.message || err);
    res.status(200).json({ ok: false, reason: 'Exception while contacting Supabase', info });
  }
}
