import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET) {
  console.error('SUPABASE_URL and SUPABASE_SECRET_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET);

async function run() {
  const filePath = path.join(process.cwd(), 'scripts', 'sample_store.json');
  if (!fs.existsSync(filePath)) {
    console.error('sample_store.json not found at', filePath);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse sample_store.json:', err);
    process.exit(1);
  }

  try {
    const { error } = await supabase.from('app_store').upsert({ id: 'singleton', data: payload }, { returning: 'minimal' });
    if (error) {
      console.error('Supabase upsert error:', error);
      process.exit(1);
    }
    console.log('Successfully upserted sample store into Supabase app_store (id=singleton)');
  } catch (err) {
    console.error('Unexpected error while upserting to Supabase:', err);
    process.exit(1);
  }
}

run();
