import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GET_INITIAL_DATA } from './src/initialData';
import { InitialData } from './src/types';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// File storage path for local fallback persistence
const DATA_FILE = path.join(process.cwd(), 'data_store.json');

// Supabase client (server-side) - uses secret key from env
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET = process.env.SUPABASE_SECRET_KEY;
let supabase: ReturnType<typeof createClient> | null = null;
if (SUPABASE_URL && SUPABASE_SECRET) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SECRET);
}

async function loadStore(): Promise<InitialData> {
  // Try Supabase first (if configured)
  if (supabase) {
    try {
      const { data, error } = await supabase.from('app_store').select('data').eq('id', 'singleton').limit(1).maybeSingle();
      if (!error && data && (data as any).data) {
        return (data as any).data as InitialData;
      }
    } catch (err) {
      console.warn('Supabase load failed, falling back to disk:', err);
    }
  }

  // Fallback to local disk
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to load store from disk:', err);
  }

  const initial = GET_INITIAL_DATA();
  await saveStore(initial);
  return initial;
}

async function saveStore(data: InitialData) {
  // Try Supabase upsert
  if (supabase) {
    try {
      const payload = { id: 'singleton', data };
      const { error } = await supabase.from('app_store').upsert(payload, { returning: 'minimal' });
      if (error) {
        console.warn('Supabase upsert error:', error);
      }
    } catch (err) {
      console.warn('Supabase save failed, will save to disk as fallback:', err);
    }
  }

  // Always write to disk as local fallback
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save store to disk:', err);
  }
}

let currentStore: InitialData | null = null;

// API Routes
app.get('/api/store', (req, res) => {
  if (!currentStore) {
    res.status(503).json({ error: 'Store not initialized yet' });
    return;
  }
  res.json(currentStore);
});

app.post('/api/store', async (req, res) => {
  try {
    if (req.body && typeof req.body === 'object') {
      currentStore = { ...(currentStore || GET_INITIAL_DATA()), ...req.body };
      await saveStore(currentStore);
      res.json({ success: true, store: currentStore });
    } else {
      res.status(400).json({ error: 'Invalid store data' });
    }
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/store/reset', async (req, res) => {
  currentStore = GET_INITIAL_DATA();
  await saveStore(currentStore);
  res.json({ success: true, store: currentStore });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', group: 'Comedy Group' });
});

async function start() {
  // Initialize the store from Supabase or disk before starting server
  currentStore = await loadStore();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
