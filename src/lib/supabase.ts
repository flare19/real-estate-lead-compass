
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fxolvqfayvrxtkwjohtv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4b2x2cWZheXZyeHRrd2pvaHR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2OTgxOTgsImV4cCI6MjA2MDI3NDE5OH0.lK4FzEiSfP9tLCTcOlVVeEjk_bPJp01lRie0hkn-JN8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  name: string;
  role: 'CEO' | 'Employee';
  created_at: string;
  email: string;
};

export type Lead = {
  id: string;
  customer_name: string;
  email: string;
  mobile_number: string;
  project_name: string;
  budget: number;
  preferred_area: string;
  team_leader: string;
  assigned_to: string;
  last_contacted_date: string;
  next_followup_date: string;
  comments: string;
  deal_status: string;
  interest_level: string;
  property_type: string;
  site_visit_done: boolean;
};
