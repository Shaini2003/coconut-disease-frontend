import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface DiseaseInfo {
  id: string;
  name: string;
  scientific_name: string | null;
  description: string;
  symptoms: string[];
  causes: string[];
  treatment: string | null;
  prevention: string | null;
  severity: string;
  image_url: string | null;
  created_at: string;
}

export interface Prediction {
  id: string;
  image_url: string;
  predicted_disease: string;
  confidence: number;
  gradcam_url: string | null;
  location: string | null;
  notes: string | null;
  created_at: string;
  metadata: Record<string, unknown>;
}
